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


const termsVersionSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Version des conditions invalide');
export const registerClientSchema = z.object({
  firstName: personNameSchema,
  lastName: personNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  consent: consentSchema,
  termsVersion: termsVersionSchema,
});

export const registerProfessionalSchema = z.object({
  displayName: displayNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  tradeId: idSchema('Choisissez un métier'),
  zoneIds: zoneIdsSchema,
  consent: consentSchema,
  
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


export const loginSchema = z.object({
  phone: z.string({ error: 'Champ obligatoire' }).trim().min(1, 'Champ obligatoire'),
  password: z
    .string({ error: 'Champ obligatoire' })
    .min(1, 'Champ obligatoire')
    .max(72, 'Mot de passe trop long'),
});

export const updateAccountSchema = z.object({
  firstName: personNameSchema.optional(),
  lastName: personNameSchema.optional(),
  phone: phoneSchema.optional(),
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
