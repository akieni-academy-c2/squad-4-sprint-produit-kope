import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { UserAvatar } from "@/shared/components/ui/UserAvatar.jsx";

const PHOTO = "https://exemple.test/portrait.webp";

const render = (props) => renderToStaticMarkup(<UserAvatar {...props} />);

/**
 * Le repli sur l'icône est le contrat que voit l'utilisateur partout : pas de
 * photo ne doit jamais produire une image cassée ni une case vide.
 */
describe("Avatar sans photo", () => {
  it("affiche l'icone utilisateur", () => {
    expect(render({ user: { firstName: "Awa" } })).toContain("lucide-user");
  });

  it("n'insere aucune image", () => {
    const html = render({ user: { firstName: "Awa", avatarUrl: null } });

    expect(html).not.toContain("<img");
  });

  it("masque l'icone aux lecteurs d'ecran", () => {
    expect(render({ name: "Awa" })).toContain('aria-hidden="true"');
  });
});

describe("Avatar avec photo", () => {
  it("affiche l'image et son texte alternatif", () => {
    const html = render({ name: "Awa", src: PHOTO });

    expect(html).toContain(`src="${PHOTO}"`);
    expect(html).toContain('alt="Awa"');
    expect(html).toContain('decoding="async"');
  });

  it("compose le nom depuis le prenom et le nom", () => {
    expect(
      render({ user: { firstName: "Awa", lastName: "Mavoungou" }, src: PHOTO }),
    ).toContain('alt="Awa Mavoungou"');
  });

  it("n'affiche plus l'icone quand la photo est presente", () => {
    expect(render({ name: "Awa", src: PHOTO })).not.toContain("lucide-user");
  });
});

/**
 * La photo de la fiche publique est l'image LCP de la page : la charger en
 * différé la retarderait, d'où `priority`. React 19 en profite pour émettre
 * seul le préchargement, il n'y a donc rien à écrire dans index.html.
 */
describe("Priorite de chargement", () => {
  it("charge sans attendre l'avatar prioritaire", () => {
    const html = render({ name: "Awa", src: PHOTO, priority: true });

    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('rel="preload"');
  });

  it("differe les autres avatars", () => {
    const html = render({ name: "Awa", src: PHOTO });

    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('fetchPriority="high"');
  });
});