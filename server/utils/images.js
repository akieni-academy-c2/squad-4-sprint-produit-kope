import sharp from 'sharp';
import { ApiError } from './ApiError.js';

const ALLOWED_FORMATS = ['jpeg', 'png'];

export const INVALID_IMAGE = "Le fichier n'est pas une image JPG ou PNG valide";
export const IMAGE_TOO_LARGE = "L'image est trop grande pour être traitée";


const MAX_INPUT_PIXELS = 40_000_000;

const SHARP_OPTIONS = {
  limitInputPixels: MAX_INPUT_PIXELS,
  failOn: 'warning',
  sequentialRead: true,
};

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

  return sharp(buffer, SHARP_OPTIONS);
}

function isPixelLimit(err) {
  return typeof err?.message === 'string' && err.message.includes('pixel limit');
}