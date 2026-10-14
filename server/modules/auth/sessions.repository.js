import { pool } from '../../db/pool.js';

export async function destroyUserSessions(userId, { exceptSessionId } = {}, db = pool) {
  // La prédiction `~ '^\d+$'` évite le cast qui ferait échouer tout le DELETE
  // (donc toute la transaction de changement de mot de passe) dès qu'une
  // session porte un objet `user` sans identifiant numérique exploitable.
  // Elle est alignée sur le prédicat de `session_user_numeric_idx`.
  const { rowCount } = await db.query(
    `DELETE FROM session
      WHERE (sess->'user'->>'id') ~ '^\\d+$'
        AND (sess->'user'->>'id')::bigint = $1
        AND ($2::text IS NULL OR sid <> $2)`,
    [userId, exceptSessionId ?? null],
  );
  return rowCount;
}