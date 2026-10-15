import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog.jsx";
import { IconButton } from "@/shared/components/ui/IconButton.jsx";
import { Star } from "lucide-react";
import { dialogPanel } from "@/shared/motion/variants.js";

const panelMarkup = (props) =>
  renderToStaticMarkup(
    <DialogContent {...props}>
      <DialogTitle>Titre</DialogTitle>
    </DialogContent>,
  );

describe("panneau de dialogue", () => {
  it("applique la variante qu’il reçoit", () => {
    const html = panelMarkup({ variants: dialogPanel, initial: "initial" });

    expect(html).toContain("opacity:0");
    expect(html).toContain("translateY(8px)");
    expect(html).toContain("scale(0.96)");
  });

  it("reste neutre sans variante", () => {
    expect(panelMarkup({ initial: "initial" })).not.toContain("opacity:0");
  });

  it("porte le nom accessible de son titre", () => {
    expect(panelMarkup({ variants: dialogPanel })).toMatch(
      /aria-labelledby="[^"]+"/,
    );
  });

  it("ferme au clavier comme au clic", () => {
    expect(panelMarkup({ variants: dialogPanel })).toContain(
      'aria-label="Fermer"',
    );
  });

  it("n’a pas de bandeau quand le dialogue n’a pas d’en-tête", () => {
    const html = panelMarkup({ variants: dialogPanel });

    expect(html).toContain("absolute right-4 top-4");
    expect(html).toContain("pr-11");
  });

  it("conserve le bandeau quand le dialogue en a un", () => {
    const html = renderToStaticMarkup(
      <DialogContent variants={dialogPanel}>
        <DialogHeader>
          <DialogTitle>Contacter</DialogTitle>
        </DialogHeader>
      </DialogContent>,
    );
    expect(html).toContain("Contacter");
    expect(html).not.toContain("absolute right-4 top-4");
    expect(html).not.toContain("pr-11");
  });
});

describe("bouton d’icône", () => {
  const icon = (props) =>
    renderToStaticMarkup(<IconButton icon={Star} label="Noter" {...props} />);

  it("porte un nom accessible", () => {
    expect(icon()).toContain('aria-label="Noter"');
  });

  it("ne bouge pas quand il est désactivé", () => {
    const html = icon({ disabled: true });
    expect(html).toContain("disabled");
    expect(html).toContain("cursor-not-allowed");
  });

  it("reste un bouton", () => {
    expect(icon()).toMatch(/<button/);
    expect(icon()).toContain('type="button"');
  });

  it("prend un titre quand on ne lui en donne pas", () => {
    expect(icon({ title: "Noter ce professionnel" })).toContain(
      'title="Noter ce professionnel"',
    );
  });
});
