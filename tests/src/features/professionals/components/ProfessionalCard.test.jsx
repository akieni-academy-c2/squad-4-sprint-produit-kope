import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { ProfessionalCard } from "@/features/professionals/components/ProfessionalCard.jsx";

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
};

describe("ProfessionalCard - note", () => {
  it("garde l'étoile et la moyenne sur une seule ligne (grille)", () => {
    const html = render(<ProfessionalCard mode="grid" item={PRO} />);

    expect(
      html,
      "l'étoile et la moyenne doivent partager un conteneur `nowrap`",
    ).toMatch(
      /<span class="inline-flex items-center gap-1[^"]*whitespace-nowrap[^"]*"><svg[\s\S]*?avis<\/span>/,
    );
    expect(html).toContain("4.6");
    expect(html).toContain("12 avis");
  });

  it("garde la note groupée en mode liste", () => {
    const html = render(<ProfessionalCard mode="list" item={PRO} />);

    expect(html).toMatch(
      /<span class="inline-flex items-center gap-1\.5 font-semibold text-gray-900">/,
    );
    expect(html).toContain("4.6 (12 avis)");
  });

  it("annonce « Nouveau » quand le professionnel n'a aucun avis", () => {
    const html = render(
      <ProfessionalCard
        mode="grid"
        item={{ ...PRO, rating: { average: 0, count: 0 } }}
      />,
    );

    expect(html).toContain("Nouveau");
    expect(html).not.toContain("avis");
  });
});

describe("ProfessionalCard - sémantique de liste", () => {
  const hasListItem = (html) => /<li(\s|>)/.test(html);

  it("ne rend pas de <li> : la carte est le contenu de l'élément de liste", () => {
    for (const mode of ["list", "grid"])
      expect(
        hasListItem(render(<ProfessionalCard mode={mode} item={PRO} />)),
        mode,
      ).toBe(false);
  });

  it("reste valide une fois enveloppée dans un <li> par le parent", () => {
    for (const mode of ["list", "grid"]) {
      const html = render(
        <ul>
          <li>
            <ProfessionalCard mode={mode} item={PRO} />
          </li>
        </ul>,
      );

      expect(html, mode).toMatch(/^<ul><li><a /);
      expect(html, mode).not.toContain("<li><li>");
      expect(html.match(/<li(\s|>)/g), mode).toHaveLength(1);
    }
  });
});
