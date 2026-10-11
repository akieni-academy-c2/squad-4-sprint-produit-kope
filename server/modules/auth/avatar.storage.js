import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { useCloud, uploadBuffer } from '../../config/cloudinary.js';
import { decodeImage } from '../../utils/images.js';

const SIZE = 512;

/* Redimensionne */
export async function processAvatar(buffer) {
  // decodeImage contrôle le format sur les octets du fichier. Sans lui,
  // sharp réencodait un GIF, un TIFF ou une archive déguisée en image.
  const image = await decodeImage(buffer, { field: 'avatar' });

  return image.rotate().resize(SIZE, SIZE, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
}

/* Enregistre l'avatar */
export async function saveAvatar(buffer, userId) {
  const relativePath = `avatars/${userId}-${randomUUID()}.jpg`;

  if (useCloud) {
    await uploadBuffer(buffer, relativePath);
    return relativePath;
  }

  await fs.mkdir(path.join(env.UPLOAD_DIR, 'avatars'), { recursive: true });
  await fs.writeFile(path.join(env.UPLOAD_DIR, relativePath), buffer);
  return relativePath;
}