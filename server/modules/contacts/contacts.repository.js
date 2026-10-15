import { pool } from "../../db/pool.js";

const COUNTERPART = `
       FROM contacts c
       JOIN users u ON u.id = %s
       LEFT JOIN professionals p ON p.user_id = u.id
       LEFT JOIN trades t ON t.id = p.trade_id`;

const COUNTERPART_COLUMNS = `
            u.id AS "userId",
            u.role,
            u.phone,
            u.avatar_url AS "avatarUrl",
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            COALESCE(
              p.display_name,
              NULLIF(BTRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), '')
            ) AS "displayName",
            t.name AS "tradeName"`;

export async function create(
  { senderId, recipientId, message, channel = "message" },
  db = pool,
) {
  const { rows } = await db.query(
    `INSERT INTO contacts (sender_id, recipient_id, message, channel)
     VALUES ($1, $2, $3, $4)
     RETURNING id, message, channel, status, created_at AS "createdAt"`,
    [senderId, recipientId, message, channel],
  );
  return rows[0];
}

export async function hasContactBetween(userA, userB, db = pool) {
  const { rowCount } = await db.query(
    `SELECT 1 FROM contacts
      WHERE (sender_id = $1 AND recipient_id = $2)
         OR (sender_id = $2 AND recipient_id = $1)
      LIMIT 1`,
    [userA, userB],
  );
  return rowCount > 0;
}

/**
 * Marque une demande entrante comme vue.
 *
 * `recipient_id = $2` interdit de toucher la conversation d'autrui, et
 * `status = 'new'` rend l'opération idempotente : une seconde passe ne réécrit
 * rien. La liste ne déclenche plus la transition — seul un geste de
 * l'utilisateur le déclenche, sinon le statut serait déjà `seen` au moment du
 * rendu et ne pourrait rien afficher.
 */
export async function markSeen(contactId, userId, db = pool) {
  const { rowCount } = await db.query(
    "UPDATE contacts SET status = 'seen' WHERE id = $1 AND recipient_id = $2 AND status = 'new'",
    [contactId, userId],
  );
  return rowCount > 0;
}

/** Repli pour les demandes sans téléphone, où aucun geste n'est déclenché. */
export async function markAllSeen(userId, db = pool) {
  const { rowCount } = await db.query(
    "UPDATE contacts SET status = 'seen' WHERE recipient_id = $1 AND status = 'new'",
    [userId],
  );
  return rowCount;
}

export async function listForUser(
  userId,
  { limit = 20, offset = 0 } = {},
  db = pool,
) {
  const outgoing = COUNTERPART.replace("%s", "c.recipient_id");
  const incoming = COUNTERPART.replace("%s", "c.sender_id");
  const { rows } = await db.query(
    `WITH mine AS (
       SELECT c.id, c.message, c.channel, c.status, TRUE AS outgoing, c.created_at AS "createdAt",
              ${COUNTERPART_COLUMNS}
       ${outgoing}
      WHERE c.sender_id = $1
     UNION ALL
       SELECT c.id, c.message, c.channel, c.status, FALSE AS outgoing, c.created_at AS "createdAt",
              ${COUNTERPART_COLUMNS}
       ${incoming}
      WHERE c.recipient_id = $1
     )
     SELECT *, COUNT(*) OVER()::int AS total
       FROM mine
      ORDER BY "createdAt" DESC, id DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return rows;
}

export async function countForUser(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT (SELECT COUNT(*)::int FROM contacts WHERE sender_id = $1)
          + (SELECT COUNT(*)::int FROM contacts WHERE recipient_id = $1) AS count`,
    [userId],
  );
  return Number(rows[0]?.count ?? 0);
}
