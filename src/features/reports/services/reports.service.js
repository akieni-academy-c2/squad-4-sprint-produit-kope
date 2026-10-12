import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { mockMyReports, mockDeleteMyReport } from '@/shared/mocks/appMock.js';

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