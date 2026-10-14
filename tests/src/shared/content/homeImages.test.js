import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { repoPath } from '@test/support/repoRoot.js';
import { IMAGES, reserveImage } from '@/shared/assets/placeholders.js';
import { FEATURED_FACES, HOME_IMAGES, HOME_RESERVED } from '@/shared/content/homeImages.js';
import { variants } from '@/shared/assets/variants.js';

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const RASTER_IMPORT = /^import\s[^;]*\{[^}]*\}\s*from\s*['"][^'"]+\.(?:png|jpe?g)['"]/m;


describe('Visuels de la page d\'accueil', () => {
  it('expose six visuels locaux', () => {
    expect(IMAGES).toHaveLength(6);
  });

  it('ne réutilise aucun visuel entre emplacements', () => {
    const beforeTrust = HOME_RESERVED.upTo('trust');
    const beforeCta = HOME_RESERVED.upTo('cta');

    const trust = reserveImage('a-confiance', beforeTrust);
    const cta = reserveImage('b-devenir-prestataire', beforeCta);

    expect(beforeTrust).not.toContain(trust);
    expect(beforeCta).not.toContain(cta);
    expect(trust).not.toBe(cta);
  });

  it('réserve les visuels du héros et des catégories avant les sections suivantes', () => {
    expect(HOME_RESERVED.upTo('trust')).toHaveLength(4);
  });

  it('redevient au tirage complet si tout est déjà pris', () => {
    const all = IMAGES;
    const image = reserveImage('trop-etroit', all);

    expect(all).toContain(image);
  });

  it('reste déterministe pour un même libellé', () => {
    expect(reserveImage('meme-libel')).toBe(reserveImage('meme-libel'));
  });

  it('donne trois visages distincts à la section des professionnels mis en avant', () => {
    expect(FEATURED_FACES).toHaveLength(3);
    expect(new Set(FEATURED_FACES).size).toBe(3);
    for (const face of FEATURED_FACES) expect(IMAGES).toContain(face);
  });
});

describe('variantes responsives des visuels', () => {
  it('déclare une taille d\'affichage pour chaque visuel', () => {
    for (const [name, image] of Object.entries(HOME_IMAGES)) {
      expect(image.src, name).toBeTruthy();
      expect(image.sizes, name).toBeTruthy();
    }
  });

  it('lit un module sans export nommé, comme en développement', () => {
    expect(variants({ default: '/src/shared/assets/hero.png' })).toEqual({
      src: '/src/shared/assets/hero.png',
      srcSet: undefined,
    });
  });

  it('lit un module avec srcSet, comme après le build', () => {
    expect(variants({ default: '/a.webp', srcSet: '/a.webp 640w' })).toEqual({
      src: '/a.webp',
      srcSet: '/a.webp 640w',
    });
  });
});

/**
 * Le plugin `kop-image-optimizer` n'agit qu'au build. En développement, le
 * module image n'exporte qu'un `default` : un `import { srcSet }` y lève une
 * SyntaxError qui casse la page entière, et que `vite build` ne voit jamais
 * puisque le build fournit bien l'export. D'où l'interdiction ci-dessous.
 */
describe('imports d\'images matricielles', () => {
  const sources = walk(repoPath('src')).filter((file) => /\.(?:js|jsx)$/.test(file));

  it.each(sources)('%s n\'utilise aucun import nommé', (file) => {
    const source = readFileSync(file, 'utf8');

    expect(RASTER_IMPORT.test(source), `${file} : import nommé depuis une image`).toBe(false);
  });
});