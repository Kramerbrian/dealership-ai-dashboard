-- Sentinel Governance System
-- Automated monitoring with β-calibration coupling

CREATE TABLE IF NOT EXISTS sentinel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  kind text NOT NULL,                -- REVIEW_CRISIS | VLI_DEGRADE | ATI_DROP | AIV_STALL | ECON_TSM
  severity text NOT NULL,            -- critical | warning | info
  metric jsonb NOT NULL,             -- {name:"ATI", cur:78, prev:91, delta:-13}
  note text,
  created_at timestamptz DEFAULT now()
);

-- Only create index if tenant_id column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'tenant_id') THEN
    CREATE INDEX IF NOT EXISTS idx_sentinel_tenant_time ON sentinel_events(tenant_id, created_at DESC);
  END IF;
END $$;
-- Only create index if kind and severity columns exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'kind') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'severity') THEN
    CREATE INDEX IF NOT EXISTS idx_sentinel_kind_severity ON sentinel_events(kind, severity);
  END IF;
END $$;

-- KPI History table for Sentinel monitoring
CREATE TABLE IF NOT EXISTS kpi_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  as_of timestamptz NOT NULL,
  aiv_pct numeric(5,2) NOT NULL,
  ati_pct numeric(5,2) NOT NULL,
  vli_integrity_pct numeric(5,2) NOT NULL,
  clarity_json jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kpi_history_tenant_as_of ON kpi_history(tenant_id, as_of DESC);

-- Beta calibration tracking
CREATE TABLE IF NOT EXISTS beta_calibrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  trigger_event text NOT NULL,       -- ATI_DROP | AIV_STALL | MANUAL
  old_weights jsonb NOT NULL,
  new_weights jsonb NOT NULL,
  confidence_score numeric(3,2) DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beta_calibrations_tenant ON beta_calibrations(tenant_id, created_at DESC);

-- RLS Policies
ALTER TABLE sentinel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_calibrations ENABLE ROW LEVEL SECURITY;

-- Only create RLS policy if tenant_id column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sentinel_events' AND column_name = 'tenant_id') THEN
    CREATE POLICY sentinel_events_tenant_isolation ON sentinel_events
      FOR ALL USING (tenant_id = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');
  END IF;
END $$;

CREATE POLICY kpi_history_tenant_isolation ON kpi_history
  FOR ALL USING (tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid);

CREATE POLICY beta_calibrations_tenant_isolation ON beta_calibrations
  FOR ALL USING (tenant_id = (current_setting('request.jwt.claims', true)::jsonb->>'tenant_id')::uuid);

-- Function to insert KPI history
CREATE OR REPLACE FUNCTION insert_kpi_history(
  p_tenant_id uuid,
  p_aiv_pct numeric,
  p_ati_pct numeric,
  p_vli_integrity_pct numeric,
  p_clarity_json jsonb DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO kpi_history (tenant_id, as_of, aiv_pct, ati_pct, vli_integrity_pct, clarity_json)
  VALUES (p_tenant_id, now(), p_aiv_pct, p_ati_pct, p_vli_integrity_pct, p_clarity_json)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log Sentinel event
CREATE OR REPLACE FUNCTION log_sentinel_event(
  p_tenant_id uuid,
  p_kind text,
  p_severity text,
  p_metric jsonb,
  p_note text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO sentinel_events (tenant_id, kind, severity, metric, note)
  VALUES (p_tenant_id, p_kind, p_severity, p_metric, p_note)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
