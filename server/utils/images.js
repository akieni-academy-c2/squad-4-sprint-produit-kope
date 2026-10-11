import sharp from 'sharp';
import { ApiError } from './ApiError.js';

/** Formats réellement décodés, vérifiés sur les octets du fichier. */
const ALLOWED_FORMATS = ['jpeg', 'png'];

export const INVALID_IMAGE = "Le fichier n'est pas une image JPG ou PNG valide";

/**
 * Ouvre une image en contrôlant son format réel.
 *
 * Le `fileFilter` de multer se fie à `file.mimetype`, valeur fournie par le
 * client et donc falsifiable. Seul le décodage fait foi : sans cette
 * vérification, sharp réencodait sans broncher un GIF, un TIFF ou un fichier
 * « polyglot » contenant une charge.
 *
 * Renvoie une instance sharp prête à être redimensionnée.
 */
export async function decodeImage(buffer, { field = 'photo' } = {}) {
  let format;
  try {
    ({ format } = await sharp(buffer).metadata());
  } catch {
    throw ApiError.badRequest(INVALID_IMAGE, { [field]: INVALID_IMAGE });
  }

  if (!ALLOWED_FORMATS.includes(format))
    throw ApiError.badRequest(INVALID_IMAGE, { [field]: INVALID_IMAGE });

  return sharp(buffer);
}