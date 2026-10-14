import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { rateLimit, loginLimit } from '../../middlewares/rateLimit.js';
import { upload } from '../../middlewares/upload.js';
import {
  becomeProfessionalSchema,
  changePasswordSchema,
  loginSchema,
  registerClientSchema,
  registerProfessionalSchema,
  updateAccountSchema,
} from './auth.schemas.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/auth/register/client', rateLimit({ max: 10, key: 'register' }), validate(registerClientSchema), controller.registerClient);
router.post('/auth/register/professional', rateLimit({ max: 10, key: 'register' }), validate(registerProfessionalSchema), controller.registerProfessional);
router.post('/auth/become-professional', requireAuth, rateLimit({ max: 5, key: 'become-pro', byUser: true }), validate(becomeProfessionalSchema), controller.becomeProfessional);
router.post('/auth/login', validate(loginSchema), loginLimit(), controller.login);
router.post('/auth/logout', requireAuth, controller.logout);
router.get('/auth/me', controller.me);
router.put('/auth/me', requireAuth, validate(updateAccountSchema), controller.updateAccount);
router.put('/auth/password', requireAuth, rateLimit({ max: 10, key: 'password' }), validate(changePasswordSchema), controller.changePassword);
router.post('/auth/avatar', requireAuth, rateLimit({ max: 10, windowMs: 60 * 60 * 1000, key: 'avatar', byUser: true }), upload.single('avatar'), controller.uploadAvatar);

export default router;
