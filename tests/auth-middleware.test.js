import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '../server/middlewares/requireAuth.js';
import { requireRole } from '../server/middlewares/requireRole.js';

// requireAuth relit l'état du compte en base : on isole cette dépendance.
vi.mock('../server/modules/auth/auth.repository.js', () => ({
  getAccountState: vi.fn(),
}));

const { getAccountState } = await import('../server/modules/auth/auth.repository.js');

/** Compte actif par défaut ; chaque test surcharge ce qu'il lui faut. */
function account(overrides = {}) {
  return { role: 'client', blockedAt: null, suspendedAt: null, ...overrides };
}

/** Requête portant une session ouverte. */
function withSession(user, extra = {}) {
  return { headers: {}, session: { user }, ...extra };
}

function run(req) {
  return new Promise((resolve, reject) => {
    requireAuth(req, {}, (err) => (err ? reject(err) : resolve()));
  });
}

describe('requireAuth', () => {
  beforeEach(() => {
    getAccountState.mockResolvedValue(account());
  });

  it('accepte une session valide et remplit req.user', async () => {
    const req = withSession({ id: 7, role: 'client' });
    await run(req);
    expect(req.user).toEqual({ id: 7, role: 'client' });
  });

  it('rejette une requête sans session', async () => {
    const req = { headers: {}, session: {} };
    await expect(run(req)).rejects.toThrow(/Connexion requise/);
  });

  it('rejette une requête dépourvue d\'objet session', async () => {
    const req = { headers: {} };
    await expect(run(req)).rejects.toThrow(/Connexion requise/);
  });

  it('refuse un compte bloqué sur une session valide', async () => {
    getAccountState.mockResolvedValue(account({ blockedAt: new Date() }));
    await expect(run(withSession({ id: 9, role: 'client' }))).rejects.toThrow(/bloqué/);
  });

  it('refuse un compte suspendu avec un message dédié', async () => {
    getAccountState.mockResolvedValue(account({ role: 'professional', suspendedAt: new Date() }));
    await expect(run(withSession({ id: 7, role: 'professional' }))).rejects.toThrow(/suspendu/);
  });

  it('refuse un compte introuvable en base', async () => {
    getAccountState.mockResolvedValue(null);
    await expect(run(withSession({ id: 7, role: 'client' }))).rejects.toThrow(/Connexion requise/);
  });

  it('ignore un en-tête Authorization : aucun jeton n\'est émis', async () => {
    const req = { headers: { authorization: 'Bearer a.b.c' }, session: {} };
    await expect(run(req)).rejects.toThrow(/Connexion requise/);
  });
});

describe('requireRole', () => {
  beforeEach(() => {
    getAccountState.mockResolvedValue(account());
  });

  function runRole(mw, req) {
    return new Promise((resolve, reject) => {
      mw(req, {}, (err) => (err ? reject(err) : resolve()));
    });
  }

  it('autorise le bon rôle', async () => {
    getAccountState.mockResolvedValue(account({ role: 'professional' }));
    const mw = requireRole('professional');
    await expect(runRole(mw, withSession({ id: 1, role: 'professional' }))).resolves.toBeUndefined();
  });

  it('refuse un mauvais rôle (403)', async () => {
    getAccountState.mockResolvedValue(account({ role: 'client' }));
    const mw = requireRole('admin');
    await expect(runRole(mw, withSession({ id: 1, role: 'client' }))).rejects.toThrow(/Accès refusé/);
  });

  it('refuse un administrateur bloqué (fuite de privilèges)', async () => {
    getAccountState.mockResolvedValue(account({ role: 'admin', blockedAt: new Date() }));
    const mw = requireRole('admin');
    await expect(runRole(mw, withSession({ id: 1, role: 'admin' }))).rejects.toThrow(/bloqué/);
  });

  it('refuse un administrateur suspendu', async () => {
    getAccountState.mockResolvedValue(account({ role: 'admin', suspendedAt: new Date() }));
    const mw = requireRole('admin');
    await expect(runRole(mw, withSession({ id: 1, role: 'admin' }))).rejects.toThrow(/suspendu/);
  });

  it('expose req.user à la route', async () => {
    getAccountState.mockResolvedValue(account({ role: 'admin' }));
    const mw = requireRole('admin');
    const req = withSession({ id: 42, role: 'admin' });
    await runRole(mw, req);
    expect(req.user).toEqual({ id: 42, role: 'admin' });
  });

  it('ignore un rôle périmé : le rôle en base fait foi', async () => {
    // Rétrogradé depuis l'ouverture de la session.
    getAccountState.mockResolvedValue(account({ role: 'client' }));
    const mw = requireRole('admin');
    await expect(runRole(mw, withSession({ id: 1, role: 'admin' }))).rejects.toThrow(/Accès refusé/);
  });
});