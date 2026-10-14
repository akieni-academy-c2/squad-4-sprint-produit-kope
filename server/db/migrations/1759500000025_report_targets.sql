-- Cibles de signalement : un compte, pas un professionnel.
--
-- La cible devient un `users` : un client n'a pas de ligne dans `professionals` et
-- était donc structurellement impossible à signaler. Le nom de colonne est gardé,
-- il désigne bien le compte visé.
--
-- `target_role` fige le rôle au moment du signalement : il n'est pas déductible du
-- compte visé, dont `users.role` peut changer ensuite.
ALTER TABLE account_reports
  ADD COLUMN target_role text NOT NULL DEFAULT 'professional'
    CHECK (target_role IN ('client', 'professional'));

ALTER TABLE account_reports
  DROP CONSTRAINT account_reports_professional_id_fkey;

ALTER TABLE account_reports
  ADD CONSTRAINT account_reports_target_fkey
  FOREIGN KEY (professional_id) REFERENCES users(id) ON DELETE CASCADE;

-- Le garde existed déjà côté service (`reporterId === professionalId`), mais une
-- contrainte est la seule garantie qui ne dépende pas d'un appelant.
ALTER TABLE account_reports
  ADD CONSTRAINT account_reports_no_self_report CHECK (professional_id <> reporter_id);

-- La jointure d'inventaire ne filtre plus sur `status` seul : une cible peut
-- être un compte de n'importe quel rôle, l'index reste valable par prefixe.
DROP INDEX IF EXISTS account_reports_professional_idx;
CREATE INDEX account_reports_professional_idx ON account_reports (professional_id, status);

-- Signalements d'avis.
--
-- Table distincte de `account_reports` : la cible est un contenu, pas un compte.
-- Les deux flux n'ont ni les mêmes effets ni les mêmes acteurs - un avis se
-- retire, un compte se suspend - et les confondre ferait porter à l'un les
-- compteurs de l'autre. Pas de seuil de blocage automatique ici.
CREATE TABLE review_reports (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review_id   bigint NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason      text   NOT NULL CHECK (reason IN ('abusive', 'false', 'spam', 'inappropriate', 'private_info', 'other')),
  message     text   CHECK (message IS NULL OR char_length(message) BETWEEN 3 AND 500),
  status      text   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  resolved_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Un seul signalement par avis et par auteur : sans cela, une procession de
  -- signalements gonflerait un compteur de file d'attente sans rien apprendre.
  CONSTRAINT review_reports_reporter_unique UNIQUE (review_id, reporter_id)
);

CREATE INDEX review_reports_status_idx ON review_reports (status, created_at DESC);
CREATE INDEX review_reports_review_idx ON review_reports (review_id);