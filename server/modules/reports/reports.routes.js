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

// Signalement d'un correspondant depuis la liste des contacts. Cible un compte,
// pas une fiche publiée : un client n'a pas de fiche, et c'est le contact qui
// fait foi. Le service refuse toute cible sans conversation réelle.
router.post(
  '/contacts/:id/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 60 * 1000, key: 'reports', byUser: true }),
  validate(idParamSchema, 'params'),
  validate(createReportSchema),
  controller.createForContact,
);

// Signalement d'un avis reçu. Réservé au professionnel dont c'est la fiche —
// l'autorisation est portée par la requête du service, pas par un rôle :
// n'importe quel professionnel est « professionnel ».
router.post(
  '/reviews/:id/reports',
  requireAuth,
  rateLimit({ max: 5, windowMs: 60 * 60 * 1000, key: 'reports', byUser: true }),
  validate(idParamSchema, 'params'),
  validate(createReviewReportSchema),
  controller.createForReview,
);

// File de modération des signalements d'avis.
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
