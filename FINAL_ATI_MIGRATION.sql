CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ati_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date_week date NOT NULL,
  precision_pct numeric(5,2) NOT NULL,
  consistency_pct numeric(5,2) NOT NULL,
  recency_pct numeric(5,2) NOT NULL,
  authenticity_pct numeric(5,2) NOT NULL,
  alignment_pct numeric(5,2) NOT NULL,
  ati_pct numeric(5,2) GENERATED ALWAYS AS (
    LEAST(100, precision_pct*0.30 + consistency_pct*0.25 + recency_pct*0.20 + authenticity_pct*0.15 + alignment_pct*0.10)
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, date_week)
);

CREATE INDEX IF NOT EXISTS idx_ati_signals_tenant_week ON ati_signals (tenant_id, date_week DESC);

ALTER TABLE ati_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ati_tenant_sel ON ati_signals;
CREATE POLICY ati_tenant_sel ON ati_signals FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

DROP POLICY IF EXISTS ati_tenant_ins ON ati_signals;
CREATE POLICY ati_tenant_ins ON ati_signals FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

DROP POLICY IF EXISTS ati_tenant_upd ON ati_signals;
CREATE POLICY ati_tenant_upd ON ati_signals FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid) WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $func$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_ati_updated_at ON ati_signals;
CREATE TRIGGER trg_ati_updated_at BEFORE UPDATE ON ati_signals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
