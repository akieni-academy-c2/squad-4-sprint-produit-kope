import { describe, it, expect } from 'vitest';
import {
  displayNameSchema,
  passwordSchema,
  personNameSchema,
  phoneSchema,
} from '../server/utils/commonSchemas.js';
import { registerClientSchema } from '../server/modules/auth/auth.schemas.js';
import { updateProfileSchema } from '../server/modules/professionals/professionals.schemas.js';

describe('règles de mot de passe', () => {
  it('accepte un mot de passe conforme', () => {
    expect(passwordSchema.safeParse('Motdepasse1').success).toBe(true);
    expect(passwordSchema.safeParse('K0pé!aB2').success).toBe(true);
  });

  it('exige au moins 8 caractères', () => {
    expect(passwordSchema.safeParse('Abcdef1').success).toBe(false);
    expect(passwordSchema.safeParse('Abcdefg1').success).toBe(true);
  });

  it('exige une minuscule', () => {
    const r = passwordSchema.safeParse('MOTDEPASSE1');
    expect(r.success).toBe(false);
    expect(r.error.issues[0].message).toMatch(/minuscule/);
  });

  it('exige une majuscule', () => {
    const r = passwordSchema.safeParse('motdepasse1');
    expect(r.success).toBe(false);
    expect(r.error.issues[0].message).toMatch(/majuscule/);
  });

  it('exige un chiffre', () => {
    const r = passwordSchema.safeParse('Motdepasse');
    expect(r.success).toBe(false);
    expect(r.error.issues[0].message).toMatch(/chiffre/);
  });

  it('accepte les accents comme lettres', () => {
    expect(passwordSchema.safeParse('Été20245').success).toBe(true);
  });

  it('refuse au-delà de 72 caractères (limite bcrypt)', () => {
    expect(passwordSchema.safeParse(`A1${'a'.repeat(71)}`).success).toBe(false);
  });
});

describe('règles de nom de personne', () => {
  it('accepte les noms réels courants', () => {
    for (const name of ['Ada', 'Mbarga', 'Jean-Pierre', "O'Brien", 'Nsimba', 'Kopé', 'De La Salle'])
      expect(personNameSchema.safeParse(name).success, name).toBe(true);

  });

  it('refuse les chiffres', () => {
    expect(personNameSchema.safeParse('Ada2').success).toBe(false);
    expect(personNameSchema.safeParse('007').success).toBe(false);
  });

  it('refuse les symboles et le HTML', () => {
    for (const name of ['<script>', '@@@', 'a@b.com', 'x;y', 'a/b'])
      expect(personNameSchema.safeParse(name).success, name).toBe(false);

  });

  it('exige au moins 2 caractères', () => {
    expect(personNameSchema.safeParse('A').success).toBe(false);
    expect(personNameSchema.safeParse('  ').success).toBe(false);
  });

  it('refuse un nom dépassant 50 caractères', () => {
    expect(personNameSchema.safeParse('a'.repeat(51)).success).toBe(false);
  });
});

describe('règles de nom affiché', () => {
  it('accepte les pseudonymes commerciaux', () => {
    for (const name of ['Plomberie Makélékélé Services', 'BTP & Carrelage', 'Kope.Pro 24', "L'Atelier d'Ada", 'Maçon-Grâce'])
      expect(displayNameSchema.safeParse(name).success, name).toBe(true);

  });

  it('exige au moins 3 caractères', () => {
    expect(displayNameSchema.safeParse('Ab').success).toBe(false);
  });

  it('refuse les caractères non autorisés', () => {
    for (const name of ['<script>alert(1)</script>', 'a@b', 'nom#1', 'x$y', 'e-mail@test'])
      expect(displayNameSchema.safeParse(name).success, name).toBe(false);

  });

  it('ne peut pas commencer par un symbole', () => {
    expect(displayNameSchema.safeParse('&Service').success).toBe(false);
  });
});

describe('intégration des règles dans les formulaires', () => {
  it('inscription client refuse un prénom numérique', () => {
    const base = { firstName: 'Ada', lastName: 'Kopé', phone: '061234567', password: 'Motdepasse1', consent: true };
    expect(registerClientSchema.safeParse(base).success).toBe(true);
    expect(registerClientSchema.safeParse({ ...base, firstName: 'Ada99' }).success).toBe(false);
    expect(registerClientSchema.safeParse({ ...base, password: 'motdepasse1' }).success).toBe(false);
  });

  it('le profil professionnel valide le nom affiché', () => {
    const base = {
      displayName: 'Plomberie Kope',
      tradeId: 1,
      description: 'x'.repeat(40),
      yearsExperience: 5,
      zoneIds: [1],
    };
    expect(updateProfileSchema.safeParse(base).success).toBe(true);
    expect(updateProfileSchema.safeParse({ ...base, displayName: 'ab' }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ ...base, displayName: '<script>' }).success).toBe(false);
  });
});

describe('règles de téléphone', () => {
  it('normalise les formats nationaux et internationaux', () => {
    for (const input of ['061234567', '+242061234567', '00242061234567', '06 12 34 56 7']) {
      expect(phoneSchema.safeParse(input).success, input).toBe(true);
      expect(phoneSchema.parse(input)).toBe('+242061234567');
    }
  });

  it('refuse les formats invalides', () => {
    for (const input of ['123', 'abcdefghi', '0612345', '0612345678', '+33 6 12 34 56 78'])
      expect(phoneSchema.safeParse(input).success, input).toBe(false);

  });
});