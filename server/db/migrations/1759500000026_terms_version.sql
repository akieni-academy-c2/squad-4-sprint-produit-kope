-- Version des conditions d'utilisation acceptee.
--
-- `consented_at` dit QUAND la case a été cochée, pas CE QU'IL a été accepté. Sans
-- la version, une contestation deux ans plus tard se résume à « il avait
-- accepté », ce qui ne prouve rien puisque le texte a pu changer depuis.
--
-- Nulable : la migration constate l'absence sur les comptes antérieurs, elle ne
-- les invalide pas.
ALTER TABLE users ADD COLUMN terms_version text;

-- Une version est une date de publication, pas un texte libre.
ALTER TABLE users
  ADD CONSTRAINT users_terms_version_format
  CHECK (terms_version IS NULL OR terms_version ~ '^\d{4}-\d{2}-\d{2}$');
