import { z } from 'zod';
import {
  consentSchema,
  displayNameSchema,
  idSchema,
  passwordSchema,
  personNameSchema,
  phoneSchema,
  zoneIdsSchema,
} from '../../utils/commonSchemas.js';

/** US-01 */
export const registerClientSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  consent: consentSchema,
});

/** US-02 */
export const registerProfessionalSchema = z.object({
  displayName: displayNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  tradeId: idSchema('Choisissez un métier'),
  zoneIds: zoneIdsSchema,
  consent: consentSchema,
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
  password: z.string({ error: 'Champ obligatoire' }).min(1, 'Champ obligatoire'),
});

export const updateAccountSchema = z.object({
  firstName: personNameSchema.optional(),
  lastName: personNameSchema.optional(),
  phone: phoneSchema.optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: 'Champ obligatoire' }).min(1, 'Champ obligatoire'),
  newPassword: passwordSchema,
});
