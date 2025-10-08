-- DealershipAI Database Schema - Simplified Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and types (clean slate)
DROP TABLE IF EXISTS api_usage CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS market_analysis CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;
DROP TABLE IF EXISTS score_history CASCADE;
DROP TABLE IF EXISTS dealership_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS review_sentiment CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS tenant_type CASCADE;

-- Create custom types
CREATE TYPE tenant_type AS ENUM ('single', 'dealership', 'enterprise');
CREATE TYPE user_role AS ENUM ('superadmin', 'enterprise_admin', 'dealership_admin', 'user');
CREATE TYPE subscription_tier AS ENUM ('test_drive', 'tier_1', 'tier_2', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type tenant_type NOT NULL DEFAULT 'single',
    parent_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_org_id VARCHAR(255) UNIQUE,
    subscription_tier subscription_tier NOT NULL DEFAULT 'test_drive',
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    mrr DECIMAL(10,2) DEFAULT 0,
    rooftop_count INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'user',
    permissions TEXT[] DEFAULT ARRAY['view:own_data'],
    last_seen_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dealership_data table
CREATE TABLE dealership_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),
    seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
    aeo_score INTEGER CHECK (aeo_score >= 0 AND aeo_score <= 100),
    geo_score INTEGER CHECK (geo_score >= 0 AND geo_score <= 100),
    eeat_score INTEGER CHECK (eeat_score >= 0 AND eeat_score <= 100),
    domain VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website_url TEXT,
    google_my_business_url TEXT,
    social_media JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    services JSONB DEFAULT '[]',
    brands JSONB DEFAULT '[]',
    established_date DATE,
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    tier INTEGER CHECK (tier IN (1, 2, 3)),
    raw_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create score_history table
CREATE TABLE score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID NOT NULL REFERENCES dealership_data(id) ON DELETE CASCADE,
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),
    seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
    aeo_score INTEGER CHECK (aeo_score >= 0 AND aeo_score <= 100),
    geo_score INTEGER CHECK (geo_score >= 0 AND geo_score <= 100),
    eeat_score INTEGER CHECK (eeat_score >= 0 AND eeat_score <= 100),
    raw_scores JSONB DEFAULT '{}',
    scoring_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competitors table
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID NOT NULL REFERENCES dealership_data(id) ON DELETE CASCADE,
    competitor_domain VARCHAR(255) NOT NULL,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_type VARCHAR(50) DEFAULT 'direct',
    market_share DECIMAL(5,2),
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),
    seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
    aeo_score INTEGER CHECK (aeo_score >= 0 AND aeo_score <= 100),
    geo_score INTEGER CHECK (geo_score >= 0 AND geo_score <= 100),
    eeat_score INTEGER CHECK (eeat_score >= 0 AND eeat_score <= 100),
    analysis_data JSONB DEFAULT '{}',
    last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create market_analysis table
