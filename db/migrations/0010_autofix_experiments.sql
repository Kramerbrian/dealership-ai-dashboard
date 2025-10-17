-- Auto-Fix Experiments for A/B testing and canary deployments
CREATE TABLE IF NOT EXISTS autofix_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,                 -- e.g., "schema_full_v1"
  target text NOT NULL,               -- "VDP"
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'running'  -- running|rolled_out|rolled_back
);

CREATE TABLE IF NOT EXISTS autofix_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES autofix_experiments(id) ON DELETE CASCADE,
  vdp_id text NOT NULL,
  variant text NOT NULL,              -- "control" | "canary"
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (experiment_id, vdp_id)
);

CREATE TABLE IF NOT EXISTS autofix_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES autofix_experiments(id) ON DELETE CASCADE,
  vdp_id text NOT NULL,
  variant text NOT NULL,              -- control/canary
  kpi jsonb NOT NULL,                 -- {aiv_delta:0.6, lead:1}
  observed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE autofix_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE autofix_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE autofix_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for autofix_experiments
CREATE POLICY autofix_experiments_tenant_select ON autofix_experiments
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY autofix_experiments_tenant_insert ON autofix_experiments
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY autofix_experiments_tenant_update ON autofix_experiments
  FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);

-- Create RLS policies for autofix_assignments
CREATE POLICY autofix_assignments_tenant_select ON autofix_assignments
  FOR SELECT USING (experiment_id IN (
    SELECT id FROM autofix_experiments WHERE tenant_id = current_setting('app.tenant')::uuid
  ));

CREATE POLICY autofix_assignments_tenant_insert ON autofix_assignments
  FOR INSERT WITH CHECK (experiment_id IN (
    SELECT id FROM autofix_experiments WHERE tenant_id = current_setting('app.tenant')::uuid
  ));

-- Create RLS policies for autofix_metrics
CREATE POLICY autofix_metrics_tenant_select ON autofix_metrics
  FOR SELECT USING (experiment_id IN (
    SELECT id FROM autofix_experiments WHERE tenant_id = current_setting('app.tenant')::uuid
  ));

CREATE POLICY autofix_metrics_tenant_insert ON autofix_metrics
  FOR INSERT WITH CHECK (experiment_id IN (
    SELECT id FROM autofix_experiments WHERE tenant_id = current_setting('app.tenant')::uuid
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_autofix_experiments_tenant ON autofix_experiments(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_autofix_assignments_exp ON autofix_assignments(experiment_id, variant);
CREATE INDEX IF NOT EXISTS idx_autofix_metrics_exp ON autofix_metrics(experiment_id, variant, observed_at DESC);
