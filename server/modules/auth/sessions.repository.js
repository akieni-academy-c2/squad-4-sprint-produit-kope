import { pool } from '../../db/pool.js';

/**
 * Ferme les sessions d'un utilisateur dans la table `session` de
 * connect-pg-simple. Utilisé après un changement de mot de passe : les
 * sessions ouvertes ailleurs (appareil volé, navigateur partagé) deviennent
 * invalides immédiatement.
 *
 * `exceptSessionId` préserve la session courante, sinon l'utilisateur serait
 * déconnecté de l'appareil sur lequel il vient de changer son mot de passe.
 *
 * Remplace l'ancien `revokeAllForUser`, qui ne révoquait que des refresh
 * tokens jamais utilisés par la SPA.
 */
export async function destroyUserSessions(userId, { exceptSessionId } = {}, db = pool) {
  const { rowCount } = await db.query(
    `DELETE FROM session
      WHERE (sess->'user'->>'id')::bigint = $1
        AND ($2::text IS NULL OR sid <> $2)`,
    [userId, exceptSessionId ?? null],
  );
  return rowCount;
}