import { describe, expect, it } from 'vitest';
import {
  updateAccountSchema,
  updateProfileSchema,
  validateFrontend,
} from '@/shared/utils/validators.js';


const ACCOUNT = {
  firstName: 'Simone',
  lastName: 'Adoua',
  phone: '+242061261008',
};

const PROFILE = {
  displayName: 'Simone maçonne',
  tradeId: '3',
  description: 'Maîtrise d Enfermement et de dallage, devis gratuit sur Brazzaville.',
  yearsExperience: '8',
  whatsapp: '',
  zoneIds: [1],
};

describe('Édition du profil - identité du compte', () => {
  it('valide une identité correcte', () => {
    expect(validateFrontend(updateAccountSchema, ACCOUNT).success).toBe(true);
  });

  it('refuse un prénom vide', () => {
    const { success, errors } = validateFrontend(updateAccountSchema, {
      ...ACCOUNT,
      firstName: '',
    });

    expect(success).toBe(false);
    expect(errors.firstName).toBeTruthy();
  });

  it('refuse un téléphone mal saisi', () => {
    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT, phone: '00242' }).success).toBe(false);
    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT, phone: '+242061261008' }).success).toBe(true);
  });

  it('traite l\'e-mail comme facultatif et effaçable', () => {
    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT }).success).toBe(true);
    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT, email: '' }).success).toBe(true);
    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT, email: null }).success).toBe(true);
  });

  it('normalise l\'e-mail et refuse une adresse invalide', () => {
    const { success, data } = validateFrontend(updateAccountSchema, {
      ...ACCOUNT,
      email: '  Simone.Adoua@Exemple.COM ',
    });

    expect(success).toBe(true);
    expect(data.email).toBe('simone.adoua@exemple.com');

    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT, email: 'pas-une-adresse' }).success).toBe(false);
  });

  it('n\'est pas validé par le schéma du profil', () => {
    const fields = Object.keys(updateAccountSchema.shape);
    const profileFields = Object.keys(updateProfileSchema.shape);

    expect(fields.some((f) => profileFields.includes(f))).toBe(false);
  });
});

describe('Édition du profil - schéma professionnel', () => {
  it('accepte la fiche de référence', () => {
    expect(validateFrontend(updateProfileSchema, PROFILE).success).toBe(true);
  });

  it('exige une description suffisamment longue', () => {
    expect(validateFrontend(updateProfileSchema, { ...PROFILE, description: 'Courte' }).success).toBe(false);
  });

  it('exige l\'expérience et n\'accepte pas une valeur vide', () => {
    expect(validateFrontend(updateProfileSchema, { ...PROFILE, yearsExperience: '' }).success).toBe(false);
    expect(validateFrontend(updateProfileSchema, { ...PROFILE, yearsExperience: '12' }).data.yearsExperience).toBe(12);
  });

  it('traite un WhatsApp vide comme absent', () => {
    const { success, data } = validateFrontend(updateProfileSchema, PROFILE);

    expect(success).toBe(true);
    expect(data.whatsapp).toBeNull();
  });
});