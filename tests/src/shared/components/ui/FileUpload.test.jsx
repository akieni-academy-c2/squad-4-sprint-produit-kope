import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FileUpload } from "@/shared/components/ui/FileUpload.jsx";

const PNG = () => new Blob(["x"], { type: "image/png" });

/**
 * Créer une URL d'objet alloue une ressource dans le navigateur : c'est une
 * effet de bord, pas un calcul. Le faire pendant le rendu la duplique sous
 * StrictMode, qui invoque deux fois le rendu, et l'URL orpheline n'est jamais
 * révoquée - `revokeObjectURL` est explicite, le ramasse-miettes ne suffit pas.
 */
describe("Pureté du rendu de l'aperçu", () => {
  afterEach(() => vi.restoreAllMocks());

  it("n'alloue aucune URL d'objet pendant le rendu", () => {
    const spy = vi.spyOn(URL, "createObjectURL");

    renderToStaticMarkup(<FileUpload value={PNG()} />);

    expect(spy).not.toHaveBeenCalled();
  });

  it("n'en alloue pas non plus pour une URL déjà disponible", () => {
    const spy = vi.spyOn(URL, "createObjectURL");

    renderToStaticMarkup(<FileUpload value="https://exemple.test/a.png" />);

    expect(spy).not.toHaveBeenCalled();
  });
});