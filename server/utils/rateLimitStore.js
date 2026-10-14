
import { pool } from '../db/pool.js';

const DEFAULT_WINDOW_MS = 15 * 60_000;


export async function consumeRateLimitSlot(key, windowMs = DEFAULT_WINDOW_MS, db = pool) {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  // `make_interval(secs => $2::int)` plutôt que `($2 || ' seconds')::interval` :
  // le second form concatène puis reparse du texte à chaque ligne mise à jour,
  // et un `interval` construit ainsi n'est pas sargable sur `window_start`.
  const { rows } = await db.query(
    `INSERT INTO rate_limits (key, window_start, count)
          VALUES ($1, now(), 1)
     ON CONFLICT (key) DO UPDATE SET
            count = CASE
                      WHEN rate_limits.window_start < now() - make_interval(secs => $2::int) THEN 1
                      ELSE rate_limits.count + 1
                    END,
            window_start = CASE
                      WHEN rate_limits.window_start < now() - make_interval(secs => $2::int) THEN now()
                      ELSE rate_limits.window_start
                    END
      RETURNING count`,
    [key, windowSeconds],
  );
  // `RETURNING count` rend toujours une ligne en cas de succès. La garde reste
// malgré tout : une ligne manquante ne doit pas faire tomber le limiteur, ce qui
// reviendrait à désactiver la protection sur une erreur de base. On retombe sur
// 1, la valeur la plus conservatrice.
return rows[0]?.count ?? 1;
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