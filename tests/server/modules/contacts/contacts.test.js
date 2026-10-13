import { describe, it, expect, vi, afterEach } from 'vitest';
import { createContactSchema } from '@server/modules/contacts/contacts.schemas.js';
import * as contactsService from '@server/modules/contacts/contacts.service.js';
import * as contactsRepository from '@server/modules/contacts/contacts.repository.js';
import * as authRepository from '@server/modules/auth/auth.repository.js';
import { ApiError } from '@server/utils/ApiError.js';
import { createContactSchema as createContactSchemaClient } from '@/shared/utils/validators.js';
import { getMyContacts } from '@/features/contacts/services/contacts.service.js';
import { resetMockMode } from '@/shared/lib/dataSource.js';

afterEach(() => {
  vi.restoreAllMocks();
  resetMockMode();
});

const MESSAGE = 'Bonjour, je recherche un devis pour une rénovation.';

describe('contacts.schemas (serveur)', () => {
  it('exige un destinataire et un message de 10 à 500 caractères', () => {
    expect(createContactSchema.safeParse({ toUserId: '7', message: MESSAGE }).success).toBe(true);

    expect(createContactSchema.safeParse({ toUserId: '7', message: 'court' }).success).toBe(false);
    expect(createContactSchema.safeParse({ toUserId: '0', message: MESSAGE }).success).toBe(false);
    expect(createContactSchema.safeParse({ toUserId: 'abc', message: MESSAGE }).success).toBe(false);
  });

  it('applique la même règle côté client', () => {
    expect(createContactSchemaClient.safeParse({ toUserId: 7, message: MESSAGE }).success).toBe(true);
    expect(createContactSchemaClient.safeParse({ toUserId: 7, message: 'court' }).success).toBe(false);
  });
});

describe('contacts.service', () => {
  it('refuse de se contacter soi-même', async () => {
    await expect(contactsService.createContact(7, { toUserId: 7, message: MESSAGE })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('refuse un destinataire inexistant', async () => {
    vi.spyOn(authRepository, 'findById').mockResolvedValue(null);
    await expect(contactsService.createContact(7, { toUserId: 9, message: MESSAGE })).rejects.toBeInstanceOf(ApiError);
    expect(authRepository.findById).toHaveBeenCalledWith(9);
  });

  // Un doublon n'est plus refusé : la paire n'est plus unique en base, un
  // professionnel peut être rappelé autant de fois que nécessaire. Le test
  // vérifie que le canal transite bien jusqu'à l'écriture.
  it('crée le contact quand tout est valide', async () => {
    vi.spyOn(authRepository, 'findById').mockResolvedValue({ id: 9, role: 'client' });
    const created = { id: 1, message: MESSAGE, channel: 'message', status: 'new' };
    vi.spyOn(contactsRepository, 'create').mockResolvedValue(created);

    await expect(contactsService.createContact(7, { toUserId: 9, message: MESSAGE })).resolves.toEqual(created);
    expect(contactsRepository.create).toHaveBeenCalledWith({
      senderId: 7,
      recipientId: 9,
      message: MESSAGE,
      channel: 'message',
    });
  });

  it('enregistre un appel sans message', async () => {
    vi.spyOn(authRepository, 'findById').mockResolvedValue({ id: 9, role: 'professional' });
    const created = { id: 2, message: null, channel: 'call', status: 'new' };
    vi.spyOn(contactsRepository, 'create').mockResolvedValue(created);

    await expect(contactsService.createContact(7, { toUserId: 9, channel: 'call' })).resolves.toEqual(created);
    expect(contactsRepository.create).toHaveBeenCalledWith({
      senderId: 7,
      recipientId: 9,
      message: null,
      channel: 'call',
    });
  });

  it('liste mes contacts et marque les demandes reçues comme vues', async () => {
    const seen = vi.spyOn(contactsRepository, 'markIncomingAsSeen').mockResolvedValue(undefined);
    vi.spyOn(contactsRepository, 'listForUser').mockResolvedValue([
      {
        id: 1,
        message: MESSAGE,
        status: 'new',
        outgoing: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        userId: 9,
        role: 'professional',
        phone: '+242061234567',
        avatarUrl: null,
        firstName: null,
        lastName: null,
        displayName: 'Atelier Kengo',
        tradeName: 'Menuiserie',
        total: 1,
      },
    ]);

    const res = await contactsService.listContacts(7, { page: 1, pageSize: 20 });

    expect(seen).toHaveBeenCalledWith(7);
    expect(res.total).toBe(1);
    expect(res.items[0]).not.toHaveProperty('total');
    expect(res.items[0].displayName).toBe('Atelier Kengo');
    expect(res.items[0].outgoing).toBe(false);
  });
});

describe('contacts.service (frontend)', () => {
  it('retourne une liste paginée en mode démo', async () => {
    const data = await getMyContacts();
    expect(data.items.length).toBeGreaterThan(0);
    expect(data).toHaveProperty('total');
    // Un contact client et un contact professionnel dans la démo
    expect(data.items.map((c) => c.role)).toEqual(expect.arrayContaining(['client', 'professional']));
  });
});
