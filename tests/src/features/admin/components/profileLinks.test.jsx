import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

const { useNotification } = vi.hoisted(() => ({
  useNotification: () => ({ toast: vi.fn() }),
}));
vi.mock("@/shared/context/NotificationContext.jsx", () => ({
  useNotification,
}));

const { AdminProfessionalCard } =
  await import("@/features/admin/components/professionals/AdminProfessionalCard.jsx");
const { ReportGroup } =
  await import("@/features/admin/components/reports/ReportGroup.jsx");

const render = (element) =>
  renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

/** Ouvre chaque balise jusqu'à la position donnée pour savoir ce qui l'englobe. */
function enclosingTag(html, marker, tag) {
  const at = html.indexOf(marker);
  if (at < 0) return false;
  const before = html.slice(0, at);
  const opens = (before.match(new RegExp(`<${tag}\\b`, "g")) ?? []).length;
  const closes = (before.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
  return opens > closes;
}

const card = () =>
  render(
    <AdminProfessionalCard
      pro={{
        id: 7,
        displayName: "Atelier Kengo",
        trade: "Menuiserie",
        status: "published",
        avatarUrl: null,
      }}
      onToggleVisibility={vi.fn()}
    />,
  );

const group = () =>
  render(
    <ReportGroup
      group={{
        professionalId: 7,
        professionalName: "Atelier Kengo",
        professionalAvatarUrl: null,
        professionalSuspendedAt: null,
        professionalBlockedAt: null,
        pendingCount: 0,
      }}
      onResolveReport={vi.fn()}
      onDismissReport={vi.fn()}
      onUnblock={vi.fn()}
      onUnsuspend={vi.fn()}
    />,
  );

/**
 * Un avatar posé à côté d'un nom cliquable, sans être lui-même cliquable, est
 * le pire des deux cas : l'utilisateur voit un élément cliquable et son voisin
 * qui ne l'est pas. Ces tests verrouillent les deux ensemble.
 */
describe("carte professionnel de l'administration", () => {
  it("lie l'avatar vers la fiche publique", () => {
    expect(enclosingTag(card(), "Kengo", "a")).toBe(true);
  });

  it("donne à l'avatar une étiquette nommant la fiche", () => {
    expect(card()).toContain(
      'aria-label="Voir la fiche publique de Atelier Kengo"',
    );
  });

  it("pointe vers la bonne fiche", () => {
    expect(card()).toContain('href="/professionals/7"');
  });
});

describe("groupe de signalements", () => {
  it("lie l'avatar comme le nom", () => {
    const html = group();

    expect(enclosingTag(html, "Atelier Kengo", "a")).toBe(true);
  });

  it("pointe vers la bonne fiche", () => {
    expect(group()).toContain('href="/professionals/7"');
  });

  it("nomme l'artisan dans l'étiquette de l'avatar", () => {
    expect(group()).toContain("aria-label=");
  });
});
