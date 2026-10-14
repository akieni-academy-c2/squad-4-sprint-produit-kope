import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { idParamSchema, paginationSchema } from '../../utils/commonSchemas.js';
import { createReportSchema, createReviewReportSchema, listReportsQuerySchema, reportStatusSchema } from './reports.schemas.js';
import * as controller from './reports.controller.js';

const router = Router();

router.get('/reports/mine', requireAuth, validate(listReportsQuerySchema, 'query'), controller.mine);

router.delete('/reports/:id', requireAuth, validate(idParamSchema, 'params'), controller.remove);

router.get('/admin/reports', requireRole('admin'), validate(listReportsQuerySchema, 'query'), controller.list);
router.patch(
  '/admin/reports/:id',
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(reportStatusSchema),
  controller.setStatus,
);

router.post(
  '/professionals/:id/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 60 * 1000, key: 'reports', byUser: true }),
  validate(idParamSchema, 'params'),
  validate(createReportSchema),
  controller.create,
);

router.post(
  '/contacts/:id/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 60 * 1000, key: 'reports', byUser: true }),
  validate(idParamSchema, 'params'),
  validate(createReportSchema),
  controller.createForContact,
);

router.post(
  '/reviews/:id/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 60 * 1000, key: 'reports', byUser: true }),
  validate(idParamSchema, 'params'),
  validate(createReviewReportSchema),
  controller.createForReview,
);

router.get(
  '/admin/review-reports',
  requireRole('admin'),
  validate(paginationSchema.extend({ status: z.enum(['pending', 'resolved', 'dismissed']).optional() }), 'query'),
  controller.listReviewReports,
);
router.patch(
  '/admin/review-reports/:id',
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(reportStatusSchema),
  controller.setReviewReportStatus,
);

export default router;
