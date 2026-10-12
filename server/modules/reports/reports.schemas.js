import { z } from 'zod';
import { paginationSchema } from '../../utils/commonSchemas.js';

const emptyToUndefined = (value) => (value === '' || value == null ? undefined : value);

export const REPORT_REASONS = [
  'fake_profile',
  'harassment',
  'spam',
  'inappropriate',
  'fraud',
  'other',
];

export const createReportSchema = z.object({
  reason: z.enum(REPORT_REASONS, { error: 'Motif invalide' }),
  message: z
    .preprocess(emptyToUndefined, z.string().trim().min(3, 'Le message doit contenir au moins 3 caractères').max(500, 'Le message ne doit pas dépasser 500 caractères').optional())
    .transform((value) => value || null),
});

export const listReportsQuerySchema = paginationSchema.extend({
  status: z.preprocess(emptyToUndefined, z.enum(['pending', 'resolved', 'dismissed']).optional()),
  q: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(['recent', 'oldest']).optional()),
});

export const reportStatusSchema = z.object({
  status: z.enum(['resolved', 'dismissed'], { error: 'Statut invalide' }),
});
