import { pool } from '../../db/pool.js';

export async function listTrades(db = pool) {
  const { rows } = await db.query('SELECT id, name FROM trades ORDER BY name');
  return rows;
}

export async function listZones(db = pool) {
  const { rows } = await db.query(
    `SELECT z.id, z.name, z.city_id AS "cityId"
       FROM zones z
      WHERE z.city_id IS NOT NULL
      ORDER BY z.name`,
  );
  return rows;
}

export async function listCities(db = pool) {
  const { rows } = await db.query(
    `SELECT c.id, c.name
       FROM cities c
      WHERE EXISTS (SELECT 1 FROM zones z WHERE z.city_id = c.id)
      ORDER BY c.name`,
  );
  return rows;
}
