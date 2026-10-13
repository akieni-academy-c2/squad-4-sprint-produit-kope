import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema } from '../../utils/commonSchemas.js';
import {
  categorySchema,
  citySchema,
  createAdminSchema,
  listProfessionalsQuerySchema,
  listReviewsQuerySchema,
  listUsersQuerySchema,
  reorderSchema,
  tradeItemSchema,
  userBlockedSchema,
  userSuspendedSchema,
  visibilitySchema,
  zoneItemSchema,
} from './admin.schemas.js';
import * as controller from './admin.controller.js';

const router = Router();

// Tout ce qui est sous /admin est réservé à l'administrateur
router.use('/admin', requireRole('admin'));

router.get('/admin/stats', controller.getStats);

router.get('/admin/professionals', validate(listProfessionalsQuerySchema, 'query'), controller.listProfessionals);
router.patch(
  '/admin/professionals/:id/visibility',
  validate(idParamSchema, 'params'),
  validate(visibilitySchema),
  controller.setProfessionalHidden,
);

router.get('/admin/reviews', validate(listReviewsQuerySchema, 'query'), controller.listReviews);
router.patch(
  '/admin/reviews/:id/visibility',
  validate(idParamSchema, 'params'),
  validate(visibilitySchema),
  controller.setReviewHidden,
);

router.get('/admin/users', validate(listUsersQuerySchema, 'query'), controller.listUsers);
router.patch(
  '/admin/users/:id/blocked',
  validate(idParamSchema, 'params'),
  validate(userBlockedSchema),
  controller.setUserBlocked,
);
router.patch(
  '/admin/users/:id/suspended',
  validate(idParamSchema, 'params'),
  validate(userSuspendedSchema),
  controller.setUserSuspended,
);
router.post('/admin/users', validate(createAdminSchema), controller.createAdmin);

router.get('/admin/trades', controller.listTrades);
router.post('/admin/trades', validate(tradeItemSchema), controller.createTrade);
router.post('/admin/trades/reorder', validate(reorderSchema), controller.reorderTrades);
router.put('/admin/trades/:id', validate(idParamSchema, 'params'), validate(tradeItemSchema), controller.updateTrade);
router.delete('/admin/trades/:id', validate(idParamSchema, 'params'), controller.deleteTrade);

router.get('/admin/trade-categories', controller.listTradeCategories);
router.post('/admin/trade-categories', validate(categorySchema), controller.createTradeCategory);
router.post('/admin/trade-categories/reorder', validate(reorderSchema), controller.reorderTradeCategories);
router.put(
  '/admin/trade-categories/:id',
  validate(idParamSchema, 'params'),
  validate(categorySchema),
  controller.updateTradeCategory,
);
router.delete('/admin/trade-categories/:id', validate(idParamSchema, 'params'), controller.deleteTradeCategory);

router.get('/admin/zones', controller.listZones);
router.post('/admin/zones', validate(zoneItemSchema), controller.createZone);
router.post('/admin/zones/reorder', validate(reorderSchema), controller.reorderZones);
router.put('/admin/zones/:id', validate(idParamSchema, 'params'), validate(zoneItemSchema), controller.updateZone);
router.delete('/admin/zones/:id', validate(idParamSchema, 'params'), controller.deleteZone);

router.get('/admin/cities', controller.listCities);
router.post('/admin/cities', validate(citySchema), controller.createCity);
router.post('/admin/cities/reorder', validate(reorderSchema), controller.reorderCities);
router.put('/admin/cities/:id', validate(idParamSchema, 'params'), validate(citySchema), controller.updateCity);
router.delete('/admin/cities/:id', validate(idParamSchema, 'params'), controller.deleteCity);

export default router;
