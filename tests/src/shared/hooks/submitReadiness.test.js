import { describe, it, expect } from 'vitest';
import { PASSWORD_RULES, FIELD_STATUS, checkPassword } from '@/shared/hooks/useFieldStatus.js';


const isReady = (statuses, consent = true) =>
  statuses.every((s) => s === FIELD_STATUS.OK) && consent;

describe('activation du bouton de soumission', () => {
  const ok = FIELD_STATUS.OK;
  const near = FIELD_STATUS.NEAR;
  const wrong = FIELD_STATUS.WRONG;
  const idle = FIELD_STATUS.IDLE;

  it('reste inactif tant qu\'un champ manque', () => {
    expect(isReady([idle, idle, idle, idle])).toBe(false);
    expect(isReady([ok, idle, ok, ok])).toBe(false);
    expect(isReady([ok, ok, near, ok])).toBe(false);
    expect(isReady([ok, ok, wrong, ok])).toBe(false);
    expect(isReady([ok, ok, ok, near])).toBe(false);
  });

  it('reste inactif sans consentement', () => {
    expect(isReady([ok, ok, ok, ok], false)).toBe(false);
  });

  it('s\'active seulement quand tout est conforme', () => {
    expect(isReady([ok, ok, ok, ok])).toBe(true);
  });
});

describe('règles de mot de passe comme source unique', () => {
  it('PASSWORD_RULES et checkPassword racontent la même chose', () => {
    for (const value of ['', 'a', 'Motdepasse', 'Motdepasse1', 'Motdepasse@', 'MOTDEPASSE1', 'abc123AB']) {
      const manquant = checkPassword(value).rules.filter((r) => !r.passed).length;
      const direct = PASSWORD_RULES.filter((r) => !r.test(value)).length;
      expect(manquant, value).toBe(direct);
    }
  });

  it('un mot de passe à un seul caractère ne valide aucune règle de casse', () => {
    expect(checkPassword('a').rules.find((r) => r.key === 'case').passed).toBe(false);
  });

  it('un caractère spécial remplace le chiffre', () => {
    expect(checkPassword('Motdepasse@').missing).toBe(0);
    expect(checkPassword('Motdepasse-').missing).toBe(0);
  });
});