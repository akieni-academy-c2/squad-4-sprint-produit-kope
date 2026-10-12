import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginate, paginateSafely } from '../../utils/pagination.js';
import * as repository from './reviews.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';


export function getSummary(professionalId) {
  return repository.getSummary(professionalId);
}

export async function canReview(viewer, professionalId) {
  if (!viewer || viewer.role === 'admin') return false;
  if (String(viewer.id) === String(professionalId)) return false;
  return !(await repository.exists(viewer.id, professionalId));
}

export async function createReview(clientId, professionalId, { rating, comment }) {
  if (!(await professionalsRepository.existsPublished(professionalId)))
    throw ApiError.notFound('Profil introuvable');
  if (String(clientId) === String(professionalId))
    throw ApiError.forbidden();


  try {
    return await repository.create({ clientId, professionalId, rating, comment });
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('Vous avez déjà laissé un avis à ce professionnel');
    throw err;
  }
}

export async function mine(clientId, query) {
  const rows = await repository.listByClient(clientId, {
    limit: query.pageSize,
    offset: offsetOf(query),
    q: query.q,
    rating: query.rating,
    professionalId: query.professionalId,
    visibility: query.visibility,
  });
  return paginateSafely(rows, query, () => repository.countByClient(clientId));
}

/**
 * Charge un avis en vérifiant qu'il appartient au client.
 *
 * Le 404 est volontaire et non un 403 : confirmer qu'un avis existe alors
 * qu'il est celui de quelqu'un d'autre permet d'énumérer les avis du site.
 * Le client voit donc « introuvable » dans les deux cas.
 */
async function ownedReview(reviewId, clientId) {
  const review = await repository.findOwnedById(reviewId, clientId);
  if (!review) throw ApiError.notFound('Avis introuvable');
  return review;
}

export async function updateReview(reviewId, clientId, patch) {
  await ownedReview(reviewId, clientId);
  return repository.updateOwned(reviewId, clientId, patch);
}

export async function setReviewVisibility(reviewId, clientId, isHidden) {
  await ownedReview(reviewId, clientId);
  return repository.setHiddenOwned(reviewId, clientId, isHidden);
}

export async function deleteReview(reviewId, clientId) {
  await ownedReview(reviewId, clientId);
  await repository.deleteOwned(reviewId, clientId);
}

export async function byClient(clientId, pagination) {
  const rows = await repository.listByClient(clientId, { limit: pagination.pageSize, offset: offsetOf(pagination) });
  return paginate(rows, pagination);
}

export async function listReviews(viewer, professionalId, pagination) {
  const isOwner = viewer?.role === 'professional' && viewer.id === professionalId;
  if (!isOwner && !(await professionalsRepository.existsPublished(professionalId)))
    throw ApiError.notFound('Profil introuvable');


  const [rows, summary] = await Promise.all([
    repository.listByProfessional(professionalId, { limit: pagination.pageSize, offset: offsetOf(pagination) }),
    repository.getSummary(professionalId),
  ]);

  const result = await paginateSafely(rows, pagination, () =>
    repository.countByProfessional(professionalId),
  );
  return { summary, ...result };
}
