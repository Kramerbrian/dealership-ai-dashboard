-- DealershipAI Database Schema
-- This file contains all the necessary tables for the DealershipAI platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'enterprise_admin', 'dealership_admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TYPE audit_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE optimization_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tenants table (multi-tenant architecture)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Dealerships table
CREATE TABLE IF NOT EXISTS dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    website_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- AI Visibility Audits table
CREATE TABLE IF NOT EXISTS ai_visibility_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    status audit_status DEFAULT 'pending',
    
    -- AI Visibility Scores
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),
    zero_click_score INTEGER CHECK (zero_click_score >= 0 AND zero_click_score <= 100),
    ugc_health_score INTEGER CHECK (ugc_health_score >= 0 AND ugc_health_score <= 100),
    geo_trust_score INTEGER CHECK (geo_trust_score >= 0 AND geo_trust_score <= 100),
    sgp_integrity_score INTEGER CHECK (sgp_integrity_score >= 0 AND sgp_integrity_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- Trust Scores
    authority_score INTEGER CHECK (authority_score >= 0 AND authority_score <= 100),
    expertise_score INTEGER CHECK (expertise_score >= 0 AND expertise_score <= 100),
    experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100),
    transparency_score INTEGER CHECK (transparency_score >= 0 AND transparency_score <= 100),
    consistency_score INTEGER CHECK (consistency_score >= 0 AND consistency_score <= 100),
    freshness_score INTEGER CHECK (freshness_score >= 0 AND freshness_score <= 100),
    overall_trust_score INTEGER CHECK (overall_trust_score >= 0 AND overall_trust_score <= 100),
    
    -- Metadata
    audit_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Optimization Recommendations table
CREATE TABLE IF NOT EXISTS optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    audit_id UUID REFERENCES ai_visibility_audits(id) ON DELETE CASCADE,
    
    -- Recommendation details
    actionable_win TEXT NOT NULL,
    opportunity TEXT NOT NULL,
    score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
    explanation TEXT NOT NULL,
    
    -- Categorization
    category VARCHAR(50) CHECK (category IN ('seo', 'aeo', 'geo', 'ai_visibility', 'content', 'technical', 'local')),
    priority optimization_priority DEFAULT 'medium',
    effort_level VARCHAR(20) CHECK (effort_level IN ('low', 'medium', 'high')),
    impact_level VARCHAR(20) CHECK (impact_level IN ('low', 'medium', 'high')),
    
    -- Implementation details
    estimated_time VARCHAR(50),
    required_skills TEXT[],
    tools_needed TEXT[],
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Citations tracking table
CREATE TABLE IF NOT EXISTS ai_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Citation details
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('chatgpt', 'claude', 'perplexity', 'gemini', 'google_sge')),
    query TEXT NOT NULL,
    response_text TEXT,
    citation_position INTEGER,
    confidence_score DECIMAL(3,2),
    
    -- Metadata
    citation_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor Analysis table
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Competitor details
    competitor_name VARCHAR(255) NOT NULL,
    competitor_domain VARCHAR(255),
    competitor_score INTEGER CHECK (competitor_score >= 0 AND competitor_score <= 100),
    
    -- Analysis data
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Feed table
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    message TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_dealerships_tenant_id ON dealerships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dealerships_domain ON dealerships(domain);
CREATE INDEX IF NOT EXISTS idx_audits_dealership_id ON ai_visibility_audits(dealership_id);
CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON ai_visibility_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON ai_visibility_audits(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_dealership_id ON optimization_recommendations(dealership_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_tenant_id ON optimization_recommendations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_citations_dealership_id ON ai_citations(dealership_id);
CREATE INDEX IF NOT EXISTS idx_citations_platform ON ai_citations(platform);
CREATE INDEX IF NOT EXISTS idx_citations_created_at ON ai_citations(created_at);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_dealership_id ON competitor_analysis(dealership_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_tenant_id ON activity_feed(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_visibility_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant isolation
DO $$ BEGIN
    CREATE POLICY "Users can only see their tenant data" ON users
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Dealerships are isolated by tenant" ON dealerships
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Audits are isolated by tenant" ON ai_visibility_audits
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Recommendations are isolated by tenant" ON optimization_recommendations
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Citations are isolated by tenant" ON ai_citations
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Competitor analysis is isolated by tenant" ON competitor_analysis
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Activity feed is isolated by tenant" ON activity_feed
        FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON dealerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON ai_visibility_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_recommendations_updated_at BEFORE UPDATE ON optimization_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_competitor_analysis_updated_at BEFORE UPDATE ON competitor_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert sample data
INSERT INTO tenants (name, domain) VALUES 
('DealershipAI Demo', 'demo.dealershipai.com'),
('Enterprise Customer', 'enterprise.dealershipai.com')
ON CONFLICT (domain) DO NOTHING;

-- Insert sample dealerships
INSERT INTO dealerships (tenant_id, name, domain, website_url, city, state, phone, email) VALUES 
((SELECT id FROM tenants WHERE domain = 'demo.dealershipai.com'), 'ABC Toyota', 'abctoyota.com', 'https://abctoyota.com', 'Austin', 'TX', '(555) 123-4567', 'info@abctoyota.com'),
((SELECT id FROM tenants WHERE domain = 'demo.dealershipai.com'), 'Honda Center', 'hondacenter.com', 'https://hondacenter.com', 'Dallas', 'TX', '(555) 234-5678', 'info@hondacenter.com'),
((SELECT id FROM tenants WHERE domain = 'demo.dealershipai.com'), 'BMW of Texas', 'bmwoftexas.com', 'https://bmwoftexas.com', 'Houston', 'TX', '(555) 345-6789', 'info@bmwoftexas.com')
ON CONFLICT (domain) DO NOTHING;