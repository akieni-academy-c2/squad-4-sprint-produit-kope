import sharp from 'sharp';
import { ApiError } from './ApiError.js';

/** Formats réellement décodés, vérifiés sur les octets du fichier. */
const ALLOWED_FORMATS = ['jpeg', 'png'];

export const INVALID_IMAGE = "Le fichier n'est pas une image JPG ou PNG valide";
export const IMAGE_TOO_LARGE = "L'image est trop grande pour être traitée";

/**
 * Plafond de pixels décodés.
 *
 * La limite par défaut de sharp est de 268 402 689 pixels. Un PNG de 5 Mo
 * déclarant 16 384 x 16 384 passe la limite de taille du fichier et représente
 * environ 1 Go de RGBA en mémoire - sur un serveur qui traite plusieurs
 * téléversements à la fois, c'est un arrêt de la machine. 40 M de pixels
 * couvre très largement un 8 000 x 5 000, soit bien au-delà de ce que les
 * daliennes 1600 pxjustifient.
 */
const MAX_INPUT_PIXELS = 40_000_000;

const SHARP_OPTIONS = {
  limitInputPixels: MAX_INPUT_PIXELS,
  // `warning` transforme les EnTêtes douteuses (profil ICC cassé, métadonnées
  // tronquées) en erreur : mieux vaut refuser que produire une image abimée.
  failOn: 'warning',
  sequentialRead: true,
};

/**
 * Ouvre une image en contrôlant son format réel.
 *
 * Le `fileFilter` de multer se fie à `file.mimetype`, valeur fournie par le
 * client et donc falsifiable. Seul le décodage fait foi : sans cette
 * vérification, sharp réencodait sans broncher un GIF, un TIFF ou une archive
 * déguisée en image.
 *
 * Le plafond de pixels est appliqué aux deux instances - celle qui lit les
 * métadonnées et celle qui travaille - sinon la première acceptsrait l'image
 * que la seconde refuse.
 */
export async function decodeImage(buffer, { field = 'photo' } = {}) {
  let format;
  try {
    ({ format } = await sharp(buffer, SHARP_OPTIONS).metadata());
  } catch (err) {
    if (isPixelLimit(err))
      throw ApiError.badRequest(IMAGE_TOO_LARGE, { [field]: IMAGE_TOO_LARGE });
    throw ApiError.badRequest(INVALID_IMAGE, { [field]: INVALID_IMAGE });
  }

  if (!ALLOWED_FORMATS.includes(format))
    throw ApiError.badRequest(INVALID_IMAGE, { [field]: INVALID_IMAGE });

  // `limitInputPixels` est déjà vérifié à la lecture de l'en-tête ; l'instance
  // de travail le reverrouille au décodage effectif des pixels.
  return sharp(buffer, SHARP_OPTIONS);
}

/** sharp signale le dépassement par un message, pas par un code d'erreur. */
function isPixelLimit(err) {
  return typeof err?.message === 'string' && err.message.includes('pixel limit');
}