import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { upload } from '../../middlewares/upload.js';
import { idParamSchema } from '../../utils/commonSchemas.js';
import { addPhotoSchema } from './photos.schemas.js';
import * as controller from './photos.controller.js';

const router = Router();

const photoWriteLimit = rateLimit({
  key: 'photos-write',
  max: 30,
  windowMs: 60 * 60_000,
  byUser: true,
});

router.post(
  '/me/photos',
  requireRole('professional'),
  photoWriteLimit,
  upload.single('photo'),
  validate(addPhotoSchema),
  controller.add,
);


router.put(
  '/me/photos/:id',
  requireRole('professional'),
  photoWriteLimit,
  validate(idParamSchema, 'params'),
  validate(addPhotoSchema),
  controller.update,
);

router.delete(
  '/me/photos/:id',
  requireRole('professional'),
  photoWriteLimit,
  validate(idParamSchema, 'params'),
  controller.remove,
);

export default router;