/**
 * Compteur de tentatives partagé entre instances.
 *
 * La mémoire ne suffit pas en serverless : chaque conteneur a son propre
 * compteur, qui repart à zéro à chaque démarrage à froid. PostgreSQL donne un
 * compteur unique quel que soit le nombre d'instances, au prix d'une écriture
 * par tentative - négligeable pour des routes de connexion.
 *
 * `RATE_LIMIT_STORE=memory` revient au comportement local si la table n'est pas
 * encore migrée.
 */
import { pool } from '../db/pool.js';

const DEFAULT_WINDOW_MS = 15 * 60_000;

/**
 * Consomme un jeton pour `key`.
 * Renvoie le nombre de tentatives consommées dans la fenêtre courante.
 *
 * `windowMs` est fourni par l'appelant : la fenêtre était figée à 15 minutes,
 * ce qui rendait toute configuration par route inopérante - l'en-tête
 * Retry-After annonçait la fenêtre demandée alors que le compteur suivait
 * celle du store.
 */
export async function consumeRateLimitSlot(key, windowMs = DEFAULT_WINDOW_MS, db = pool) {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  const { rows } = await db.query(
    `INSERT INTO rate_limits (key, window_start, count)
          VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
            count = CASE
                      WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval THEN 1
                      ELSE rate_limits.count + 1
                    END,
            window_start = CASE
                      WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval THEN now()
                      ELSE rate_limits.window_start
                    END
      RETURNING count`,
    [key, String(windowSeconds)],
  );
  return rows[0].count;
}

export async function purgeRateLimits(db = pool) {
  const { rowCount } = await db.query(
    "DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour'",
  );
  return rowCount;
}

export async function rateLimitTableExists(db = pool) {
  try {
    await db.query('SELECT 1 FROM rate_limits LIMIT 1');
    return true;
  } catch {
    return false;
  }
}