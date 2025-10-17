-- Feature Store Schema for normalized metrics persistence
-- Enables consistent training data and back-tests

CREATE TABLE IF NOT EXISTS feature_store (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  date date NOT NULL,
  
  -- Normalized metrics (0-1 range)
  eeat_score numeric(4,3) NOT NULL,
  qai_score numeric(4,3) NOT NULL,
  piqr_score numeric(4,3) NOT NULL,
  tsm_score numeric(4,3) NOT NULL,
  
  -- Raw metrics for reference
  ai_visibility_raw integer,
  trust_score_raw integer,
  zero_click_raw integer,
  ugc_health_raw integer,
  geo_trust_raw integer,
  
  -- Derived features
  elasticity_coefficient numeric(8,4),
  regime_state text,
  confidence_score numeric(4,3),
  
  -- Metadata
  data_source text NOT NULL DEFAULT 'system',
  quality_score numeric(4,3) DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, date)
);

-- Indexes for performance
CREATE INDEX idx_feature_store_tenant_date ON feature_store(tenant_id, date DESC);
CREATE INDEX idx_feature_store_date ON feature_store(date DESC);
CREATE INDEX idx_feature_store_quality ON feature_store(quality_score DESC);

-- RLS policies
ALTER TABLE feature_store ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY feature_store_tenant_select ON feature_store FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY feature_store_tenant_insert ON feature_store FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Data quality audit table
CREATE TABLE IF NOT EXISTS data_quality_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  audit_date date NOT NULL,
  
  -- Quality metrics
  missing_data_count integer DEFAULT 0,
  stale_data_count integer DEFAULT 0,
  quality_score numeric(4,3) NOT NULL,
  
  -- Issues found
  issues jsonb DEFAULT '[]',
  
  -- Resolution
  resolved boolean DEFAULT false,
  resolution_notes text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, audit_date)
);

-- RLS for data quality audits
ALTER TABLE data_quality_audits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY data_quality_audits_tenant_select ON data_quality_audits FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Feature store views for analytics
CREATE OR REPLACE VIEW v_feature_store_summary AS
SELECT 
  tenant_id,
  COUNT(*) as total_records,
  MIN(date) as earliest_date,
  MAX(date) as latest_date,
  AVG(quality_score) as avg_quality,
  COUNT(CASE WHEN quality_score < 0.8 THEN 1 END) as low_quality_count
FROM feature_store
GROUP BY tenant_id;

-- Function to normalize metrics to 0-1 range
CREATE OR REPLACE FUNCTION normalize_metric(raw_value integer, min_val integer DEFAULT 0, max_val integer DEFAULT 100)
RETURNS numeric(4,3) AS $$
BEGIN
  RETURN GREATEST(0, LEAST(1, (raw_value - min_val)::numeric / (max_val - min_val)::numeric));
END;
$$ LANGUAGE plpgsql;

-- Function to calculate feature store quality score
CREATE OR REPLACE FUNCTION calculate_feature_quality(
  p_tenant_id uuid,
  p_date date
) RETURNS numeric(4,3) AS $$
DECLARE
  quality_score numeric(4,3) := 1.0;
  missing_count integer := 0;
  total_fields integer := 4; -- eeat, qai, piqr, tsm
BEGIN
  -- Check for missing normalized values
  SELECT COUNT(*) INTO missing_count
  FROM feature_store
  WHERE tenant_id = p_tenant_id 
    AND date = p_date
    AND (eeat_score IS NULL OR qai_score IS NULL OR piqr_score IS NULL OR tsm_score IS NULL);
  
  -- Calculate quality score
  quality_score := 1.0 - (missing_count::numeric / total_fields::numeric);
  
  RETURN GREATEST(0, quality_score);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate quality score
CREATE OR REPLACE FUNCTION update_feature_quality()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quality_score := calculate_feature_quality(NEW.tenant_id, NEW.date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_update_feature_quality ON feature_store;
  CREATE TRIGGER trigger_update_feature_quality
    BEFORE INSERT OR UPDATE ON feature_store
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_quality();
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Sample data for testing
INSERT INTO feature_store (tenant_id, date, eeat_score, qai_score, piqr_score, tsm_score, ai_visibility_raw, trust_score_raw, zero_click_raw, ugc_health_raw, geo_trust_raw, elasticity_coefficient, regime_state, confidence_score, data_source)
VALUES 
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', CURRENT_DATE, 0.85, 0.78, 0.82, 0.91, 85, 78, 82, 91, 88, 2.45, 'normal', 0.92, 'system'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', CURRENT_DATE - INTERVAL '1 day', 0.83, 0.76, 0.80, 0.89, 83, 76, 80, 89, 86, 2.38, 'normal', 0.90, 'system'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', CURRENT_DATE - INTERVAL '2 days', 0.81, 0.74, 0.78, 0.87, 81, 74, 78, 87, 84, 2.31, 'normal', 0.88, 'system')
ON CONFLICT (tenant_id, date) DO NOTHING;
