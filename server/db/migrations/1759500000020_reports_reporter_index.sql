-- Up Migration

-- account_reports_reporter_unique est composite (professional_id, reporter_id) :
-- reporter_id n'est donc pas exploitable seul. La suppression d'un compte
-- déclenche un ON DELETE CASCADE qui dut alors parcourir toute la table.
CREATE INDEX IF NOT EXISTS account_reports_reporter_idx
  ON account_reports (reporter_id);

-- Down Migration

DROP INDEX IF EXISTS account_reports_reporter_idx;