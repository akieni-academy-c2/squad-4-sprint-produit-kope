-- Up Migration

CREATE TABLE trade_categories (
  id         smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO trade_categories (name, sort_order) VALUES
  ('Bâtiment & gros œuvre', 1),
  ('Électricité & plomberie', 2),
  ('Bois & finitions', 3),
  ('Services & entretien', 4),
  ('Autre', 5);

ALTER TABLE trades ADD COLUMN category_id smallint REFERENCES trade_categories(id) ON DELETE SET NULL;

UPDATE trades
   SET category_id = c.id
  FROM trade_categories c
 WHERE trades.category IS NOT NULL
   AND lower(trim(trades.category)) = lower(c.name);

UPDATE trades t SET category_id = (SELECT id FROM trade_categories WHERE name = 'Autre')
 WHERE t.category_id IS NULL;

ALTER TABLE trades DROP COLUMN category;

CREATE INDEX ON trades (category_id);

-- Down Migration

DROP INDEX IF EXISTS trades_category_id_idx;

ALTER TABLE trades ADD COLUMN category text;

UPDATE trades
   SET category = c.name
  FROM trade_categories c
 WHERE trades.category_id = c.id;

DROP TABLE IF EXISTS trade_categories;
