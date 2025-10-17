-- 0007_sentinel_events_create.sql
-- Creates sentinel_events table for governance monitoring

CREATE TABLE IF NOT EXISTS sentinel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  kind text NOT NULL,                -- REVIEW_CRISIS | VLI_DEGRADE | ATI_DROP | AIV_STALL | ECON_TSM
  severity text NOT NULL,            -- critical | warning | info
  metric jsonb NOT NULL,             -- {name:"ATI", cur:78, prev:91, delta:-13}
  note text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sentinel_tenant_time ON sentinel_events(tenant_id, created_at DESC);

ALTER TABLE sentinel_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY sentinel_events_tenant_select ON sentinel_events FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY sentinel_events_tenant_ins ON sentinel_events FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
