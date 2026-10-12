import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { idParamSchema } from '../../utils/commonSchemas.js';
import { createReportSchema, listReportsQuerySchema, reportStatusSchema } from './reports.schemas.js';
import * as controller from './reports.controller.js';

const router = Router();

// Suivi et retrait de ses propres signalements. Même chemin que la lecture
// publique des avis : l'auteur est déduit de la session, jamais du corps.
router.get('/reports/mine', requireAuth, validate(listReportsQuerySchema, 'query'), controller.mine);

router.delete('/reports/:id', requireAuth, validate(idParamSchema, 'params'), controller.remove);

// Traitement côté administrateur
router.get('/admin/reports', requireRole('admin'), validate(listReportsQuerySchema, 'query'), controller.list);
router.patch(
  '/admin/reports/:id',
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(reportStatusSchema),
  controller.setStatus,
);

// Signalement d'un profil depuis la fiche publique.
//
// Limité par utilisateur, pas seulement par IP : un signalement déclenche un
// auto-blocage à partir du seuil (3 par défaut). Sans ce plafond, quelques
// comptes suffisaient à faire bloquer un professionnel en ligne.
router.post(
  '/professionals/:id/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 60 * 1000, key: 'reports', byUser: true }),
  validate(idParamSchema, 'params'),
  validate(createReportSchema),
  controller.create,
);

export default router;
