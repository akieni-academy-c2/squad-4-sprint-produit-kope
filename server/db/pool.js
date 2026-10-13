import pg from 'pg';
import { env } from '../config/env.js';

pg.types.setTypeParser(20, Number);

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: env.PG_POOL_MAX,
  connectionTimeoutMillis: env.PG_CONNECTION_TIMEOUT_MS,
  idleTimeoutMillis: env.PG_IDLE_TIMEOUT_MS,
  keepAlive: true,
  keepAliveInitialDelayMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Erreur inattendue du pool Postgres', err);
});

/** Sonde de disponibilité : une seule requête, aucun accès aux données métier. */
export async function isDatabaseReachable(db = pool) {
  await db.query('SELECT 1');
  return true;
}

/**
 * Exécute fn(client) dans une transaction.
 * Les repositories acceptent ce client en dernier argument (db = pool).
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
