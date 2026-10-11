import { useMemo } from 'react';
import { validateFrontend } from '@/shared/utils/validators.js';

/**
 * Règles de mot de passe, dupliquées côté client pour un retour immédiat.
 * Le serveur les réapplique : cette copie n'est qu'un confort d'ergonomie,
 * et toute divergence afficherait un état vert sur une valeur refusée.
 */
export const PASSWORD_RULES = [
  { key: 'length', label: '8 caractères minimum', test: (v) => v.length >= 8 },
  {
    key: 'case',
    label: 'une majuscule et une minuscule',
    test: (v) => /[a-zà-ÿ]/u.test(v) && /[A-ZÀ-Ÿ]/u.test(v),
  },
  {
    key: 'special',
    label: 'un chiffre ou caractère spécial (@ - _ …)',
    test: (v) => /[^A-Za-zÀ-ÿ\s]/.test(v),
  },
];

export const PASSWORD_MAX = 72;

/** Chaque règle annotée de son résultat pour un affichage direct. */
export function checkPassword(value) {
  const v = String(value ?? '');
  const rules = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(v) }));
  return { rules, missing: rules.filter((r) => !r.passed).length, total: rules.length };
}

/** État d'un champ pendant la saisie : inactif, presque, ou bon. */
export const FIELD_STATUS = {
  IDLE: 'idle',
  NEAR: 'near',
  OK: 'ok',
  /** Saisie manifestement fausse : bordure rouge, pas d'invitation à continuer. */
  WRONG: 'wrong',
};

/**
 * Évalue un champ en direct et renvoie un état lisible.
 *
 * `validate` reçoit la valeur et renvoie soit `null` (correct), soit un
 * message. `rules` distingue « il manque une exigence » d'une saisie fausse :
 * des lettres dans un numéro de téléphone ne sont pas un presque, c'est une
 * erreur — l''utilisateur ne pourra jamais valider en ajoutant un chiffre.
 *
 * Rien n'est affiché tant que le champ est vide : reprocher une erreur avant
 * même la première frappe est le meilleur moyen d'agacer.
 */
export function useFieldStatus(validate, value, { rules = null } = {}) {
  return useMemo(() => {
    if (!value || String(value).trim() === '') return { status: FIELD_STATUS.IDLE, missing: 0, total: 0 };

    if (rules) {
      const missing = rules.filter((rule) => !rule.test(String(value))).length;
      return {
        status: missing === 0 ? FIELD_STATUS.OK : FIELD_STATUS.NEAR,
        missing,
        total: rules.length,
      };
    }

    const message = validate ? validate(value) : null;
    if (!message) return { status: FIELD_STATUS.OK, missing: 0, total: 1 };

    const wrong = validate.wrongOn ? validate.wrongOn(value) : false;
    return {
      status: wrong ? FIELD_STATUS.WRONG : FIELD_STATUS.NEAR,
      message,
      missing: 1,
      total: 1,
    };
  }, [validate, value, rules]);
}

/**
 * Valide un champ isolé avec un schéma Zod complet.
 * `wrongOn` indique les saisies qu'aucune correction ne rendra valides.
 */
export function fieldValidator(schema, field, wrongOn = null) {
  const validate = (value) => {
    const { success, errors } = validateFrontend(schema, { [field]: value });
    if (success) return null;
    return errors[field] ?? null;
  };
  validate.wrongOn = wrongOn;
  return validate;
}