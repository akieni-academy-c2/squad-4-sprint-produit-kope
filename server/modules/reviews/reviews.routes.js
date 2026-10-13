import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema, paginationSchema } from '../../utils/commonSchemas.js';
import { createReviewSchema, myReviewsQuerySchema, reviewVisibilitySchema, updateReviewSchema } from './reviews.schemas.js';
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
  validate(myReviewsQuerySchema, 'query'),
  controller.mine,
);

// Gestion de son propre avis. Le client_id n'est jamais lu dans le corps : il
// vient de la session, donc ces trois routes ne peuvent agir que sur ses
// propres avis. Le masquage est séparé de la mise à jour - corriger un texte
// ne doit pas réafficher un avis que le client avait retiré.
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
