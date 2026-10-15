import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

/**
 * Trois cas de figure, et un seul doit porter le badge : une demande entrante
 * encore à l'état `new`. Un contact que *j'ai* écrit garde `status = 'new'` en
 * base — c'est la colonne par défaut, elle ne dit rien d'un état à traiter.
 */
vi.mock("@/shared/hooks/useAsyncData.js", () => ({
  useAsyncData: () => ({
    loading: false,
    error: null,
    data: [
      {
        id: 1,
        userId: 9,
        displayName: "Nouvelle",
        role: "professional",
        tradeName: "Menuiserie",
        phone: "+242061234567",
        avatarUrl: null,
        firstName: null,
        lastName: null,
        channel: "call",
        status: "new",
        outgoing: false,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 2,
        userId: 10,
        displayName: "Deja vue",
        role: "professional",
        tradeName: null,
        phone: "+242069999999",
        avatarUrl: null,
        firstName: null,
        lastName: null,
        channel: "call",
        status: "seen",
        outgoing: false,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 3,
        userId: 11,
        displayName: "Ecris par moi",
        role: "client",
        tradeName: null,
        phone: null,
        avatarUrl: null,
        firstName: null,
        lastName: null,
        channel: "message",
        status: "new",
        outgoing: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  }),
}));

vi.mock("@/shared/context/NotificationContext.jsx", () => ({
  useNotification: () => ({ toast: vi.fn() }),
}));

const { ContactsSection } =
  await import("@/features/contacts/components/ContactsSection.jsx");

const html = renderToStaticMarkup(
  <MemoryRouter>
    <ContactsSection />
  </MemoryRouter>,
);

const occurrences = (needle) => html.split(needle).length - 1;

describe("badge des demandes non vues", () => {
  it("marque la seule demande entrante encore nouvelle", () => {
    expect(occurrences(">Nouveau<")).toBe(1);
  });

  it("compte les demandes à traiter dans l'action groupée", () => {
    expect(html).toContain("Tout marquer comme vu (1)");
  });

  it("propose de marquer la demande à l'unité", () => {
    expect(occurrences("Marquer comme vu")).toBe(1);
    expect(occurrences("marquer comme vu (")).toBe(1);
  });

  it("n'affiche aucune action groupée quand plus rien n'est à traiter", () => {
    expect(html).not.toContain("Tout marquer comme vu (0)");
  });
});
