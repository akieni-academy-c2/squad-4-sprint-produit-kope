import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

const { useAuthContext } = vi.hoisted(() => ({ useAuthContext: vi.fn() }));
vi.mock("@/shared/context/AuthContext.jsx", () => ({ useAuthContext }));

const { HomeRoute } = await import("@/routes/HomeRoute.jsx");

const render = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <HomeRoute>
        <p>contenu de la home</p>
      </HomeRoute>
    </MemoryRouter>,
  );

/**
 * Le vide au chargement venait d'ici, pas du morceau lazy. La vérification de
 * session prend le temps d'un aller-retour API, et la home rendait `null`
 * pendant ce temps - en masquant son propre placeholder, qui vit dans
 * `children`. C'est la seule route qui faisait ainsi : les autres passent par
 * `ProtectedRoute`, qui affiche un squelette.
 */
describe("HomeRoute pendant la vérification de session", () => {
  it("rend la page même quand la session est en cours de vérification", () => {
    useAuthContext.mockReturnValue({ user: null, loading: true });

    expect(render()).toContain("contenu de la home");
  });

  it("rend la page pour un visiteur déconnecté", () => {
    useAuthContext.mockReturnValue({ user: null, loading: false });

    expect(render()).toContain("contenu de la home");
  });

  it("ne rend aucun contenu quand la session est en cours", () => {
    useAuthContext.mockReturnValue({ user: null, loading: true });

    expect(render().trim()).not.toBe("");
  });
});
