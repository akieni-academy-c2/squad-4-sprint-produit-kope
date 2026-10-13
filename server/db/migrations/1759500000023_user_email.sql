-- Adresse e-mail du compte.
--
-- Nulable et non exigée à l'inscription : la connexion se fait par téléphone,
-- l'e-mail n'est qu'un canal de contact. `citext` n'est pas utilisé — la
-- comparaison se fait sur la version lower stockée, donc `UNIQUE` porte sur
-- `email` et le CHECK refuse la casse mélangée qui passerait la contrainte.
ALTER TABLE users ADD COLUMN email text;

-- Un e-mail ne peut appartenir qu'à un compte. La connexion ne se fait pas
-- par e-mail, donc cette contrainte ne sert qu'à empêcher deux personnes de
-- se voir attribuer la même adresse.
CREATE UNIQUE INDEX users_email_unique ON users (email) WHERE email IS NOT NULL;

-- Pas d'espace autour, longueur bornée : les espaces de saisie sont coupés
-- par Zod, cette contrainte ferme la porte à une insertion directe en SQL.
ALTER TABLE users
  ADD CONSTRAINT users_email_format
  CHECK (email IS NULL OR (email = btrim(email) AND char_length(email) BETWEEN 3 AND 254));