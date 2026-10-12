import { pool } from '../../db/pool.js';

export async function create({ professionalId, reporterId, reason, message }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO account_reports (professional_id, reporter_id, reason, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, professional_id AS "professionalId", reason, message, status, created_at AS "createdAt"`,
    [professionalId, reporterId, reason, message],
  );
  return rows[0];
}

export async function exists(reporterId, professionalId, db = pool) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM account_reports WHERE reporter_id = $1 AND professional_id = $2',
    [reporterId, professionalId],
  );
  return rowCount > 0;
}

/** Nombre de signalements reçus par un professionnel (tous statuts confondus). */
export async function countByProfessional(professionalId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM account_reports WHERE professional_id = $1',
    [professionalId],
  );
  return Number(rows[0]?.count ?? 0);
}

/** Liste les signalements regroupés par professionnel. */
export async function list({ limit, offset, status, q }, db = pool) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    conditions.push(
      `(p.display_name ILIKE $${values.length} OR r.message ILIKE $${values.length} OR u.first_name ILIKE $${values.length} OR u.last_name ILIKE $${values.length})`,
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  values.push(limit, offset);

  const { rows } = await db.query(
    `WITH filtered AS (
       SELECT r.id, r.professional_id, r.reason, r.message, r.status,
              r.created_at, r.resolved_at,
              p.display_name AS professional_name,
              pu.avatar_url AS professional_avatar_url,
              pu.blocked_at AS professional_blocked_at,
              pu.suspended_at AS professional_suspended_at,
              json_build_object(
                'id', u.id,
                'firstName', u.first_name,
                'lastName', u.last_name,
                'avatarUrl', u.avatar_url
              ) AS reporter
         FROM account_reports r
         JOIN professionals p ON p.user_id = r.professional_id
         JOIN users u ON u.id = r.reporter_id
         JOIN users pu ON pu.id = r.professional_id
         ${where}
     )
     SELECT f.professional_id AS "professionalId",
            MAX(f.professional_name) AS "professionalName",
            MAX(f.professional_avatar_url) AS "professionalAvatarUrl",
            MAX(f.professional_blocked_at) AS "professionalBlockedAt",
            MAX(f.professional_suspended_at) AS "professionalSuspendedAt",
            COUNT(*)::int AS "reportCount",
            COUNT(*) FILTER (WHERE f.status = 'pending')::int AS "pendingCount",
            MAX(f.created_at) AS "latestAt",
            json_agg(
              json_build_object(
                'id', f.id,
                'reason', f.reason,
                'message', f.message,
                'status', f.status,
                'createdAt', f.created_at,
                'resolvedAt', f.resolved_at,
                'reporter', f.reporter
              ) ORDER BY f.created_at DESC
            ) AS reports,
            COUNT(*) OVER()::int AS total
       FROM filtered f
      GROUP BY f.professional_id
      ORDER BY COUNT(*) FILTER (WHERE f.status = 'pending') DESC, MAX(f.created_at) DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return rows;
}

/** Compte des professionnels signalés (tous statuts confondus). */
export async function countGrouped({ status, q }, db = pool) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    conditions.push(
      `(p.display_name ILIKE $${values.length} OR r.message ILIKE $${values.length} OR u.first_name ILIKE $${values.length} OR u.last_name ILIKE $${values.length})`,
    );
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await db.query(
    `SELECT COUNT(DISTINCT r.professional_id)::int AS count
       FROM account_reports r
       JOIN professionals p ON p.user_id = r.professional_id
       JOIN users u ON u.id = r.reporter_id
       ${where}`,
    values,
  );
  return Number(rows[0]?.count ?? 0);
}

/**
 * Signalements déposés par un utilisateur, avec le nom du professionnel.
 *
 * Séparée de `list` : celle-ci est la vue administrateur, groupée par
 * professionnel et motivée par la modération. Ici le client veut savoir ce que
 * *lui* a déposé et sur qui, pour pouvoir le retirer.
 */
export async function listByReporter(reporterId, { limit, offset, status, q } = {}, db = pool) {
  const conditions = ['r.reporter_id = $1'];
  const values = [reporterId];

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    conditions.push(`(p.display_name ILIKE $${values.length} OR r.message ILIKE $${values.length})`);
  }

  values.push(limit, offset);
  const { rows } = await db.query(
    `SELECT r.id, r.professional_id AS "professionalId",
            p.display_name AS "professionalName",
            pu.avatar_url AS "professionalAvatarUrl",
            r.reason, r.message, r.status,
            r.created_at AS "createdAt", r.resolved_at AS "resolvedAt",
            COUNT(*) OVER()::int AS total
       FROM account_reports r
       JOIN professionals p ON p.user_id = r.professional_id
       JOIN users pu ON pu.id = r.professional_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return rows;
}

export async function countByReporter(reporterId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM account_reports WHERE reporter_id = $1',
    [reporterId],
  );
  return Number(rows[0]?.count ?? 0);
}

/**
 * Suppression par l'auteur du signalement.
 *
 * `resolved_at` est remis à null : le signalement redevient « en attente »,
 * donc un administrateur le revoit plutôt que de le traiter comme clos.
 */
export async function deleteByReporter(id, reporterId, db = pool) {
  const { rowCount } = await db.query(
    'DELETE FROM account_reports WHERE id = $1 AND reporter_id = $2',
    [id, reporterId],
  );
  return rowCount > 0;
}

export async function setStatus(id, status, db = pool) {
  const { rows } = await db.query(
    `UPDATE account_reports
        SET status = $2, resolved_at = now()
      WHERE id = $1
      RETURNING id, status, resolved_at AS "resolvedAt"`,
    [id, status],
  );
  return rows[0] ?? null;
}
