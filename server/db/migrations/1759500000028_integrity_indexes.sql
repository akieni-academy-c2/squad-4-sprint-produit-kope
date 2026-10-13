-- Up Migration
-- Corrections d'intégrité et de performance relevées à l'audit (octobre 2026).

-- ------------------------------------------------------------------
-- 1. Unicité de l'e-mail réellement insensible à la casse
-- ------------------------------------------------------------------
-- 1759500000023_user_email.sql justifie son index par « la comparaison se
-- fait sur la version lower stockée » et son CHECK par « le CHECK refuse la
-- casse mélangée ». Aucune des deux affirmations n'était tenue : l'index porte
-- sur `email` tel quel, et le CHECK ne vérifie que le btrim et la longueur.
-- `Jean@x.com` et `jean@x.com` coexistent donc, et un même humain peut
-- ouvrir deux comptes sur la même adresse.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
  ON users (lower(btrim(email)))
  WHERE email IS NOT NULL;

DROP INDEX IF EXISTS users_email_unique;

-- La colonne elle-même est normalisée : le CHECK reste un garde-fou pour les
-- écritures directes en SQL (psql, script de reprise), pas une convention.
ALTER TABLE users
  ADD CONSTRAINT users_email_normalized
  CHECK (email IS NULL OR email = lower(btrim(email)));

-- ------------------------------------------------------------------
-- 2. Un contact « message » porte forcément un message
-- ------------------------------------------------------------------
-- 1759500000022_contact_channel.sql a rendu `message` nullable pour permettre
-- les canaux call/whatsapp, sans contrepartie : plus rien n'exige de contenu
-- pour un contact de type 'message'. contacts.repository.js insère $3 tel quel.
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_message_required;
ALTER TABLE contacts
  ADD CONSTRAINT contacts_message_required
  CHECK (channel <> 'message' OR message IS NOT NULL);

-- ------------------------------------------------------------------
-- 3. Index de session aligné sur la prédiction qui le parcourt
-- ------------------------------------------------------------------
-- Le prédicat de 1759500000021 porte sur `sess->'user' IS NOT NULL`, qui
-- garantit la présence de la clé mais pas celle d'un `id` numérique.
-- sessions.repository.js fait `(sess->'user'->>'id')::bigint` : une session
-- sérialisée sans identifiant exploitable fait échouer le DELETE, et avec lui
-- la transaction de changement de mot de passe.
CREATE INDEX IF NOT EXISTS session_user_numeric_idx
  ON session (((sess->'user'->>'id')::bigint))
  WHERE (sess->'user'->>'id') ~ '^\d+$';

DROP INDEX IF EXISTS session_user_id_idx;

-- ------------------------------------------------------------------
-- 4. Index orientés « comptes actifs »
-- ------------------------------------------------------------------
-- Les deux index partiels existants portent sur `IS NOT NULL`, donc ils ne
-- servent ni published_professionals (`blocked_at IS NULL AND suspended_at
-- IS NULL`), ni countActiveAdmins. Les prédicats les plus chauds sont les
-- positifs, en particulier pour la vue de publication.
CREATE INDEX IF NOT EXISTS users_active_idx
  ON users (role)
  WHERE blocked_at IS NULL AND suspended_at IS NULL;

CREATE INDEX IF NOT EXISTS users_admin_active_idx
  ON users (id)
  WHERE role = 'admin' AND blocked_at IS NULL AND suspended_at IS NULL;

-- Garde la purge des comptes bloqués (admin.repository.js) qui filtre
-- `blocked_at IS NOT NULL` : celui-ci sert, celui sur suspended_at non
-- référencé par la moindre requête.
DROP INDEX IF EXISTS users_suspended_at_idx;

-- ------------------------------------------------------------------
-- 5. Index redondants
-- ------------------------------------------------------------------
-- photos_professional_id_idx est un préfixe strict de
-- photos_professional_created_idx : il n'apporte rien et coûte en écriture.
DROP INDEX IF EXISTS photos_professional_id_idx;

-- contacts_pair_idx est un préfixe strict de contacts_pair_recent_idx.
DROP INDEX IF EXISTS contacts_pair_idx;

-- ------------------------------------------------------------------
-- 6. Recherche textuelle : sans pg_trgm, chaque ILIKE '%…%' est un scan
-- ------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS professionals_display_name_trgm_idx
  ON professionals USING gin (display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS users_first_name_trgm_idx
  ON users USING gin (first_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS users_last_name_trgm_idx
  ON users USING gin (last_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS reviews_comment_trgm_idx
  ON reviews USING gin (comment gin_trgm_ops);

-- Down Migration

DROP INDEX IF EXISTS reviews_comment_trgm_idx;
DROP INDEX IF EXISTS users_last_name_trgm_idx;
DROP INDEX IF EXISTS users_first_name_trgm_idx;
DROP INDEX IF EXISTS professionals_display_name_trgm_idx;
DROP EXTENSION IF EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS photos_professional_id_idx ON photos (professional_id);
CREATE INDEX IF NOT EXISTS contacts_pair_idx ON contacts (sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS users_suspended_at_idx
  ON users (suspended_at) WHERE suspended_at IS NOT NULL;

DROP INDEX IF EXISTS users_admin_active_idx;
DROP INDEX IF EXISTS users_active_idx;

CREATE INDEX IF NOT EXISTS session_user_id_idx
  ON session (((sess->'user'->>'id')::bigint))
  WHERE sess->'user' IS NOT NULL;
DROP INDEX IF EXISTS session_user_numeric_idx;

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_message_required;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_normalized;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
  ON users (email) WHERE email IS NOT NULL;
