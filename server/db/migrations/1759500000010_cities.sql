-- Up Migration

CREATE TABLE cities (
  id         smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO cities (name, sort_order) VALUES
  ('Brazzaville', 1),
  ('Pointe-Noire', 2),
  ('Dolisie', 3),
  ('Nkayi', 4),
  ('Owando', 5),
  ('Mossaka', 6);

ALTER TABLE zones ADD COLUMN city_id smallint REFERENCES cities(id) ON DELETE SET NULL;

UPDATE zones SET city_id = (SELECT id FROM cities WHERE name = 'Brazzaville');

CREATE INDEX ON zones (city_id);

-- Down Migration

DROP INDEX IF EXISTS zones_city_id_idx;

ALTER TABLE zones DROP COLUMN city_id;
DROP TABLE IF EXISTS cities;
