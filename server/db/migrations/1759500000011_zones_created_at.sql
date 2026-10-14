-- Up Migration

ALTER TABLE zones ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

-- Down Migration

ALTER TABLE zones DROP COLUMN created_at;
