-- 0005_ati_signals.sql
-- ATI (Algorithmic Trust Index) - Five-Pillar Trust Measurement System
-- Part of DealershipAI v5.0 Command Center

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS ati_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date_week date NOT NULL,

  -- Five Pillars of Algorithmic Trust
  precision_pct numeric(5,2) NOT NULL,     -- Data accuracy (30% weight)
  consistency_pct numeric(5,2) NOT NULL,   -- Cross-channel parity (25% weight)
  recency_pct numeric(5,2) NOT NULL,       -- Freshness / latency (20% weight)
  authenticity_pct numeric(5,2) NOT NULL,  -- Review/backlink credibility (15% weight)
  alignment_pct numeric(5,2) NOT NULL,     -- Query/task match (10% weight)

  -- Composite ATI Score (weighted calculation, capped at 100)
  ati_pct numeric(5,2) GENERATED ALWAYS AS
    (LEAST(100,
      precision_pct*0.30 + consistency_pct*0.25 +
      recency_pct*0.20 + authenticity_pct*0.15 +
      alignment_pct*0.10)) STORED,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (tenant_id, date_week)
);

-- Index for efficient tenant + time-series queries
CREATE INDEX IF NOT EXISTS idx_ati_signals_tenant_week ON ati_signals (tenant_id, date_week DESC);

-- Enable Row Level Security for multi-tenancy
ALTER TABLE ati_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - users can only see their tenant's data
DO $$ BEGIN
  CREATE POLICY ati_tenant_sel ON ati_signals FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policy: INSERT - users can only insert for their tenant
DO $$ BEGIN
  CREATE POLICY ati_tenant_ins ON ati_signals FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS Policy: UPDATE - users can only update their tenant's data
DO $$ BEGIN
  CREATE POLICY ati_tenant_upd ON ati_signals FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update timestamp on row changes
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trg_ati_updated_at ON ati_signals;
  CREATE TRIGGER trg_ati_updated_at BEFORE UPDATE ON ati_signals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
END $$;

-- Documentation
COMMENT ON TABLE ati_signals IS 'ATI (Algorithmic Trust Index) five-pillar signals and composite score per tenant/week. Part of DealershipAI Command Center autonomous monitoring.';
COMMENT ON COLUMN ati_signals.precision_pct IS 'Data accuracy pillar (30% weight) - measures correctness of business data';
COMMENT ON COLUMN ati_signals.consistency_pct IS 'Cross-channel parity pillar (25% weight) - measures alignment across platforms';
COMMENT ON COLUMN ati_signals.recency_pct IS 'Freshness/latency pillar (20% weight) - measures data timeliness';
COMMENT ON COLUMN ati_signals.authenticity_pct IS 'Review/backlink credibility pillar (15% weight) - measures trust signals';
COMMENT ON COLUMN ati_signals.alignment_pct IS 'Query/task match pillar (10% weight) - measures search intent matching';
COMMENT ON COLUMN ati_signals.ati_pct IS 'Composite ATI score (weighted sum of five pillars, capped at 100)';
