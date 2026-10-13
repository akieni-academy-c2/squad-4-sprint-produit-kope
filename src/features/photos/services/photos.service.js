import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { MOCK_PROS } from '@/shared/mocks/appMock.js';

export function listPhotos() {
  return callApi(
    () => api.get('/me/profile').then((r) => r.profile?.photos || []),
    async () => MOCK_PROS[0].photos,
  );
}

export function addPhoto(file, { title, description } = {}) {
  const fd = new FormData();
  fd.append('photo', file);
  fd.append('title', String(title ?? '').slice(0, 100));
  fd.append('description', String(description ?? '').slice(0, 500));
  return callApi(
    () => api.postFormData('/me/photos', fd).then((r) => r.photo),
    async () => {
      const url = file ? URL.createObjectURL(file) : MOCK_PROS[0].image;
      const photo = {
        id: Date.now(),
        url,
        thumbUrl: url,
        title: title ?? '',
        description: description ?? '',
        caption: title ?? '',
        createdAt: new Date().toISOString(),
      };
      MOCK_PROS[0].photos = [...MOCK_PROS[0].photos, photo];
      return photo;
    },
  );
}

export function updatePhoto(photoId, { title, description } = {}) {
  const payload = {
    title: String(title ?? '').slice(0, 100),
    description: String(description ?? '').slice(0, 500),
  };
  return callApi(
    () => api.putJson(`/me/photos/${photoId}`, payload).then((r) => r.photo),
    async () => {
      MOCK_PROS[0].photos = MOCK_PROS[0].photos.map((p) =>
        p.id === photoId ? { ...p, ...payload, caption: payload.title } : p,
      );
      return MOCK_PROS[0].photos.find((p) => p.id === photoId);
    },
  );
}

export function deletePhoto(photoId) {
  return callApi(
    () => api.del(`/me/photos/${photoId}`),
    async () => {
      MOCK_PROS[0].photos = MOCK_PROS[0].photos.filter((p) => p.id !== photoId);
      return {};
    },
  );
}