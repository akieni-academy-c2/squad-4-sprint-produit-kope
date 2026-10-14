import hero, { srcSet as heroSrcSet } from '@/shared/assets/hero.png';
import what1, { srcSet as what1SrcSet } from '@/shared/assets/what1.png';
import what2, { srcSet as what2SrcSet } from '@/shared/assets/what2.png';
import what3, { srcSet as what3SrcSet } from '@/shared/assets/what3.png';
import confiance, { srcSet as confianceSrcSet } from '@/shared/assets/confiance.png';
import cta, { srcSet as ctaSrcSet } from '@/shared/assets/cta.png';
import user1, { srcSet as user1SrcSet } from '@/shared/assets/user1.png';
import user2, { srcSet as user2SrcSet } from '@/shared/assets/user2.png';

const CATEGORY_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw';

/**
 * Visuels de l'accueil, avec la largeur à laquelle le navigateur les rend
 * réellement. `src` sert de repli, `srcSet` et `sizes` laissent le navigateur
 * choisir la variante - un téléphone ne télécharge pas l'image d'un grand écran.
 */
export const HOME_IMAGES = {
  hero: { src: hero, srcSet: heroSrcSet, sizes: '(min-width: 1024px) 640px, 100vw' },
  what1: { src: what1, srcSet: what1SrcSet, sizes: CATEGORY_SIZES },
  what2: { src: what2, srcSet: what2SrcSet, sizes: CATEGORY_SIZES },
  what3: { src: what3, srcSet: what3SrcSet, sizes: CATEGORY_SIZES },
  trust: { src: confiance, srcSet: confianceSrcSet, sizes: '(min-width: 1024px) 45vw, 92vw' },
  cta: { src: cta, srcSet: ctaSrcSet, sizes: '(min-width: 1024px) 40vw, 92vw' },
  face1: { src: user1, srcSet: user1SrcSet, sizes: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw' },
  face2: { src: user2, srcSet: user2SrcSet, sizes: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw' },
};

const ORDER = {
  hero: hero,
  categories: [what1, what2, what3],
  trust: user1,
  cta: user2,
};

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