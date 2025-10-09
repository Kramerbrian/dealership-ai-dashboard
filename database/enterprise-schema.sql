-- DealershipAI Enterprise Database Schema
-- Multi-tenant SaaS platform for automotive AI intelligence
-- Supports 5,000+ dealerships with 4-tier RBAC

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- CORE TENANT MANAGEMENT
-- ==============================================

-- Tenants table (multi-tenant root)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('enterprise', 'dealership', 'single')),
  parent_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) UNIQUE,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'US',
  established_date DATE,
  tier INTEGER NOT NULL DEFAULT 1 CHECK (tier IN (1, 2, 3, 4)), -- 1=Test Drive, 2=Intelligence, 3=Boss Mode, 4=Enterprise
  settings JSONB DEFAULT '{}',
  billing_customer_id VARCHAR(255), -- Stripe customer ID
  subscription_id VARCHAR(255), -- Stripe subscription ID
  subscription_status VARCHAR(50) DEFAULT 'inactive', -- active, trialing, past_due, canceled, etc.
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with RBAC
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL CHECK (role IN ('superadmin', 'enterprise_admin', 'dealership_admin', 'user')),
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- DEALERSHIP DATA & ANALYTICS
-- ==============================================

-- Dealership data with tenant isolation
CREATE TABLE dealership_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  
  -- SEO Scores
  seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
  seo_components JSONB DEFAULT '{}',
  seo_confidence DECIMAL(3,2) CHECK (seo_confidence >= 0 AND seo_confidence <= 1),
  
  -- AI Engine Optimization (AEO) Scores
  aeo_score INTEGER CHECK (aeo_score >= 0 AND aeo_score <= 100),
  aeo_components JSONB DEFAULT '{}',
  aeo_mentions INTEGER DEFAULT 0,
  aeo_queries INTEGER DEFAULT 0,
  aeo_mention_rate DECIMAL(5,2),
  
  -- Geographic Optimization Scores
  geo_score INTEGER CHECK (geo_score >= 0 AND geo_score <= 100),
  geo_components JSONB DEFAULT '{}',
  sge_appearance_rate DECIMAL(5,2),
  
  -- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
  eeat_experience INTEGER CHECK (eeat_experience >= 0 AND eeat_experience <= 100),
  eeat_expertise INTEGER CHECK (eeat_expertise >= 0 AND eeat_expertise <= 100),
  eeat_authoritativeness INTEGER CHECK (eeat_authoritativeness >= 0 AND eeat_authoritativeness <= 100),
  eeat_trustworthiness INTEGER CHECK (eeat_trustworthiness >= 0 AND eeat_trustworthiness <= 100),
  eeat_overall INTEGER CHECK (eeat_overall >= 0 AND eeat_overall <= 100),
  eeat_confidence DECIMAL(3,2) CHECK (eeat_confidence >= 0 AND eeat_confidence <= 1),
  
  -- Overall scoring
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  
  -- Raw data and metadata
  raw_data JSONB DEFAULT '{}',
  last_analyzed TIMESTAMP WITH TIME ZONE,
  analysis_version VARCHAR(20) DEFAULT '1.0.0',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, domain)
);

-- ==============================================
-- AOER (AI Overview Exposure Rate) METRICS
-- ==============================================

-- AOER queries tracking
CREATE TABLE aoer_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  intent VARCHAR(50) NOT NULL, -- informational, navigational, transactional
  ai_pos INTEGER NOT NULL, -- AI position in results
  click_through_rate DECIMAL(5,4),
  ai_claim_score DECIMAL(5,4),
  click_loss DECIMAL(5,4),
  priority_score DECIMAL(5,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AOER summary rollups
CREATE TABLE aoer_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_queries INTEGER DEFAULT 0,
  total_ai_positions INTEGER DEFAULT 0,
  avg_ai_pos DECIMAL(5,2),
  avg_click_through_rate DECIMAL(5,4),
  avg_ai_claim_score DECIMAL(5,4),
  avg_click_loss DECIMAL(5,4),
  priority_queries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, date)
);

-- ==============================================
-- BILLING & SUBSCRIPTIONS
-- ==============================================

-- Stripe billing events
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  billing_period DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- AUDIT LOGGING
-- ==============================================

-- Audit log for compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aoer_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenant isolation
-- Users can only see data from their tenant
CREATE POLICY tenant_isolation_users ON users
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_dealership_data ON dealership_data
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_aoer_queries ON aoer_queries
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_aoer_summary ON aoer_summary
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_billing_events ON billing_events
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY tenant_isolation_usage_tracking ON usage_tracking
  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- SuperAdmin can see all data
CREATE POLICY superadmin_access ON tenants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.clerk_id = current_setting('app.current_user_id') 
      AND users.role = 'superadmin'
    )
  );

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Function to compute AOER summary
CREATE OR REPLACE FUNCTION compute_aoer_summary()
RETURNS void AS $$
BEGIN
  INSERT INTO aoer_summary (
    tenant_id,
    date,
    total_queries,
    total_ai_positions,
    avg_ai_pos,
    avg_click_through_rate,
    avg_ai_claim_score,
    avg_click_loss,
    priority_queries
  )
  SELECT 
    tenant_id,
    CURRENT_DATE,
    COUNT(*) as total_queries,
    SUM(ai_pos) as total_ai_positions,
    AVG(ai_pos) as avg_ai_pos,
    AVG(click_through_rate) as avg_click_through_rate,
    AVG(ai_claim_score) as avg_ai_claim_score,
    AVG(click_loss) as avg_click_loss,
    COUNT(*) FILTER (WHERE priority_score > 0.7) as priority_queries
  FROM aoer_queries
  WHERE created_at >= CURRENT_DATE
  GROUP BY tenant_id
  ON CONFLICT (tenant_id, date) 
  DO UPDATE SET
    total_queries = EXCLUDED.total_queries,
    total_ai_positions = EXCLUDED.total_ai_positions,
    avg_ai_pos = EXCLUDED.avg_ai_pos,
    avg_click_through_rate = EXCLUDED.avg_click_through_rate,
    avg_ai_claim_score = EXCLUDED.avg_ai_claim_score,
    avg_click_loss = EXCLUDED.avg_click_loss,
    priority_queries = EXCLUDED.priority_queries;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealership_data_updated_at BEFORE UPDATE ON dealership_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Tenant-based indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_dealership_data_tenant_id ON dealership_data(tenant_id);
CREATE INDEX idx_aoer_queries_tenant_id ON aoer_queries(tenant_id);
CREATE INDEX idx_aoer_summary_tenant_id ON aoer_summary(tenant_id);
CREATE INDEX idx_billing_events_tenant_id ON billing_events(tenant_id);
CREATE INDEX idx_usage_tracking_tenant_id ON usage_tracking(tenant_id);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- Performance indexes
CREATE INDEX idx_dealership_data_domain ON dealership_data(domain);
CREATE INDEX idx_aoer_queries_created_at ON aoer_queries(created_at);
CREATE INDEX idx_aoer_summary_date ON aoer_summary(date);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ==============================================
-- INITIAL DATA
-- ==============================================

-- Create default superadmin tenant
INSERT INTO tenants (id, name, type, tier, subscription_status) 
VALUES ('00000000-0000-0000-0000-000000000000', 'DealershipAI Platform', 'enterprise', 4, 'active');
