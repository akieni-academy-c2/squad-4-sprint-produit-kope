-- Up Migration

-- Le rate limiter en mémoire compte par instance : en déploiement serverless
-- (Lambda, Vercel) chaque conteneur repart à zéro, la limite de 10 tentatives
-- sur /auth/login n'est donc jamais atteinte. On compte en base, comme le
-- store de session (connect-pg-simple) le fait déjà.
CREATE TABLE IF NOT EXISTS rate_limits (
  key            text PRIMARY KEY,
  window_start   timestamptz NOT NULL DEFAULT now(),
  count          integer     NOT NULL DEFAULT 0
);

-- Un seul balayage : les lignes sont réécrites à chaque tentative, seules
-- celles d'une clé inactive s'accumulent.
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);

-- Down Migration

DROP TABLE IF EXISTS rate_limits;