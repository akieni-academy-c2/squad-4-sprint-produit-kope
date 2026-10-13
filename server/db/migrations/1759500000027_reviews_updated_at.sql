-- Up Migration
-- `reviews.updated_at` est référencé par reviews.repository.js (listByClient,
-- findOwnedById, updateOwned, setHiddenOwned) mais n'a jamais été créé : la
-- table `reviews` de 1759500000000_init.sql ne portait que `created_at`.
-- Toute lecture ou écriture d'un avis par son auteur échouait donc en
-- `column "updated_at" does not exist`.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- `updated_at` doit suivre `created_at` pour les lignes antérieures.
UPDATE reviews SET updated_at = created_at WHERE updated_at > created_at;

-- Index de tri du chemin par défaut ("Mes avis", visibility = 'all').
-- 1759500000021_audit_indexes.sql n'en pose qu'un partiel
-- (`WHERE NOT is_hidden`) qui ne sert pas la liste par défaut, laquelle garde
-- volontairement les avis masqués : le planner retombait sur
-- reviews_client_professional_unique puis triait toutes les lignes en mémoire.
CREATE INDEX IF NOT EXISTS reviews_client_created_idx
  ON reviews (client_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS reviews_professional_created_idx
  ON reviews (professional_id, created_at DESC, id DESC);

-- Down Migration
DROP INDEX IF EXISTS reviews_professional_created_idx;
DROP INDEX IF EXISTS reviews_client_created_idx;
ALTER TABLE reviews DROP COLUMN IF EXISTS updated_at;