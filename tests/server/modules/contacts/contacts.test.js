import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { createContactSchema } from "@server/modules/contacts/contacts.schemas.js";
import * as contactsService from "@server/modules/contacts/contacts.service.js";
import * as contactsRepository from "@server/modules/contacts/contacts.repository.js";
import * as authRepository from "@server/modules/auth/auth.repository.js";
import { ApiError } from "@server/utils/ApiError.js";
import { createContactSchema as createContactSchemaClient } from "@/shared/utils/validators.js";
import { getMyContacts } from "@/features/contacts/services/contacts.service.js";
import { enableMockMode, resetMockMode } from "@/shared/lib/dataSource.js";

afterEach(() => {
  vi.restoreAllMocks();
  resetMockMode();
});

const MESSAGE = "Bonjour, je recherche un devis pour une rénovation.";

describe("contacts.schemas (serveur)", () => {
  it("exige un destinataire et un message de 10 à 500 caractères", () => {
    expect(
      createContactSchema.safeParse({ toUserId: "7", message: MESSAGE })
        .success,
    ).toBe(true);

    expect(
      createContactSchema.safeParse({ toUserId: "7", message: "court" })
        .success,
    ).toBe(false);
    expect(
      createContactSchema.safeParse({ toUserId: "0", message: MESSAGE })
        .success,
    ).toBe(false);
    expect(
      createContactSchema.safeParse({ toUserId: "abc", message: MESSAGE })
        .success,
    ).toBe(false);
  });

  it("applique la même règle côté client", () => {
    expect(
      createContactSchemaClient.safeParse({ toUserId: 7, message: MESSAGE })
        .success,
    ).toBe(true);
    expect(
      createContactSchemaClient.safeParse({ toUserId: 7, message: "court" })
        .success,
    ).toBe(false);
  });
});

describe("contacts.service", () => {
  it("refuse de se contacter soi-même", async () => {
    await expect(
      contactsService.createContact(7, { toUserId: 7, message: MESSAGE }),
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it("refuse un destinataire inexistant", async () => {
    vi.spyOn(authRepository, "findById").mockResolvedValue(null);
    await expect(
      contactsService.createContact(7, { toUserId: 9, message: MESSAGE }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(authRepository.findById).toHaveBeenCalledWith(9);
  });

  it("crée le contact quand tout est valide", async () => {
    vi.spyOn(authRepository, "findById").mockResolvedValue({
      id: 9,
      role: "client",
    });
    const created = {
      id: 1,
      message: MESSAGE,
      channel: "message",
      status: "new",
    };
    vi.spyOn(contactsRepository, "create").mockResolvedValue(created);

    await expect(
      contactsService.createContact(7, { toUserId: 9, message: MESSAGE }),
    ).resolves.toEqual(created);
    expect(contactsRepository.create).toHaveBeenCalledWith({
      senderId: 7,
      recipientId: 9,
      message: MESSAGE,
      channel: "message",
    });
  });

  it("enregistre un appel sans message", async () => {
    vi.spyOn(authRepository, "findById").mockResolvedValue({
      id: 9,
      role: "professional",
    });
    const created = { id: 2, message: null, channel: "call", status: "new" };
    vi.spyOn(contactsRepository, "create").mockResolvedValue(created);

    await expect(
      contactsService.createContact(7, { toUserId: 9, channel: "call" }),
    ).resolves.toEqual(created);
    expect(contactsRepository.create).toHaveBeenCalledWith({
      senderId: 7,
      recipientId: 9,
      message: null,
      channel: "call",
    });
  });

  it("liste mes contacts sans rien écrire", async () => {
    vi.spyOn(contactsRepository, "listForUser").mockResolvedValue([
      {
        id: 1,
        message: MESSAGE,
        status: "new",
        outgoing: false,
        createdAt: "2026-01-01T00:00:00.000Z",
        userId: 9,
        role: "professional",
        phone: "+242061234567",
        avatarUrl: null,
        firstName: null,
        lastName: null,
        displayName: "Atelier Kengo",
        tradeName: "Menuiserie",
        total: 1,
      },
    ]);

    const res = await contactsService.listContacts(7, {
      page: 1,
      pageSize: 20,
    });

    /**
     * La liste marquait chaque demande entrante comme vue avant même de la lire.
     * Aucun écran ne consommait ce statut, et la lecture étant le déclencheur, il
     * ne pouvait plus rien afficher. Une lecture qui écrit coûte un aller-retour
     * à chaque affichage pour un résultat invisible.
     */
    expect(contactsRepository.markIncomingAsSeen).toBeUndefined();
    expect(res.total).toBe(1);
    expect(res.items[0]).not.toHaveProperty("total");
    expect(res.items[0].displayName).toBe("Atelier Kengo");
    expect(res.items[0].outgoing).toBe(false);
  });

  it("délègue le marquage en plaçant l'appelant en second argument", async () => {
    const mark = vi
      .spyOn(contactsRepository, "markSeen")
      .mockResolvedValue(true);

    await expect(contactsService.markContactSeen(7, 5)).resolves.toBe(true);
    expect(mark).toHaveBeenCalledWith(5, 7);
  });

  it("délègue le marquage groupé à l'appelant", async () => {
    const markAll = vi
      .spyOn(contactsRepository, "markAllSeen")
      .mockResolvedValue(3);

    await expect(contactsService.markAllContactsSeen(7)).resolves.toBe(3);
    expect(markAll).toHaveBeenCalledWith(7);
  });
});

describe("contacts.repository (écriture du statut)", () => {
  const stub = (rowCount) => {
    const query = vi.fn().mockResolvedValue({ rowCount });
    return { query, db: { query } };
  };

  /**
   * Sans `recipient_id = $2`, n'importe quel utilisateur connecté pourrait
   *ococcus une demande qui ne lui est pas adressée. Sans `status = 'new'`, le
   * marquage n'est plus idempotent et réécrit à chaque affichage.
   */
  it("n'écrit que sur une demande reçue et encore nouvelle", async () => {
    const { db, query } = stub(1);

    await expect(contactsRepository.markSeen(5, 7, db)).resolves.toBe(true);

    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain("recipient_id = $2");
    expect(sql).toContain("status = 'new'");
    expect(sql).toContain("id = $1");
    expect(params).toEqual([5, 7]);
  });

  it("ne signale aucun changement si la ligne est ineligible", async () => {
    const { db } = stub(0);

    await expect(contactsRepository.markSeen(5, 7, db)).resolves.toBe(false);
  });

  it("marque en masse seulement les demandes reçues", async () => {
    const { db, query } = stub(4);

    await expect(contactsRepository.markAllSeen(7, db)).resolves.toBe(4);

    const [sql, params] = query.mock.calls[0];
    expect(sql).toContain("recipient_id = $1");
    expect(sql).toContain("status = 'new'");
    expect(params).toEqual([7]);
  });
});

describe("contacts.service (frontend)", () => {
  beforeEach(() => {
    enableMockMode();
  });

  it("retourne une liste paginée en mode démo", async () => {
    const data = await getMyContacts();
    expect(data.items.length).toBeGreaterThan(0);
    expect(data).toHaveProperty("total");
    expect(data.items.map((c) => c.role)).toEqual(
      expect.arrayContaining(["client", "professional"]),
    );
  });
});
