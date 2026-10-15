import { api } from "@/shared/lib/api.js";
import { callApi } from "@/shared/lib/dataSource.js";
import {
  mockMyContacts,
  mockLogContact,
  mockMarkContactSeen,
  mockMarkAllSeen,
} from "@/shared/mocks/appMock.js";

export function getMyContacts({ page = 1, pageSize = 20 } = {}) {
  return callApi(
    () => api.get("/contacts", { page, pageSize }),
    async () => mockMyContacts({ page, pageSize }),
  );
}

export function markContactSeen(contactId) {
  return callApi(
    () => api.patchJson(`/contacts/${contactId}/seen`, {}),
    async () => mockMarkContactSeen(contactId),
  );
}

export function markAllContactsSeen() {
  return callApi(
    () => api.patchJson("/contacts/seen", {}),
    async () => mockMarkAllSeen(),
  );
}

export function logContact(toUserId, channel) {
  return callApi(
    () => api.postJson("/contacts", { toUserId, channel }),
    async () => mockLogContact(toUserId, channel),
  );
}

export function createContact({ toUserId, message }) {
  return callApi(
    () =>
      api
        .postJson("/contacts", { toUserId, channel: "message", message })
        .then((r) => r.contact),
    async () => ({
      id: Date.now(),
      message,
      channel: "message",
      status: "new",
      createdAt: new Date().toISOString(),
    }),
  );
}
