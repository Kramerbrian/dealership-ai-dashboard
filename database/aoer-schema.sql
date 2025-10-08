-- AOER (AI Overview Exposure Rate) Database Schema
-- DealershipAI proprietary metrics system

-- AOER queries table - stores individual query performance data
CREATE TABLE IF NOT EXISTS aoer_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  week_start DATE NOT NULL,
  query_text TEXT NOT NULL,
  intent_category VARCHAR(50) NOT NULL, -- 'local', 'inventory', 'finance', 'trade', 'info', 'service', 'brand'
  monthly_volume INTEGER DEFAULT 0,
  has_ai_overview BOOLEAN DEFAULT false,
  ai_position VARCHAR(20), -- 'top', 'mid', 'bottom', 'none'
  has_our_citation BOOLEAN DEFAULT false,
  serp_position INTEGER,
  click_loss_estimate DECIMAL(10,2) DEFAULT 0,
  ai_claim_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AOER summary table - aggregated weekly metrics per tenant
CREATE TABLE IF NOT EXISTS aoer_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  week_start DATE NOT NULL,
  aoer DECIMAL(5,4) NOT NULL, -- 0-1 (percentage as decimal)
  aoer_weighted DECIMAL(5,4) NOT NULL, -- volume-weighted AOER
  risk_index DECIMAL(5,4) NOT NULL, -- calculated risk score
  total_visibility DECIMAL(5,2) NOT NULL, -- 0-100 composite score
  total_queries INTEGER DEFAULT 0,
  total_volume BIGINT DEFAULT 0,
  ai_overview_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start)
);

-- Algorithmic Visibility Index tables
CREATE TABLE IF NOT EXISTS aiv_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  week_start DATE NOT NULL,
  seo_score DECIMAL(5,2) NOT NULL, -- 0-100
  aeo_score DECIMAL(5,2) NOT NULL, -- 0-100 (AI Engine Optimization)
  geo_score DECIMAL(5,2) NOT NULL, -- 0-100
  ugc_score DECIMAL(5,2) NOT NULL, -- 0-100 (User Generated Content)
  geo_local_score DECIMAL(5,2) NOT NULL, -- 0-100
  temporal_weight DECIMAL(3,2) DEFAULT 1.0, -- 0-1
  entity_confidence DECIMAL(3,2) DEFAULT 1.0, -- 0-1
  crawl_budget_mult DECIMAL(3,2) DEFAULT 1.0, -- 0-2
  inventory_truth_mult DECIMAL(3,2) DEFAULT 1.0, -- 0-1
  clarity_scs DECIMAL(5,2) DEFAULT 0, -- Search Clarity Score
  clarity_sis DECIMAL(5,2) DEFAULT 0, -- Search Intent Score
  clarity_adi DECIMAL(5,2) DEFAULT 0, -- Answer Depth Index
  clarity_scr DECIMAL(5,2) DEFAULT 0, -- Search Context Relevance
  final_aiv DECIMAL(5,2) NOT NULL, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start)
);

CREATE TABLE IF NOT EXISTS ati_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  week_start DATE NOT NULL,
  schema_consistency DECIMAL(5,2) NOT NULL, -- 0-100
  review_legitimacy DECIMAL(5,2) NOT NULL, -- 0-100
  topical_authority DECIMAL(5,2) NOT NULL, -- 0-100
  source_credibility DECIMAL(5,2) NOT NULL, -- 0-100
  site_reliability_value DECIMAL(5,2) NOT NULL, -- 0-100
  first_page_score DECIMAL(5,2) NOT NULL, -- 0-100
  host_penalty DECIMAL(3,2) DEFAULT 0, -- 0-1
  fraud_guard_score DECIMAL(5,2) NOT NULL, -- 0-100
  local_accuracy_mult DECIMAL(3,2) DEFAULT 1.0, -- 0-1
  final_ati DECIMAL(5,2) NOT NULL, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start)
);

CREATE TABLE IF NOT EXISTS crs_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  week_start DATE NOT NULL,
  aiv_score DECIMAL(5,2) NOT NULL,
  ati_score DECIMAL(5,2) NOT NULL,
  variance_weight DECIMAL(3,2) DEFAULT 0.5,
  final_crs DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start)
);

