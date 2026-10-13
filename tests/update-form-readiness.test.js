import { describe, it, expect } from 'vitest';
import { updateAccountSchema } from '../src/shared/utils/validators.js';
import { evaluateForm } from '../src/shared/hooks/useFormReadiness.js';
import { FIELD_STATUS } from '../src/shared/hooks/useFieldStatus.js';

/**
 * État du bouton « Enregistrer » d'un formulaire de modification : il ne doit
 * s'activer que si les valeurs sont valides ET réellement différentes de l'état
 * initial.
 *
 * Ces tests appellent `evaluateForm`, le calcul réellement utilisé par
 * `useFormReadiness`. Une version précédente rejouait la logique à sa main —
 * elle continuait à passer quand un champ optionnel avait été ajouté au schéma
 * et que le vrai calcul éteignait le bouton en permanence.
 */
const evaluate = (initial, current) => {
  const { ready, dirty } = evaluateForm(updateAccountSchema, current, initial);
  return { ready, dirty, canSubmit: ready && dirty };
};

const PROFIL = { firstName: 'Ada', lastName: 'Lovelace', phone: '061234567', email: '' };

describe('formulaire de modification', () => {
  it('reste inactif tant que rien n\'a changé', () => {
    expect(evaluate(PROFIL, { ...PROFIL })).toEqual({ ready: true, dirty: false, canSubmit: false });
  });

  it('s\'active dès qu\'un champ change', () => {
    const r = evaluate(PROFIL, { ...PROFIL, firstName: 'Awa' });
    expect(r).toEqual({ ready: true, dirty: true, canSubmit: true });
  });

  it('se désactive si l\'utilisateur revient à la valeur initiale', () => {
    expect(evaluate(PROFIL, { ...PROFIL, firstName: 'Awa' }).canSubmit).toBe(true);
    expect(evaluate(PROFIL, { ...PROFIL, firstName: 'Ada' }).canSubmit).toBe(false);
  });

  it('reste inactif si la nouvelle valeur est invalide', () => {
    // Numéro trop court : modifié mais non conforme.
    expect(evaluate(PROFIL, { ...PROFIL, phone: '061' })).toEqual({
      ready: false,
      dirty: true,
      canSubmit: false,
    });
  });

  it('reste inactif si un champ obligatoire est vidé', () => {
    expect(evaluate(PROFIL, { ...PROFIL, firstName: '' }).canSubmit).toBe(false);
  });

  it('détecte un changement sur chaque champ', () => {
    for (const patch of [{ firstName: 'Awa' }, { lastName: 'Mbarga' }, { phone: '065678901' }])
      expect(evaluate(PROFIL, { ...PROFIL, ...patch }).canSubmit, JSON.stringify(patch)).toBe(true);
  });

  it('n\'exige pas les champs facultatifs', () => {
    // L'e-mail est `nullish` : absent, vide et `null` sont acceptés. Exiger
    // qu'il soit renseigné éteindrait « Enregistrer » pour tout compte sans
    // adresse, alors que ne pas en avoir n'est pas une saisie invalide.
    expect(evaluate(PROFIL, { ...PROFIL, firstName: 'Awa' }).canSubmit).toBe(true);
    expect(evaluate(PROFIL, { ...PROFIL, email: '' }).canSubmit).toBe(false); // rien de changé
    expect(evaluate(PROFIL, { ...PROFIL, firstName: 'Awa', email: null }).canSubmit).toBe(true);
  });

  it('reste inactif sur une adresse invalide, et l\'explique', () => {
    const r = evaluate(PROFIL, { ...PROFIL, email: 'pas-une-adresse' });

    expect(r.canSubmit).toBe(false);
    expect(r.ready).toBe(false);

    const { statuses, errors } = evaluateForm(updateAccountSchema, { ...PROFIL, email: 'nope' }, PROFIL);
    expect(statuses.email).toBe(FIELD_STATUS.NEAR);
    expect(errors.email).toBeTruthy();
  });

  it('valide le format sans exiger de vérification d\'adresse', () => {
    // Rien ne prouve que la boîte existe : c'est le métier du serveur, pas du
    // formulaire. Le champ passe donc au vert dès que la syntaxe est bonne.
    const { statuses } = evaluateForm(updateAccountSchema, { ...PROFIL, email: 'a@b.tld' }, PROFIL);

    expect(statuses.email).toBe(FIELD_STATUS.OK);
  });
});