-- Up Migration

-- Un contact n'est plus un message envoyé : c'est un événement. Appeler et
-- écrire sur WhatsApp sont deux gestes différents, comptabilisés séparément, et
-- rien n'est saisi à la main. Trois conséquences sur le schéma.

-- 1. Le message devient facultatif : un appel n'en porte pas.
ALTER TABLE contacts DROP CONSTRAINT contacts_message_check;
ALTER TABLE contacts ALTER COLUMN message DROP NOT NULL;

-- 2. Le canal dit comment le contact a été pris. 'message' est la valeur des
--    lignes existantes, qui restent valables.
CREATE TYPE contact_channel AS ENUM ('message', 'call', 'whatsapp');

ALTER TABLE contacts
  ADD COLUMN channel contact_channel NOT NULL DEFAULT 'message';

-- 3. Un même professionnel peut être appelé plusieurs fois : la contrainte
--    d'unicité sur la paire rendait le second appel impossible, alors que
--    c'est le cas le plus courant. Elle est remplacée par un index simple, qui
--    garde la paire exploitable sans l'interdire.
ALTER TABLE contacts DROP CONSTRAINT contacts_unique_pair;

CREATE INDEX contacts_pair_idx ON contacts (sender_id, recipient_id);

-- Le regroupement par professionnel (la lecture du compte client) s'appuie sur
-- l'ordre des événements.
CREATE INDEX contacts_pair_recent_idx
  ON contacts (sender_id, recipient_id, created_at DESC);

-- Down Migration

DROP INDEX IF EXISTS contacts_pair_recent_idx;
DROP INDEX IF EXISTS contacts_pair_idx;

ALTER TABLE contacts DROP COLUMN channel;
DROP TYPE IF EXISTS contact_channel;

ALTER TABLE contacts
  ALTER COLUMN message SET NOT NULL;
ALTER TABLE contacts
  ADD CONSTRAINT contacts_message_check
  CHECK (char_length(message) BETWEEN 10 AND 500);

ALTER TABLE contacts ADD CONSTRAINT contacts_unique_pair UNIQUE (sender_id, recipient_id);