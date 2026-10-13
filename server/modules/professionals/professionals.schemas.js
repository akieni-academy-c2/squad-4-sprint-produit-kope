import { z } from 'zod';
import { displayNameSchema, phoneSchema, zoneIdsSchema, idSchema } from '../../utils/commonSchemas.js';

/** US-04 */
export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
  tradeId: idSchema('Choisissez un métier'),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(30, 'La description doit contenir au moins 30 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
  yearsExperience: z.coerce
    .number({ error: "Indiquez vos années d'expérience" })
    .int("Indiquez un nombre entier d'années")
    .min(0, "Les années d'expérience doivent être comprises entre 0 et 60")
    .max(60, "Les années d'expérience doivent être comprises entre 0 et 60"),
  whatsapp: z.preprocess((value) => (value === '' ? null : value), phoneSchema.nullish()),
  // La ville vient du catalogue de l'administrateur, d'où `idSchema` borné à
  // 32767 : une ville qui n'existe pas est refusée avant d'atteindre la clé
  // étrangère, pas transformée en 500.
  // Facultative : les profils antérieurs à cette colonne n'en ont pas, et les
  // rendre obligatoires les mettrait hors conformité au premier enregistrement.
  cityId: z.preprocess((value) => (value === '' ? null : value), idSchema('Choisissez une ville').nullish()),
  zoneIds: zoneIdsSchema,
});

/** US-12 */
export const availabilitySchema = z.object({
  isAvailable: z.boolean({ error: 'Valeur invalide' }),
});
