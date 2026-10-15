import { describe, expect, it } from "vitest";
import { repoPath } from "@test/support/repoRoot.js";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

const { PORTRAIT, HIGHLIGHT_ITEMS } = vi.hoisted(() => {
  const portrait =
    "https://persona-portraits.osirisbalonga.workers.dev/portraits/v1/medium/p_0001.webp";
  return {
    PORTRAIT: portrait,
    HIGHLIGHT_ITEMS: [1, 2, 3].map((id) => ({
      id,
      displayName: `Pro ${id}`,
      trade: "Plombier",
      zones: [{ name: "Poto-Poto" }],
      yearsExperience: 4,
      isAvailable: true,
      rating: { average: 4.5, count: 6 },
      avatarUrl: portrait,
      image: portrait,
    })),
  };
});

vi.mock("@/shared/hooks/useAsyncData.js", () => ({
  useAsyncData: () => ({
    data: { items: HIGHLIGHT_ITEMS },
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}));

const { ProfessionalCard } =
  await import("@/features/professionals/components/ProfessionalCard.jsx");
const { FeaturedProfessionalSection } =
  await import("@/shared/components/home/FeaturedProfessionalSection.jsx");
const { ZoneSection } =
  await import("@/shared/components/home/ZoneSection.jsx");
const { FEATURED_FACES, HOME_RESERVED } =
  await import("@/shared/content/homeImages.js");
const { reserveImage } = await import("@/shared/assets/placeholders.js");

const render = (element) =>
  renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

const PRO = {
  id: 7,
  displayName: "Daniel Adoua",
  trade: "Plombier",
  zones: [{ name: "Poto-Poto" }],
  yearsExperience: 5,
  isAvailable: true,
  rating: { average: 4.6, count: 12 },
  avatarUrl: PORTRAIT,
  image: PORTRAIT,
};

describe("L'accueil ne lit rien en base", () => {
  /**
   * Ces deux sections étaient alimentées par l'API. En rendu serveur elles
   * retombaient donc sur leur état de chargement : l'utilisateur ne voyait que
   * des squelettes. Elles doivent donc livrer leurs données dès le premier
   * rendu, sans passer par un état vide. Un spy sur `fetch` ne prouverait rien
   * ici : `renderToStaticMarkup` n'exécute aucun effet, donc aucun appel.
   */
  it("livre les visages au premier rendu, sans état de chargement", () => {
    const html = render(<FeaturedProfessionalSection />);

    for (const name of ["Grace Mpassi", "David Malonga", "Patrick Kengue"])
      expect(html, name).toContain(name);
  });

  it("livre les quartiers au premier rendu, sans état de chargement", () => {
    const html = render(<ZoneSection />);

    expect(html).toContain("Makélékélé");
    expect(html).toContain("Poto-Poto");
  });

  it("n'affiche que six quartiers, les suivants restent masqués", () => {
    const html = render(<ZoneSection />);
    const rendered =
      html.match(
        /Makélékélé|Bacongo|Poto-Poto|Moungali|Ouenzé|Talangaï|Mfilou|Madibou|Djiri/g,
      ) ?? [];

    expect(rendered).toHaveLength(9);
    expect((html.match(/hidden=""/g) ?? []).length).toBe(3);
  });

  it("approvisionne les deux sections sans passer par un état vide", () => {
    const zoneSource = readFileSync(
      repoPath("src/shared/components/home/ZoneSection.jsx"),
      "utf8",
    );
    const proSource = readFileSync(
      repoPath("src/shared/components/home/FeaturedProfessionalSection.jsx"),
      "utf8",
    );

    for (const source of [zoneSource, proSource]) {
      expect(source).not.toMatch(
        /useReferenceData|useAsyncData|searchProfessionals/,
      );
      expect(source).not.toContain("loading");
    }
  });
});

describe("Cartes de la page d'accueil", () => {
  it("ignore le portrait du service quand la carte est en avant-première", () => {
    const html = render(
      <ProfessionalCard mode="grid" item={PRO} homePreview />,
    );

    expect(html).not.toContain("persona-portraits");
    expect(html).not.toContain(PORTRAIT);
    expect(html).toContain("data:image/svg+xml");
  });

  it("affiche l'image locale fournie en avant-première", () => {
    const previewImage = "/assets/user1-audit.png";
    const html = render(
      <ProfessionalCard
        mode="grid"
        item={{ ...PRO, previewImage }}
        homePreview
      />,
    );

    expect(html).toContain(previewImage);
    expect(html).not.toContain("data:image/svg+xml");
    expect(html).not.toContain("persona-portraits");
  });

  it("donne un visuel distinct par professionnel", () => {
    const a = render(
      <ProfessionalCard mode="grid" item={{ ...PRO, id: 1 }} homePreview />,
    );
    const b = render(
      <ProfessionalCard mode="grid" item={{ ...PRO, id: 2 }} homePreview />,
    );

    expect(a).not.toBe(b);
  });

  it("utilise le portrait du professionnel ailleurs", () => {
    const html = render(<ProfessionalCard mode="list" item={PRO} />);

    expect(html).toContain(PORTRAIT);
  });
});

describe("Section des professionnels mis en avant", () => {
  it("affiche les visuels locaux de src/shared/assets pour chaque carte", () => {
    const html = render(<FeaturedProfessionalSection />);

    for (const face of FEATURED_FACES) expect(html).toContain(face);
    expect(html).not.toContain("persona-portraits");
    expect(html).not.toContain("data:image/svg+xml");
  });
});

describe("Aucune image distante sur l'accueil", () => {
  const homeFiles = [
    "@/pages/HomePage.jsx",
    "@/shared/components/home/CategorySection.jsx",
    "@/shared/components/home/FeaturedProfessionalSection.jsx",
    "@/shared/components/home/TrustSection.jsx",
    "@/shared/components/home/ProCTA.jsx",
    "@/shared/components/home/ZoneSection.jsx",
    "@/shared/components/home/FAQSection.jsx",
    "@/shared/components/home/FinalCTA.jsx",
    "@/shared/components/home/HeroSection.jsx",
    "@/shared/content/homeImages.js",
    "@/shared/content/featuredPros.js",
    "@/shared/content/homeZones.js",
    "@/shared/content/highlightedTrades.js",
  ];

  it.each(homeFiles)("%s ne référence aucun service de portraits", (path) => {
    const source = readFileSync(repoPath("src", path.slice(2)), "utf8");

    expect(source).not.toContain("persona-portraits");
    expect(source).not.toContain("persona-dev");
  });

  it("passe bien l'option sur la section des professionnels mis en avant", () => {
    const source = readFileSync(
      repoPath("src/shared/components/home/FeaturedProfessionalSection.jsx"),
      "utf8",
    );

    expect(source).toContain("homePreview");
  });

  it("puise les visages de la section dans les images locales", () => {
    const source = readFileSync(
      repoPath("src/shared/content/featuredPros.js"),
      "utf8",
    );

    expect(source).toContain("FEATURED_FACES");
    expect(source).toContain("@/shared/content/homeImages.js");
    expect(source).toContain("previewImage");
  });

  it("approvisionne la section sans aucun appel API", () => {
    const source = readFileSync(
      repoPath("src/shared/components/home/FeaturedProfessionalSection.jsx"),
      "utf8",
    );

    expect(source).not.toContain("searchProfessionals");
    expect(source).not.toContain("useAsyncData");
  });

  it("approvisionne les quartiers sans aucun appel API", () => {
    const source = readFileSync(
      repoPath("src/shared/components/home/ZoneSection.jsx"),
      "utf8",
    );

    expect(source).not.toContain("useReferenceData");
    expect(source).toContain("HOME_ZONES");
  });

  it("n'attribue jamais deux fois le même visuel", () => {
    const trust = reserveImage("confiance", HOME_RESERVED.upTo("trust"));
    const cta = reserveImage("devenir-prestataire", HOME_RESERVED.upTo("cta"));

    expect(HOME_RESERVED.upTo("trust")).not.toContain(trust);
    expect(HOME_RESERVED.upTo("cta")).not.toContain(cta);
    expect(trust).not.toBe(cta);
  });
});
