
import hero from '@/shared/assets/hero.png';
import what1 from '@/shared/assets/what1.png';
import what2 from '@/shared/assets/what2.png';
import what3 from '@/shared/assets/what3.png';
import user1 from '@/shared/assets/user1.png';
import user2 from '@/shared/assets/user2.png';

const ORDER = {
  hero: hero,
  categories: [what1, what2, what3],
  trust: user1,
  cta: user2,
};

/**
 * Visages de la section « Faites connaissance ».
 *
 * Les trois visuels de personnes du dossier : cette section annonce des
 * visages, elle ne peut donc pas reprendre les images de chantier (what1..3)
 * déjà servies par les cartes catégories juste au-dessus.
 */
export const FEATURED_FACES = [hero, user1, user2];

export const HOME_RESERVED = {
  upTo(section) {
    const before = ['hero', 'categories', 'trust', 'cta'];
    const taken = [];

    for (const name of before) {
      if (name === section) break;
      taken.push(...[ORDER[name]].flat());
    }

    return taken;
  },
};