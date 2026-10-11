import { describe, expect, it } from 'vitest';
import { IMAGES, reserveImage } from '../src/shared/assets/placeholders.js';
import { HOME_RESERVED } from '../src/shared/content/homeImages.js';

/**
 * Visuels de la page d'accueil.
 *
 * Six images locales pour cinq emplacements. Sans réservation explicite, le
 * tirage par empreinte donnait la même image à deux sections et l'accueil
 * semblait répéter des visages. Ces tests verrouillent la répartition.
 */
describe('Visuels de la page d\'accueil', () => {
  it('expose six visuels locaux', () => {
    expect(IMAGES).toHaveLength(6);
  });

  it('ne réutilise aucun visuel entre emplacements', () => {
    const beforeTrust = HOME_RESERVED.upTo('trust');
    const beforeCta = HOME_RESERVED.upTo('cta');

    const trust = reserveImage('a-confiance', beforeTrust);
    const cta = reserveImage('b-devenir-prestataire', beforeCta);

    // Chaque section ignore tout ce qui a déjà été servi avant elle.
    expect(beforeTrust).not.toContain(trust);
    expect(beforeCta).not.toContain(cta);
    expect(trust).not.toBe(cta);
  });

  it('réserve les visuels du héros et des catégories avant les sections suivantes', () => {
    // Le héros et les trois cartes catégories sont les premiers servis.
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
});