import { describe, it, expect } from 'vitest';
import { paginate, offsetOf } from '@server/utils/pagination.js';

describe('pagination', () => {
  it('calcule offsetOf', () => {
    expect(offsetOf({ page: 1, pageSize: 10 })).toBe(0);
    expect(offsetOf({ page: 3, pageSize: 10 })).toBe(20);
  });

  it('construit la réponse paginée avec total', () => {
    const rows = [
      { id: 1, total: 25 },
      { id: 2, total: 25 },
    ];
    const r = paginate(rows, { page: 2, pageSize: 10 });
    expect(r.total).toBe(25);
    expect(r.totalPages).toBe(3);
    expect(r.items).toHaveLength(2);
    expect(r.items[0].total).toBeUndefined();
  });

  it('gère une liste vide', () => {
    const r = paginate([], { page: 1, pageSize: 10 });
    expect(r.total).toBe(0);
    expect(r.totalPages).toBe(0);
    expect(r.items).toEqual([]);
  });
});
