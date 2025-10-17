CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS avi_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  window_weeks int NOT NULL DEFAULT 8,
  aiv_pct numeric(5,2) NOT NULL,
  ati_pct numeric(5,2) NOT NULL,
  crs_pct numeric(5,2) NOT NULL,
  elasticity_usd_per_point numeric(12,2) NOT NULL,
  r2 numeric(4,3) NOT NULL,
  pillars_json jsonb NOT NULL,
  modifiers_json jsonb NOT NULL,
  clarity_json jsonb NOT NULL,
  secondary_json jsonb,
  ci95_json jsonb NOT NULL,
  counterfactual_json jsonb,
  drivers_json jsonb,
  anomalies_json jsonb,
  backlog_json jsonb,
  regime_state text NOT NULL,
  version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, as_of)
);

CREATE INDEX IF NOT EXISTS idx_avi_reports_tenant_asof ON avi_reports(tenant_id, as_of DESC);

ALTER TABLE avi_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY avi_reports_tenant_select ON avi_reports FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY avi_reports_tenant_ins ON avi_reports FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY avi_reports_tenant_upd ON avi_reports FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
  BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_avi_reports_updated_at ON avi_reports;
  CREATE TRIGGER trg_avi_reports_updated_at BEFORE UPDATE ON avi_reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;