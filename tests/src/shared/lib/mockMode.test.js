import { describe, expect, it } from 'vitest';

/**
 * Activation du mode démonstration.
 *
 * Règle : le mode démo est **opt-in**. `VITE_USE_MOCKS=true` l'active, toute
 * autre valeur - variable absente comprise - le laisse éteint. Le developpement
 * local le garde allumé sans rien déclarer via `import.meta.env.DEV`.
 *
 * L'inverse était un risque de production : sans la variable, la démo était
 * active, le sélecteur de rôle « Administrateur » était rendu à tous les
 * visiteurs, et une API en panne était servie en données de démonstration
 * saines.
 *
 * `import.meta.env` est figé à l'import du module : on teste donc la règle
 * elle-même, pas l'environnement d'un build donné.
 */
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
    // Un .env écrit à la main contient souvent « true » avec des espaces.
    // Sans cette tolérance, la variable semble ignorée et la démo reste éteinte
    // sans que l'on comprenne pourquoi.
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