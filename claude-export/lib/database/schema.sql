-- DealershipAI Ultimate Database Schema
-- Supabase PostgreSQL with Row Level Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Dealerships table
CREATE TABLE dealerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  city VARCHAR(100),
  state VARCHAR(2),
  tier VARCHAR(20) DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO', 'ENTERPRISE')),
  sessions_used INT DEFAULT 0,
  sessions_limit INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table (linked to Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'enterprise_admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- QAI Scores table
CREATE TABLE qai_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  -- QAI Components
  qai_star_score DECIMAL(5,2) CHECK (qai_star_score >= 0 AND qai_star_score <= 100),
  authority_velocity DECIMAL(5,2),
  oci_value DECIMAL(10,2),
  
  -- 5 Pillars
  ai_visibility DECIMAL(5,2) CHECK (ai_visibility >= 0 AND ai_visibility <= 100),
  zero_click_shield DECIMAL(5,2) CHECK (zero_click_shield >= 0 AND zero_click_shield <= 100),
  ugc_health DECIMAL(5,2) CHECK (ugc_health >= 0 AND ugc_health <= 100),
  geo_trust DECIMAL(5,2) CHECK (geo_trust >= 0 AND geo_trust <= 100),
  sgp_integrity DECIMAL(5,2) CHECK (sgp_integrity >= 0 AND sgp_integrity <= 100),
  
  -- Risk Scores
  piqr_score DECIMAL(5,2) DEFAULT 1.0,
  hrp_score DECIMAL(5,2) DEFAULT 0.0,
  vai_penalized DECIMAL(5,2) CHECK (vai_penalized >= 0 AND vai_penalized <= 100),
  
  -- SEO/AEO/GEO Breakdown
  seo_score DECIMAL(5,2) CHECK (seo_score >= 0 AND seo_score <= 100),
  aeo_score DECIMAL(5,2) CHECK (aeo_score >= 0 AND aeo_score <= 100),
  geo_score DECIMAL(5,2) CHECK (geo_score >= 0 AND geo_score <= 100),
  
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- E-E-A-T Scores table
CREATE TABLE eeat_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  experience DECIMAL(5,2) CHECK (experience >= 0 AND experience <= 100),
  expertise DECIMAL(5,2) CHECK (expertise >= 0 AND expertise <= 100),
  authoritativeness DECIMAL(5,2) CHECK (authoritativeness >= 0 AND authoritativeness <= 100),
  trustworthiness DECIMAL(5,2) CHECK (trustworthiness >= 0 AND trustworthiness <= 100),
  
  -- Sub-components
  page_performance_index DECIMAL(5,2) CHECK (page_performance_index >= 0 AND page_performance_index <= 100),
  structured_discoverability_index DECIMAL(5,2) CHECK (structured_discoverability_index >= 0 AND structured_discoverability_index <= 100),
  local_surface_index DECIMAL(5,2) CHECK (local_surface_index >= 0 AND local_surface_index <= 100),
  trust_authority_score DECIMAL(5,2) CHECK (trust_authority_score >= 0 AND trust_authority_score <= 100),
  answer_share DECIMAL(5,2) CHECK (answer_share >= 0 AND answer_share <= 100),
  audience_integrity_score DECIMAL(5,2) CHECK (audience_integrity_score >= 0 AND audience_integrity_score <= 100),
  
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- AI Platform Scores table
CREATE TABLE ai_platform_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'copilot', 'grok')),
  visibility_score DECIMAL(5,2) CHECK (visibility_score >= 0 AND visibility_score <= 100),
  mentions INT DEFAULT 0,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  rank INT,
  market_share DECIMAL(5,2) CHECK (market_share >= 0 AND market_share <= 100),
  
  measured_at TIMESTAMP DEFAULT NOW()
);

-- Competitors table
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  city VARCHAR(100),
  rank INT,
  qai_score DECIMAL(5,2) CHECK (qai_score >= 0 AND qai_score <= 100),
  score_change DECIMAL(5,2),
  gap INT,
  weaknesses TEXT[],
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quick Wins table
CREATE TABLE quick_wins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('schema', 'reviews', 'citations', 'content', 'seo', 'aeo', 'geo')),
  
  impact_points DECIMAL(5,2) CHECK (impact_points >= 0),
  revenue_monthly DECIMAL(10,2) CHECK (revenue_monthly >= 0),
  effort VARCHAR(20) CHECK (effort IN ('easy', 'medium', 'hard')),
  time_to_fix VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('critical', 'high', 'medium', 'low')),
  
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mystery Shops table (Enterprise only)
CREATE TABLE mystery_shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  shop_type VARCHAR(50) CHECK (shop_type IN ('email', 'chat', 'phone', 'form')),
  query_text TEXT,
  response_text TEXT,
  
  -- Scoring (0-100 each)
  response_time_score DECIMAL(5,2) CHECK (response_time_score >= 0 AND response_time_score <= 100),
  personalization_score DECIMAL(5,2) CHECK (personalization_score >= 0 AND personalization_score <= 100),
  transparency_score DECIMAL(5,2) CHECK (transparency_score >= 0 AND transparency_score <= 100),
  followup_score DECIMAL(5,2) CHECK (followup_score >= 0 AND followup_score <= 100),
  professionalism_score DECIMAL(5,2) CHECK (professionalism_score >= 0 AND professionalism_score <= 100),
  
  overall_score DECIMAL(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  
  conducted_at TIMESTAMP DEFAULT NOW()
);

