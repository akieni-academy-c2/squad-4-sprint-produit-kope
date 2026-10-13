-- Index manquants relevés à l'audit (octobre 2026).
--
-- 1. session : la suppression des autres sessions à chaque changement de mot
--    de passe filtre sur un identifiant stocké dans du json. Sans cet index,
--    chaque changement de mot de passe scanne toute la table session.
CREATE INDEX IF NOT EXISTS session_user_id_idx
  ON session (((sess->'user'->>'id')::bigint))
  WHERE sess->'user' IS NOT NULL;

-- 2. Avis d'un client : la contrainte unique (client_id, professional_id)
--    filtre la colonne mais ne couvre pas le tri, donc chaque page trie
--    toutes les lignes du client.
CREATE INDEX IF NOT EXISTS reviews_client_visible_created_idx
  ON reviews (client_id, created_at DESC, id DESC)
  WHERE NOT is_hidden;

-- 3. Listes d'administration triées par date : sans index, chaque page
--    déclenche un tri complet de la table.
CREATE INDEX IF NOT EXISTS users_created_id_idx ON users (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS reviews_created_id_idx ON reviews (created_at DESC, id DESC);

-- ------------------------------------------------------------------
-- Down : reverse assumé de l'Up
-- ------------------------------------------------------------------
DROP INDEX IF EXISTS session_user_id_idx;
DROP INDEX IF EXISTS reviews_client_visible_created_idx;
DROP INDEX IF EXISTS users_created_id_idx;
DROP INDEX IF EXISTS reviews_created_id_idx;