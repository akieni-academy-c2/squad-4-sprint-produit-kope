import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/shared/components/layout/Navbar.jsx";
import { AuthProvider } from "@/shared/context/AuthContext.jsx";
import { NotificationProvider } from "@/shared/context/NotificationContext.jsx";
import { AuthModalProvider } from "@/shared/context/AuthModalContext.jsx";
import { ROUTES } from "@/shared/lib/constants.js";

function render({ at = "/" } = {}) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[at]}>
      <NotificationProvider>
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
          </AuthModalProvider>
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>,
  );
}

describe("Destinations de la barre", () => {
  it("envoie chaque onglet vers sa page", () => {
    const html = render();

    expect(html).toContain(`href="${ROUTES.SEARCH}"`);
    expect(html).toContain(`href="${ROUTES.HOW_IT_WORKS}"`);
  });

  it("nhibernate aucun onglet", () => {
    const html = render();
    const hrefs = [...html.matchAll(/<a[^>]*\shref="([^"]*)"/g)].map(
      (m) => m[1],
    );

    expect(hrefs.length).toBeGreaterThan(2);
    expect(
      hrefs.every(
        (href) =>
          href === ROUTES.SEARCH ||
          href === ROUTES.HOW_IT_WORKS ||
          href === "/",
      ),
    ).toBe(true);
    expect(hrefs).toContain(ROUTES.SEARCH);
    expect(hrefs).toContain(ROUTES.HOW_IT_WORKS);
  });

  it("marque actif le seul onglet de la page courante", () => {
    expect(render({ at: "/" })).not.toContain("nav-link-active");
    expect(render({ at: ROUTES.HOW_IT_WORKS })).toContain("nav-link-active");
    expect(render({ at: ROUTES.SEARCH })).toContain("nav-link-active");
  });
});

describe("Sélecteur de rôle dans la barre", () => {
  it("est présent dans le rendu", () => {
    expect(render()).toContain(
      "Tester l&#x27;application avec des données fictives",
    );
  });

  it("affiche une entrée par défaut", () => {
    expect(render()).toContain("Démo");
  });

  it("garde le logo comme lien principal", () => {
    const html = render();

    expect(html).toContain("KOP");
    expect(html).toContain('href="/"');
  });

  it("reste un bouton avec menu, pas un lien de navigation", () => {
    const html = render();

    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
  });
});

describe("Justification du header sur mobile", () => {
  it("cale le bouton menu à droite quand la nav desktop est masquée", () => {
    expect(render()).toContain("absolute right-3");
  });
});
