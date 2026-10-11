import { describe, it, expect, vi, beforeAll } from 'vitest';

// Le middleware compte désormais en base. On force le store mémoire pour tester
// la logique du limiteur sans dépendre de PostgreSQL (le comportement commun
// est couvert par tests/sql-live.test.js).
beforeAll(() => {
  process.env.RATE_LIMIT_STORE = 'memory';
});

const { rateLimit } = await import('../server/middlewares/rateLimit.js');

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.set = vi.fn(() => res);
  return res;
}

/**
 * Le middleware lève `ApiError` plutôt que d'écrire la réponse lui-même :
 * `errorHandler` est le seul point qui décide du corps d'erreur et du statut.
 * La promesse résout donc avec le refus, pas avec un appel à `res.json`.
 */
async function call(mw, req) {
  const res = mockRes();
  let nextCalled = false;

  try {
    await mw(req, res, () => { nextCalled = true; });
  } catch (err) {
    return { res, nextCalled, err };
  }

  return { res, nextCalled, err: null };
}

describe('rateLimit', () => {
  it('laisse passer sous la limite', async () => {
    const mw = rateLimit({ max: 3, key: 'test-ok' });
    const req = { ip: '1.2.3.4' };
    let calls = 0;
    for (let i = 0; i < 3; i += 1) calls += (await call(mw, req)).nextCalled ? 1 : 0;
    expect(calls).toBe(3);
  });

  it('bloque avec 429 au-delà de la limite', async () => {
    const mw = rateLimit({ max: 2, key: 'test-block', windowMs: 60_000 });
    const req = { ip: '5.6.7.8' };
    await call(mw, req);
    await call(mw, req);

    const { res, nextCalled, err } = await call(mw, req);

    expect(nextCalled).toBe(false);
    expect(err).not.toBeNull();
    expect(err.status).toBe(429);
    expect(err.message).toBe('Trop de tentatives, réessayez plus tard');
    expect(res.status).not.toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith('Retry-After', '60');
  });

  it('isole les compteurs par clé', async () => {
    const a = rateLimit({ max: 1, key: 'a' });
    const b = rateLimit({ max: 1, key: 'b' });
    const req = { ip: '9.9.9.9' };
    await call(a, req);
    expect((await call(b, req)).nextCalled).toBe(true);
  });

  it('isole les compteurs par IP', async () => {
    const mw = rateLimit({ max: 1, key: 'per-ip' });
    await call(mw, { ip: '10.0.0.1' });
    expect((await call(mw, { ip: '10.0.0.2' })).nextCalled).toBe(true);
    expect((await call(mw, { ip: '10.0.0.1' })).nextCalled).toBe(false);
  });

  it('isole les compteurs par utilisateur', async () => {
    const mw = rateLimit({ max: 1, key: 'per-user', byUser: true });
    const first = { ip: '12.0.0.1', session: { user: { id: 1 } } };
    const second = { ip: '12.0.0.1', session: { user: { id: 2 } } };

    await call(mw, first);
    expect((await call(mw, second)).nextCalled).toBe(true);
    expect((await call(mw, first)).nextCalled).toBe(false);
  });

  it('replie sur l\'IP quand aucun utilisateur n\'est connecte', async () => {
    const mw = rateLimit({ max: 1, key: 'anon', byUser: true });
    const anonymous = { ip: '13.0.0.1' };

    await call(mw, anonymous);
    expect((await call(mw, { ip: '13.0.0.2' })).nextCalled).toBe(true);
    expect((await call(mw, anonymous)).nextCalled).toBe(false);
  });

  it('reste bloqué une fois la limite atteinte', async () => {
    const mw = rateLimit({ max: 1, key: 'sticky' });
    const req = { ip: '11.0.0.1' };
    await call(mw, req);
    for (let i = 0; i < 3; i += 1) expect((await call(mw, req)).nextCalled).toBe(false);
  });
});