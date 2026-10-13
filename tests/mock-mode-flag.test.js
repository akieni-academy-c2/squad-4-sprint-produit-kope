import { describe, expect, it } from 'vitest';

/**
 * Activation du mode démonstration.
 *
 * Règle : `VITE_USE_MOCKS=false` désactive, toute autre valeur - variable
 * absente comprise - laisse la démo active. Le projet doit démarrer et être
 * manipulable sans base de données ni backend.
 *
 * `import.meta.env` est figé à l'import du module : on teste donc la règle
 * elle-même, pas l'environnement d'un build donné.
 */
const isForced = (value) => String(value ?? '').trim().toLowerCase() !== 'false';

describe('Activation du mode démonstration', () => {
  it('est active si la variable est absente', () => {
    expect(isForced(undefined)).toBe(true);
  });

  it('est active si la variable vaut true', () => {
    expect(isForced('true')).toBe(true);
  });

  it('est désactivée seulement par la valeur false', () => {
    expect(isForced('false')).toBe(false);
  });

  it('tolère les espaces autour de false', () => {
    // Un .env écrit à la main contient souvent « false » avec des espaces.
    // Sans cette tolérance, la variable semble ignorée et la démo reste active
    // sans que l'on comprenne pourquoi.
    expect(isForced(' false ')).toBe(false);
    expect(isForced('FALSE')).toBe(false);
  });

  it('traite toute autre valeur comme une activation', () => {
    for (const value of ['', '0', 'non', 'oui', '1'])
      expect(isForced(value), value).toBe(true);
  });
});