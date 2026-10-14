-- Up Migration

ALTER TABLE users ADD COLUMN blocked_at timestamptz;

CREATE INDEX ON users (blocked_at) WHERE blocked_at IS NOT NULL;

-- Down Migration

DROP INDEX IF EXISTS users_blocked_at_idx;
ALTER TABLE users DROP COLUMN blocked_at;
