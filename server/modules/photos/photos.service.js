import { withTransaction } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { uploadUrl } from '../../utils/uploads.js';
import * as repository from './photos.repository.js';
import * as storage from './photos.storage.js';

const MAX_PHOTOS = 10;
const LIMIT_MESSAGE = 'Limite de 10 photos atteinte';

function toDto(photo) {
  return {
    id: photo.id,
    url: uploadUrl(photo.filePath),
    thumbUrl: uploadUrl(photo.thumbPath),
    title: photo.title ?? photo.caption ?? null,
    description: photo.description ?? null,
    caption: photo.caption,
  };
}

export async function listPhotos(professionalId) {
  const photos = await repository.listByProfessional(professionalId);
  return photos.map(toDto);
}

/** US-05 */
export async function addPhoto(professionalId, file, { title, description }) {
  if (!file)
    throw ApiError.badRequest('Aucune photo reçue', { photo: 'Choisissez une photo' });

  // L'écriture disque (ou les deux uploads Cloudinary) a lieu AVANT la
  // transaction : une transaction SQL ne couvre pas le système de fichiers.
  // La tenir dedans retenait une connexion du pool et un verrou FOR UPDATE
  // pendant toute la durée du transfert réseau — 10 uploads simultanés
  // suffisaient à répondre 503 à toute l'API.
  const processed = await storage.processImage(file.buffer);
  const paths = storage.newPaths(professionalId);

  try {
    await storage.save(paths, processed);
  } catch {
    throw ApiError.badRequest("L'image n'a pas pu être enregistrée", {
      photo: "L'image n'a pas pu être enregistrée",
    });
  }

  try {
    const photo = await withTransaction(async (tx) => {
      await repository.lockProfessional(professionalId, tx);
      // Re-compte sous verrou : le contrôle preliminaire ci-dessus est
      // optimiste, deux ajouts concurrents pourraient tous deux le passer.
      if ((await repository.count(professionalId, tx)) >= MAX_PHOTOS)
        throw ApiError.badRequest(LIMIT_MESSAGE, { photo: LIMIT_MESSAGE });

      return repository.create(
        { professionalId, filePath: paths.filePath, thumbPath: paths.thumbPath, title, description },
        tx,
      );
    });

    return toDto(photo);
  } catch (error) {
    // Le fichier est déjà sur le disque : sans ce nettoyage, un COMMIT en
    // échec laisse une image orpheline que rien ne référencera jamais.
    await storage.remove(paths).catch(() => {});
    throw error;
  }
}

/** Modification du titre */
export async function updatePhoto(professionalId, photoId, { title, description }) {
  const updated = await repository.update(photoId, professionalId, { title, description });
  if (!updated) throw ApiError.notFound('Photo introuvable');
  return toDto(updated);
}

/** US-05 */
export async function removePhoto(professionalId, photoId) {
  const removed = await withTransaction((tx) => repository.remove(photoId, professionalId, tx)); // filtre par propriétaire
  if (!removed) throw ApiError.notFound('Photo introuvable');
  await storage.remove(removed);
}
