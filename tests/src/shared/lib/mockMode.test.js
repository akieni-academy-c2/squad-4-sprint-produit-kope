import { describe, it, expect } from 'vitest';
import { mocksFromBuild } from '@/shared/lib/dataSource.js';

describe('mode démo au build', () => {
  it("s'allume si la variable est absente", () => {
    expect(mocksFromBuild(undefined)).toEqual({ allowed: true, active: true });
  });

  it('traite une variable vide comme absente', () => {
    for (const raw of ['', '   '])
      expect(mocksFromBuild(raw), JSON.stringify(raw)).toEqual({ allowed: true, active: true });
  });

  it("s'éteint si la variable vaut 'false'", () => {
    expect(mocksFromBuild('false')).toEqual({ allowed: false, active: false });
  });

  it("reste allumée si la variable vaut 'true'", () => {
    expect(mocksFromBuild('true')).toEqual({ allowed: true, active: true });
  });

  it('tolère les espaces et la casse autour de true', () => {
    for (const raw of [' true ', 'TRUE'])
      expect(mocksFromBuild(raw).active, raw).toBe(true);
  });

  it("ne prend pas une valeur arbitraire pour une activation", () => {
    for (const raw of ['0', 'non', 'oui', '1', 'on'])
      expect(mocksFromBuild(raw), raw).toEqual({ allowed: false, active: false });
  });
});