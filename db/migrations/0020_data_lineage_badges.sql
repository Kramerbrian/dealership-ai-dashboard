-- Data Lineage Badges - Track data source, freshness, and verification
CREATE TABLE IF NOT EXISTS data_lineage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  data_source text NOT NULL, -- 'google_analytics', 'google_search_console', 'manual_entry', etc.
  source_type text NOT NULL CHECK (source_type IN ('api', 'scrape', 'manual', 'webhook', 'import')),
  entity_type text NOT NULL, -- 'kpi', 'listing', 'trend', 'alert', etc.
  entity_id text NOT NULL,
  data_hash text NOT NULL, -- hash of the actual data for change detection
  fetched_at timestamptz NOT NULL,
  verified_at timestamptz,
  verified_by text, -- user_id or 'system'
  verification_method text, -- 'manual', 'cross_check', 'api_validation', etc.
  confidence_score numeric(3,2) DEFAULT 1.0, -- 0.0 to 1.0
  metadata jsonb, -- additional context about the data
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS data_quality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  panel_id text NOT NULL, -- identifies which dashboard panel
  panel_type text NOT NULL, -- 'kpi', 'chart', 'table', etc.
  freshness_score numeric(3,2) NOT NULL, -- 0.0 to 1.0
  coverage_score numeric(3,2) NOT NULL, -- 0.0 to 1.0
  parity_score numeric(3,2) NOT NULL, -- 0.0 to 1.0
  overall_score numeric(3,2) NOT NULL, -- weighted average
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Materialized view for data quality dashboard
CREATE MATERIALIZED VIEW data_quality_overview_mv AS
SELECT 
  tenant_id,
  panel_id,
  panel_type,
  overall_score,
  freshness_score,
  coverage_score,
  parity_score,
  last_updated,
  CASE 
    WHEN overall_score >= 0.9 THEN 'excellent'
    WHEN overall_score >= 0.7 THEN 'good'
    WHEN overall_score >= 0.5 THEN 'fair'
    ELSE 'poor'
  END as quality_status
FROM data_quality_scores
WHERE last_updated >= NOW() - INTERVAL '7 days';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_lineage_tenant_entity ON data_lineage_tracking (tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_data_lineage_fetched_at ON data_lineage_tracking (fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_quality_scores_tenant_panel ON data_quality_scores (tenant_id, panel_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_overview_mv_tenant ON data_quality_overview_mv (tenant_id);

-- Function to calculate data quality scores
CREATE OR REPLACE FUNCTION calculate_data_quality_score(
  p_tenant_id uuid,
  p_panel_id text,
  p_panel_type text
) RETURNS void AS $$
DECLARE
  v_freshness_score numeric(3,2);
  v_coverage_score numeric(3,2);
  v_parity_score numeric(3,2);
  v_overall_score numeric(3,2);
  v_hours_old numeric;
BEGIN
  -- Calculate freshness score (penalize data older than 24 hours)
  SELECT EXTRACT(EPOCH FROM (NOW() - MAX(fetched_at))) / 3600 INTO v_hours_old
  FROM data_lineage_tracking 
  WHERE tenant_id = p_tenant_id 
    AND entity_type = p_panel_type;
  
  v_freshness_score := GREATEST(0, 1.0 - (v_hours_old / 24.0));
  
  -- Calculate coverage score (based on expected vs actual data points)
  -- This would need to be customized per panel type
  v_coverage_score := 0.85; -- Placeholder - implement based on business logic
  
  -- Calculate parity score (consistency across data sources)
  v_parity_score := 0.90; -- Placeholder - implement based on cross-source validation
  
  -- Calculate overall weighted score
  v_overall_score := (v_freshness_score * 0.4) + (v_coverage_score * 0.3) + (v_parity_score * 0.3);
  
  -- Insert or update the quality score
  INSERT INTO data_quality_scores (tenant_id, panel_id, panel_type, freshness_score, coverage_score, parity_score, overall_score)
  VALUES (p_tenant_id, p_panel_id, p_panel_type, v_freshness_score, v_coverage_score, v_parity_score, v_overall_score)
  ON CONFLICT (tenant_id, panel_id) 
  DO UPDATE SET 
    freshness_score = EXCLUDED.freshness_score,
    coverage_score = EXCLUDED.coverage_score,
    parity_score = EXCLUDED.parity_score,
    overall_score = EXCLUDED.overall_score,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