-- Activity Log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  action VARCHAR(255) NOT NULL,
  target VARCHAR(255),
  delta VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Geographic Pooling table
CREATE TABLE geo_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city VARCHAR(100),
  state VARCHAR(2),
  
  pooled_scores JSONB,
  dealer_count INT DEFAULT 0,
  
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Session Tracking table
CREATE TABLE session_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  action_type VARCHAR(50) CHECK (action_type IN ('score_refresh', 'report_export', 'mystery_shop', 'competitor_analysis', 'ai_chat_query', 'schema_generate', 'review_draft')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- VCO Model Storage table
CREATE TABLE vco_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  
  vdp_id VARCHAR(255),
  vdp_features JSONB,
  
  conversion_probability DECIMAL(5,2) CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  shap_values JSONB,
  recommended_actions JSONB,
  
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_dealerships_domain ON dealerships(domain);
CREATE INDEX idx_dealerships_tier ON dealerships(tier);
CREATE INDEX idx_qai_scores_dealership ON qai_scores(dealership_id);
CREATE INDEX idx_qai_scores_calculated ON qai_scores(calculated_at);
CREATE INDEX idx_ai_platforms_dealership ON ai_platform_scores(dealership_id);
CREATE INDEX idx_ai_platforms_platform ON ai_platform_scores(platform);
CREATE INDEX idx_competitors_dealership ON competitors(dealership_id);
CREATE INDEX idx_competitors_rank ON competitors(rank);
CREATE INDEX idx_quick_wins_dealership ON quick_wins(dealership_id);
CREATE INDEX idx_quick_wins_status ON quick_wins(status);
CREATE INDEX idx_mystery_shops_dealership ON mystery_shops(dealership_id);
CREATE INDEX idx_geo_pools_location ON geo_pools(city, state);
CREATE INDEX idx_session_logs_dealership ON session_logs(dealership_id);
CREATE INDEX idx_session_logs_action ON session_logs(action_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE qai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE eeat_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_platform_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vco_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their dealership data" ON dealerships
  FOR SELECT USING (
    id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view their dealership's scores" ON qai_scores
  FOR SELECT USING (
    dealership_id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view their dealership's E-E-A-T scores" ON eeat_scores
  FOR SELECT USING (
    dealership_id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view their dealership's AI platform scores" ON ai_platform_scores
  FOR SELECT USING (
    dealership_id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view their dealership's competitors" ON competitors
  FOR SELECT USING (
    dealership_id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can view their dealership's quick wins" ON quick_wins
  FOR SELECT USING (
    dealership_id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Enterprise users can view mystery shops" ON mystery_shops
  FOR SELECT USING (
    dealership_id IN (
      SELECT dealership_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    ) AND dealership_id IN (
      SELECT id FROM dealerships WHERE tier = 'ENTERPRISE'
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON dealerships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Session limit enforcement function
CREATE OR REPLACE FUNCTION check_session_limit(
  p_dealership_id UUID,
  p_action_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier VARCHAR(20);
  v_sessions_used INT;
  v_sessions_limit INT;
  v_action_cost INT;
BEGIN
  -- Get dealership tier and session info
  SELECT tier, sessions_used, sessions_limit
  INTO v_tier, v_sessions_used, v_sessions_limit
  FROM dealerships
  WHERE id = p_dealership_id;
  
  -- Define action costs
  v_action_cost := CASE p_action_type
    WHEN 'score_refresh' THEN 1
    WHEN 'competitor_analysis' THEN 2
    WHEN 'report_export' THEN 1
    WHEN 'ai_chat_query' THEN 1
    WHEN 'mystery_shop' THEN 5
    ELSE 0
  END;
  
  -- Check if action is allowed
  IF v_sessions_used + v_action_cost > v_sessions_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Update session count
  UPDATE dealerships
  SET sessions_used = sessions_used + v_action_cost
  WHERE id = p_dealership_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default session limits by tier
UPDATE dealerships SET sessions_limit = 0 WHERE tier = 'FREE';
UPDATE dealerships SET sessions_limit = 50 WHERE tier = 'PRO';
UPDATE dealerships SET sessions_limit = 200 WHERE tier = 'ENTERPRISE';
