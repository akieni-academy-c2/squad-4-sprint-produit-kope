import { useState } from 'react';
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
/**
 * Noms des champs facultatifs d'un schéma Zod, mis en cache par schéma.
 *
 * Un champ est facultatif si le schéma accepte `undefined`. Sans cette liste,
 * un champ vide reste IDLE et `ready` l'exigerait à tort - le bouton
 * « Enregistrer » resterait éteint pour tout compte sans adresse, alors que ne
 * pas avoir d'e-mail n'est pas une saisie invalide.
 *
 * On teste le schéma lui-même plutôt que de tenir une liste à la main, sinon le
 * prochain champ optionnel réintroduirait exactement ce défaut. Le résultat est
 * mis en cache : `safeParse(undefined)` était relancé pour chaque champ à
 * chaque frappe.
 *
 * Le cache contient les NOMS des champs facultatifs, jamais le résultat du
 * test : ajouter `false` au lieu du nom rendait `optional.has('email')` faux,
 * et éteignait « Enregistrer » sur tout formulaire comportant un champ
 * optionnel.
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
 * État de soumission d'un formulaire, calculé à chaque frappe.
 *
 * `initial` est la référence de comparaison pour `dirty`. Elle vaut `values` au
 * premier rendu, et suit `baseline` dès qu'il en est fourni - sans quoi, après
 * un enregistrement réussi, le formulaire resterait « modifié » pour toujours
 * et le bouton « Enregistrer » ne se réactiverait plus.
 *
 * ## Pas de `useMemo` ici
 *
 * Le calcul est laissé au compilateur React, activé dans `vite.config.js`. Il
 * fait le même travail que le `useMemo` et, surtout, ne se laisse pas désarmer
 * par une dépendance mal choisie : les quatre versions successives de ce hook
 * avaient chacune une liste de dépendances fausse, parce que `rules` et
 * `wrongOn` arrivent sous forme d'objets littéraux à chaque rendu. Une clé
 * sérialisée pour contourner le problème déplaçait l'erreur d'un cran au lieu
 * de la régler.
 *
 * @param {object} values    état courant du formulaire
 * @param {object} [options] `{ ignore, rules, wrongOn }` plus le `baseline`
 *                          facultatif, à faire changer après une sauvegarde.
 */
export function useFormReadiness(schema, values, options) {
  const { baseline, ...rest } = options ?? {};

  // Instantané figé au premier rendu, qu'un `baseline` explicite peut ensuite
  // remplacer. Reprendre `values` à chaque rendu rendrait `dirty` toujours
  // faux ; ne jamais le mettre à jour le rendrait toujours vrai.
  const [mountedValues] = useState(() => values);

  return evaluateForm(schema, values, baseline ?? mountedValues, rest);
}