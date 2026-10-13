-- Up Migration

-- La vue listait les profils publiés sans vérifier que le compte est encore
-- un professionnel : un compte promu administrateur (ou rétrogradé) restait
-- dans l'annuaire public et dans les résultats de recherche.
-- On ajoute aussi un filtre bloqué_at, cohérent avec le retrait des comptes bloqués.
CREATE OR REPLACE VIEW published_professionals AS
SELECT p.user_id,
       p.display_name,
       p.trade_id,
       p.description,
       p.years_experience,
       p.whatsapp,
       p.is_available,
       p.updated_at
  FROM professionals p
  JOIN users u ON u.id = p.user_id
  JOIN trades t ON t.id = p.trade_id
 WHERE NOT p.is_hidden
   AND u.role = 'professional'
   AND u.blocked_at IS NULL
   AND u.suspended_at IS NULL
   AND char_length(btrim(p.display_name)) > 0
   AND char_length(btrim(t.name)) > 0
   AND (EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id))
   AND char_length(btrim(u.phone)) > 0
   AND char_length(btrim(p.description)) >= 30
   AND (EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id));

-- Down Migration

-- Restaure la vue d'origine (sans filtre de rôle ni de blocage).
CREATE OR REPLACE VIEW published_professionals AS
SELECT p.user_id,
       p.display_name,
       p.trade_id,
       p.description,
       p.years_experience,
       p.whatsapp,
       p.is_available,
       p.updated_at
  FROM professionals p
  JOIN users u ON u.id = p.user_id
  JOIN trades t ON t.id = p.trade_id
 WHERE NOT p.is_hidden
   AND u.suspended_at IS NULL
   AND char_length(btrim(p.display_name)) > 0
   AND char_length(btrim(t.name)) > 0
   AND (EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id))
   AND char_length(btrim(u.phone)) > 0
   AND char_length(btrim(p.description)) >= 30
   AND (EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id));