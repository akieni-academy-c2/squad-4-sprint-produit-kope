import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema, paginationSchema } from '../../utils/commonSchemas.js';
import { createReviewSchema } from './reviews.schemas.js';
import * as controller from './reviews.controller.js';

const router = Router();

// US-15
router.get(
  '/professionals/:id/reviews',
  validate(idParamSchema, 'params'),
  validate(paginationSchema, 'query'),
  controller.list,
);

// Avis
router.get(
  '/reviews/mine',
  requireAuth,
  validate(paginationSchema, 'query'),
  controller.mine,
);

// avis client
router.get(
  '/clients/:id/reviews',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(paginationSchema, 'query'),
  controller.byClient,
);

// US-14
router.post(
  '/professionals/:id/reviews',
  requireRole('client', 'professional'),
  validate(idParamSchema, 'params'),
  validate(createReviewSchema),
  controller.create,
);

export default router;
