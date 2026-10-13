-- Up Migration

-- La sous-requête de couverture des photos (première réalisation d'un professionnel)
-- filtre sur professional_id puis trie sur created_at, id : sans cet index
-- composite, PostgreSQL trie les lignes en mémoire à chaque résultat de recherche.
CREATE INDEX photos_professional_created_idx ON photos (professional_id, created_at, id);

-- Même raison pour la file des signalements (pending d'abord, puis date).
CREATE INDEX refresh_tokens_revoked_idx ON refresh_tokens (revoked_at) WHERE revoked_at IS NULL;

-- Down Migration

DROP INDEX IF EXISTS refresh_tokens_revoked_idx;
DROP INDEX IF EXISTS photos_professional_created_idx;
