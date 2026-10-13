-- Up Migration

-- L'authentification repose uniquement sur la session serveur (cookie `sid`).
-- Les access/refresh tokens n'étaient plus consommés par la SPA depuis le
-- passage au cookie httpOnly : ils étaient émis, stockés, puis ignorés.
DROP TABLE IF EXISTS refresh_tokens;

-- Down Migration

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          bigserial PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text   NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_expiry_idx ON refresh_tokens (expires_at);
CREATE INDEX IF NOT EXISTS refresh_tokens_revoked_idx ON refresh_tokens (revoked_at) WHERE revoked_at IS NULL;