import { pool } from '../../db/pool.js';

export async function create({ professionalId, reporterId, reason, message, targetRole = 'professional' }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO account_reports (professional_id, reporter_id, reason, message, target_role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, professional_id AS "professionalId", target_role AS "targetRole",
               reason, message, status, created_at AS "createdAt"`,
    [professionalId, reporterId, reason, message, targetRole],
  );
  return rows[0];
}

/** Rôle du compte visé, au moment où le signalement est déposé. */
export async function targetRoleOf(userId, db = pool) {
  const { rows } = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
  return rows[0]?.role ?? null;
}

export async function exists(reporterId, professionalId, db = pool) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM account_reports WHERE reporter_id = $1 AND professional_id = $2',
    [reporterId, professionalId],
  );
  return rowCount > 0;
}

/**
 * Nombre de signalements reçus, tous statuts confondus, **en ne comptant que
 * ceux qui peuvent déclencher une sanction automatique**.
 *
 * Voir `shouldAutoSanction` dans le service : les signalements déposés par un
 * professionnel sont recevables mais hors comptage, sinon un petit groupe de
 * professionnels coordonnés pourrait faire suspendre un concurrent en
 * atteignant le seuil.
 */
export async function countSanctionable(professionalId, db = pool) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM account_reports r
       JOIN users u ON u.id = r.reporter_id
      WHERE r.professional_id = $1 AND u.role = 'client'`,
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
         -- La cible est un compte, pas forcément un professionnel : en JOIN
         -- interne, tout signalement contre un client disparaît de la file de
         -- modération et de son total (listByReporter fait déjà ce JOIN en LEFT).
         LEFT JOIN professionals p ON p.user_id = r.professional_id
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
       LEFT JOIN professionals p ON p.user_id = r.professional_id
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
/**
 * Tris de « Mes signalements ».
 *
 * Littéraux choisis par correspondance, jamais interpolés : la liste est
 * indexée sur `ORDER BY`, un choix par `ORDER BY ${tri}` ouvrirait une
 * injection sur une liste paginée.
 */
const ORDER_BY = {
  recent: 'r.created_at DESC, r.id DESC',
  oldest: 'r.created_at ASC, r.id ASC',
};

export async function listByReporter(reporterId, { limit, offset, status, q, sort = 'recent' } = {}, db = pool) {
  const conditions = ['r.reporter_id = $1'];
  const values = [reporterId];

  if (status) {
    values.push(status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (q) {
    values.push(`%${q}%`);
    // Le nom affiché n'existe que pour un professionnel. Pour un client
    // ciblé, on retombe sur son nom : sans cela, une recherche par nom ne
    // trouverait jamais un signalement déposé contre un client.
    conditions.push(
      `(COALESCE(p.display_name, cu.first_name || ' ' || cu.last_name) ILIKE $${values.length} OR r.message ILIKE $${values.length})`,
    );
  }

  values.push(limit, offset);
  const { rows } = await db.query(
    `SELECT r.id, r.professional_id AS "professionalId",
            r.target_role AS "targetRole",
            COALESCE(p.display_name, NULLIF(BTRIM(cu.first_name || ' ' || cu.last_name), ''), 'Util #' || cu.id) AS "professionalName",
            cu.avatar_url AS "professionalAvatarUrl",
            t.name AS "professionalTrade",
            r.reason, r.message, r.status,
            r.created_at AS "createdAt", r.resolved_at AS "resolvedAt",
            COUNT(*) OVER()::int AS total
       FROM account_reports r
       -- La cible est un compte, pas forcément un professionnel : ces jointures
       -- sont toutes à LEFT JOIN, sinon un signalement contre un client
       -- disparaîtrait de « Mes signalements ». L'alias cu (la cible) sert
       -- aussi d'avatar : un second alias sur la même ligne était une jointure
       -- imbriquée inutile sur la clé primaire de users.
       LEFT JOIN professionals p ON p.user_id = r.professional_id
       JOIN users cu ON cu.id = r.professional_id
       LEFT JOIN trades t ON t.id = p.trade_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${ORDER_BY[sort] ?? ORDER_BY.recent}
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
 * Suppression par l'auteur du signalement, uniquement s'il est en attente.
 *
 * La condition `status = 'pending'` est portée par le `WHERE` : un signalement
 * déjà traité ne produit aucune ligne supprimée, l'appelant reçoit donc `null`
 * et répond 404, exactement comme un signalement qui n'est pas le sien.
 */
export async function deleteByReporter(id, reporterId, db = pool) {
  const { rows } = await db.query(
    `DELETE FROM account_reports
      WHERE id = $1 AND reporter_id = $2 AND status = 'pending'
      RETURNING id`,
    [id, reporterId],
  );
  return rows[0] ?? null;
}

export async function setStatus(id, status, db = pool) {
  const { rows } = await db.query(
    `UPDATE account_reports
        SET status = $2, resolved_at = now()
      WHERE id = $1
      RETURNING id, status, resolved_at AS "resolvedAt"`,
    [id, status],
    db,
  );
  return rows[0] ?? null;
}

// ---------- Signalements d'avis ----------
//
// Table et flux séparés de ceux des comptes : la cible est un contenu, les
// effets sont « retirer l'avis » et non « suspendre le compte ». Les confondre
// ferait porter à l'un les compteurs et les seuils de l'autre.

export async function createReviewReport({ reviewId, reporterId, reason, message }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO review_reports (review_id, reporter_id, reason, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, review_id AS "reviewId", reason, message, status, created_at AS "createdAt"`,
    [reviewId, reporterId, reason, message],
  );
  return rows[0];
}

export async function reviewReportExists(reviewId, reporterId, db = pool) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM review_reports WHERE review_id = $1 AND reporter_id = $2',
    [reviewId, reporterId],
  );
  return rowCount > 0;
}

/**
 * Avis reçu par ce professionnel, avec les éléments du signalement.
 *
 * La jointure `r.professional_id = $1` est la garantie : elle ne renvoie rien
 * si l'avis n'a pas été laissé sur la fiche du demandeur. Le contrôle est donc
 * porté par la requête, pas seulement par une comparaison en JavaScript.
 */
export async function findReceivedReview(reviewId, professionalId, db = pool) {
  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.client_id AS "clientId",
            r.created_at AS "createdAt",
            json_build_object(
              'id', u.id,
              'firstName', u.first_name,
              'lastName', COALESCE(UPPER(LEFT(u.last_name, 1)), ''),
              'avatarUrl', u.avatar_url
            ) AS client
       FROM reviews r
       JOIN users u ON u.id = r.client_id
      WHERE r.id = $1 AND r.professional_id = $2`,
    [reviewId, professionalId],
  );
  return rows[0] ?? null;
}

/** File de modération des avis, avec l'auteur du signalement. */
export async function listReviewReports({ limit, offset, status } = {}, db = pool) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`rr.status = $${values.length}`);
  }

  values.push(limit, offset);
  const { rows } = await db.query(
    `SELECT rr.id, rr.review_id AS "reviewId",
            rr.reason, rr.message, rr.status,
            rr.created_at AS "createdAt", rr.resolved_at AS "resolvedAt",
            rv.rating AS "reviewRating", rv.comment AS "reviewComment",
            ru.id AS "reviewAuthorId",
            ru.first_name AS "authorFirstName",
            ru.last_name AS "authorLastName",
            COALESCE(p.display_name, NULLIF(BTRIM(ru.first_name || ' ' || ru.last_name), ''), 'Util #' || ru.id) AS "reviewAuthorName",
            rep.role AS "reporterRole",
            COUNT(*) OVER()::int AS total
       FROM review_reports rr
       JOIN reviews rv ON rv.id = rr.review_id
       JOIN users ru ON ru.id = rv.client_id
       JOIN users rep ON rep.id = rr.reporter_id
       LEFT JOIN professionals p ON p.user_id = ru.id
      ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
      ORDER BY rr.created_at DESC, rr.id DESC
      LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return rows;
}

export async function countReviewReports(db = pool) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM review_reports');
  return Number(rows[0]?.count ?? 0);
}

export async function setReviewReportStatus(id, status, db = pool) {
  const { rows } = await db.query(
    `UPDATE review_reports
        SET status = $2, resolved_at = now()
      WHERE id = $1
      RETURNING id, status, resolved_at AS "resolvedAt"`,
    [id, status],
  );
  return rows[0] ?? null;
}