CREATE TABLE IF NOT EXISTS elasticity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  week_start DATE NOT NULL,
  delta_rar DECIMAL(12,2) NOT NULL, -- Revenue at Risk change
  delta_aiv DECIMAL(5,2) NOT NULL, -- AIV change
  elasticity DECIMAL(10,2) NOT NULL, -- $/AIV point
  r_squared DECIMAL(5,4) NOT NULL, -- Regression quality
  confidence_interval_low DECIMAL(10,2) NOT NULL,
  confidence_interval_high DECIMAL(10,2) NOT NULL,
  is_valid BOOLEAN NOT NULL, -- R² ≥ 0.70
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, week_start)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_aoer_queries_tenant_week ON aoer_queries(tenant_id, week_start);
CREATE INDEX IF NOT EXISTS idx_aoer_queries_intent ON aoer_queries(intent_category);
CREATE INDEX IF NOT EXISTS idx_aoer_summary_tenant_week ON aoer_summary(tenant_id, week_start);
CREATE INDEX IF NOT EXISTS idx_aiv_metrics_tenant_week ON aiv_metrics(tenant_id, week_start);
CREATE INDEX IF NOT EXISTS idx_ati_metrics_tenant_week ON ati_metrics(tenant_id, week_start);
CREATE INDEX IF NOT EXISTS idx_crs_metrics_tenant_week ON crs_metrics(tenant_id, week_start);
CREATE INDEX IF NOT EXISTS idx_elasticity_metrics_tenant_week ON elasticity_metrics(tenant_id, week_start);

-- Enable RLS for multi-tenant security
ALTER TABLE aoer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE aiv_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ati_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE crs_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE elasticity_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for aoer_queries
CREATE POLICY "Users can view aoer_queries for their tenant" ON aoer_queries
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert aoer_queries for their tenant" ON aoer_queries
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS policies for aoer_summary
CREATE POLICY "Users can view aoer_summary for their tenant" ON aoer_summary
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert aoer_summary for their tenant" ON aoer_summary
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS policies for aiv_metrics
CREATE POLICY "Users can view aiv_metrics for their tenant" ON aiv_metrics
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert aiv_metrics for their tenant" ON aiv_metrics
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS policies for ati_metrics
CREATE POLICY "Users can view ati_metrics for their tenant" ON ati_metrics
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert ati_metrics for their tenant" ON ati_metrics
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS policies for crs_metrics
CREATE POLICY "Users can view crs_metrics for their tenant" ON crs_metrics
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert crs_metrics for their tenant" ON crs_metrics
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- RLS policies for elasticity_metrics
CREATE POLICY "Users can view elasticity_metrics for their tenant" ON elasticity_metrics
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Users can insert elasticity_metrics for their tenant" ON elasticity_metrics
  FOR INSERT WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Insert sample data for testing
INSERT INTO aoer_queries (tenant_id, week_start, query_text, intent_category, monthly_volume, has_ai_overview, ai_position, has_our_citation, serp_position, click_loss_estimate, ai_claim_score) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 'hybrid vs gas car cost', 'info', 5400, true, 'top', false, 3, 125.50, 85.2),
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 'what''s my car worth trade-in', 'trade', 8100, true, 'mid', false, 5, 98.75, 78.5),
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 'toyota dealer near me', 'local', 12100, true, 'bottom', true, 2, 45.25, 65.8),
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', '2025 corolla lease deal', 'finance', 4400, true, 'top', false, 4, 87.30, 82.1),
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 'brake replacement cost', 'service', 9900, false, 'none', false, 6, 0, 45.2),
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 'used honda civic for sale', 'inventory', 6600, false, 'none', false, 1, 0, 35.8),
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 'abc motors reviews', 'brand', 1600, false, 'none', false, 1, 0, 25.4)
ON CONFLICT DO NOTHING;

-- Insert sample AIV metrics
INSERT INTO aiv_metrics (tenant_id, week_start, seo_score, aeo_score, geo_score, ugc_score, geo_local_score, temporal_weight, entity_confidence, crawl_budget_mult, inventory_truth_mult, clarity_scs, clarity_sis, clarity_adi, clarity_scr, final_aiv) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 78, 85, 72, 68, 75, 0.95, 0.88, 1.2, 0.92, 82, 78, 85, 80, 79.2)
ON CONFLICT DO NOTHING;

-- Insert sample ATI metrics
INSERT INTO ati_metrics (tenant_id, week_start, schema_consistency, review_legitimacy, topical_authority, source_credibility, site_reliability_value, first_page_score, host_penalty, fraud_guard_score, local_accuracy_mult, final_ati) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 88, 75, 82, 85, 90, 78, 0.05, 92, 0.95, 81.3)
ON CONFLICT DO NOTHING;

-- Insert sample CRS metrics
INSERT INTO crs_metrics (tenant_id, week_start, aiv_score, ati_score, variance_weight, final_crs) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 79.2, 81.3, 0.5, 80.25)
ON CONFLICT DO NOTHING;

-- Insert sample elasticity metrics
INSERT INTO elasticity_metrics (tenant_id, week_start, delta_rar, delta_aiv, elasticity, r_squared, confidence_interval_low, confidence_interval_high, is_valid) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', '2024-01-15', 10500, 2.1, 5000, 0.85, 4200, 5800, true)
ON CONFLICT DO NOTHING;
