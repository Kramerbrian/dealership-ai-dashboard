-- DealershipAI Enterprise Database Schema
-- This file contains the complete database schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE tenant_type AS ENUM ('single', 'dealership', 'enterprise');
CREATE TYPE user_role AS ENUM ('superadmin', 'enterprise_admin', 'dealership_admin', 'user');
CREATE TYPE subscription_tier AS ENUM ('test_drive', 'tier_1', 'tier_2', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
CREATE TYPE review_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push', 'webhook');

-- Create tenants table (organizations)
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
    chatgpt_score INTEGER CHECK (chatgpt_score >= 0 AND chatgpt_score <= 100),
    google_aio_score INTEGER CHECK (google_aio_score >= 0 AND google_aio_score <= 100),
    perplexity_score INTEGER CHECK (perplexity_score >= 0 AND perplexity_score <= 100),
    gemini_score INTEGER CHECK (gemini_score >= 0 AND gemini_score <= 100),
    schema_audit JSONB DEFAULT '{}',
    cwv_metrics JSONB DEFAULT '{}',
    website_health JSONB DEFAULT '{}',
    review_data JSONB DEFAULT '{}',
    ugc_health_score INTEGER CHECK (ugc_health_score >= 0 AND ugc_health_score <= 100),
    competitor_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_query_results table
CREATE TABLE ai_query_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    prompt_id VARCHAR(255) NOT NULL,
    engine VARCHAR(50) NOT NULL,
    query_text TEXT NOT NULL,
    response_text TEXT,
    position INTEGER,
    cited BOOLEAN DEFAULT FALSE,
    sentiment review_sentiment,
    cost_cents INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    changes JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    permissions TEXT[] DEFAULT ARRAY['read'],
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    dealership_id UUID REFERENCES dealership_data(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    author VARCHAR(255),
    date DATE,
    sentiment review_sentiment,
    needs_response BOOLEAN DEFAULT FALSE,
    response_text TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_templates table
CREATE TABLE review_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tenants_parent_id ON tenants(parent_id);
CREATE INDEX idx_tenants_clerk_org_id ON tenants(clerk_org_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_dealership_data_tenant_id ON dealership_data(tenant_id);
CREATE INDEX idx_ai_query_results_tenant_id ON ai_query_results(tenant_id);
CREATE INDEX idx_ai_query_results_created_at ON ai_query_results(created_at);
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_reviews_tenant_id ON reviews(tenant_id);
CREATE INDEX idx_reviews_dealership_id ON reviews(dealership_id);
CREATE INDEX idx_reviews_platform ON reviews(platform);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_reviews_needs_response ON reviews(needs_response);
CREATE INDEX idx_review_templates_tenant_id ON review_templates(tenant_id);

-- Create Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_query_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Superadmins can view all tenants" ON tenants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub' 
            AND role = 'superadmin'
        )
    );

-- Create RLS policies for users
CREATE POLICY "Users can view users in their tenant" ON users
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        clerk_id = auth.jwt() ->> 'sub'
    );

-- Create RLS policies for dealership_data
CREATE POLICY "Users can view data for their tenant" ON dealership_data
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update data for their tenant" ON dealership_data
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for ai_query_results
CREATE POLICY "Users can view query results for their tenant" ON ai_query_results
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert query results for their tenant" ON ai_query_results
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for audit_logs
CREATE POLICY "Users can view audit logs for their tenant" ON audit_logs
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for api_keys
CREATE POLICY "Users can view API keys for their tenant" ON api_keys
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage API keys for their tenant" ON api_keys
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for notification_settings
CREATE POLICY "Users can view their own notification settings" ON notification_settings
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage their own notification settings" ON notification_settings
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for reviews
CREATE POLICY "Users can view reviews for their tenant" ON reviews
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage reviews for their tenant" ON reviews
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for review_templates
CREATE POLICY "Users can view templates for their tenant" ON review_templates
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage templates for their tenant" ON review_templates
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM users 
            WHERE clerk_id = auth.jwt() ->> 'sub'
        )
    );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealership_data_updated_at BEFORE UPDATE ON dealership_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_templates_updated_at BEFORE UPDATE ON review_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO tenants (id, name, type, subscription_tier, subscription_status, mrr) VALUES
    ('00000000-0000-0000-0000-000000000000', 'DealershipAI SuperAdmin', 'enterprise', 'enterprise', 'active', 0),
    ('11111111-1111-1111-1111-111111111111', 'Terry Reid Hyundai', 'dealership', 'tier_2', 'active', 999),
    ('22222222-2222-2222-2222-222222222222', 'Enterprise Motors Group', 'enterprise', 'enterprise', 'active', 50000);

-- Insert sample users
INSERT INTO users (clerk_id, tenant_id, email, full_name, role, permissions) VALUES
    ('user_superadmin', '00000000-0000-0000-0000-000000000000', 'superadmin@dealershipai.com', 'Super Admin', 'superadmin', ARRAY['*']),
    ('user_terry_admin', '11111111-1111-1111-1111-111111111111', 'admin@terryreidhyundai.com', 'Terry Admin', 'dealership_admin', ARRAY['view:own_data', 'manage:team', 'update:settings']),
    ('user_terry_staff', '11111111-1111-1111-1111-111111111111', 'staff@terryreidhyundai.com', 'Terry Staff', 'user', ARRAY['view:own_data']);

-- Insert sample dealership data
INSERT INTO dealership_data (tenant_id, ai_visibility_score, seo_score, aeo_score, geo_score, chatgpt_score, google_aio_score, perplexity_score, gemini_score, schema_audit, cwv_metrics, website_health, review_data, ugc_health_score, competitor_analysis) VALUES
    ('11111111-1111-1111-1111-111111111111', 85, 90, 80, 75, 88, 82, 79, 81, 
     '{"active": 15, "missing": 2, "errors": []}', 
     '{"lcp": 1.5, "fid": 50, "cls": 0.05}', 
     '{"performance": 95, "seo": 88}', 
     '{"total": 1200, "positive": 1000, "neutral": 100, "negative": 100}', 
     88, 
     '{"top_competitor": "Honda of Naples", "score_diff": 5}');

-- Insert sample reviews
INSERT INTO reviews (tenant_id, dealership_id, platform, rating, text, author, date, sentiment, needs_response, response_text, response_date) VALUES
    ('11111111-1111-1111-1111-111111111111', (SELECT id FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111'), 'google', 5, 'Great service, highly recommend!', 'John D.', '2024-09-20', 'positive', false, 'Thank you for your kind words!', '2024-09-21'),
    ('11111111-1111-1111-1111-111111111111', (SELECT id FROM dealership_data WHERE tenant_id = '11111111-1111-1111-1111-111111111111'), 'facebook', 4, 'Good experience, but wait time was long.', 'Jane S.', '2024-09-22', 'neutral', true, null, null);

-- Insert sample review templates
INSERT INTO review_templates (tenant_id, name, template_text) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Positive Review Thank You', 'Thank you for your wonderful feedback! We appreciate your business.'),
    ('11111111-1111-1111-1111-111111111111', 'Neutral Review Acknowledge', 'We appreciate your feedback and are always looking to improve.');

-- Create a function to get user context for RLS
CREATE OR REPLACE FUNCTION get_user_context()
RETURNS TABLE (
    user_id UUID,
    tenant_id UUID,
    role user_role,
    permissions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.tenant_id,
        u.role,
        u.permissions
    FROM users u
    WHERE u.clerk_id = auth.jwt() ->> 'sub';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
