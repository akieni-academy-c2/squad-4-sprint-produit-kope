-- Up Migration

CREATE TYPE user_role AS ENUM ('client', 'professional', 'admin');

-- L'ordre des valeurs compte (on ne revient jamais en arrière)

CREATE TYPE request_status AS ENUM ('new', 'seen', 'done');

CREATE TABLE users (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role          user_role NOT NULL,
  phone         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  first_name    text,
  last_name     text,
  consented_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Référentiels
CREATE TABLE trades (
  id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE zones (
  id   smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE
);

INSERT INTO trades (name) VALUES ('Plombier'), ('Électricien'), ('Maçon'), ('Menuisier');

INSERT INTO zones (name) VALUES
  ('Makélékélé'), ('Bacongo'), ('Poto-Poto'), ('Moungali'), ('Ouenzé'),
  ('Talangaï'), ('Mfilou'), ('Madibou'), ('Djiri');

CREATE TABLE professionals (
  user_id          bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name     text NOT NULL,
  trade_id         smallint NOT NULL REFERENCES trades(id),
  description      text CHECK (description IS NULL OR char_length(description) BETWEEN 30 AND 500),
  years_experience smallint CHECK (years_experience IS NULL OR years_experience BETWEEN 0 AND 60),
  whatsapp         text,
  is_available     boolean NOT NULL DEFAULT true,
  is_hidden        boolean NOT NULL DEFAULT false,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE professional_zones (
  professional_id bigint   NOT NULL REFERENCES professionals(user_id) ON DELETE CASCADE,
  zone_id         smallint NOT NULL REFERENCES zones(id),
  PRIMARY KEY (professional_id, zone_id)
);

CREATE TABLE photos (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  professional_id bigint NOT NULL REFERENCES professionals(user_id) ON DELETE CASCADE,
  file_path       text NOT NULL,
  thumb_path      text NOT NULL,
  caption         varchar(100),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_requests (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id       bigint NOT NULL REFERENCES users(id),
  professional_id bigint NOT NULL REFERENCES professionals(user_id),
  message         text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 500),
  is_urgent       boolean NOT NULL DEFAULT false,
  status          request_status NOT NULL DEFAULT 'new',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id       bigint NOT NULL REFERENCES users(id),
  professional_id bigint NOT NULL REFERENCES professionals(user_id),
  rating          smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         varchar(300),
  is_hidden       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, professional_id)
);

CREATE INDEX ON professionals (trade_id);
CREATE INDEX ON professional_zones (zone_id);
CREATE INDEX ON photos (professional_id);
CREATE INDEX ON contact_requests (professional_id, created_at DESC);
CREATE INDEX ON contact_requests (client_id, professional_id, created_at DESC);
CREATE INDEX ON reviews (professional_id);

CREATE VIEW published_professionals AS
SELECT p.user_id, p.display_name, p.trade_id, p.description, p.years_experience,
       p.whatsapp, p.is_available, p.updated_at
  FROM professionals p
 WHERE NOT p.is_hidden
   AND p.description IS NOT NULL
   AND p.years_experience IS NOT NULL
   AND EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id)
   AND EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id);

-- Down Migration

DROP VIEW published_professionals;
DROP TABLE reviews;
DROP TABLE contact_requests;
DROP TABLE photos;
DROP TABLE professional_zones;
DROP TABLE professionals;
DROP TABLE zones;
DROP TABLE trades;
DROP TABLE users;
DROP TYPE request_status;
DROP TYPE user_role;
