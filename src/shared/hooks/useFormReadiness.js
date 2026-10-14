import { useState } from 'react';
import { validateFrontend } from '@/shared/utils/validators.js';
import { FIELD_STATUS } from './useFieldStatus.js';

const sameValue = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => String(v) === String(b[i]));
  return String(a ?? '') === String(b ?? '');
};

/**
 * Évaluation hors React : le test tourne en `node`, sans bibliothèque de rendu.
 * `dirty` évite un PUT inutile ; `rules` et `wrongOn` couvrent ce que le schéma
 * ne dit pas.
 */
/**
 * Un champ est facultatif si son schéma accepte `undefined`, sinon `ready`
 * l'exigerait à tort. Résultat mis en cache : `safeParse` était relancé pour
 * chaque champ à chaque frappe.
 */
const optionalFieldsCache = new WeakMap();

function optionalFields(schema, fields) {
  let cache = optionalFieldsCache.get(schema);
  if (!cache) {
    cache = new Set();
    optionalFieldsCache.set(schema, cache);
  }
  // `forEach` et non `for...of` : la règle `curly` du projet interdit les
  // accolades après `for`, et un `if` seul sous `for` se lit comme une faute.
  fields.forEach((field) => {
    if (!cache.has(field) && schema.shape[field].safeParse(undefined).success) cache.add(field);
  });
  return cache;
}

export function evaluateForm(schema, values, initial = values, { ignore = [], rules = {}, wrongOn = {} } = {}) {
  if (!schema) return { ready: true, dirty: false, statuses: {}, errors: {} };

  const { success, errors } = validateFrontend(schema, values);
  const fields = Object.keys(schema.shape).filter((f) => !ignore.includes(f));
  const optional = optionalFields(schema, fields);

  const statuses = {};
  for (const field of fields) {
    const raw = values[field];

    // Les cases à cocher vides doivent rester « inactives », pas en erreur.
    if (typeof raw === 'boolean' || raw == null || String(raw).trim() === '') {
      statuses[field] = FIELD_STATUS.IDLE;
      continue;
    }
    if (rules[field]) {
      const missing = rules[field].filter((r) => !r.test(String(raw))).length;
      statuses[field] = missing === 0 ? FIELD_STATUS.OK : FIELD_STATUS.NEAR;
      continue;
    }
    if (errors[field]) {
      statuses[field] = wrongOn[field]?.(raw) ? FIELD_STATUS.WRONG : FIELD_STATUS.NEAR;
      continue;
    }
    statuses[field] = FIELD_STATUS.OK;
  }

  // `ready` : valide, et chaque champ obligatoire est OK. Un champ facultatif
  // laissé vide ne bloque pas - il n'a rien à corriger.
  const ready =
    success &&
    fields.every(
      (f) =>
        statuses[f] === FIELD_STATUS.OK ||
        (statuses[f] === FIELD_STATUS.IDLE && optional.has(f)),
    );

  const dirty = fields.some((f) => !sameValue(values[f], initial[f]));

  return { ready, dirty, statuses, errors };
}

/**
 * `initial` sert de référence à `dirty` et suit `baseline` dès qu'il est fourni,
 * sans quoi le formulaire resterait « modifié » après un enregistrement réussi.
 * Pas de `useMemo` : `rules` et `wrongOn` arrivent en objet littéral à chaque rendu.
 */
export function useFormReadiness(schema, values, options) {
  const { baseline, ...rest } = options ?? {};

  // Instantané figé au premier rendu, qu'un `baseline` explicite peut ensuite
  // remplacer. Reprendre `values` à chaque rendu rendrait `dirty` toujours
  // faux ; ne jamais le mettre à jour le rendrait toujours vrai.
  const [mountedValues] = useState(() => values);

  return evaluateForm(schema, values, baseline ?? mountedValues, rest);
}