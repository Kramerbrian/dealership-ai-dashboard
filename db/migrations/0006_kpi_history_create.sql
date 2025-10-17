-- 0006_kpi_history_create.sql
-- Creates kpi_history table for sparkline data

CREATE TABLE IF NOT EXISTS kpi_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  aiv_pct numeric(5,2),
  ati_pct numeric(5,2),
  crs_pct numeric(5,2),
  elasticity_usd_per_point numeric(12,2),
  vli_integrity_pct numeric(5,2)
);

CREATE INDEX IF NOT EXISTS idx_kpi_hist_tenant ON kpi_history(tenant_id,as_of);

ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY kpi_history_tenant_select ON kpi_history FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY kpi_history_tenant_ins ON kpi_history FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY kpi_history_tenant_upd ON kpi_history FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
