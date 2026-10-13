-- Up Migration

CREATE TABLE account_reports (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  professional_id bigint NOT NULL REFERENCES professionals(user_id) ON DELETE CASCADE,
  reporter_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason          text   NOT NULL CHECK (reason IN ('fake_profile', 'harassment', 'spam', 'inappropriate', 'fraud', 'other')),
  message         text   CHECK (message IS NULL OR char_length(message) BETWEEN 3 AND 500),
  status          text   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_reports_reporter_unique UNIQUE (professional_id, reporter_id)
);

CREATE INDEX account_reports_status_idx ON account_reports (status, created_at DESC);
CREATE INDEX account_reports_professional_idx ON account_reports (professional_id);

-- Down Migration

DROP TABLE IF EXISTS account_reports;
