import { FIELD_STATUS } from '@/shared/hooks/useFieldStatus.js';

const LABELS = {
  firstName: 'le prénom',
  lastName: 'le nom',
  phone: 'le numéro',
  password: 'le mot de passe',
  confirm: 'la confirmation',
  consent: 'le consentement',
};

/**
 * Libellé du premier champ encore incomplet, dans l'ordre du formulaire.
 *
 * Sert d'instruction sur le bouton désactivé : un bouton grisé sans dire quoi
 * corriger est une impasse. Volontairement bref — un bouton n'accueille pas
 * une phrase. `null` signifie que tout est rempli.
 */
export function firstMissingField(statuses, order = []) {
  for (const field of order)
    if (statuses[field] && statuses[field] !== FIELD_STATUS.OK)
      return LABELS[field] ?? field;

  return null;
}

export function submitLabel(statuses, order, readyLabel) {
  const missing = firstMissingField(statuses, order);
  // Sans guillemets : « le mot de passe » ferait 29 caractères et déborde.
  return missing ? `Complétez ${missing}` : readyLabel;
}