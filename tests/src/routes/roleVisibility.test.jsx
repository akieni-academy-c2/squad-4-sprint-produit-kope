import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";

const { authState } = vi.hoisted(() => ({
  authState: { current: null, loading: false },
}));

vi.mock("@/shared/context/AuthContext.jsx", () => ({
  useAuthContext: () => ({
    user: authState.current,
    loading: authState.loading,
    hasRole: (role) => authState.current?.role === role,
    isServiceProvider: Boolean(
      authState.current &&
      ["professional", "admin"].includes(authState.current.role),
    ),
  }),
}));

vi.mock("@/shared/context/AuthModalContext.jsx", () => ({
  useAuthModal: () => ({ open: vi.fn() }),
}));

vi.mock("@/shared/hooks/useAsyncData.js", () => ({
  useAsyncData: () => ({
    data: { items: [] },
    loading: false,
    error: null,
    reload: vi.fn(),
  }),
}));

const { Navbar } = await import("@/shared/components/layout/Navbar.jsx");
const { HomePage } = await import("@/pages/HomePage.jsx");
const { HomeRoute } = await import("@/routes/HomeRoute.jsx");
const { landingHrefFor, dashboardHref } =
  await import("@/shared/utils/userMenuUtils.js");

const render = (element) =>
  renderToStaticMarkup(<MemoryRouter>{element}</MemoryRouter>);

function connectAs(role) {
  authState.current = role
    ? { id: 1, role, firstName: "Ama", lastName: "B" }
    : null;
}

beforeEach(() => {
  authState.loading = false;
  connectAs(null);
});

describe("Navbar", () => {
  it("montre tous les liens et renvoie le logo vers la home si non connecté", () => {
    const html = render(<Navbar />);

    expect(html).toContain("Comment ça marche");
    expect(html).toContain("Devenir Prestataire");
    expect(html).toContain('href="/"');
  });

  it("réduit la navigation à la recherche pour un client", () => {
    connectAs("client");
    const html = render(<Navbar />);

    expect(html).not.toContain("Comment ça marche");
    expect(html).not.toContain("Devenir Prestataire");
    expect(html).toContain("Trouver un professionnel");
  });

  it("envoie le logo vers la recherche pour un client", () => {
    connectAs("client");
    expect(render(<Navbar />)).toContain('href="/search"');
  });

  it("masque les deux liens pour un professionnel", () => {
    connectAs("professional");
    const html = render(<Navbar />);

    expect(html).not.toContain("Comment ça marche");
    expect(html).not.toContain("Devenir Prestataire");
    expect(html).toContain("Trouver un professionnel");
  });

  it("envoie le logo vers l'espace professionnel", () => {
    connectAs("professional");
    expect(render(<Navbar />)).toContain('href="/dashboard/pro"');
  });

  it("masque les deux liens pour un administrateur", () => {
    connectAs("admin");
    const html = render(<Navbar />);

    expect(html).not.toContain("Comment ça marche");
    expect(html).not.toContain("Devenir Prestataire");
  });

  it("envoie le logo vers l'administration", () => {
    connectAs("admin");
    expect(render(<Navbar />)).toContain('href="/admin"');
  });
});

describe("Recherche dans la navigation", () => {
  it("reste un lien simple si non connecté", () => {
    const html = render(<Navbar />);

    expect(html).toContain("Trouver un professionnel");
    expect(html).toContain('href="/search"');
    expect(html).not.toContain("border-gray-300 bg-white/25");
  });

  it("devient un bouton marqué pour un client", () => {
    connectAs("client");
    const html = render(<Navbar />);

    expect(html).toContain("border-gray-300 bg-white/25");
    expect(html).toContain('href="/search"');
  });

  it("reste un bouton marqué pour un professionnel", () => {
    connectAs("professional");
    expect(render(<Navbar />)).toContain("border-gray-300 bg-white/25");
  });

  it("reste un bouton marqué pour un administrateur", () => {
    connectAs("admin");
    expect(render(<Navbar />)).toContain("border-gray-300 bg-white/25");
  });

  it("continue de mener vers /search", () => {
    connectAs("professional");

    const html = render(<Navbar />);
    const searchLinks = html.match(/href="\/search"/g) ?? [];

    expect(searchLinks.length).toBeGreaterThan(0);
  });

  it("n'affiche qu'un seul lien de recherche par surface", () => {
    for (const role of [null, "client", "professional", "admin"]) {
      connectAs(role);
      const desktop = render(<Navbar />);
      expect(
        desktop.split('href="/search"').length - 1,
        String(role),
      ).toBeLessThanOrEqual(3);
    }
  });
});

