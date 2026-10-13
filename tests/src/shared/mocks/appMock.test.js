import { describe, expect, it } from 'vitest';
import { IMAGES } from '@/shared/assets/placeholders.js';
import { MOCK_PROS } from '@/shared/mocks/appMock.js';

/**
 * Visuels des professionnels de démonstration.
 *
 * Deux contraintes se contredisent si on n'y fait pas attention :
 *   - la démonstration doit rester utilisable hors ligne, donc ne pas
 *     appeler un service externe pour chaque carte ;
 *   - deux professionnels différents ne doivent jamais partager la même image.
 *
 * Le piège : alterner sur un pas de 2 puis indexer un stock de 6 sur le même
 * pas redonne trois images en double. Ces tests verrouillent les deux règles.
 */
const isRemote = (url) => /^https?:\/\//.test(url);

describe('Visuels des professionnels de démonstration', () => {
  it('ne répète aucun visuel', () => {
    const images = MOCK_PROS.map((pro) => pro.avatarUrl);

    expect(new Set(images).size).toBe(MOCK_PROS.length);
  });

  it('mélange service distant et visuels du projet', () => {
    // Un catalogue entièrement distant casserait la démonstration hors ligne ;
    // un catalogue entièrement local ne montrerait pas les personas.
    const remote = MOCK_PROS.filter((pro) => isRemote(pro.avatarUrl)).length;

    expect(remote).toBeGreaterThan(0);
    expect(remote).toBeLessThan(MOCK_PROS.length);
  });

  it('utilise les visuels locaux sans les répéter', () => {
    const local = MOCK_PROS.filter((pro) => !isRemote(pro.avatarUrl)).map((pro) => pro.avatarUrl);

    expect(local.length).toBeGreaterThan(1);
    expect(new Set(local).size).toBe(local.length);
  });

  it('n\'emploie que des visuels du stock du projet', () => {
    // Ces visuels sont déjà servis sur la home : les réemployer dans les
    // résultats de recherche ferait croire à des profils identiques.
    const local = MOCK_PROS.filter((pro) => !isRemote(pro.avatarUrl)).map((pro) => pro.avatarUrl);

    expect(local.every((url) => IMAGES.includes(url))).toBe(true);
  });

  it('donne à chaque professionnel une fiche cohérente', () => {
    for (const pro of MOCK_PROS) {
      expect(pro.displayName).toBeTruthy();
      expect(pro.phone).toMatch(/^\+242/);
      expect(pro.yearsExperience).toBeGreaterThanOrEqual(0);
      expect(pro.yearsExperience).toBeLessThanOrEqual(50);
    }
  });

  it('conserve la répartition des genres par métier', () => {
    const maçons = MOCK_PROS.filter((pro) => pro.tradeId === 3);
    const autres = MOCK_PROS.filter((pro) => pro.tradeId !== 3);

    expect(maçons.length).toBeGreaterThan(0);
    expect(maçons.every((pro) => pro.gender === 'female')).toBe(true);

    const femmesAilleurs = autres.filter((pro) => pro.gender === 'female').length;
    expect(femmesAilleurs).toBeLessThan(autres.length);
  });
});