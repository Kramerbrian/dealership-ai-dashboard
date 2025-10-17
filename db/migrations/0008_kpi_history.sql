-- Create KPI history table for weekly aggregated metrics
CREATE TABLE IF NOT EXISTS kpi_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of date NOT NULL,
  aiv_pct numeric(5,2),
  ati_pct numeric(5,2),
  crs_pct numeric(5,2),
  elasticity_usd_per_point numeric(10,2),
  vli_integrity_pct numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, as_of)
);

-- Enable RLS
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY kpi_history_tenant_select ON kpi_history
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY kpi_history_tenant_insert ON kpi_history
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY kpi_history_tenant_update ON kpi_history
  FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY kpi_history_tenant_delete ON kpi_history
  FOR DELETE USING (tenant_id = current_setting('app.tenant')::uuid);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kpi_history_tenant_as_of ON kpi_history(tenant_id, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_history_as_of ON kpi_history(as_of DESC);
