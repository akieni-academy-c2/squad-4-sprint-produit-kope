import { pool } from '../../db/pool.js';

export async function updateRole(userId, role, db = pool) {
  await db.query('UPDATE users SET role = $2 WHERE id = $1', [userId, role]);
}

export async function updateAccount(userId, { firstName, lastName, phone, email }, db = pool) {
  const { rows } = await db.query(
    `UPDATE users
        SET first_name = COALESCE($2, first_name),
            last_name = COALESCE($3, last_name),
            phone = COALESCE($4, phone),
            email = $5
      WHERE id = $1
  RETURNING id, role, phone, email,
            first_name AS "firstName", last_name AS "lastName"`,
    // L'e-mail est le seul champ effaçable : `COALESCE` interdirait de le
    // retirer, `email` prend donc la valeur telle quelle - `null` pour vider,
    // une chaîne pour la poser. Les autres restent inchangés si absents.
    [userId, firstName ?? null, lastName ?? null, phone ?? null, email ?? null],
  );
  return rows[0] ?? null;
}

export async function updatePasswordHash(userId, passwordHash, db = pool) {
  await db.query('UPDATE users SET password_hash = $2 WHERE id = $1', [userId, passwordHash]);
}

export async function getPasswordHash(userId, db = pool) {
  const { rows } = await db.query('SELECT password_hash AS "passwordHash" FROM users WHERE id = $1', [userId]);
  return rows[0]?.passwordHash ?? null;
}

export async function findByPhone(phone, db = pool) {
  const { rows } = await db.query(
    `SELECT id, role, phone, password_hash AS "passwordHash",
            first_name AS "firstName", last_name AS "lastName",
            blocked_at AS "blockedAt"
       FROM users
      WHERE phone = $1`,
    [phone],
  );
  return rows[0] ?? null;
}

/**
 * Relit l'état du compte en base : rôle courant, blocage et suspension.
 * Une seule requête remplace les contrôles séparés, et évite de faire
 * confiance au rôle figé dans le access token.
 */
export async function getAccountState(id, db = pool) {
  const { rows } = await db.query(
    'SELECT role, blocked_at AS "blockedAt", suspended_at AS "suspendedAt" FROM users WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function findById(id, db = pool) {
  const { rows } = await db.query(
    `SELECT u.id, u.role, u.phone, u.email,
            u.first_name AS "firstName", u.last_name AS "lastName",
            u.avatar_url AS "avatarUrl",
            u.blocked_at AS "blockedAt",
            p.display_name AS "displayName"
       FROM users u
       LEFT JOIN professionals p ON p.user_id = u.id
      WHERE u.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function updateAvatarUrl(userId, avatarUrl, db = pool) {
  await db.query('UPDATE users SET avatar_url = $2 WHERE id = $1', [userId, avatarUrl]);
}

export async function createUser(
  { role, phone, passwordHash, firstName = null, lastName = null, termsVersion = null },
  db = pool,
) {
  const { rows } = await db.query(
    `INSERT INTO users (role, phone, password_hash, first_name, last_name, consented_at, terms_version)
     VALUES ($1, $2, $3, $4, $5, now(), $6)
     RETURNING id, role, phone, first_name AS "firstName", last_name AS "lastName"`,
    [role, phone, passwordHash, firstName, lastName, termsVersion],
  );
  return rows[0];
}