describe("HomePage", () => {
  it("affiche « Comment ça marche » et le bouton devenir pro si non connecté", () => {
    const html = render(<HomePage />);

    expect(html).toContain("Vous avez le savoir-faire");
    expect(html).toContain("Cherchez près de chez vous");
  });

  it("conserve les deux sections pour un client", () => {
    connectAs("client");
    const html = render(<HomePage />);

    expect(html).toContain("Vous avez le savoir-faire");
    expect(html).toContain("Cherchez près de chez vous");
  });

  it("retire les deux sections pour un professionnel", () => {
    connectAs("professional");
    const html = render(<HomePage />);

    expect(html).not.toContain("Vous avez le savoir-faire");
    expect(html).not.toContain("Cherchez près de chez vous");
  });

  it("retire les deux sections pour un administrateur", () => {
    connectAs("admin");
    const html = render(<HomePage />);

    expect(html).not.toContain("Vous avez le savoir-faire");
    expect(html).not.toContain("Cherchez près de chez vous");
  });

  it("garde le reste de la page intact", () => {
    const html = render(<HomePage />);

    expect(html).toContain("Le bon artisan");
    expect(html).toContain("Faut-il un compte pour chercher");
  });
});

describe("Redirection de /", () => {
  it("renvoie le client vers la recherche et les autres vers leur gestion", () => {
    expect(landingHrefFor({ role: "client" })).toBe("/search");
    expect(landingHrefFor({ role: "professional" })).toBe("/dashboard/pro");
    expect(landingHrefFor({ role: "admin" })).toBe("/admin");
  });

  it("laisse la home à qui n'est pas connecté", () => {
    expect(landingHrefFor(null)).toBe("/");
    expect(landingHrefFor(undefined)).toBe("/");
  });

  it("donne la même destination que le logo", () => {
    for (const role of ["client", "professional", "admin"]) {
      connectAs(role);
      expect(render(<Navbar />), role).toContain(
        `href="${landingHrefFor({ role })}"`,
      );
    }
  });

  it("laisse l'espace client accessible depuis le menu", () => {
    expect(dashboardHref("client")).toBe("/dashboard/client");
  });

  it("affiche la home quand personne n'est connecté", () => {
    expect(
      render(
        <HomeRoute>
          <p>ACCUEIL</p>
        </HomeRoute>,
      ),
    ).toContain("ACCUEIL");
  });

  /**
   * La home est la page d'atterrissage. La faire attendre la réponse de l'API de
   * session donnait un écran vide, le temps que l'appel atteigne la base et
   * revienne - plusieurs secondes en pratique. Elle s'affiche donc dès le premier
   * rendu ; la redirection d'un visiteur connecté n'a lieu qu'une fois la session
   * connue, ce qui n'est observable que pour lui.
   */
  it("affiche la page d'accueil pendant le chargement de session", () => {
    connectAs("client");
    authState.loading = true;

    expect(
      render(
        <HomeRoute>
          <p>ACCUEIL</p>
        </HomeRoute>,
      ),
    ).toContain("ACCUEIL");
  });

  it("redirige un visiteur connecté dès que la session est connue", () => {
    connectAs("client");
    authState.loading = false;

    expect(
      render(
        <HomeRoute>
          <p>ACCUEIL</p>
        </HomeRoute>,
      ),
    ).not.toContain("ACCUEIL");
  });
});
