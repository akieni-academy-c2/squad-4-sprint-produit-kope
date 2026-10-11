import { z } from 'zod';
import { idSchema, paginationSchema, passwordSchema, phoneSchema, requiredText } from '../../utils/commonSchemas.js';

const emptyToUndefined = (value) => (value === '' || value == null ? undefined : value);

export const userBlockedSchema = z.object({
  blocked: z.boolean({ error: 'Valeur invalide' }),
});

export const userSuspendedSchema = z.object({
  suspended: z.boolean({ error: 'Valeur invalide' }),
});

export const createAdminSchema = z.object({
  firstName: requiredText(60, 'Le prénom est obligatoire'),
  lastName: requiredText(60, 'Le nom est obligatoire'),
  phone: phoneSchema,
  password: passwordSchema,
});

export const visibilitySchema = z.object({
  hidden: z.boolean({ error: 'Valeur invalide' }),
});

export const listProfessionalsQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  status: z.preprocess(emptyToUndefined, z.enum(['published', 'incomplete', 'hidden']).optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(['name', 'recent']).optional()),
  city: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
});

export const listReviewsQuerySchema = paginationSchema.extend({
  hidden: z.preprocess(
    (value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    },
    z.boolean().optional(),
  ),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

export const listUsersQuerySchema = paginationSchema.extend({
  role: z.preprocess(emptyToUndefined, z.enum(['client', 'professional', 'admin']).optional()),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

export const tradeItemSchema = z.object({
  name: requiredText(60, 'Le nom est obligatoire'),
  categoryId: z.preprocess(emptyToUndefined, idSchema('Catégorie invalide').optional()),
});

export const zoneItemSchema = z.object({
  name: requiredText(60, 'Le nom est obligatoire'),
  cityId: z.preprocess(emptyToUndefined, idSchema('Ville invalide').optional()),
});

export const categorySchema = z.object({
  name: requiredText(60, 'Le nom est obligatoire'),
});

export const citySchema = z.object({
  name: requiredText(60, 'Le nom est obligatoire'),
});

export const reorderSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1, 'Liste vide'),
});
