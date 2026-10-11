-- Up Migration

-- Le nom affiché (pseudonyme) est la seule chose qu'un visiteur voie sur une
-- fiche. Deux professionnels ne doivent pas pouvoir afficher le même nom :
-- le client ne saurait plus qui il contacte.
--
-- Insensible à la casse et aux espaces de bord : « Plomberie Kope » et
-- « plomberie kope » sont considérés comme le même nom.

CREATE UNIQUE INDEX professionals_display_name_unique
  ON professionals (lower(btrim(display_name)));

-- Down Migration

DROP INDEX IF EXISTS professionals_display_name_unique;