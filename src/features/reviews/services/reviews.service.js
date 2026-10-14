import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { mockReviewsFor, mockMyReviews, mockUpdateMyReview, mockSetMyReviewHidden, mockDeleteMyReview } from '@/shared/mocks/appMock.js';

export function listReviews(professionalId, { page = 1, pageSize = 10 } = {}) {
  return callApi(
    () => api.get(`/professionals/${professionalId}/reviews`, { page, pageSize }),
    async () => {
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

export function getMyReviews({ page = 1, pageSize = 20, q, rating, professionalId, visibility, sort } = {}) {
  return callApi(
    () =>
      api.get('/reviews/mine', {
        page,
        pageSize,
        ...(q ? { q } : {}),
        ...(rating ? { rating } : {}),
        ...(professionalId ? { professionalId } : {}),
        ...(visibility && visibility !== 'all' ? { visibility } : {}),
        ...(sort ? { sort } : {}),
      }),
    async () => mockMyReviews({ page, pageSize, q, rating, visibility, sort }),
  );
}

export function updateReview(reviewId, payload) {
  return callApi(
    () => api.patchJson(`/reviews/${reviewId}`, payload).then((r) => r.review),
    async () => mockUpdateMyReview(reviewId, payload),
  );
}

export function setReviewVisibility(reviewId, isHidden) {
  return callApi(
    () => api.patchJson(`/reviews/${reviewId}/visibility`, { isHidden }).then((r) => r.review),
    async () => mockSetMyReviewHidden(reviewId, isHidden),
  );
}

export function deleteReview(reviewId) {
  return callApi(
    () => api.del(`/reviews/${reviewId}`),
    async () => mockDeleteMyReview(reviewId),
  );
}

export function getClientReviews(clientId, { page = 1, pageSize = 20 } = {}) {
  return callApi(
    () => api.get(`/clients/${clientId}/reviews`, { page, pageSize }),
    async () => ({ items: [], total: 0, page, pageSize, totalPages: 1 }),
  );
}