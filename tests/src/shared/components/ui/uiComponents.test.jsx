import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { User, Star } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/Skeleton.jsx";
import { FloatingCaption } from "@/shared/components/ui/FloatingCaption.jsx";
import { BottomNav } from "@/shared/components/ui/BottomNav.jsx";
import { Tooltip } from "@/shared/components/ui/Tooltip.jsx";

describe("Skeleton", () => {
  it("a l animation pulse", () => {
    const html = renderToStaticMarkup(<Skeleton className="h-10 w-full" />);
    expect(html).toContain("animate-pulse");
  });
});

describe("FloatingCaption", () => {
  it("affiche titre et sous-titre", () => {
    const html = renderToStaticMarkup(
      <FloatingCaption title="Titre" subtitle="Sous-titre" />,
    );
    expect(html).toContain("Titre");
    expect(html).toContain("Sous-titre");
    expect(html).toContain("bg-white/92");
  });

  it("aligne à droite quand align=right", () => {
    const html = renderToStaticMarkup(
      <FloatingCaption title="T" align="right" />,
    );
    expect(html).toContain("right-2");
  });
});

describe("BottomNav", () => {
  const items = [
    { id: "profil", label: "Mon profil", shortLabel: "Profil", icon: User },
    { id: "avis", label: "Mes avis", icon: Star },
  ];

  it("est fixée en bas et masquée en desktop", () => {
    const html = renderToStaticMarkup(
      <BottomNav
        items={items}
        active="profil"
        onChange={() => {}}
        ariaLabel="Navigation"
      />,
    );
    expect(html).toContain("fixed");
    expect(html).toContain("bottom-0");
    expect(html).toContain("lg:hidden");
    expect(html).toContain('aria-label="Navigation"');
  });

  it("utilise le libellé court pour les petits écrans", () => {
    const html = renderToStaticMarkup(
      <BottomNav items={items} active="profil" onChange={() => {}} />,
    );
    expect(html).toContain("Profil");
    expect(html).not.toContain("Mon profil");
    expect(html).toContain("Mes avis");
  });

  it("marque l'entrée active via aria-current, sans rôle tab", () => {
    const html = renderToStaticMarkup(
      <BottomNav items={items} active="avis" onChange={() => {}} />,
    );
    expect(html).not.toContain('role="tab"');
    expect(html).not.toContain("aria-selected");
    expect(html.split('aria-current="page"').length - 1).toBe(1);
  });

  const manyItems = [
    { id: "a", label: "Section A", shortLabel: "S-A", icon: User },
    { id: "b", label: "Section B", shortLabel: "S-B", icon: Star },
    { id: "c", label: "Section C", shortLabel: "S-C", icon: User },
    { id: "d", label: "Section D", shortLabel: "S-D", icon: Star },
    { id: "e", label: "Section E", shortLabel: "S-E", icon: User },
    { id: "f", label: "Section F", shortLabel: "S-F", icon: Star },
  ];

  it("ne dépasse jamais 5 cellules, bouton Menu compris", () => {
    const html = renderToStaticMarkup(
      <BottomNav
        items={manyItems}
        active="a"
        onChange={() => {}}
        ariaLabel="Navigation"
      />,
    );

    expect(html.split("<button").length - 1).toBe(5);
    expect(html).toContain("S-A");
    expect(html).toContain("S-D");
    expect(html).not.toContain("S-E");
    expect(html).not.toContain("S-F");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
  });

  it("affiche les 5 onglets du compte client sans Menu", () => {
    const html = renderToStaticMarkup(
      <BottomNav
        items={manyItems.slice(0, 5)}
        active="a"
        onChange={() => {}}
      />,
    );

    expect(html.split("<button").length - 1).toBe(5);
    expect(html).toContain("S-E");
    expect(html).not.toContain('aria-haspopup="dialog"');
  });

  it("ne propose pas de Menu quand tout tient dans les 4 places", () => {
    const html = renderToStaticMarkup(
      <BottomNav
        items={manyItems.slice(0, 4)}
        active="a"
        onChange={() => {}}
      />,
    );

    expect(html.split("<button").length - 1).toBe(4);
    expect(html).not.toContain('aria-haspopup="dialog"');
  });

  it("met en avant le bouton Menu quand la section active est en débordement", () => {
    const html = renderToStaticMarkup(
      <BottomNav items={manyItems} active="f" onChange={() => {}} />,
    );

    expect(html.split("bg-primary-50 text-primary-500").length - 1).toBe(1);
    expect(html).not.toContain('aria-current="page"');
  });
});

describe("Tooltip", () => {
  it("affiche le contenu avec role tooltip", () => {
    const html = renderToStaticMarkup(
      <Tooltip content="Voir la fiche">
        <button type="button">Fiche</button>
      </Tooltip>,
    );
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("Voir la fiche");
    expect(html).toContain("group/tooltip");
  });

  it("rend uniquement les enfants si pas de contenu", () => {
    const html = renderToStaticMarkup(
      <Tooltip content="">
        <button type="button">Action</button>
      </Tooltip>,
    );
    expect(html).not.toContain('role="tooltip"');
    expect(html).toContain("Action");
  });

  it("positionne selon side", () => {
    const html = renderToStaticMarkup(
      <Tooltip content="X" side="bottom">
        <span>a</span>
      </Tooltip>,
    );
    expect(html).toContain("top-full");
  });
});
