import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import {
  mockDeleteMyReport,
  mockMyReports,
  mockReportContact,
  mockReportReview,
} from '@/shared/mocks/appMock.js';

/** Signalements déposés par le client connecté, avec filtres. */
export function getMyReports({ page = 1, pageSize = 20, status, q, sort } = {}) {
  return callApi(
    () =>
      api.get('/reports/mine', {
        page,
        pageSize,
        ...(status ? { status } : {}),
        ...(q ? { q } : {}),
        ...(sort ? { sort } : {}),
      }),
    async () => mockMyReports({ page, pageSize, status, q, sort }),
  );
}

/** Retrait d'un signalement. Seul l'auteur peut le faire, le serveur le vérifie. */
export function deleteMyReport(id) {
  return callApi(
    () => api.del(`/reports/${id}`),
    async () => mockDeleteMyReport(id),
  );
}

/**
 * Signalement d'un correspondant depuis la liste des contacts.
 *
 * Cible un compte, pas une fiche publiée : un client n'a pas de fiche, et le
 * contact fait foi. Le serveur refuse toute cible sans conversation réelle.
 */
export function reportContact(userId, payload) {
  return callApi(
    () => api.postJson(`/contacts/${userId}/reports`, payload).then((r) => r.report),
    async () => mockReportContact(userId, payload),
  );
}

/**
 * Signalement d'un avis reçu.
 *
 * Réservé au professionnel dont c'est la fiche, et sans effet automatique :
 * retirer un avis engage autant la réputation de son auteur que celle du
 * professionnel signalé.
 */
export function reportReview(reviewId, payload) {
  return callApi(
    () => api.postJson(`/reviews/${reviewId}/reports`, payload).then((r) => r.report),
    async () => mockReportReview(reviewId, payload),
  );
}