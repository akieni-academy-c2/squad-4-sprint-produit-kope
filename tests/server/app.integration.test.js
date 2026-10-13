import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from 'vitest';

/**
 * Tests d'intégration HTTP : le vrai serveur Express est démarré sur un port
 * éphémère et interrogé en HTTP. Couvre la chaîne complète
 * route → middleware → session → service → repository.
 *
 * Seul le pool PostgreSQL est simulé : le SQL lui-même est déjà couvert
 * unitairement et par tests/sql-live.test.js.
 *
 * L'authentification passe par la session (cookie `sid`), comme en production.
 */

const STATS = {
  users: 42,
  clients: 20,
  professionals: 15,
  published: 9,
  hidden: 2,
  total: 15,
  reviews: 30,
  reviewsHidden: 1,
  ratingAverage: 4.2,
  contacts: 7,
  reportsPending: 3,
  usersBlocked: 4,
  usersSuspended: 1,
};

/** Sessions ouvertes dans la base de test, par identifiant de cookie. */
const openSessions = {
  'session-admin': { id: 1, role: 'admin' },
  'session-client': { id: 5, role: 'client' },
  'session-backdated-admin': { id: 3, role: 'admin' },
  'session-suspended-admin': { id: 4, role: 'admin' },
};

/** État des comptes en base, indexé par id : chaque test décrit le compte qu'il utilise. */
const accountStates = new Map();
const activeAdmin = { role: 'admin', blockedAt: null, suspendedAt: null };

function fakePool() {
  return {
    on() {},
    async connect() {
      return { query: fakePool().query, release() {} };
    },
    async query(sql, params = []) {
      // Store de session (connect-pg-simple) : lecture d'une session ouverte.
      if (/FROM\s+"?session"?/i.test(sql) && /\bsid\b/i.test(sql)) {
        const user = openSessions[params[0]];
        if (!user) return { rows: [], rowCount: 0 };
        return { rows: [{ sess: JSON.stringify({ user, cookie: {} }) }], rowCount: 1 };
      }

      if (sql.includes('SELECT role, blocked_at')) {
        const state = accountStates.get(Number(params[0])) ?? activeAdmin;
        return { rows: [{ ...state }], rowCount: 1 };
      }

      if (sql.includes('FROM published_professionals') && sql.includes('AS "published"'))
        return { rows: [STATS], rowCount: 1 };
      if (sql.includes('display_name AS "displayName"') && sql.includes('ORDER BY u.created_at DESC'))
        return { rows: [], rowCount: 0 };
      if (sql.includes('SELECT 1 FROM published_professionals'))
        return { rowCount: 1, rows: [] };

      return { rows: [], rowCount: 0 };
    },
  };
}

vi.mock('@server/db/pool.js', () => {
  const pool = fakePool();
  return {
    pool,
    withTransaction: async (fn) => fn({ query: pool.query }),
  };
});

const { default: app } = await import('@server/app.js');
const { env } = await import('@server/config/env.js');
const { sign } = await import('cookie-signature');

let server;
let baseUrl;

beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  accountStates.clear();
});

/**
 * express-session ignore un cookie qui ne commence pas par « s: » ou dont la
 * signature ne correspond pas : le store n'est même pas interrogé. On
 * reproduit donc exactement le format produit par le serveur.
 */
const asSession = (sid) => ({ Cookie: `sid=s:${sign(sid, env.SESSION_SECRET)}` });

/**
 * Un navigateur envoie toujours ces deux en-têtes sur une requête vers l'API,
 * et `csrfGuard` refuse une requête mutante qui n'en porte aucun : c'est
 * précisément le profil d'un script qui tente d'utiliser le cookie de session
 * d'un visiteur. Les tests doivent donc se comporter comme un navigateur.
 */
const asBrowser = (extra = {}) => ({ 'Sec-Fetch-Site': 'same-origin', Origin: baseUrl, ...extra });

const get = (path, headers = {}) => fetch(`${baseUrl}${path}`, { headers });
const post = (path, body, headers = {}) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: asBrowser({ 'Content-Type': 'application/json', ...headers }),
    body: JSON.stringify(body),
  });

