import { describe, expect, it } from 'vitest';


const isAllowed = (value, { dev = false } = {}) =>
  dev === true ||
  String(value ?? '')
    .trim()
    .toLowerCase() === 'true';

describe('Activation du mode démonstration', () => {
  it('reste éteinte si la variable est absente', () => {
    expect(isAllowed(undefined)).toBe(false);
  });

  it("reste éteinte si la variable vaut 'false'", () => {
    expect(isAllowed('false')).toBe(false);
  });

  it("s'allume si la variable vaut 'true'", () => {
    expect(isAllowed('true')).toBe(true);
  });

  it('tolère les espaces et la casse autour de true', () => {
    expect(isAllowed(' true ')).toBe(true);
    expect(isAllowed('TRUE')).toBe(true);
  });

  it("ne prend pas une valeur arbitraire pour une activation", () => {
    for (const value of ['', '0', 'non', 'oui', '1', 'on'])
      expect(isAllowed(value), value).toBe(false);
  });

  it("s'allume en développement sans déclaration", () => {
    expect(isAllowed(undefined, { dev: true })).toBe(true);
    expect(isAllowed('false', { dev: true })).toBe(true);
  });
});