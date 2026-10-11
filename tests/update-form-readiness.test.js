import { describe, it, expect } from 'vitest';
import { updateAccountSchema } from '../src/shared/utils/validators.js';

/**
 * Reproduit `useFormReadiness` sur un formulaire de modification : le bouton ne
 * doit s'activer que si les valeurs sont valides ET réellement différentes de
 * l'état initial.
 */
const sameValue = (a, b) => {
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => String(v) === String(b[i]));
  return String(a ?? '') === String(b ?? '');
};

const evaluate = (initial, current) => {
  const { success } = updateAccountSchema.safeParse(current);
  const fields = Object.keys(updateAccountSchema.shape);
  const dirty = fields.some((f) => !sameValue(current[f], initial[f]));
  return { ready: success, dirty, canSubmit: success && dirty };
};

const PROFIL = { firstName: 'Ada', lastName: 'Lovelace', phone: '061234567' };

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

  it('reste inactif si un champ est vidé', () => {
    expect(evaluate(PROFIL, { ...PROFIL, firstName: '' }).canSubmit).toBe(false);
  });

  it('détecte un changement sur chaque champ', () => {
    for (const patch of [{ firstName: 'Awa' }, { lastName: 'Mbarga' }, { phone: '065678901' }]) 
      expect(evaluate(PROFIL, { ...PROFIL, ...patch }).canSubmit, JSON.stringify(patch)).toBe(true);
    
  });
});