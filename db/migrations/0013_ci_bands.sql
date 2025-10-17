-- Confidence interval bands for KPI stability tracking
ALTER TABLE kpi_history
  ADD COLUMN IF NOT EXISTS aiv_ci jsonb,
  ADD COLUMN IF NOT EXISTS ati_ci jsonb,
  ADD COLUMN IF NOT EXISTS crs_ci jsonb;

-- Shape: {"low":72.4,"high":78.9,"width":6.5,"stable":true}

-- Review cadence tracking
CREATE VIEW IF NOT EXISTS review_cadence AS
SELECT 
  tenant_id, 
  date_trunc('week', created_at) AS wk, 
  count(*) AS n
FROM reviews_feed 
GROUP BY 1,2;

-- Action log for audit trail
CREATE TABLE IF NOT EXISTS action_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  action_type text NOT NULL,          -- 'weight_change', 'autofix_write', 'sentinel_outcome'
  actor text NOT NULL,                -- user_id or 'system'
  details jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE action_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY action_log_tenant_select ON action_log
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY action_log_tenant_insert ON action_log
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- Create index
CREATE INDEX IF NOT EXISTS idx_action_log_tenant ON action_log(tenant_id, created_at DESC);
