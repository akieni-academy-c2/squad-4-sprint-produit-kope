import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { mockMyContacts } from '@/shared/mocks/appMock.js';

export function getMyContacts({ page = 1, pageSize = 20 } = {}) {
  return callApi(
    () => api.get('/contacts', { page, pageSize }),
    async () => mockMyContacts({ page, pageSize }),
  );
}

export function createContact({ toUserId, message }) {
  return callApi(
    () => api.postJson('/contacts', { toUserId, message }).then((r) => r.contact),
    async () => ({
      id: Date.now(),
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    }),
  );
}