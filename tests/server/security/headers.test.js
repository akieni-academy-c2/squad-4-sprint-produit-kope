import fs from 'node:fs';
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sign } from 'cookie-signature';
import { repoPath } from '../../support/repoRoot.js';

/**
 * En-têtes de sécurité et protection CSRF.
 *
 * Deux zones que la suite ne couvrait pas, alors que ce sont les contrôles qui
 * protègent l'application quand tout le reste a déjà cédé :
 *
 * - le document et ses assets sont servis par le CDN, pas par Express : seul
 *   `vercel.json` peut poser des en-têtes dessus, et le middleware ne les voit
 *   jamais. Une régression y serait invisible d'ici ;
 * - le contrôle d'origine protège les routes mutantes contre une requête
 *   forgée depuis un site tiers. Un client HTTP ordinaire n'envoie ni
 *   `Sec-Fetch-Site` ni `Origin`, ce qui est exactement le profil d'un script
 *   qui essaie de réutiliser le cookie de session d'un visiteur.
 */

const openSessions = {
  'session-admin': { id: 1, role: 'admin' },
  'session-client': { id: 5, role: 'client' },
};

function fakePool() {
  return {
    on() {},
    async connect() {
      return { query: fakePool().query, release() {} };
    },
    async query(sql, params = []) {
      if (/FROM\s+"?session"?/i.test(sql) && /\bsid\b/i.test(sql)) {
        const user = openSessions[params[0]];
        if (!user) return { rows: [], rowCount: 0 };
        return { rows: [{ sess: JSON.stringify({ user, cookie: {} }) }], rowCount: 1 };
      }
      return { rows: [], rowCount: 0 };
    },
  };
}

vi.mock('@server/db/pool.js', () => {
  const pool = fakePool();
  return {
    pool,
    withTransaction: async (fn) => fn({ query: pool.query }),
    // `/api/health` l'interroge : sans cet export, la route journalise une
    // erreur de mock à chaque appel et bruite la sortie du test.
    isDatabaseReachable: async () => true,
  };
});

const { default: app } = await import('@server/app.js');
const { env } = await import('@server/config/env.js');
// `vercel.json` est un fichier de configuration, pas un module : on le lit sur
// le disque plutôt que de l'importer, sinon Vite tente de le résoudre comme un
// module relatif au fichier de test.
const vercelConfig = JSON.parse(fs.readFileSync(repoPath('vercel.json'), 'utf8'));

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

beforeEach(() => vi.clearAllMocks());

const asBrowser = (extra = {}) => ({ 'Sec-Fetch-Site': 'same-origin', Origin: baseUrl, ...extra });
const sessionCookie = (sid) => `sid=s:${sign(sid, env.SESSION_SECRET)}`;

const post = (path, headers = {}) =>
  fetch(`${baseUrl}${path}`, { method: 'POST', headers, body: '{}' });

describe('en-têtes de sécurité', () => {
  it('vercel.json pose des en-têtes sur le document et ses assets', () => {
    // Le document, les chunks JS et le CSS sont servis par le CDN : sans cette
    // règle, aucune de ces réponses ne portait le moindre en-tête.
    const catchAll = vercelConfig.headers.find((h) => h.source === '/(.*)');
    expect(catchAll, 'vercel.json doit décrire /(.*)').toBeTruthy();

    const keys = catchAll.headers.map((h) => h.key.toLowerCase());
    for (const required of [
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'strict-transport-security',
      'content-security-policy',
    ])
      expect(keys, required).toContain(required);
  });

  it('la CSP interdit le cadrage et les objets', () => {
    const csp = vercelConfig.headers
      .find((h) => h.source === '/(.*)')
      .headers.find((h) => h.key === 'Content-Security-Policy').value;

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("base-uri 'self'");
  });

  it('HSTS est présent avec une durée longue et includeSubDomains', () => {
    const hsts = vercelConfig.headers
      .find((h) => h.source === '/(.*)')
      .headers.find((h) => h.key === 'Strict-Transport-Security').value;

    expect(hsts).toContain('max-age=63072000');
    expect(hsts).toContain('includeSubDomains');
  });

  it("l'API pose nosniff et refuse le cadrage", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBe('DENY');
  });

  it("l'API n'est pas signable par le serveur", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.headers.get('x-powered-by')).toBeNull();
  });
});

describe('protection CSRF par origine', () => {
  it('laisse passer une requête mutante venue du même site', async () => {
    const res = await post('/api/auth/login', asBrowser({ 'Content-Type': 'application/json' }));
    expect(res.status).not.toBe(403);
  });

  it('refuse une requête intersite, même accompagnée d’une session valide', async () => {
    const res = await post('/api/auth/login', {
      Cookie: sessionCookie('session-admin'),
      Origin: 'https://attaquant.example',
      'Sec-Fetch-Site': 'cross-site',
      'Content-Type': 'application/json',
    });
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({ reason: 'cross-site' });
  });

  it('refuse une requête qui ne déclare ni origine ni contexte de récupération', async () => {
    // Le profil d'un script : `fetch` ne peut pas ajouter `Sec-Fetch-Site`,
    // et un client HTTP ordinaire n'a pas d'`Origin` à envoyer.
    const res = await post('/api/auth/login', { 'Content-Type': 'application/json' });
    expect(res.status).toBe(403);
  });

  it('refuse une origine tierce même sans en-tête Sec-Fetch-Site', async () => {
    const res = await post('/api/auth/login', {
      Origin: 'https://attaquant.example',
      'Content-Type': 'application/json',
    });
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toMatchObject({ reason: 'origine-inconnue' });
  });

  it('ne gêne pas la lecture', async () => {
    const res = await fetch(`${baseUrl}/api/professionals`, { headers: asBrowser() });
    expect(res.status).not.toBe(403);
  });
});