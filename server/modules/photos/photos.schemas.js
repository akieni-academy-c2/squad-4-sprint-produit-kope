import { z } from 'zod';

export const addPhotoSchema = z.object({
  title: z
    .string({ error: 'Le titre est obligatoire' })
    .trim()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
});
