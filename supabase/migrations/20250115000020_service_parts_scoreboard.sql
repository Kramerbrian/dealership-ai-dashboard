-- Service | Parts | Body Shop Scoreboard System
-- Migration: 20250115000020_service_parts_scoreboard.sql

-- Service department visibility tracking
CREATE TABLE IF NOT EXISTS service_visibility_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  department TEXT NOT NULL, -- 'service', 'parts', 'body_shop'
  signal_type TEXT NOT NULL, -- 'seo', 'aeo', 'geo'
  metric_name TEXT NOT NULL, -- 'organic_visits', 'schema_completeness', 'core_web_vitals', 'ai_overview_inclusion', 'map_rank', 'nap_consistency'
  score DECIMAL(5,2) NOT NULL, -- 0-100
  raw_value DECIMAL(12,4), -- original metric value
  unit TEXT, -- 'visits', 'seconds', 'rank', 'percentage'
  confidence DECIMAL(3,2) DEFAULT 0.9, -- 0-1
  details JSONB, -- additional context
  source_system TEXT, -- 'gsc', 'lighthouse', 'chatgpt', 'perplexity', 'gmb', 'yelp'
  as_of TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service department revenue tracking
CREATE TABLE IF NOT EXISTS service_revenue_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  department TEXT NOT NULL, -- 'service', 'parts', 'body_shop'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  monthly_ro_volume INTEGER DEFAULT 0, -- repair orders per month
  avg_ticket DECIMAL(10,2) DEFAULT 0, -- average ticket value
  total_revenue DECIMAL(12,2) DEFAULT 0,
  organic_visits INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- visits to appointments
  revenue_at_risk DECIMAL(12,2) DEFAULT 0, -- calculated from visibility gaps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service department keywords and content tracking
CREATE TABLE IF NOT EXISTS service_keyword_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  department TEXT NOT NULL,
  keyword TEXT NOT NULL,
  keyword_type TEXT, -- 'service', 'parts', 'location', 'brand'
  search_volume INTEGER DEFAULT 0,
  current_rank INTEGER,
  target_rank INTEGER DEFAULT 10,
  url TEXT,
  page_title TEXT,
  meta_description TEXT,
  schema_present BOOLEAN DEFAULT FALSE,
  ai_mention_count INTEGER DEFAULT 0, -- mentions in AI answers
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACP commerce integration tracking
CREATE TABLE IF NOT EXISTS acp_commerce_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  transaction_type TEXT NOT NULL, -- 'trade_in', 'parts_purchase', 'service_deposit'
  transaction_id TEXT NOT NULL, -- ACP transaction ID
  vin TEXT, -- for trade-ins
  part_sku TEXT, -- for parts
  service_type TEXT, -- for service deposits
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded'
  payment_method TEXT, -- 'stripe', 'apple_pay', 'google_pay'
  fulfillment_method TEXT, -- 'pickup', 'delivery', 'in_store'
  customer_contact JSONB, -- anonymized customer data
  chat_session_id TEXT, -- ChatGPT session reference
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service department aggregated scores
CREATE TABLE IF NOT EXISTS service_visibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  dealership_id UUID,
  department TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  seo_score DECIMAL(5,2) NOT NULL, -- 0-100
  aeo_score DECIMAL(5,2) NOT NULL, -- 0-100
  geo_score DECIMAL(5,2) NOT NULL, -- 0-100
  visibility_index DECIMAL(5,2) NOT NULL, -- composite score
  revenue_at_risk DECIMAL(12,2) DEFAULT 0,
  entity_trust_level TEXT DEFAULT 'safe', -- 'safe', 'warn', 'critical'
  trend_direction TEXT, -- 'up', 'down', 'stable'
  trend_percentage DECIMAL(5,2),
  top_risks JSONB, -- array of risk factors
  recommendations JSONB, -- array of actionable recommendations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_visibility_tenant_dept ON service_visibility_signals(tenant_id, department, as_of DESC);
