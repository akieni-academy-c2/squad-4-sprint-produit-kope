import { describe, expect, it } from 'vitest';
import {
  updateAccountSchema,
  updateProfileSchema,
  validateFrontend,
} from '@/shared/utils/validators.js';

/**
 * Le formulaire d'édition du profilprofessionnel couvre deux ensembles de
 * champs distincts :
 *
 *   - l'identité du compte : firstName, lastName, phone ;
 *   - la fiche professionnelle : displayName, tradeId, description…
 *
 * L'identité est validée par `updateAccountSchema` et envoyée par
 * `updateAccount`, la fiche par `updateProfileSchema` et `updateMyProfile`.
 * Un bouton d'enregistrement qui n'agrège que la seconde reste inactif quand
 * seul le prénom change : le profil ne peut alors pas être corrigé.
 */
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
    // Les trois états d'un champ jamais renseigné doivent passer : absent
    // (aucun `email` dans l'objet), chaîne vide, `null` explicite. Un `z.string()`
    // nu refuse les deux derniers et garde « Enregistrer » éteint pour toujours.
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
    // Minuscules et sans espaces : c'est la forme stockée, celle que porte
    // l'index unique. Garder la casse ferait dépendre l'unicité de la frappe.
    expect(data.email).toBe('simone.adoua@exemple.com');

    expect(validateFrontend(updateAccountSchema, { ...ACCOUNT, email: 'pas-une-adresse' }).success).toBe(false);
  });

  it('n\'est pas validé par le schéma du profil', () => {
    // Les deux schémas sont disjoints : sans agrégation explicite, la validité
    // de l'identité n'est jamais consultée.
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
    // `preprocess` convertit '' en undefined, puis `z.number` le refuse : le
    // champ est obligatoire. Ne pas confondre avec le cas de `whatsapp`, qui
    // accepte l'absence.
    expect(validateFrontend(updateProfileSchema, { ...PROFILE, yearsExperience: '' }).success).toBe(false);
    expect(validateFrontend(updateProfileSchema, { ...PROFILE, yearsExperience: '12' }).data.yearsExperience).toBe(12);
  });

  it('traite un WhatsApp vide comme absent', () => {
    const { success, data } = validateFrontend(updateProfileSchema, PROFILE);

    expect(success).toBe(true);
    expect(data.whatsapp).toBeNull();
  });
});