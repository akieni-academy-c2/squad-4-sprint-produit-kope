import { describe, it, expect } from 'vitest';
import { updateAccountSchema } from '@/shared/utils/validators.js';
import { evaluateForm } from '@/shared/hooks/useFormReadiness.js';
import { FIELD_STATUS } from '@/shared/hooks/useFieldStatus.js';


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
    expect(evaluate(PROFIL, { ...PROFIL, firstName: 'Awa' }).canSubmit).toBe(true);
    expect(evaluate(PROFIL, { ...PROFIL, email: '' }).canSubmit).toBe(false);
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
    const { statuses } = evaluateForm(updateAccountSchema, { ...PROFIL, email: 'a@b.tld' }, PROFIL);

    expect(statuses.email).toBe(FIELD_STATUS.OK);
  });
});