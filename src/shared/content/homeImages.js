import * as heroModule from '@/shared/assets/hero.png';
import * as what1Module from '@/shared/assets/what1.png';
import * as what2Module from '@/shared/assets/what2.png';
import * as what3Module from '@/shared/assets/what3.png';
import * as confianceModule from '@/shared/assets/confiance.png';
import * as ctaModule from '@/shared/assets/cta.png';
import * as user1Module from '@/shared/assets/user1.png';
import * as user2Module from '@/shared/assets/user2.png';
import { variants } from '@/shared/assets/variants.js';

const CATEGORY_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw';
const FACE_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw';

const hero = variants(heroModule);
const what1 = variants(what1Module);
const what2 = variants(what2Module);
const what3 = variants(what3Module);
const confiance = variants(confianceModule);
const cta = variants(ctaModule);
const user1 = variants(user1Module);
const user2 = variants(user2Module);

/**
 * Visuels de l'accueil, avec la largeur à laquelle le navigateur les rend
 * réellement. `src` sert de repli, `srcSet` et `sizes` laissent le navigateur
 * choisir la variante - un téléphone ne télécharge pas l'image d'un grand écran.
 */
export const HOME_IMAGES = {
  hero: { ...hero, sizes: '(min-width: 1024px) 640px, 100vw' },
  what1: { ...what1, sizes: CATEGORY_SIZES },
  what2: { ...what2, sizes: CATEGORY_SIZES },
  what3: { ...what3, sizes: CATEGORY_SIZES },
  trust: { ...confiance, sizes: '(min-width: 1024px) 45vw, 92vw' },
  cta: { ...cta, sizes: '(min-width: 1024px) 40vw, 92vw' },
  face1: { ...user1, sizes: FACE_SIZES },
  face2: { ...user2, sizes: FACE_SIZES },
};

const ORDER = {
  hero: hero.src,
  categories: [what1.src, what2.src, what3.src],
  trust: user1.src,
  cta: user2.src,
};

export const FEATURED_FACES = [hero.src, user1.src, user2.src];

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