CREATE INDEX IF NOT EXISTS idx_service_visibility_signal_type ON service_visibility_signals(signal_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_service_revenue_tenant_dept ON service_revenue_metrics(tenant_id, department, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_service_keywords_tenant_dept ON service_keyword_coverage(tenant_id, department, keyword);
CREATE INDEX IF NOT EXISTS idx_service_keywords_rank ON service_keyword_coverage(current_rank, target_rank);
CREATE INDEX IF NOT EXISTS idx_acp_commerce_tenant ON acp_commerce_metrics(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acp_commerce_type ON acp_commerce_metrics(transaction_type, status);
CREATE INDEX IF NOT EXISTS idx_service_scores_tenant_dept ON service_visibility_scores(tenant_id, department, period_start DESC);

-- Add RLS policies
ALTER TABLE service_visibility_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_keyword_coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE acp_commerce_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_visibility_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY service_visibility_tenant_sel ON service_visibility_signals
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_visibility_tenant_ins ON service_visibility_signals
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_revenue_tenant_sel ON service_revenue_metrics
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_revenue_tenant_ins ON service_revenue_metrics
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_keywords_tenant_sel ON service_keyword_coverage
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_keywords_tenant_ins ON service_keyword_coverage
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_keywords_tenant_upd ON service_keyword_coverage
  FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY acp_commerce_tenant_sel ON acp_commerce_metrics
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY acp_commerce_tenant_ins ON acp_commerce_metrics
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_scores_tenant_sel ON service_visibility_scores
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY service_scores_tenant_ins ON service_visibility_scores
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- Function to calculate service visibility index
CREATE OR REPLACE FUNCTION calculate_service_visibility_index(
  p_tenant_id UUID,
  p_dealership_id UUID,
  p_department TEXT,
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  department TEXT,
  seo_score DECIMAL(5,2),
  aeo_score DECIMAL(5,2),
  geo_score DECIMAL(5,2),
  visibility_index DECIMAL(5,2),
  revenue_at_risk DECIMAL(12,2),
  entity_trust_level TEXT,
  trend_direction TEXT,
  trend_percentage DECIMAL(5,2),
  top_risks JSONB,
  recommendations JSONB
) AS $$
DECLARE
  v_seo_score DECIMAL(5,2) := 0;
  v_aeo_score DECIMAL(5,2) := 0;
  v_geo_score DECIMAL(5,2) := 0;
  v_visibility_index DECIMAL(5,2) := 0;
  v_revenue_at_risk DECIMAL(12,2) := 0;
  v_entity_trust_level TEXT := 'safe';
  v_trend_direction TEXT := 'stable';
  v_trend_percentage DECIMAL(5,2) := 0;
  v_monthly_ro_volume INTEGER := 0;
  v_avg_ticket DECIMAL(10,2) := 0;
  v_previous_score DECIMAL(5,2) := 0;
BEGIN
  -- Calculate SEO score (weighted average of SEO metrics)
  SELECT AVG(score) INTO v_seo_score
  FROM service_visibility_signals
  WHERE tenant_id = p_tenant_id
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND department = p_department
    AND signal_type = 'seo'
    AND as_of > NOW() - (p_period_days || ' days')::INTERVAL;

  -- Calculate AEO score (weighted average of AEO metrics)
  SELECT AVG(score) INTO v_aeo_score
  FROM service_visibility_signals
  WHERE tenant_id = p_tenant_id
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND department = p_department
    AND signal_type = 'aeo'
    AND as_of > NOW() - (p_period_days || ' days')::INTERVAL;

  -- Calculate GEO score (weighted average of GEO metrics)
  SELECT AVG(score) INTO v_geo_score
  FROM service_visibility_signals
  WHERE tenant_id = p_tenant_id
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND department = p_department
    AND signal_type = 'geo'
    AND as_of > NOW() - (p_period_days || ' days')::INTERVAL;

  -- Calculate composite visibility index
  v_visibility_index := (COALESCE(v_seo_score, 0) * 0.4) + (COALESCE(v_aeo_score, 0) * 0.4) + (COALESCE(v_geo_score, 0) * 0.2);

  -- Get revenue metrics for risk calculation
  SELECT monthly_ro_volume, avg_ticket
  INTO v_monthly_ro_volume, v_avg_ticket
  FROM service_revenue_metrics
  WHERE tenant_id = p_tenant_id
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND department = p_department
  ORDER BY period_start DESC
  LIMIT 1;

  -- Calculate revenue at risk
  v_revenue_at_risk := (1 - (v_visibility_index / 100)) * COALESCE(v_monthly_ro_volume, 100) * COALESCE(v_avg_ticket, 150);

  -- Determine entity trust level
  IF v_visibility_index >= 80 THEN
    v_entity_trust_level := 'safe';
  ELSIF v_visibility_index >= 60 THEN
    v_entity_trust_level := 'warn';
  ELSE
    v_entity_trust_level := 'critical';
  END IF;

  -- Calculate trend (compare with previous period)
  SELECT visibility_index INTO v_previous_score
  FROM service_visibility_scores
  WHERE tenant_id = p_tenant_id
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND department = p_department
    AND period_start < NOW() - (p_period_days || ' days')::INTERVAL
  ORDER BY period_start DESC
  LIMIT 1;

  IF v_previous_score > 0 THEN
    v_trend_percentage := ((v_visibility_index - v_previous_score) / v_previous_score) * 100;
    IF v_trend_percentage > 2 THEN
      v_trend_direction := 'up';
    ELSIF v_trend_percentage < -2 THEN
      v_trend_direction := 'down';
    ELSE
      v_trend_direction := 'stable';
    END IF;
  END IF;

  RETURN QUERY SELECT 
    p_department,
    COALESCE(v_seo_score, 0),
    COALESCE(v_aeo_score, 0),
    COALESCE(v_geo_score, 0),
    v_visibility_index,
    v_revenue_at_risk,
    v_entity_trust_level,
    v_trend_direction,
    v_trend_percentage,
    jsonb_build_array(
      CASE WHEN v_seo_score < 70 THEN 'Low SEO visibility' END,
      CASE WHEN v_aeo_score < 70 THEN 'Poor AI engine coverage' END,
      CASE WHEN v_geo_score < 70 THEN 'Weak local search presence' END
    ) FILTER (WHERE CASE WHEN v_seo_score < 70 THEN 'Low SEO visibility' END IS NOT NULL),
    jsonb_build_array(
      'Add ServiceSchema to key service pages',
      'Optimize for AI-friendly content structure',
      'Improve Google Business Profile completeness',
      'Enhance local keyword targeting'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get ACP commerce summary
CREATE OR REPLACE FUNCTION get_acp_commerce_summary(
  p_tenant_id UUID,
  p_dealership_id UUID DEFAULT NULL,
  p_period_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_transactions INTEGER,
  total_revenue DECIMAL(12,2),
  trade_ins INTEGER,
  parts_purchases INTEGER,
  service_deposits INTEGER,
  avg_transaction_value DECIMAL(10,2),
  top_transaction_types JSONB
) AS $$
DECLARE
  v_total_transactions INTEGER := 0;
  v_total_revenue DECIMAL(12,2) := 0;
  v_trade_ins INTEGER := 0;
  v_parts_purchases INTEGER := 0;
  v_service_deposits INTEGER := 0;
  v_avg_transaction_value DECIMAL(10,2) := 0;
BEGIN
  -- Get transaction counts and revenue
  SELECT 
    COUNT(*),
    SUM(amount),
    COUNT(*) FILTER (WHERE transaction_type = 'trade_in'),
    COUNT(*) FILTER (WHERE transaction_type = 'parts_purchase'),
    COUNT(*) FILTER (WHERE transaction_type = 'service_deposit'),
    AVG(amount)
  INTO v_total_transactions, v_total_revenue, v_trade_ins, v_parts_purchases, v_service_deposits, v_avg_transaction_value
  FROM acp_commerce_metrics
  WHERE tenant_id = p_tenant_id
    AND (p_dealership_id IS NULL OR dealership_id = p_dealership_id)
    AND created_at > NOW() - (p_period_days || ' days')::INTERVAL
    AND status = 'completed';

  RETURN QUERY SELECT 
    v_total_transactions,
    v_total_revenue,
    v_trade_ins,
    v_parts_purchases,
    v_service_deposits,
    v_avg_transaction_value,
    jsonb_build_object(
      'trade_in', v_trade_ins,
      'parts_purchase', v_parts_purchases,
      'service_deposit', v_service_deposits
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON service_visibility_signals TO authenticated;
GRANT SELECT ON service_revenue_metrics TO authenticated;
GRANT SELECT ON service_keyword_coverage TO authenticated;
GRANT SELECT ON acp_commerce_metrics TO authenticated;
GRANT SELECT ON service_visibility_scores TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_service_visibility_index TO authenticated;
GRANT EXECUTE ON FUNCTION get_acp_commerce_summary TO authenticated;
