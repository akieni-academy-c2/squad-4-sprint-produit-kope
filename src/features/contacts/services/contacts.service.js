import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { mockMyContacts, mockLogContact } from '@/shared/mocks/appMock.js';

export function getMyContacts({ page = 1, pageSize = 20 } = {}) {
  return callApi(
    () => api.get('/contacts', { page, pageSize }),
    async () => mockMyContacts({ page, pageSize }),
  );
}

/**
 * Enregistre un contact pris puis ouvre le canal.
 *
 * L'appel et le lien WhatsApp partent toujours : un échec d'enregistrement ne
 * doit jamais empêcher de joindre le professionnel. L'erreur est seulement
 * signalée, l'utilisateur ne voit pas d'écran bloqué.
 */
export function logContact(toUserId, channel) {
  return callApi(
    () => api.postJson('/contacts', { toUserId, channel }),
    async () => mockLogContact(toUserId, channel),
  );
}

export function createContact({ toUserId, message }) {
  return callApi(
    () => api.postJson('/contacts', { toUserId, channel: 'message', message }).then((r) => r.contact),
    async () => ({
      id: Date.now(),
      message,
      channel: 'message',
      status: 'new',
      createdAt: new Date().toISOString(),
    }),
  );
}