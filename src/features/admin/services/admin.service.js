import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import {
  mockAdminProfessionals,
  mockAdminStats,
  mockAdminUsers,
  mockCreateAdmin,
  mockCreateCity,
  mockCreateTrade,
  mockCreateTradeCategory,
  mockCreateZone,
  mockDeleteCity,
  mockDeleteTrade,
  mockDeleteTradeCategory,
  mockDeleteZone,
  mockAdminReviews,
  mockAdminReports,
  mockListCities,
  mockListTradeCategories,
  mockListTrades,
  mockListZones,
  mockReorderCities,
  mockReorderTradeCategories,
  mockReorderTrades,
  mockReorderZones,
  mockResolveReport,
  mockSetReviewHidden,
  mockSetUserBlocked,
  mockSetUserSuspended,
  mockUpdateCity,
  mockUpdateTrade,
  mockUpdateTradeCategory,
  mockUpdateZone,
} from '@/shared/mocks/appMock.js';
import { MOCK_PROS } from '@/shared/mocks/appMock.js';

export function getStats() {
  return callApi(
    () => api.get('/admin/stats'),
    async () => mockAdminStats(),
  );
}

export function listPros({
  page = 1,
  pageSize = 20,
  query = '',
  status = '',
  sort = 'name',
  city = '',
} = {}) {
  return callApi(
    () => {
      const params = { page, pageSize };
      if (query) params.q = query;
      if (status) params.status = status;
      if (sort && sort !== 'name') params.sort = sort;
      if (city) params.city = city;
      return api.get('/admin/professionals', params);
    },
    async () => mockAdminProfessionals({ page, pageSize, query, status, sort, city }),
  );
}

export function setProHidden(id, hidden) {
  return callApi(
    () => api.patchJson(`/admin/professionals/${id}/visibility`, { hidden: Boolean(hidden) }),
    async () => {
      const pro = MOCK_PROS.find((p) => String(p.id) === String(id));
      if (pro) pro.isHidden = Boolean(hidden);
      return { id, hidden: Boolean(hidden) };
    },
  );
}

export function listReviews({ page = 1, pageSize = 20, hidden, query = '' } = {}) {
  return callApi(
    () => {
      const params = { page, pageSize };
      if (typeof hidden === 'boolean') params.hidden = String(hidden);
      if (query) params.q = query;
      return api.get('/admin/reviews', params);
    },
    async () => mockAdminReviews({ page, pageSize, hidden, query }),
  );
}

export function setReviewHidden(reviewId, hidden) {
  return callApi(
    () => api.patchJson(`/admin/reviews/${reviewId}/visibility`, { hidden: Boolean(hidden) }),
    async () => mockSetReviewHidden(reviewId, hidden),
  );
}

export function listReports({ page = 1, pageSize = 20, status = '', query = '' } = {}) {
  return callApi(
    () => {
      const params = { page, pageSize };
      if (status) params.status = status;
      if (query) params.q = query;
      return api.get('/admin/reports', params);
    },
    async () => mockAdminReports({ page, pageSize, status, query }),
  );
}

export function setReportStatus(reportId, status) {
  return callApi(
    () => api.patchJson(`/admin/reports/${reportId}`, { status }).then((r) => r.report),
    async () => mockResolveReport(reportId, status),
  );
}

export function setUserSuspended(actorId, id, suspended) {
  return callApi(
    () => api.patchJson(`/admin/users/${id}/suspended`, { suspended: Boolean(suspended) }),
    async () => mockSetUserSuspended(actorId, id, suspended),
  );
}

export function listUsers({ page = 1, pageSize = 20, role = '', query = '', blocked } = {}) {
  return callApi(
    () => {
      const params = { page, pageSize };
      if (role) params.role = role;
      if (query) params.q = query;
      if (typeof blocked === 'boolean') params.blocked = String(blocked);
      return api.get('/admin/users', params);
    },
    async () => mockAdminUsers({ page, pageSize, role, query, blocked }),
  );
}

export function setUserBlocked(actorId, id, blocked) {
  return callApi(
    () => api.patchJson(`/admin/users/${id}/blocked`, { blocked }),
    async () => mockSetUserBlocked(actorId, id, blocked),
  );
}

export function createAdmin(payload) {
  return callApi(
    () => api.postJson('/admin/users', payload),
    async () => mockCreateAdmin(payload),
  );
}

export function listTrades() {
  return callApi(
    () => api.get('/admin/trades'),
    async () => mockListTrades(),
  );
}

export function createTrade(payload) {
  return callApi(
    () => api.postJson('/admin/trades', payload),
    async () => mockCreateTrade(payload),
  );
}

export function updateTrade(id, payload) {
  return callApi(
    () => api.putJson(`/admin/trades/${id}`, payload),
    async () => mockUpdateTrade(id, payload),
  );
}

export function deleteTrade(id) {
  return callApi(
    () => api.del(`/admin/trades/${id}`),
    async () => mockDeleteTrade(id),
  );
}

export function reorderTrades(ids) {
  return callApi(
    () => api.postJson('/admin/trades/reorder', { ids }),
    async () => mockReorderTrades(ids),
  );
}

export function listTradeCategories() {
  return callApi(
    () => api.get('/admin/trade-categories'),
    async () => mockListTradeCategories(),
  );
}

export function createTradeCategory(payload) {
  return callApi(
    () => api.postJson('/admin/trade-categories', payload),
    async () => mockCreateTradeCategory(payload),
  );
}

export function updateTradeCategory(id, payload) {
  return callApi(
    () => api.putJson(`/admin/trade-categories/${id}`, payload),
    async () => mockUpdateTradeCategory(id, payload),
  );
}

export function deleteTradeCategory(id) {
  return callApi(
    () => api.del(`/admin/trade-categories/${id}`),
    async () => mockDeleteTradeCategory(id),
  );
}

export function reorderTradeCategories(ids) {
  return callApi(
    () => api.postJson('/admin/trade-categories/reorder', { ids }),
    async () => mockReorderTradeCategories(ids),
  );
}

export function listZones() {
  return callApi(
    () => api.get('/admin/zones'),
    async () => mockListZones(),
  );
}

export function createZone(payload) {
  return callApi(
    () => api.postJson('/admin/zones', payload),
    async () => mockCreateZone(payload),
  );
}

export function updateZone(id, payload) {
  return callApi(
    () => api.putJson(`/admin/zones/${id}`, payload),
    async () => mockUpdateZone(id, payload),
  );
}

export function deleteZone(id) {
  return callApi(
    () => api.del(`/admin/zones/${id}`),
    async () => mockDeleteZone(id),
  );
}

export function reorderZones(ids) {
  return callApi(
    () => api.postJson('/admin/zones/reorder', { ids }),
    async () => mockReorderZones(ids),
  );
}

export function listCities() {
  return callApi(
    () => api.get('/admin/cities'),
    async () => mockListCities(),
  );
}

export function createCity(payload) {
  return callApi(
    () => api.postJson('/admin/cities', payload),
    async () => mockCreateCity(payload),
  );
}

export function updateCity(id, payload) {
  return callApi(
    () => api.putJson(`/admin/cities/${id}`, payload),
    async () => mockUpdateCity(id, payload),
  );
}

export function deleteCity(id) {
  return callApi(
    () => api.del(`/admin/cities/${id}`),
    async () => mockDeleteCity(id),
  );
}

export function reorderCities(ids) {
  return callApi(
    () => api.postJson('/admin/cities/reorder', { ids }),
    async () => mockReorderCities(ids),
  );
}