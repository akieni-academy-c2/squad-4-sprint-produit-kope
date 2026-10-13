import { useMemo, useState } from 'react';
import { validateFrontend } from '@/shared/utils/validators.js';
import { FIELD_STATUS } from './useFieldStatus.js';

const sameValue = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => String(v) === String(b[i]));
  return String(a ?? '') === String(b ?? '');
};

/**
 * Calcul de l'état de soumission, hors React.
 *
 * Isolé du hook pour être testable sans rendu : l'environnement de test est
 * `node`, sans bibliothèque de rendu, et une logique de formulaire qui ne peut
 * être testée que montée dans un composant finit par être réimplémentée dans
 * les tests - réimplémentation qui ne casse plus quand la logique change.
 *
 * `ready`  : chaque champ obligatoire est valide (bouton actif).
 * `dirty`  : au moins une valeur diffère de l'état initial. Indispensable sur
 *            un formulaire de modification : sans lui, « Enregistrer » reste
 *            actif alors que rien n'a changé et renvoie un PUT inutile.
 * `statuses` / `errors` : retour champ par champ, pour les bordures et les
 *            messages. Un bouton grisé qui ne dit pas quoi corriger est une
 *            impasse.
 *
 * `rules` associe un champ à des critères de saisie (ex. PASSWORD_RULES), pour
 * les champs dont la validité ne se déduit pas du schéma seul.
 * `wrongOn` déclare les saisies irrécupérables d'un champ.
 */
export function evaluateForm(schema, values, initial = values, { ignore = [], rules = {}, wrongOn = {} } = {}) {
  if (!schema) return { ready: true, dirty: false, statuses: {}, errors: {} };

  const { success, errors } = validateFrontend(schema, values);
  const fields = Object.keys(schema.shape).filter((f) => !ignore.includes(f));

  // Champs facultatifs : le schéma accepte `undefined`. Sans cette liste, un
  // champ vide reste IDLE et `ready` l'exigerait à tort - le bouton
  // « Enregistrer » resterait éteint pour tout compte sans adresse, alors que
  // ne pas avoir d'e-mail n'est pas une saisie invalide. On teste le schéma
  // lui-même plutôt que de tenir une liste à la main, sinon le prochain champ
  // optionnel réintroduirait exactement ce défaut.
  const optional = new Set(fields.filter((f) => schema.shape[f].safeParse(undefined).success));

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
 * État de soumission d'un formulaire, calculé à chaque frappe.
 */
export function useFormReadiness(schema, values, options) {
  // Instantané figé au premier rendu : c'est la référence pour détecter les
  // modifications. Reprendre `values` ici rendrait `dirty` toujours faux.
  const [initial] = useState(() => values);

  return useMemo(
    () => evaluateForm(schema, values, initial, options),
    // `options` est un objet littéral à chaque rendu : le déréfencer champ par
    // champ évite de recalculer la validation à la frappe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema, values, initial, options?.ignore, options?.rules, options?.wrongOn],
  );
}