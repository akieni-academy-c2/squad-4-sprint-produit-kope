-- Up Migration

ALTER TABLE trades ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();

-- Down Migration

ALTER TABLE trades DROP COLUMN created_at;
