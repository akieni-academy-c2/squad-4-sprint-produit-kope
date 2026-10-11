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

/** Le middleware est async : on attend la résolution avant d'asserter. */
function call(mw, req) {
  const res = mockRes();
  let nextCalled = false;
  return mw(req, res, () => { nextCalled = true; }).then(() => ({ res, nextCalled }));
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
    const mw = rateLimit({ max: 2, key: 'test-block' });
    const req = { ip: '5.6.7.8' };
    await call(mw, req);
    await call(mw, req);

    const { res, nextCalled } = await call(mw, req);
    expect(nextCalled).toBe(false);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: 'Trop de tentatives, réessayez plus tard' });
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

  it('reste bloqué une fois la limite atteinte', async () => {
    const mw = rateLimit({ max: 1, key: 'sticky' });
    const req = { ip: '11.0.0.1' };
    await call(mw, req);
    for (let i = 0; i < 3; i += 1) expect((await call(mw, req)).nextCalled).toBe(false);
  });
});

