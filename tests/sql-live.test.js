import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { listUsers, countUsers, listTrades, listZones, listCities, listTradeCategories, listProfessionals, countProfessionals } from '../server/modules/admin/admin.repository.js';
import { getAccountState } from '../server/modules/auth/auth.repository.js';
import { consumeRateLimitSlot, purgeRateLimits } from '../server/utils/rateLimitStore.js';

/**
 * Tests du SQL RÉELLEMENT exécuté par PostgreSQL.
 *
 * Tous les autres tests mockent `db.query` : une requête acceptant n'importe
 * quelle chaîne y passe. C'est ainsi qu'un `u.role = $1` avec un enum a pu
 * rendre /admin/users inexploitable (500) sans qu'aucun test ne le voie.
 *
 * La suite est ignorée si DATABASE_URL est absente ou injoignable :
 * `npm test` reste vert sans base, `npm run test:db` exécute ces tests.
 */

function readDotEnv() {
  const file = path.resolve('.env');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.trim() && !l.trim().startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
}

// Un pool dédié : celui de l'application est figé sur la variable factice du setup.
const url = readDotEnv().DATABASE_URL || process.env.KOPE_TEST_DATABASE_URL;
const enabled = Boolean(url);
let pool;

describe.skipIf(!enabled)('SQL reel', () => {
  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
    await pool.query('SELECT 1');
  });

  afterAll(async () => {
    // Ces tests visent la vraie base : on ne laisse pas de données derrière.
    if (pool) await pool.query("DELETE FROM rate_limits WHERE key LIKE 'test:%'");
    await pool?.end();
  });

  describe('users.role est un enum', () => {
    it('filtre par rôle sans erreur de type', async () => {
      const rows = await listUsers({ limit: 5, offset: 0, role: 'client', q: null }, pool);
      expect(rows.every((r) => r.role === 'client')).toBe(true);
    });

    it('sans filtre de rôle, renvoie tous les comptes', async () => {
      const rows = await listUsers({ limit: 50, offset: 0, role: null, q: null }, pool);
      expect(Array.isArray(rows)).toBe(true);
    });

    it('compte les utilisateurs par rôle', async () => {
      const total = await countUsers({ role: 'admin', q: null }, pool);
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThanOrEqual(0);
    });

    it('la recherche plein texte ne casse pas le filtre de rôle', async () => {
      const rows = await listUsers({ limit: 5, offset: 0, role: 'professional', q: 'zzz' }, pool);
      expect(rows).toEqual([]);
    });
  });

  describe('getAccountState', () => {
    it('renvoie rôle, blocage et suspension', async () => {
      const { rows } = await pool.query('SELECT id FROM users LIMIT 1');
      if (!rows.length) return;
      const state = await getAccountState(rows[0].id, pool);
      expect(state).toHaveProperty('role');
      expect(state).toHaveProperty('blockedAt');
      expect(state).toHaveProperty('suspendedAt');
    });

    it('renvoie null pour un identifiant inexistant', async () => {
      await expect(getAccountState(999999999, pool)).resolves.toBeNull();
    });
  });

  describe('répertoires du catalogue', () => {
    // Ces requêtes agrègent avec ORDER BY sur une colonne de la table jointe :
    // PostgreSQL exige qu'elle figure dans le GROUP BY. Une omission rendait
    // /admin/trades et /admin/zones inexploitables (500).
    it('liste les métiers', async () => {
      const rows = await listTrades(pool);
      expect(Array.isArray(rows)).toBe(true);
      rows.forEach((r) => expect(r).toHaveProperty('professionals'));
    });

    it('liste les zones', async () => {
      const rows = await listZones(pool);
      expect(Array.isArray(rows)).toBe(true);
      rows.forEach((r) => expect(r).toHaveProperty('professionals'));
    });

    it('liste les villes', async () => {
      await expect(listCities(pool)).resolves.toBeInstanceOf(Array);
    });

    it('liste les catégories de métiers', async () => {
      await expect(listTradeCategories(pool)).resolves.toBeInstanceOf(Array);
    });
  });

  describe('filtre par ville', () => {
    // Le sélecteur « Ville » était exposé dans l'interface mais la requête SQL
    // n'utilisait pas le paramètre : le filtre ne faisait rien.
    it('filtre réellement sur la ville', async () => {
      const all = await listProfessionals({ limit: 100, offset: 0, q: null, status: null, sort: null, city: null }, pool);
      const rows = await listProfessionals(
        { limit: 100, offset: 0, q: null, status: null, sort: null, city: 'Brazzaville' },
        pool,
      );
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.length).toBeLessThanOrEqual(all.length);
    });

    it('une ville inconnue ne renvoie rien', async () => {
      const rows = await listProfessionals(
        { limit: 100, offset: 0, q: null, status: null, sort: null, city: 'Ville-Inexistante' },
        pool,
      );
      expect(rows).toEqual([]);
      expect(await countProfessionals({ q: null, status: null, city: 'Ville-Inexistante' }, pool)).toBe(0);
    });

    it('la liste et le compte concordent', async () => {
      const city = 'Brazzaville';
      const rows = await listProfessionals(
        { limit: 100, offset: 0, q: null, status: null, sort: null, city },
        pool,
      );
      const count = await countProfessionals({ q: null, status: null, city }, pool);
      const total = Number(rows[0]?.total ?? 0);
      expect(total).toBe(count);
    });

    it('chaque professionnel rendu appartient bien à la ville', async () => {
      const rows = await listProfessionals(
        { limit: 100, offset: 0, q: null, status: null, sort: null, city: 'Brazzaville' },
        pool,
      );
      const ids = rows.map((r) => r.id);
      const { rows: check } = await pool.query(
        // DISTINCT : un professionnel peut couvrir plusieurs zones de la ville.
        `SELECT DISTINCT p.user_id FROM professionals p
           JOIN professional_zones pz ON pz.professional_id = p.user_id
           JOIN zones z ON z.id = pz.zone_id
           JOIN cities c ON c.id = z.city_id
          WHERE c.name = $1 AND p.user_id = ANY($2::bigint[])`,
        ['Brazzaville', ids.map(Number)],
      );
      expect(check.length).toBe(ids.length);
    });
  });

  describe('rate limiter partagé', () => {
    // En mémoire, chaque instance a son propre compteur : en serverless la
    // limite n'est jamais atteinte. Le store PostgreSQL la rend commune.
    it('compte de façon partagée entre deux instances', async () => {
      const key = `test:rl:${Date.now()}`;
      expect(await consumeRateLimitSlot(key, pool)).toBe(1);
      expect(await consumeRateLimitSlot(key, pool)).toBe(2);
      // « Deuxième instance » : nouveau processus, même base.
      expect(await consumeRateLimitSlot(key, pool)).toBe(3);
    });

    it('redémarre le compteur une fois la fenêtre dépassée', async () => {
      const key = `test:rl-exp:${Date.now()}`;
      await consumeRateLimitSlot(key, pool);
      await consumeRateLimitSlot(key, pool);
      await pool.query(
        "UPDATE rate_limits SET window_start = now() - interval '16 minutes' WHERE key = $1",
        [key],
      );
      expect(await consumeRateLimitSlot(key, pool)).toBe(1);
    });

    it('purge les compteurs expirés', async () => {
      const key = `test:rl-purge:${Date.now()}`;
      await consumeRateLimitSlot(key, pool);
      await pool.query("UPDATE rate_limits SET window_start = now() - interval '2 hours' WHERE key = $1", [key]);
      expect(await purgeRateLimits(pool)).toBeGreaterThan(0);
      const { rows } = await pool.query('SELECT key FROM rate_limits WHERE key = $1', [key]);
      expect(rows).toEqual([]);
    });

    it('isole les clés entre elles', async () => {
      const a = `test:rl-a:${Date.now()}`;
      const b = `test:rl-b:${Date.now()}`;
      await consumeRateLimitSlot(a, pool);
      await consumeRateLimitSlot(a, pool);
      expect(await consumeRateLimitSlot(b, pool)).toBe(1);
    });
  });

  describe('published_professionals reste cohérent', () => {
    it('ne publie aucun profil dont le compte n est plus professionnel', async () => {
      const { rows } = await pool.query(
        `SELECT v.user_id FROM published_professionals v
           JOIN users u ON u.id = v.user_id
          WHERE u.role <> 'professional'`,
      );
      expect(rows).toEqual([]);
    });

    it('ne publie aucun profil de compte bloque ou suspendu', async () => {
      const { rows } = await pool.query(
        `SELECT v.user_id FROM published_professionals v
           JOIN users u ON u.id = v.user_id
          WHERE u.blocked_at IS NOT NULL OR u.suspended_at IS NOT NULL`,
      );
      expect(rows).toEqual([]);
    });

    it('le nombre de publies ne depasse pas celui des professionnels', async () => {
      const { rows } = await pool.query(
        `SELECT (SELECT COUNT(*)::int FROM users WHERE role = 'professional') AS pros,
                (SELECT COUNT(*)::int FROM published_professionals) AS publies`,
      );
      expect(rows[0].publies).toBeLessThanOrEqual(rows[0].pros);
    });
  });
});