-- Up Migration

ALTER TABLE trades ADD COLUMN category text NOT NULL DEFAULT 'Autre';
ALTER TABLE trades ADD COLUMN sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE zones ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

UPDATE trades SET sort_order = id;
UPDATE zones SET sort_order = id;

CREATE INDEX ON trades (sort_order);
CREATE INDEX ON zones (sort_order);

-- Down Migration

DROP INDEX IF EXISTS trades_sort_order_idx;
DROP INDEX IF EXISTS zones_sort_order_idx;
ALTER TABLE zones DROP COLUMN sort_order;
ALTER TABLE trades DROP COLUMN sort_order;
ALTER TABLE trades DROP COLUMN category;
