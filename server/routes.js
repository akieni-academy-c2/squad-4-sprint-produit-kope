import { Router } from 'express';
import { isDatabaseReachable } from './db/pool.js';

import authRoutes from './modules/auth/auth.routes.js';
import referenceRoutes from './modules/reference/reference.routes.js';
import professionalsRoutes from './modules/professionals/professionals.routes.js';
import photosRoutes from './modules/photos/photos.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import contactsRoutes from './modules/contacts/contacts.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const router = Router();

router.get('/health', async (req, res) => {
  await isDatabaseReachable();
  res.json({ status: 'ok' });
});

router.use(authRoutes);
router.use(referenceRoutes);
router.use(searchRoutes);
router.use(professionalsRoutes);
router.use(photosRoutes);
router.use(reviewsRoutes);
router.use(contactsRoutes);
router.use(reportsRoutes);
router.use(adminRoutes);

export default router;
