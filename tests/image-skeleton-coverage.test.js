import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Chargement des images.
 *
 * Une balise <img> nue affiche un cadre vide pendant le téléchargement, puis
 * la photo : la page saute. `ImageWithSkeleton` réserve la place et fond l'image
 * en place. Ce test liste les <img> qui ont contourné ce cadre, pour qu'un
 * nouvel ajout ne passe pas inaperçu.
 *
 * Exceptions assumées, où la balise sert d'élément interchangeable et non
 * d'illustration encadrée :
 *   - PublicProfileSidebar et PublicProfileMobileIntro : avatars dont la taille
 *     est imposée par le conteneur, avec initiales de repli ;
 *   - PhotoCard : image posée en absolu sous une légende flottante ;
 *   - PhotoLightbox : vue agrandie en taille réelle, sans recadrage, où un
 *     cadre de ratio ferait déformer l'image ;
 *   - FileUpload : vignette de 80 px issue d'un fichier déjà en mémoire ;
 *   - UserAvatar : avatar générique de 32 px, avec repli icône.
 *
 * Dans tous ces cas, la taille est imposée par le conteneur et un cadre de
 * ratio n'aurait aucun sens.
 *
 * Les deux avatars partagent le même traitement : ce serait le prochain
 * candidat à factoriser.
 */
const EXEMPT = new Map([
  ['src/features/photos/components/PhotoCard.jsx', 'légende flottante superposée'],
  ['src/features/professionals/components/public/PublicProfileSidebar.jsx', 'avatar avec initiales de repli'],
  ['src/features/professionals/components/public/PublicProfileMobileIntro.jsx', 'avatar mobile'],
  ['src/features/professionals/components/public/PhotoLightbox.jsx', 'image en taille réelle, sans recadrage'],
  ['src/shared/components/ui/FileUpload.jsx', 'vignette locale de 80 px, déjà en mémoire'],
  ['src/shared/components/ui/UserAvatar.jsx', 'avatar générique de 32 px avec repli icône'],
]);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sourceFiles = walk('src').filter(
  (f) => f.endsWith('.jsx') && !f.replace(/\\/g, '/').endsWith('ImageWithSkeleton.jsx'),
);

describe('Images chargées avec squelette', () => {
  it('conserve les exceptions documentées', () => {
    for (const file of sourceFiles) {
      const content = readFileSync(file, 'utf8');
      if (!/<img\b/.test(content)) continue;

      const key = file.replace(/\\/g, '/');
      expect(
        EXEMPT.has(key),
        `${key} utilise <img> sans ImageWithSkeleton et n'est pas dans la liste des exceptions`,
      ).toBe(true);
    }
  });

  it('reste cohérent : chaque exception existe et utilise bien <img>', () => {
    for (const [file, reason] of EXEMPT)
      expect(readFileSync(file, 'utf8'), reason).toMatch(/<img\b/);
  });

  it('ne laisse aucune image sans attribut alt', () => {
    for (const file of sourceFiles) {
      const tags = readFileSync(file, 'utf8').match(/<img\b[^>]*>/g) ?? [];

      for (const tag of tags) expect(tag, `${file} : <img> sans alt`).toMatch(/\balt=/);
    }
  });

  it('ne laisse aucune image charger avec decoding synchrone', () => {
    for (const file of sourceFiles) {
      const tags = readFileSync(file, 'utf8').match(/<img\b[^>]*>/g) ?? [];

      for (const tag of tags) expect(tag, `${file} : <img> sans decoding`).toMatch(/\bdecoding=/);
    }
  });
});