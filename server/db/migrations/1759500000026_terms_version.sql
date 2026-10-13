-- Version des conditions d'utilisation acceptee.
--
-- `consented_at` dit QUAND l'utilisateur a coche la case. Il ne dit pas CE
-- QU'IL a accepte. Les deux sont indispensables : sans la version, une
-- contestation deux ans plus tard se resume a « il avait accepte », ce qui ne
-- prouve rien - le texte a pu changer depuis.
--
-- Nulable : les comptes crees avant cette colonne n'ont pas de version. La
-- migration ne les invalide pas, elle constate une absence.
ALTER TABLE users ADD COLUMN terms_version text;

-- Une version est une date de publication, pas un texte libre.
ALTER TABLE users
  ADD CONSTRAINT users_terms_version_format
  CHECK (terms_version IS NULL OR terms_version ~ '^\d{4}-\d{2}-\d{2}$');
