import { pool } from "../../db/pool.js";

export async function destroyUserSessions(
  userId,
  { exceptSessionId } = {},
  db = pool,
) {
  const { rowCount } = await db.query(
    `DELETE FROM session
      WHERE (sess->'user'->>'id') ~ '^\\d+$'
        AND (sess->'user'->>'id')::bigint = $1
        AND ($2::text IS NULL OR sid <> $2)`,
    [userId, exceptSessionId ?? null],
  );
  return rowCount;
}
