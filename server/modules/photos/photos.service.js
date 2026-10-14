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
    // Lu par le repository, absent du DTO : « Publié le … » ne s'affichait
    // qu'en mode démonstration, où le mock fournissait la date.
    createdAt: photo.createdAt ?? null,
  };
}

export async function listPhotos(professionalId) {
  const photos = await repository.listByProfessional(professionalId);
  return photos.map(toDto);
}

export async function addPhoto(professionalId, file, { title, description }) {
  if (!file)
    throw ApiError.badRequest('Aucune photo reçue', { photo: 'Choisissez une photo' });

  const processed = await storage.processImage(file.buffer);
  const paths = storage.newPaths(professionalId);

  try {
    await storage.save(paths, processed);
  } catch (err) {
      console.error('[photos] enregistrement impossible', err);
    throw new ApiError(503, "Le service d'enregistrement est indisponible");
  }

  try {
    const photo = await withTransaction(async (tx) => {
      await repository.lockProfessional(professionalId, tx);
      if ((await repository.count(professionalId, tx)) >= MAX_PHOTOS)
        throw ApiError.badRequest(LIMIT_MESSAGE, { photo: LIMIT_MESSAGE });

      return repository.create(
        { professionalId, filePath: paths.filePath, thumbPath: paths.thumbPath, title, description },
        tx,
      );
    });

    return toDto(photo);
  } catch (error) {
    await storage.remove(paths).catch((cleanupError) => {
      console.error('[photos] fichier orphelin après échec', paths, cleanupError);
    });
    throw error;
  }
}

export async function updatePhoto(professionalId, photoId, { title, description }) {
  const updated = await repository.update(photoId, professionalId, { title, description });
  if (!updated) throw ApiError.notFound('Photo introuvable');
  return toDto(updated);
}
export async function removePhoto(professionalId, photoId) {
  const removed = await withTransaction((tx) => repository.remove(photoId, professionalId, tx)); // filtre par propriétaire
  if (!removed) throw ApiError.notFound('Photo introuvable');

  // La ligne est déjà supprimée : la réponse doit dire ce qui s'est réellement
  // passé. Renvoyer 500 pour un fichier resté sur le disque ferait croire à
  // l'appelant que la suppression a échoué, donc qu'il doit réessayer.
  try {
    await storage.remove(removed);
  } catch (err) {
    console.error('[photos] ligne supprimée, fichier non supprimé', removed, err);
  }
}
