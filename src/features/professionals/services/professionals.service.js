import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { getProDetailMock, mockReportProfessional, MOCK_PROS, MOCK_TRADES } from '@/shared/mocks/appMock.js';

function ownProfileFromMock() {
  const p = MOCK_PROS[0];
  return {
    id: p.id,
    displayName: p.displayName,
    tradeId: p.tradeId,
    tradeName: p.tradeName,
    description: p.description,
    yearsExperience: p.yearsExperience,
    whatsapp: p.whatsapp ?? p.phone,
    isAvailable: p.isAvailable,
    isHidden: false,
    isPublished: true,
    avatarUrl: p.avatarUrl,
    photoCount: p.photos.length,
    zones: p.zones,
    photos: p.photos,
    status: 'published',
    missing: [],
  };
}

export function getMyProfile() {
  return callApi(
    () => api.get('/me/profile').then((r) => r.profile),
    async () => ownProfileFromMock(),
  );
}

export function updateMyProfile(payload) {
  return callApi(
    () => api.putJson('/me/profile', payload).then((r) => r.profile),
    async () => {
      const p = MOCK_PROS[0];
      const trade = MOCK_TRADES.find((t) => String(t.id) === String(payload.tradeId));
      Object.assign(p, {
        displayName: payload.displayName ?? p.displayName,
        tradeId: payload.tradeId ?? p.tradeId,
        tradeName: trade ? trade.name : p.tradeName,
        description: payload.description ?? p.description,
        yearsExperience: payload.yearsExperience ?? p.yearsExperience,
        whatsapp: payload.whatsapp ?? p.whatsapp,
      });
      if (Array.isArray(payload.zoneIds) && payload.zoneIds.length)
        p.zones = payload.zoneIds.map((id) => p.zones.find((z) => Number(z.id) === Number(id)) || { id, name: `Zone ${id}` });

      return { ...ownProfileFromMock(), ...p };
    },
  );
}

export function setAvailability(isAvailable) {
  return callApi(
    () => api.patchJson('/me/availability', { isAvailable }).then((r) => r.isAvailable),
    async () => {
      MOCK_PROS[0].isAvailable = Boolean(isAvailable);
      return Boolean(isAvailable);
    },
  );
}

export function getPublishedDetail(id) {
  return callApi(
    () => api.get(`/professionals/${id}`),
    async () => getProDetailMock(id) ?? (() => { throw Object.assign(new Error('Profil introuvable'), { status: 404 }); })(),
  );
}

export function canReview(id) {
  return callApi(
    () => api.get(`/professionals/${id}/can-review`).then((r) => r.canReview),
    async () => true,
  );
}

export function reportProfessional(id, payload) {
  return callApi(
    () => api.postJson(`/professionals/${id}/reports`, payload).then((r) => r.report),
    async () => mockReportProfessional({ professionalId: id, ...payload }),
  );
}