import { pool } from '../../db/pool.js';

export async function create({ clientId, professionalId, rating, comment }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO reviews (client_id, professional_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id, rating, comment, created_at AS "createdAt"`,
    [clientId, professionalId, rating, comment],
  );
  return rows[0];
}

export async function exists(clientId, professionalId, db = pool) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM reviews WHERE client_id = $1 AND professional_id = $2',
    [clientId, professionalId],
  );
  return rowCount > 0;
}

export async function getSummary(professionalId, db = pool) {
  const { rows } = await db.query(
    `SELECT ROUND(AVG(rating), 1)::float8 AS average, COUNT(*)::int AS count
       FROM reviews
      WHERE professional_id = $1 AND NOT is_hidden`,
    [professionalId],
  );
  return rows[0];
}

export async function listByProfessional(professionalId, { limit, offset }, db = pool) {
  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.created_at AS "createdAt",
            r.client_id AS "clientId",
            json_build_object(
              'id', u.id,
              'firstName', u.first_name,
              'lastName', COALESCE(UPPER(LEFT(u.last_name, 1)), ''),
              'avatarUrl', u.avatar_url
            ) AS client,
            COUNT(*) OVER()::int AS total
       FROM reviews r
       JOIN users u ON u.id = r.client_id
      WHERE r.professional_id = $1 AND NOT r.is_hidden
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $2 OFFSET $3`,
    [professionalId, limit, offset],
  );
  return rows;
}

export async function countByProfessional(professionalId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM reviews WHERE professional_id = $1 AND NOT is_hidden',
    [professionalId],
  );
  return Number(rows[0]?.count ?? 0);
}

export async function listByClient(clientId, { limit = 20, offset = 0 } = {}, db = pool) {
  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.created_at AS "createdAt",
            r.professional_id AS "professionalId",
            p.display_name AS "professionalName",
            COUNT(*) OVER()::int AS total
       FROM reviews r
       JOIN professionals p ON p.user_id = r.professional_id
      WHERE r.client_id = $1 AND NOT r.is_hidden
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $2 OFFSET $3`,
    [clientId, limit, offset],
  );
  return rows;
}
