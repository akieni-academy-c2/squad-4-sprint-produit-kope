import { describe, it, expect } from 'vitest';
import { paginate, offsetOf } from '@server/utils/pagination.js';
import { normalizePhone } from '@server/utils/phone.js';
import { registerClientSchema } from '@/shared/utils/validators.js';

describe('paginate', () => {
  it('extrait le total et pagine les items', () => {
    const rows = [
      { id: 1, total: 25 },
      { id: 2, total: 25 },
    ];
    const r = paginate(rows, { page: 2, pageSize: 10 });
    expect(r.total).toBe(25);
    expect(r.totalPages).toBe(3);
    expect(r.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(offsetOf({ page: 2, pageSize: 10 })).toBe(10);
  });

  it('gere un resultat vide', () => {
    const r = paginate([], { page: 1, pageSize: 10 });
    expect(r.total).toBe(0);
    expect(r.items).toEqual([]);
  });
});

describe('normalizePhone', () => {
  it('normalise un numero local 06 en +242', () => {
    expect(normalizePhone('06 123 45 67')).toBe('+242061234567');
  });
  it('accepte un numero deja formate', () => {
    expect(normalizePhone('+242061234567')).toBe('+242061234567');
  });
  it('retourne null pour une entree vide', () => {
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone(null)).toBeNull();
  });
});

describe('registerClientSchema', () => {
  it('accepte un payload valide', () => {
    const r = registerClientSchema.safeParse({
      firstName: 'Awa',
      lastName: 'Diop',
      phone: '06 123 45 67',
      password: 'Motdepasse1',
      consent: true,
    });
    expect(r.success).toBe(true);
  });
  it('refuse un consentement absent', () => {
    const r = registerClientSchema.safeParse({
      firstName: 'Awa',
      lastName: 'Diop',
      phone: '06 123 45 67',
      password: 'Motdepasse1',
      consent: false,
    });
    expect(r.success).toBe(false);
  });
  it('refuse un mot de passe court', () => {
    const r = registerClientSchema.safeParse({
      firstName: 'Awa',
      lastName: 'Diop',
      phone: '06 123 45 67',
      password: 'court',
      consent: true,
    });
    expect(r.success).toBe(false);
  });
});
