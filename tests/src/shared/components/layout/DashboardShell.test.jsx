import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { Star, Users, LayoutDashboard } from "lucide-react";
import { DashboardShell } from "@/shared/components/layout/DashboardShell.jsx";

const ITEMS = [
  {
    id: "overview",
    label: "Vue d'ensemble",
    shortLabel: "Aperçu",
    icon: LayoutDashboard,
  },
  { id: "reviews", label: "Avis", shortLabel: "Avis", icon: Star },
  { id: "users", label: "Utilisateurs", shortLabel: "Users", icon: Users },
];

/**
 * Rend le shell à une URL donnée et renvoie la section qu'il considers active.
 * Le bouton de navigation n'étant pas simulable ici, on vérifie la moitié qui
 * peut l'être : l'URL qui décide de la section rendue.
 */
const NAV_LABEL = "Sidebar";

function renderAt(pathname) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[pathname]}>
      <DashboardShell
        items={ITEMS}
        basePath="/admin"
        rootId="overview"
        navAriaLabel={NAV_LABEL}
        renderSection={(active) => <p>section:{active}</p>}
      />
    </MemoryRouter>,
  );
}

function markupAt(pathname) {
  return renderAt(pathname);
}

/**
 * Isole la navigation latérale. Le DashboardShell rend aussi une barre du bas
 * avec les mêmes liens : sans cette extraction, une assertion sur `href` passe
 * grâce à la mauvaise barre et ne vérifie plus rien.
 */
function sidebarAt(pathname) {
  return (
    renderAt(pathname).match(
      new RegExp(`<nav[^>]*aria-label="${NAV_LABEL}"[\\s\\S]*?</nav>`),
    )?.[0] ?? ""
  );
}

function activeAt(pathname) {
  return markupAt(pathname).match(/section:([a-z]+)/)?.[1] ?? null;
}

describe("DashboardShell - section active", () => {
  it("suit la racine quand aucune section n'est dans l'URL", () => {
    expect(activeAt("/admin")).toBe("overview");
  });

  it("suit la section présente dans l'URL", () => {
    expect(activeAt("/admin/reviews")).toBe("reviews");
    expect(activeAt("/admin/users")).toBe("users");
  });

  /**
   * La section affichée est déduite de l'URL, jamais conservée en mémoire :
   * c'est ce qui permet à un onglet de changer réellement de contenu, et à un
   * lien direct d'ouvrir la bonne section.
   */
  it("retombe sur la racine pour une section inconnue", () => {
    expect(activeAt("/admin/inexistant")).toBe("overview");
  });
});

/**
 * Un onglet qui n'est qu'un bouton n'est pas partageable : le clic droit et le
 * ctrl+clic n'existent pas, et la barre d'état du navigateur n'annonce aucune
 * destination. Le rendu est vérifié directement dans le HTML produit.
 */
describe("DashboardShell - onglets liens", () => {
  it("rend la navigation latérale en liens, pas en boutons", () => {
    const sidebar = sidebarAt("/admin");
    expect((sidebar.match(/<a /g) ?? []).length).toBe(ITEMS.length);
    expect(sidebar).not.toContain("<button");
  });

  it("pointe chaque section vers son URL", () => {
    const sidebar = sidebarAt("/admin");
    expect(sidebar).toContain('href="/admin/reviews"');
    expect(sidebar).toContain('href="/admin/users"');
  });

  it("pointe la racine vers la base, pas vers un segment", () => {
    expect(sidebarAt("/admin")).toContain('href="/admin"');
  });

  it("marque la section courante avec aria-current", () => {
    const tag =
      sidebarAt("/admin/reviews").match(
        /<a[^>]*href="\/admin\/reviews"[^>]*>/,
      )?.[0] ?? "";
    expect(tag).toContain('aria-current="page"');
  });

  it("ne pose pas aria-current sur les sections inactives", () => {
    const tag =
      sidebarAt("/admin/reviews").match(
        /<a[^>]*href="\/admin\/users"[^>]*>/,
      )?.[0] ?? "";
    expect(tag).not.toContain("aria-current");
  });
});
