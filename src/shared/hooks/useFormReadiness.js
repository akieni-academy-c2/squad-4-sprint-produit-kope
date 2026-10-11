import { useMemo, useState } from 'react';
import { validateFrontend } from '@/shared/utils/validators.js';
import { FIELD_STATUS } from './useFieldStatus.js';

const sameValue = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => String(v) === String(b[i]));
  return String(a ?? '') === String(b ?? '');
};

/**
 * État de soumission d'un formulaire, calculé à chaque frappe.
 *
 * `ready`  : tous les champs exigés sont valides (bouton actif).
 * `dirty`  : au moins une valeur diffère de l'état initial. Indispensable sur
 *            un formulaire de modification : sans lui, « Enregistrer » reste
 *            actif alors que rien n'a changé et renvoie un PUT inutile.
 *
 * `rules` associe un champ à des critères de saisie (ex. PASSWORD_RULES), pour
 * les champs dont la validité ne se déduit pas du schéma seul.
 * `wrongOn` déclare les saisies irrécupérables d'un champ.
 */
export function useFormReadiness(schema, values, { ignore = [], rules = {}, wrongOn = {} } = {}) {
  // Instantané figé au premier rendu : c'est la référence pour détecter les
  // modifications. Reprendre `values` ici rendrait `dirty` toujours faux.
  const [initial] = useState(() => values);

  return useMemo(() => {
    if (!schema) return { ready: true, dirty: false, statuses: {}, errors: {} };

    const { success, errors } = validateFrontend(schema, values);
    const fields = Object.keys(schema.shape).filter((f) => !ignore.includes(f));

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

    const ready =
      success && fields.every((f) => statuses[f] === FIELD_STATUS.OK);

    const dirty = fields.some((f) => !sameValue(values[f], initial[f]));

    return { ready, dirty, statuses, errors };
  }, [schema, values, initial, ignore, rules, wrongOn]);
}