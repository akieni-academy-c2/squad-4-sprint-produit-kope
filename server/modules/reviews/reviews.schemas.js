import { z } from 'zod';
import { idSchema, paginationSchema } from '../../utils/commonSchemas.js';

/** US-14 CA2 */
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

/**
 * Correction d'un avis déjà déposé.
 *
 * `rating` est obligatoire : un PATCH ne doit pas pouvoir vider un avis en
 * n'envoyant que `comment`. Le service rejette un corps sans note, donc
 * l'obligation est vérifiée des deux côtés.
 */
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

/** Masquage : l'avis reste attaché au professionnel, seul le client le retire
 *  de sa fiche. `false` le réaffiche. */
export const reviewVisibilitySchema = z.object({
  isHidden: z.boolean({ error: 'La visibilité est obligatoire' }),
});

/**
 * Filtres de « Mes avis ».
 *
 * `visibility` remplace un booléen simple : trois états sont nécessaires —
 * tous, masqués seuls, visibles seuls — et `hidden=true` seul ne peut pas
 * exprimer le troisième.
 */
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
});
