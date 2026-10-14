import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { IMAGES } from '@/shared/assets/placeholders.js';
import { repoPath } from '@test/support/repoRoot.js';
import { MOCK_PROS } from '@/shared/mocks/appMock.js';


const isRemote = (url) => /^https?:\/\//.test(url);

/** Portraits embarqués : ils remplacent un service distant, bloqué par la CSP. */
const PORTRAITS = '/portraits/';

describe('Visuels des professionnels de démonstration', () => {
  it('ne répète aucun visuel', () => {
    const images = MOCK_PROS.map((pro) => pro.avatarUrl);

    expect(new Set(images).size).toBe(MOCK_PROS.length);
  });

  it('n\'appelle aucun service distant', () => {
    const remote = MOCK_PROS.filter((pro) => isRemote(pro.avatarUrl));

    expect(remote).toEqual([]);
  });

  it('utilise les visuels locaux sans les répéter', () => {
    const local = MOCK_PROS.map((pro) => pro.avatarUrl).filter((url) => !isRemote(url));

    expect(local.length).toBeGreaterThan(1);
    expect(new Set(local).size).toBe(local.length);
  });

  it('n\'emploie que des visuels du stock du projet', () => {
    const local = MOCK_PROS.map((pro) => pro.avatarUrl).filter((url) => !isRemote(url));

    expect(
      local.every((url) => IMAGES.includes(url) || url.startsWith(PORTRAITS)),
    ).toBe(true);
  });

  it('embarque chaque portrait sur le dépôt plutôt que de le télécharger', () => {
    const portraits = MOCK_PROS.map((pro) => pro.avatarUrl).filter((url) => url.startsWith(PORTRAITS));

    expect(portraits.length).toBeGreaterThan(0);
    for (const url of portraits)
      expect(existsSync(repoPath('public', url.slice(1))), url).toBe(true);
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