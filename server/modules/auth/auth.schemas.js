import { z } from 'zod';
import {
  consentSchema,
  displayNameSchema,
  emailSchema,
  idSchema,
  passwordSchema,
  personNameSchema,
  phoneSchema,
  zoneIdsSchema,
} from '../../utils/commonSchemas.js';

/** US-01 */

/**
 * Version des conditions acceptees.
 *
 * Meme forme que le CHECK SQL `users_terms_version_format` : une date de
 * publication. Le laisser libre donnerait la possibilite d'enregistrer « v3 »,
 * qu'on ne saurait plus rattacher a aucun texte.
 */
export const termsVersionSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Version des conditions invalide');
export const registerClientSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  consent: consentSchema,
  // Ce QUI a ete accepte, pas seulement QUAND. `consented_at` existe deja ;
  // sans la version, un consentement n'est opposable que face a un texte
  // qui n'existe plus.
  termsVersion: termsVersionSchema,
});

/** US-02 */
export const registerProfessionalSchema = z.object({
  displayName: displayNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  tradeId: idSchema('Choisissez un métier'),
  zoneIds: zoneIdsSchema,
  consent: consentSchema,
  // Ce QUI a ete accepte, pas seulement QUAND. `consented_at` existe deja ;
  // sans la version, un consentement n'est opposable que face a un texte
  // qui n'existe plus.
  termsVersion: termsVersionSchema,
});

export const becomeProfessionalSchema = z.object({
  displayName: displayNameSchema,
  tradeId: idSchema('Choisissez un metier'),
  zoneIds: zoneIdsSchema,
  yearsExperience: z.coerce
    .number()
    .int("Indiquez un nombre entier d'annees")
    .min(0, "Les annees d'experience doivent etre comprises entre 0 et 60")
    .max(60, "Les annees d'experience doivent etre comprises entre 0 et 60"),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(30, 'La description doit contenir au moins 30 caracteres')
    .max(500, 'La description ne doit pas depasser 500 caracteres'),
});

/** US-03 */
export const loginSchema = z.object({
  phone: z.string({ error: 'Champ obligatoire' }).trim().min(1, 'Champ obligatoire'),
  // 72 octets est la limite de bcrypt : au-dela, le mot de passe est tronque
  // silencieusement et deux valeurs distinctes produiraient le meme hash.
  // Sans plafond, un corps de 100 ko alloue un tableau JS par caractere.
  password: z
    .string({ error: 'Champ obligatoire' })
    .min(1, 'Champ obligatoire')
    .max(72, 'Mot de passe trop long'),
});

/**
 * Modification du compte.
 *
 * `currentPassword` est exige des que le telephone ou l'e-mail change : le
 * telephone est le seul identifiant de connexion du produit, en changer sans
 * re-authentification offre un verrouillage definitif du titulaire legitime
 * pour quiconque detient une session volee.
 */
export const updateAccountSchema = z.object({
  firstName: personNameSchema.optional(),
  lastName: personNameSchema.optional(),
  phone: phoneSchema.optional(),
  // `emailSchema` est deja `nullish` : absent laisse la colonne intacte,
  // `null` ou chaine vide la retirent.
  email: emailSchema,
  currentPassword: z
    .string({ error: 'Champ obligatoire' })
    .min(1, 'Champ obligatoire')
    .max(72, 'Mot de passe trop long')
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: 'Champ obligatoire' }).min(1, 'Champ obligatoire').max(72, 'Mot de passe trop long'),
  newPassword: passwordSchema,
});
