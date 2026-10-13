import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { rateLimit } from '../../middlewares/rateLimit.js';
import { upload } from '../../middlewares/upload.js';
import { idParamSchema } from '../../utils/commonSchemas.js';
import { addPhotoSchema } from './photos.schemas.js';
import * as controller from './photos.controller.js';

const router = Router();

/**
 * Un ajout de photo est la requête la plus chère de l'API : Multer lit 5 Mo en
 * mémoire, sharp décode et ré-encode deux fois. Sans plafond, un compte
 * professionnel gratuit peut sature les workers libvips et la facturation
 * Cloudinary en boucle. La limite est par utilisateur, pas par IP : derrière
 * une box, une famille entière n'a pas à se partager le quota.
 */
const photoWriteLimit = rateLimit({
  key: 'photos-write',
  max: 30,
  windowMs: 60 * 60_000,
  byUser: true,
});

// US-05
router.post(
  '/me/photos',
  requireRole('professional'),
  photoWriteLimit,
  upload.single('photo'),
  validate(addPhotoSchema),
  controller.add,
);

// Modification du titre
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