describe('intégration HTTP', () => {
  describe('authentification par session', () => {
    it('refuse sans session', async () => {
      expect((await get('/api/admin/stats')).status).toBe(401);
    });

    it('refuse un identifiant de session inconnu', async () => {
      expect((await get('/api/admin/stats', asSession('inexistant'))).status).toBe(401);
    });

    it('/auth/me répond 200 sans session, plutôt que 401', async () => {
      // « Qui suis-je ? » sans session est une réponse normale, pas une erreur :
      // un 401 affichait une alerte rouge dans la console pour tout visiteur.
      const res = await get('/api/auth/me');
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ user: null });
    });

    it('accepte une session administrateur', async () => {
      const res = await get('/api/admin/stats', asSession('session-admin'));
      expect(res.status).toBe(200);
      const stats = await res.json();
      // countStats ne renvoie pas de clé `incomplete` : le calcul doit rester un nombre.
      expect(typeof stats.incomplete).toBe('number');
      expect(stats.incomplete).toBe(4);
      expect(stats.published).toBe(9);
      expect(stats.hidden).toBe(2);
      // File de modération : les nouveaux compteurs transitent aussi.
      expect(stats.reportsPending).toBe(3);
      expect(stats.usersBlocked).toBe(4);
      expect(stats.usersSuspended).toBe(1);
    });

    it('refuse une session client sur une route admin', async () => {
      accountStates.set(5, { role: 'client', blockedAt: null, suspendedAt: null });
      const res = await get('/api/admin/stats', asSession('session-client'));
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toMatchObject({ message: 'Accès refusé' });
    });

    it('refuse un administrateur bloqué', async () => {
      accountStates.set(3, { role: 'admin', blockedAt: new Date(), suspendedAt: null });
      const res = await get('/api/admin/stats', asSession('session-backdated-admin'));
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toMatchObject({ message: /bloqué/i });
    });

    it('refuse un administrateur suspendu', async () => {
      accountStates.set(4, { role: 'admin', blockedAt: null, suspendedAt: new Date() });
      const res = await get('/api/admin/stats', asSession('session-suspended-admin'));
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toMatchObject({ message: /suspendu/i });
    });

    it('applique le rôle en base et non celui mémorisé en session', async () => {
      // Rétrogradé depuis l'ouverture de la session.
      accountStates.set(1, { role: 'client', blockedAt: null, suspendedAt: null });
      const res = await get('/api/admin/stats', asSession('session-admin'));
      expect(res.status).toBe(403);
    });
  });

  describe('les tokens ont disparu', () => {
    it('la route de refresh n existe plus', async () => {
      const res = await post('/api/auth/refresh', { refreshToken: 'peu importe' });
      expect(res.status).toBe(404);
    });

    it('la connexion ne renvoie aucun token', async () => {
      const res = await post('/api/auth/login', { phone: '060000000', password: 'mauvais' });
      const body = await res.json();
      expect(body.accessToken).toBeUndefined();
      expect(body.refreshToken).toBeUndefined();
    });

    it('un en-tête Authorization ne donne aucun accès', async () => {
      // Aucun jeton n'est émis : un Bearer fabriqué ne doit rien ouvrir.
      const res = await get('/api/admin/stats', { Authorization: 'Bearer a.b.c' });
      expect(res.status).toBe(401);
    });
  });

  describe('validation des requêtes', () => {
    it('rejette un corps illisible', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ pas du json',
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('valide les paramètres de liste', async () => {
      const res = await get('/api/admin/professionals?page=0', asSession('session-admin'));
      expect(res.status).toBe(400);
    });
  });

  describe('routes inconnues', () => {
    it('renvoie un JSON explicite en 404', async () => {
      const res = await get('/api/inexistant');
      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ message: 'Route introuvable' });
    });
  });

  describe('en-têtes de sécurité', () => {
    it('sont appliqués', async () => {
      const res = await get('/api/admin/stats', asSession('session-admin'));
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('x-powered-by')).toBeNull();
    });
  });
});