import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { mockReviewsFor } from '@/shared/mocks/appMock.js';

export function listReviews(professionalId, { page = 1, pageSize = 10 } = {}) {
  return callApi(
    () => api.get(`/professionals/${professionalId}/reviews`, { page, pageSize }),
    async () => {
      // Un avis masqué par un administrateur n'est ni affiché ni compté, comme
      // côté serveur.
      const all = mockReviewsFor(professionalId).filter((r) => !r.isHidden);
      const items = all.slice((page - 1) * pageSize, page * pageSize);
      const average = all.length
        ? Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10
        : 0;
      return { summary: { average, count: all.length }, items, total: all.length, page, pageSize, totalPages: 1 };
    },
  );
}

export function createReview(professionalId, payload) {
  return callApi(
    () => api.postJson(`/professionals/${professionalId}/reviews`, payload).then((r) => r.review),
    async () => ({
      id: Date.now(),
      rating: payload.rating,
      comment: payload.comment ?? '',
      createdAt: new Date().toISOString(),
      client: { firstName: 'Vous', lastName: '' },
    }),
  );
}

export function getMyReviews({ page = 1, pageSize = 20, q, rating, professionalId, visibility } = {}) {
  return callApi(
    () =>
      api.get('/reviews/mine', {
        page,
        pageSize,
        ...(q ? { q } : {}),
        ...(rating ? { rating } : {}),
        ...(professionalId ? { professionalId } : {}),
        ...(visibility && visibility !== 'all' ? { visibility } : {}),
      }),
    async () => ({ items: [], total: 0, page, pageSize, totalPages: 1 }),
  );
}

/** Correction d'un avis. La note est renvoyée en entier par le sélecteur. */
export function updateReview(reviewId, payload) {
  return callApi(
    () => api.patchJson(`/reviews/${reviewId}`, payload).then((r) => r.review),
    async () => ({ ...payload, id: reviewId, updatedAt: new Date().toISOString() }),
  );
}

/** Masque ou réaffiche un avis sans toucher à son texte. */
export function setReviewVisibility(reviewId, isHidden) {
  return callApi(
    () => api.patchJson(`/reviews/${reviewId}/visibility`, { isHidden }).then((r) => r.review),
    async () => ({ id: reviewId, isHidden, updatedAt: new Date().toISOString() }),
  );
}

export function deleteReview(reviewId) {
  return callApi(
    () => api.del(`/reviews/${reviewId}`),
    async () => null,
  );
}

export function getClientReviews(clientId, { page = 1, pageSize = 20 } = {}) {
  return callApi(
    () => api.get(`/clients/${clientId}/reviews`, { page, pageSize }),
    async () => ({ items: [], total: 0, page, pageSize, totalPages: 1 }),
  );
}