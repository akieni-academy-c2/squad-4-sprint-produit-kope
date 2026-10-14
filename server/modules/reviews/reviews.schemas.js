import { z } from 'zod';
import { idSchema, paginationSchema } from '../../utils/commonSchemas.js';

export const createReviewSchema = z.object({
  rating: z
    .number({ error: 'La note est obligatoire' })
    .int('La note doit être comprise entre 1 et 5')
    .min(1, 'La note doit être comprise entre 1 et 5')
    .max(5, 'La note doit être comprise entre 1 et 5'),
  comment: z
    .string()
    .trim()
    .max(300, 'Le commentaire ne doit pas dépasser 300 caractères')
    .nullish()
    .transform((value) => value || null),
});


export const updateReviewSchema = z.object({
  rating: z
    .number({ error: 'La note est obligatoire' })
    .int('La note doit être comprise entre 1 et 5')
    .min(1, 'La note doit être comprise entre 1 et 5')
    .max(5, 'La note doit être comprise entre 1 et 5'),
  comment: z
    .string()
    .trim()
    .max(300, 'Le commentaire ne doit pas dépasser 300 caractères')
    .nullish()
    .transform((value) => value || null),
});

export const reviewVisibilitySchema = z.object({
  isHidden: z.boolean({ error: 'La visibilité est obligatoire' }),
});


export const myReviewsQuerySchema = paginationSchema.extend({
  q: z
    .string()
    .trim()
    .max(100, 'Recherche trop longue')
    .nullish()
    .transform((value) => value || ''),
  rating: z.coerce.number().int().min(1).max(5).nullish(),
  professionalId: idSchema().nullish(),
  visibility: z.enum(['all', 'visible', 'hidden']).default('all'),
  sort: z.enum(['recent', 'oldest', 'rating_desc', 'rating_asc']).default('recent'),
});
