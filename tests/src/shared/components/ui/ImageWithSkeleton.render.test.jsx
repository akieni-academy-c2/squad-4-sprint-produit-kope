import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageWithSkeleton } from "@/shared/components/ui/ImageWithSkeleton.jsx";

const IMG = "https://exemple.test/hero.webp";

const render = (props) =>
  renderToStaticMarkup(<ImageWithSkeleton alt="Artisanne" {...props} />);

/**
 * L'image du héros est l'élément LCP de l'accueil. Sans indice de priorité, le
 * navigateur la découvre en analysant le HTML, après le script. React émet le
 * preload dès qu'il voit `fetchPriority="high"` sur une image.
 */
describe("Priorité de l'image LCP", () => {
  it("precharge l'image prioritaire", () => {
    const html = render({ src: IMG, priority: true });

    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('loading="eager"');
    expect(html).toContain('rel="preload"');
    expect(html).toContain('as="image"');
  });

  it("differe les images ordinaires", () => {
    const html = render({ src: IMG });

    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain('fetchPriority="high"');
  });

  it("conserve srcset et sizes pour le choix de variante", () => {
    const html = render({
      src: IMG,
      srcSet: "/a.webp 640w, /b.webp 1280w",
      sizes: "100vw",
    });

    expect(html).toContain('srcSet="/a.webp 640w, /b.webp 1280w"');
    expect(html).toContain('sizes="100vw"');
  });
});

/**
 * Échec de chargement : l'image passe à `opacity-0`, il faut donc un fond
 * derrière. Sans lui le cadre reste vide, ce qui masque complètement la panne
 * aussi bien à l'internaute qu'au lecteur d'écran.
 */
describe("Repli sur image morte", () => {
  it("affiche un bloc neutre quand aucune source n'est fournie", () => {
    expect(render({})).toContain("bg-gray-200");
  });

  it("reste en chargement animé tant que l'image n'a pas répondu", () => {
    const html = render({ src: IMG });

    expect(html).toContain("animate-pulse");
  });

  it("cesse d'animer une fois l'image en échec", () => {
    const html = render({});

    expect(html).not.toContain("animate-pulse");
    expect(html).toContain("bg-gray-200");
  });
});

/**
 * Le placeholder d'une image est le premier élément visible d'une page qui
 * charge. Un bloc gris anonyme ne dit rien du site ; y poser la marque donne au
 * visiteur un point d'ancrage, et signale que l'attente est normale.
 */
describe("Marque dans le placeholder", () => {
  it("affiche la marque centree pendant le chargement", () => {
    const html = render({ src: IMG });

    expect(html).toContain("KOP");
    expect(html).toMatch(/flex h-full w-full items-center justify-center/);
  });

  it("ne montre pas la marque sur une image morte", () => {
    const html = render({});

    expect(html).not.toContain("KOP");
  });
});