CREATE TABLE market_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID NOT NULL REFERENCES dealership_data(id) ON DELETE CASCADE,
    market_name VARCHAR(255) NOT NULL,
    market_type VARCHAR(50) DEFAULT 'local',
    total_dealerships INTEGER DEFAULT 0,
    average_ai_visibility_score DECIMAL(5,2),
    market_leader_domain VARCHAR(255),
    market_leader_score INTEGER CHECK (market_leader_score >= 0 AND market_leader_score <= 100),
    market_trends JSONB DEFAULT '{}',
    competitive_landscape JSONB DEFAULT '{}',
    opportunities JSONB DEFAULT '[]',
    threats JSONB DEFAULT '[]',
    analysis_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_usage table
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    api_provider VARCHAR(50) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    cost_usd DECIMAL(10,4) DEFAULT 0,
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    usage_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tenants_clerk_org_id ON tenants(clerk_org_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_dealership_data_tenant_id ON dealership_data(tenant_id);
CREATE INDEX idx_dealership_data_domain ON dealership_data(domain);
CREATE INDEX idx_score_history_dealership_id ON score_history(dealership_id);
CREATE INDEX idx_score_history_created_at ON score_history(created_at DESC);
CREATE INDEX idx_competitors_dealership_id ON competitors(dealership_id);
CREATE INDEX idx_market_analysis_dealership_id ON market_analysis(dealership_id);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_api_usage_tenant_id ON api_usage(tenant_id);
CREATE INDEX idx_api_usage_usage_date ON api_usage(usage_date);

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic tenant isolation)
CREATE POLICY "Users can view own tenant data" ON tenants FOR SELECT USING (id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant users" ON users FOR SELECT USING (tenant_id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant dealerships" ON dealership_data FOR SELECT USING (tenant_id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant scores" ON score_history FOR SELECT USING (tenant_id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant competitors" ON competitors FOR SELECT USING (tenant_id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant market analysis" ON market_analysis FOR SELECT USING (tenant_id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant audit logs" ON audit_log FOR SELECT USING (tenant_id = auth.uid()::uuid);
CREATE POLICY "Users can view own tenant api usage" ON api_usage FOR SELECT USING (tenant_id = auth.uid()::uuid);

-- Insert sample data for testing
INSERT INTO tenants (id, name, type, subscription_tier, subscription_status, mrr, rooftop_count) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Demo Dealership Group', 'enterprise', 'enterprise', 'active', 2500.00, 5),
    ('550e8400-e29b-41d4-a716-446655440001', 'Test Auto Group', 'dealership', 'tier_2', 'active', 500.00, 2);

INSERT INTO users (id, clerk_id, tenant_id, email, full_name, role, permissions) VALUES
    ('650e8400-e29b-41d4-a716-446655440000', 'user_2abc123def456', '550e8400-e29b-41d4-a716-446655440000', 'admin@demodealership.com', 'Demo Admin', 'enterprise_admin', ARRAY['view:all', 'edit:all', 'delete:all']),
    ('650e8400-e29b-41d4-a716-446655440001', 'user_2xyz789ghi012', '550e8400-e29b-41d4-a716-446655440001', 'manager@testautogroup.com', 'Test Manager', 'dealership_admin', ARRAY['view:all', 'edit:all']);

INSERT INTO dealership_data (id, tenant_id, ai_visibility_score, seo_score, aeo_score, geo_score, eeat_score, domain, name, city, state, zip_code, phone, email, website_url, tier, established_date) VALUES
    ('750e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 85, 88, 82, 87, 83, 'demodealership.com', 'Demo Dealership', 'Demo City', 'DC', '12345', '(555) 123-4567', 'info@demodealership.com', 'https://demodealership.com', 1, '2020-01-01'),
    ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 72, 75, 68, 74, 71, 'testautogroup.com', 'Test Auto Group', 'Test City', 'TC', '67890', '(555) 987-6543', 'info@testautogroup.com', 'https://testautogroup.com', 2, '2018-06-15');

INSERT INTO score_history (id, tenant_id, dealership_id, ai_visibility_score, seo_score, aeo_score, geo_score, eeat_score, raw_scores) VALUES
    ('850e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440000', 85, 88, 82, 87, 83, '{"seo": {"organic_rankings": 88, "backlink_authority": 85, "content_indexation": 90}, "aeo": {"ai_citations": 82, "source_authority": 80, "answer_completeness": 85}, "geo": {"ai_overview_presence": 87, "featured_snippets": 85, "knowledge_panel": 90}, "eeat": {"experience": 83, "expertise": 85, "authoritativeness": 82, "trustworthiness": 84}}'),
    ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 72, 75, 68, 74, 71, '{"seo": {"organic_rankings": 75, "backlink_authority": 70, "content_indexation": 80}, "aeo": {"ai_citations": 68, "source_authority": 65, "answer_completeness": 72}, "geo": {"ai_overview_presence": 74, "featured_snippets": 72, "knowledge_panel": 76}, "eeat": {"experience": 71, "expertise": 73, "authoritativeness": 70, "trustworthiness": 72}}');

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dealership_data_updated_at BEFORE UPDATE ON dealership_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully! 🎉' as status;
