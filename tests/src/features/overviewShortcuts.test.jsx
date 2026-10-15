import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

const { useAsyncData } = vi.hoisted(() => ({ useAsyncData: vi.fn() }));
vi.mock("@/shared/hooks/useAsyncData.js", () => ({ useAsyncData }));

const { ClientOverviewSection } =
  await import("@/pages/dashboard/components/ClientOverviewSection.jsx");
const { OverviewSection } =
  await import("@/features/professionals/components/OverviewSection.jsx");

const sectionLink = (id, filters) =>
  filters ? `/${id}?${new URLSearchParams(filters).toString()}` : `/${id}`;

const render = (element) =>
  renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

beforeEach(() => {
  useAsyncData.mockReturnValue({
    data: { reviews: [], contacts: [], reports: [] },
    loading: false,
    error: null,
  });
});

/**
 * Les raccourcis d'un tableau de bord doivent être des liensAddressable : c'est
 * ce qui permet d'ouvrir la section dans un nouvel onglet et de la partager.
 * Un `href` vide ou absent reviendrait à un clic qui ne mène nulle part.
 */
describe("raccourcis client", () => {
  const html = () =>
    render(<ClientOverviewSection sectionLink={sectionLink} />);

  it("transforme chaque raccourci en lien vers sa section", () => {
    expect(html()).toContain('href="/avis"');
    expect(html()).toContain('href="/contacts"');
    expect(html()).toContain('href="/signalements"');
  });

  it("ne laisse aucun lien sans destination", () => {
    for (const a of html().match(/<a [^>]*>/g) ?? [])
      expect(a).toMatch(/href="\/[^"]+"/);
  });
});

describe("raccourcis artisan", () => {
  const html = () =>
    render(
      <OverviewSection
        profile={{
          id: 7,
          displayName: "Atelier Kengo",
          cityName: "Poto-Poto",
          photoCount: 2,
          photos: [],
          zones: [],
        }}
        sectionLink={sectionLink}
      />,
    );

  it("transforme chaque raccourci en lien vers sa section", () => {
    expect(html()).toContain('href="/photos"');
    expect(html()).toContain('href="/profil"');
    expect(html()).toContain('href="/contacts"');
    expect(html()).toContain('href="/avis"');
  });

  it("ne laisse aucun lien sans destination", () => {
    for (const a of html().match(/<a [^>]*>/g) ?? [])
      expect(a).toMatch(/href="\/[^"]+"/);
  });
});
