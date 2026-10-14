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

const ORDER_BY = {
  recent: 'r.created_at DESC, r.id DESC',
  oldest: 'r.created_at ASC, r.id ASC',
  rating_desc: 'r.rating DESC, r.created_at DESC',
  rating_asc: 'r.rating ASC, r.created_at DESC',
};

export async function listByClient(clientId, { limit = 20, offset = 0, q = '', rating, professionalId, visibility = 'all', sort = 'recent' } = {}, db = pool) {
  const conditions = ['r.client_id = $1'];
  const values = [clientId];

  if (visibility === 'hidden') conditions.push('r.is_hidden');
  if (visibility === 'visible') conditions.push('NOT r.is_hidden');
  if (rating != null) {
    values.push(rating);
    conditions.push(`r.rating = $${values.length}`);
  }
  if (professionalId != null) {
    values.push(professionalId);
    conditions.push(`r.professional_id = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(p.display_name ILIKE $${values.length} OR r.comment ILIKE $${values.length})`);
  }

  values.push(limit, offset);
  const limitIndex = values.length - 1;
  const offsetIndex = values.length;

  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.is_hidden AS "isHidden",
            r.created_at AS "createdAt", r.updated_at AS "updatedAt",
            r.professional_id AS "professionalId",
            p.display_name AS "professionalName",
            pu.avatar_url AS "professionalAvatarUrl",
            t.name AS "professionalTrade",
            COUNT(*) OVER()::int AS total
       FROM reviews r
       JOIN professionals p ON p.user_id = r.professional_id
       JOIN users pu ON pu.id = r.professional_id
       JOIN trades t ON t.id = p.trade_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${ORDER_BY[sort] ?? ORDER_BY.recent}
      LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    values,
  );
  return rows;
}

export async function countByClient(clientId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM reviews WHERE client_id = $1',
    [clientId],
  );
  return Number(rows[0]?.count ?? 0);
}

export async function findOwnedById(reviewId, clientId, db = pool) {
  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.is_hidden AS "isHidden",
            r.professional_id AS "professionalId",
            r.created_at AS "createdAt", r.updated_at AS "updatedAt"
       FROM reviews r
      WHERE r.id = $1 AND r.client_id = $2`,
    [reviewId, clientId],
  );
  return rows[0] ?? null;
}

export async function updateOwned(reviewId, clientId, { rating, comment }, db = pool) {
  const { rows } = await db.query(
    `UPDATE reviews
        SET rating = $3, comment = $4, updated_at = now()
      WHERE id = $1 AND client_id = $2
      RETURNING id, rating, comment, is_hidden AS "isHidden", updated_at AS "updatedAt"`,
    [reviewId, clientId, rating, comment],
  );
  return rows[0] ?? null;
}

export async function setHiddenOwned(reviewId, clientId, isHidden, db = pool) {
  const { rows } = await db.query(
    `UPDATE reviews
        SET is_hidden = $3, updated_at = now()
      WHERE id = $1 AND client_id = $2
      RETURNING id, is_hidden AS "isHidden", updated_at AS "updatedAt"`,
    [reviewId, clientId, isHidden],
  );
  return rows[0] ?? null;
}

export async function deleteOwned(reviewId, clientId, db = pool) {
  const { rowCount } = await db.query(
    'DELETE FROM reviews WHERE id = $1 AND client_id = $2',
    [reviewId, clientId],
  );
  return rowCount > 0;
}
