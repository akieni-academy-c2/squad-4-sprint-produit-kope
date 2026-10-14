import { pool } from '../../db/pool.js';

const ZONES_JSON = `
  COALESCE(
    (SELECT json_agg(json_build_object('id', z.id, 'name', z.name) ORDER BY z.name)
       FROM professional_zones pz
       JOIN zones z ON z.id = pz.zone_id
      WHERE pz.professional_id = p.user_id),
    '[]'::json)`;

export async function create({ userId, displayName, tradeId }, db = pool) {
  await db.query(
    'INSERT INTO professionals (user_id, display_name, trade_id) VALUES ($1, $2, $3)',
    [userId, displayName, tradeId],
  );
}

export async function replaceZones(professionalId, zoneIds, db = pool) {
  await db.query('DELETE FROM professional_zones WHERE professional_id = $1', [professionalId]);
  await db.query(
    `INSERT INTO professional_zones (professional_id, zone_id)
     SELECT $1, unnest($2::smallint[])`,
    [professionalId, zoneIds],
  );
}

export async function tradeExists(tradeId, db = pool) {
  const { rowCount } = await db.query('SELECT 1 FROM trades WHERE id = $1', [tradeId]);
  return rowCount > 0;
}

const PROFILE_COLUMNS = {
  displayName: 'display_name',
  tradeId: 'trade_id',
  description: 'description',
  yearsExperience: 'years_experience',
  whatsapp: 'whatsapp',
  cityId: 'city_id',
};

export async function updateProfile(userId, fields, db = pool) {
  const sets = [];
  const values = [userId];
  for (const [key, value] of Object.entries(fields)) {
    const column = PROFILE_COLUMNS[key];
    if (!column || value === undefined) continue;
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  }
  if (!sets.length) return;
  await db.query(
    `UPDATE professionals SET ${sets.join(', ')}, updated_at = now() WHERE user_id = $1`,
    values,
  );
}

export async function setAvailability(userId, isAvailable, db = pool) {
  await db.query(
    'UPDATE professionals SET is_available = $2, updated_at = now() WHERE user_id = $1',
    [userId, isAvailable],
  );
}

export async function findOwnProfile(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            u.phone,
            p.trade_id AS "tradeId",
            t.name AS "tradeName",
            p.description,
            p.years_experience AS "yearsExperience",
            p.city_id AS "cityId",
            c.name AS "cityName",
            COALESCE(p.whatsapp, u.phone) AS whatsapp,
            p.is_available AS "isAvailable",
            p.is_hidden AS "isHidden",
            EXISTS (SELECT 1 FROM published_professionals v WHERE v.user_id = p.user_id) AS "isPublished",
            (SELECT COUNT(*) FROM photos ph WHERE ph.professional_id = p.user_id)::int AS "photoCount",
            ${ZONES_JSON} AS zones
       FROM professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
       -- LEFT JOIN : un profil créé avant la colonne city_id n'a pas de ville.
       -- Un JOIN le ferait disparaître de son propre tableau de bord.
       LEFT JOIN cities c ON c.id = p.city_id
      WHERE p.user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function existsPublished(id, db = pool) {
  const { rowCount } = await db.query('SELECT 1 FROM published_professionals WHERE user_id = $1', [id]);
  return rowCount > 0;
}

export async function findPublishedDetail(id, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.id AS "tradeId",
            t.name AS trade,
            p.description,
            p.years_experience AS "yearsExperience",
            p.is_available AS "isAvailable",
           u.phone,
           u.avatar_url AS "avatarUrl",
           COALESCE(p.whatsapp, u.phone) AS whatsapp,
           u.created_at AS "createdAt",
           p.updated_at AS "updatedAt",
            ${ZONES_JSON} AS zones
       FROM published_professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
      WHERE p.user_id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
