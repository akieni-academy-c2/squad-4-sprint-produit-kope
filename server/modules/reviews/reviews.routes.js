import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema, paginationSchema } from '../../utils/commonSchemas.js';
import { createReviewSchema, myReviewsQuerySchema, reviewVisibilitySchema, updateReviewSchema } from './reviews.schemas.js';
import * as controller from './reviews.controller.js';

const router = Router();

router.get(
  '/professionals/:id/reviews',
  validate(idParamSchema, 'params'),
  validate(paginationSchema, 'query'),
  controller.list,
);

router.get(
  '/reviews/mine',
  requireAuth,
  validate(myReviewsQuerySchema, 'query'),
  controller.mine,
);

router.patch(
  '/reviews/:id',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(updateReviewSchema),
  controller.update,
);

router.patch(
  '/reviews/:id/visibility',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(reviewVisibilitySchema),
  controller.setVisibility,
);

router.delete('/reviews/:id', requireAuth, validate(idParamSchema, 'params'), controller.remove);

router.get(
  '/clients/:id/reviews',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(paginationSchema, 'query'),
  controller.byClient,
);

router.post(
  '/professionals/:id/reviews',
  requireRole('client', 'professional'),
  validate(idParamSchema, 'params'),
  validate(createReviewSchema),
  controller.create,
);

export default router;
