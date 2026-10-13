-- Up Migration

-- Suspension distincte du blocage : levée uniquement par une action explicite de l'administrateur.
ALTER TABLE users ADD COLUMN suspended_at timestamptz;

CREATE INDEX users_suspended_at_idx ON users (suspended_at) WHERE suspended_at IS NOT NULL;

-- Un compte suspendu disparaît de l'annuaire public.
CREATE OR REPLACE VIEW published_professionals AS
SELECT p.user_id, p.display_name, p.trade_id, p.description, p.years_experience,
       p.whatsapp, p.is_available, p.updated_at
  FROM professionals p
  JOIN users u ON u.id = p.user_id
  JOIN trades t ON t.id = p.trade_id
 WHERE NOT p.is_hidden
   AND u.suspended_at IS NULL
   AND char_length(btrim(p.display_name)) > 0
   AND char_length(btrim(t.name)) > 0
   AND EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id)
   AND char_length(btrim(u.phone)) > 0
   AND char_length(btrim(p.description)) >= 30
   AND EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id);

-- Down Migration

CREATE OR REPLACE VIEW published_professionals AS
SELECT p.user_id, p.display_name, p.trade_id, p.description, p.years_experience,
       p.whatsapp, p.is_available, p.updated_at
  FROM professionals p
  JOIN users u ON u.id = p.user_id
  JOIN trades t ON t.id = p.trade_id
 WHERE NOT p.is_hidden
   AND char_length(btrim(p.display_name)) > 0
   AND char_length(btrim(t.name)) > 0
   AND EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id)
   AND char_length(btrim(u.phone)) > 0
   AND char_length(btrim(p.description)) >= 30
   AND EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id);

DROP INDEX IF EXISTS users_suspended_at_idx;
ALTER TABLE users DROP COLUMN suspended_at;
