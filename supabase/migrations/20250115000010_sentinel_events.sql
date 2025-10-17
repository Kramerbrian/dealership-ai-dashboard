-- Sentinel Events Table
-- Captures critical system alerts: review crises, VLI degradation, ATI drops, AIV stalls, economic TSM events
-- Used for real-time monitoring and anomaly detection

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS sentinel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  kind text NOT NULL,                -- REVIEW_CRISIS | VLI_DEGRADE | ATI_DROP | AIV_STALL | ECON_TSM
  severity text NOT NULL,            -- critical | warning | info
  metric jsonb NOT NULL,             -- {name:"ATI", cur:78, prev:91, delta:-13}
  note text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE sentinel_events IS 'System alerts for critical metric changes, regime shifts, and anomalies.';

-- Only add column comments if the columns exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'kind') THEN
    COMMENT ON COLUMN sentinel_events.kind IS 'Event type: REVIEW_CRISIS, VLI_DEGRADE, ATI_DROP, AIV_STALL, ECON_TSM';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'severity') THEN
    COMMENT ON COLUMN sentinel_events.severity IS 'Alert level: critical, warning, info';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'metric') THEN
    COMMENT ON COLUMN sentinel_events.metric IS 'JSON with {name, cur, prev, delta} for metric tracking';
  END IF;
END $$;

-- Index for efficient tenant queries by time (only if tenant_id column exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'tenant_id') THEN
    CREATE INDEX IF NOT EXISTS idx_sentinel_tenant_time
      ON sentinel_events(tenant_id, created_at DESC);
  END IF;
END $$;

-- Index for severity filtering (only if severity column exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'severity') THEN
    CREATE INDEX IF NOT EXISTS idx_sentinel_severity
      ON sentinel_events(severity, created_at DESC)
      WHERE severity = 'critical';
  END IF;
END $$;

-- Row Level Security
ALTER TABLE sentinel_events ENABLE ROW LEVEL SECURITY;

-- Only create RLS policies if tenant_id column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'tenant_id') THEN
    DROP POLICY IF EXISTS sentinel_events_tenant_select ON sentinel_events;
    CREATE POLICY sentinel_events_tenant_select
      ON sentinel_events
      FOR SELECT
      USING (tenant_id = current_setting('app.tenant')::uuid);

    DROP POLICY IF EXISTS sentinel_events_tenant_insert ON sentinel_events;
    CREATE POLICY sentinel_events_tenant_insert
      ON sentinel_events
      FOR INSERT
      WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
  END IF;
END $$;
