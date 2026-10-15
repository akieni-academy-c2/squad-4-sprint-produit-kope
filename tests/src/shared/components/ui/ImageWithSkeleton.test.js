import { describe, expect, it } from "vitest";
import { repoPath, REPO_ROOT } from "@test/support/repoRoot.js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const EXEMPT = new Map([
  [
    "src/features/photos/components/PhotoCard.jsx",
    "légende flottante superposée",
  ],
  [
    "src/features/professionals/components/public/PublicProfileSidebar.jsx",
    "avatar avec initiales de repli",
  ],
  [
    "src/features/professionals/components/public/PublicProfileMobileIntro.jsx",
    "avatar mobile",
  ],
  [
    "src/features/professionals/components/public/PhotoLightbox.jsx",
    "image en taille réelle, sans recadrage",
  ],
  [
    "src/shared/components/ui/FileUpload.jsx",
    "vignette locale de 80 px, déjà en mémoire",
  ],
  [
    "src/shared/components/ui/UserAvatar.jsx",
    "avatar générique de 32 px avec repli icône",
  ],
]);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const SEP = /[\\/]/g;

const srcKey = (file) => relative(REPO_ROOT, file).replace(SEP, "/");

const sourceFiles = walk(repoPath("src")).filter(
  (f) =>
    f.endsWith(".jsx") &&
    !f.replace(/\\/g, "/").endsWith("ImageWithSkeleton.jsx"),
);

describe("Images chargées avec squelette", () => {
  it("conserve les exceptions documentées", () => {
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf8");
      if (!/<img\b/.test(content)) continue;

      const key = srcKey(file);
      expect(
        EXEMPT.has(key),
        `${key} utilise <img> sans ImageWithSkeleton et n'est pas dans la liste des exceptions`,
      ).toBe(true);
    }
  });

  it("reste cohérent : chaque exception existe et utilise bien <img>", () => {
    for (const [file, reason] of EXEMPT)
      expect(readFileSync(repoPath(file), "utf8"), reason).toMatch(/<img\b/);
  });

  it("ne laisse aucune image sans attribut alt", () => {
    for (const file of sourceFiles) {
      const tags = readFileSync(file, "utf8").match(/<img\b[^>]*>/g) ?? [];

      for (const tag of tags)
        expect(tag, `${file} : <img> sans alt`).toMatch(/\balt=/);
    }
  });

  it("ne laisse aucune image charger avec decoding synchrone", () => {
    for (const file of sourceFiles) {
      const tags = readFileSync(file, "utf8").match(/<img\b[^>]*>/g) ?? [];

      for (const tag of tags)
        expect(tag, `${file} : <img> sans decoding`).toMatch(/\bdecoding=/);
    }
  });
});
