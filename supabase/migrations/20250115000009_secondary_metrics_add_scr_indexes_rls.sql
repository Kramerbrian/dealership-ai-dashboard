-- 0004_secondary_metrics_add_scr_indexes_rls.sql
-- Adds Schema Coverage Ratio (SCR), uniqueness, indexes, RLS, and update trigger.

DO $$ BEGIN
  ALTER TABLE secondary_metrics ADD COLUMN scr numeric(5,4);
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE secondary_metrics
    ADD CONSTRAINT secondary_metrics_scr_range CHECK (scr IS NULL OR (scr >= 0 AND scr <= 1)) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE secondary_metrics VALIDATE CONSTRAINT secondary_metrics_scr_range;

COMMENT ON COLUMN secondary_metrics.scr IS 'Schema Coverage Ratio (0..1) — valid JSON-LD breadth, low errors, entity bindings.';

-- Uniqueness per tenant/week
DO $$ BEGIN
  ALTER TABLE secondary_metrics
    ADD CONSTRAINT secondary_metrics_tenant_week_uniq UNIQUE (tenant_id, date_week);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helpful composite index for queries
CREATE INDEX IF NOT EXISTS idx_secondary_metrics_tenant_week
  ON secondary_metrics (tenant_id, date_week);

-- Row Level Security
ALTER TABLE secondary_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS secondary_metrics_tenant_select ON secondary_metrics;
CREATE POLICY secondary_metrics_tenant_select
  ON secondary_metrics
  FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);

DROP POLICY IF EXISTS secondary_metrics_tenant_insert ON secondary_metrics;
CREATE POLICY secondary_metrics_tenant_insert
  ON secondary_metrics
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

DROP POLICY IF EXISTS secondary_metrics_tenant_update ON secondary_metrics;
CREATE POLICY secondary_metrics_tenant_update
  ON secondary_metrics
  FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- updated_at trigger (reuse existing function)
DROP TRIGGER IF EXISTS trg_secondary_metrics_updated_at ON secondary_metrics;
CREATE TRIGGER trg_secondary_metrics_updated_at
  BEFORE UPDATE ON secondary_metrics
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
