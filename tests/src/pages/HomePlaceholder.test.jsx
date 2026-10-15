import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

const { useReferenceData } = vi.hoisted(() => ({ useReferenceData: vi.fn() }));
vi.mock("@/features/reference/hooks/useReferenceData.js", () => ({
  useReferenceData,
}));

const { HomePlaceholder } = await import("@/pages/HomePlaceholder.jsx");
const { HeroSection } =
  await import("@/shared/components/home/HeroSection.jsx");

useReferenceData.mockReturnValue({
  trades: [],
  zones: [],
  cities: [],
});

const render = (element) =>
  renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

/** Première classe du conteneur, seule la mise en page nous intéresse ici. */
function sectionOf(html) {
  return html.match(/<section[^>]*class="([^"]*)"/)?.[1] ?? "";
}

const hero = () => render(<HeroSection />);
const placeholder = () => render(<HomePlaceholder />);

/**
 * Un placeholder utile ne doit pas seulement être joli : il doit occuper la
 * même place que le contenu réel. Ces tests verrouillent les classes de mise en
 * page, pour qu'une retouche du hero ne laisse plus diverger les deux.
 */
describe("placeholder de la page d'accueil", () => {
  it("reproduit le conteneur du hero", () => {
    expect(sectionOf(placeholder())).toBe(sectionOf(hero()));
  });

  it("reproduit la grille a deux colonnes", () => {
    const grid = "grid gap-8 lg:gap-10 lg:grid-cols-2 lg:items-center";

    expect(placeholder()).toContain(grid);
    expect(hero()).toContain(grid);
  });

  it("reproduit le cadre de l'image du hero", () => {
    const frame = "h-85 sm:h-100";

    expect(placeholder()).toContain(frame);
    expect(hero()).toContain(frame);
  });

  /**
   * La barre de recherche est la zone la plus fragile : décalée d'un pixel, le
   * passage à la page réelle se voit. Elle est rendue pour de vrai, donc
   * identique dans les deux états.
   */
  it("rend la meme barre de recherche que le hero", () => {
    const bar = (html) =>
      html.match(/bg-white rounded-r-\[16px\][^"]*/)?.[0] ?? "";

    expect(bar(placeholder())).toBe(bar(hero()));
  });

  it("annonce le chargement aux technologies d'assistance", () => {
    const html = placeholder();

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("aria-label");
  });
});
