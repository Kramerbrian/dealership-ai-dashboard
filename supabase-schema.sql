-- DealershipAI Database Schema
-- This schema supports the complete DealershipAI platform with multi-tenancy, AI optimization, and analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_tier AS ENUM ('free', 'growth', 'pro', 'enterprise');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'unpaid');
CREATE TYPE audit_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE recommendation_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE recommendation_category AS ENUM ('content', 'technical', 'citations', 'trust');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    dealership VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(255),
    role user_role DEFAULT 'owner',
    tier user_tier DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    dashboard_layout VARCHAR(20) DEFAULT 'grid',
    default_view VARCHAR(20) DEFAULT 'overview',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan user_tier NOT NULL,
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dealerships table
CREATE TABLE dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10),
    phone VARCHAR(20),
    website VARCHAR(255),
    email VARCHAR(255),
    brands TEXT[],
    ai_visibility_score INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 0,
    citation_score INTEGER DEFAULT 0,
    last_audit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit results table
CREATE TABLE audit_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    ai_visibility_score INTEGER NOT NULL,
    trust_score INTEGER NOT NULL,
    citation_score INTEGER NOT NULL,
    competitor_scores JSONB,
    recommendations JSONB,
    raw_data JSONB,
    status audit_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Competitor scores table
CREATE TABLE competitor_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audit_results(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    improvement INTEGER DEFAULT 0,
    is_blurred BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audit_results(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority recommendation_priority NOT NULL,
    impact INTEGER NOT NULL,
    effort VARCHAR(20) NOT NULL,
    category recommendation_category NOT NULL,
    steps JSONB,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed table
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dealership_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metadata JSONB,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Idempotency keys table
CREATE TABLE idempotency_keys (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    route VARCHAR(255) NOT NULL,
    body_hash VARCHAR(255) NOT NULL,
    response_status INTEGER,
    response_body JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Rate limiting table
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    route VARCHAR(255) NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_city_state ON users(city, state);
CREATE INDEX idx_dealerships_user_id ON dealerships(user_id);
CREATE INDEX idx_dealerships_city_state ON dealerships(city, state);
CREATE INDEX idx_audit_results_dealership_id ON audit_results(dealership_id);
CREATE INDEX idx_audit_results_created_at ON audit_results(created_at);
CREATE INDEX idx_competitor_scores_audit_id ON competitor_scores(audit_id);
CREATE INDEX idx_recommendations_audit_id ON recommendations(audit_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at);
CREATE INDEX idx_idempotency_keys_user_id ON idempotency_keys(user_id);
CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);
CREATE INDEX idx_rate_limits_user_route ON rate_limits(user_id, route);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

-- Create unique constraints
CREATE UNIQUE INDEX idx_idempotency_keys_unique ON idempotency_keys(idempotency_key, user_id, route);
CREATE UNIQUE INDEX idx_rate_limits_unique ON rate_limits(user_id, route, window_start);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for dealerships table
CREATE POLICY "Users can view their own dealerships" ON dealerships
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own dealerships" ON dealerships
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own dealerships" ON dealerships
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for audit_results table
CREATE POLICY "Users can view their own audit results" ON audit_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dealerships 
            WHERE dealerships.id = audit_results.dealership_id 
            AND dealerships.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can insert their own audit results" ON audit_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM dealerships 
            WHERE dealerships.id = audit_results.dealership_id 
            AND dealerships.user_id::text = auth.uid()::text
        )
    );

-- RLS Policies for other tables follow similar patterns
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own activity" ON activity_feed
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON dealerships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
    DELETE FROM idempotency_keys WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ language 'plpgsql';

-- Insert sample data for development
INSERT INTO users (email, name, dealership, city, state, phone, role, tier) VALUES
('demo@dealershipai.com', 'Demo User', 'Demo Dealership', 'Austin', 'TX', '+1-555-0123', 'owner', 'pro'),
('test@example.com', 'Test User', 'Test Dealership', 'Round Rock', 'TX', '+1-555-0124', 'admin', 'growth');

-- Insert sample dealerships
INSERT INTO dealerships (user_id, name, city, state, phone, website, brands, ai_visibility_score, trust_score, citation_score) VALUES
((SELECT id FROM users WHERE email = 'demo@dealershipai.com'), 'Demo Dealership', 'Austin', 'TX', '+1-555-0123', 'https://demo-dealership.com', ARRAY['Toyota', 'Honda'], 87, 82, 91),
((SELECT id FROM users WHERE email = 'test@example.com'), 'Test Dealership', 'Round Rock', 'TX', '+1-555-0124', 'https://test-dealership.com', ARRAY['BMW', 'Mercedes'], 92, 88, 85);

-- Insert sample audit results
INSERT INTO audit_results (dealership_id, overall_score, ai_visibility_score, trust_score, citation_score, competitor_scores, recommendations, status, completed_at) VALUES
((SELECT id FROM dealerships WHERE name = 'Demo Dealership'), 87, 87, 82, 91, 
 '{"competitors": [{"name": "Austin Toyota", "score": 89, "improvement": 12}, {"name": "Round Rock Honda", "score": 85, "improvement": 8}]}',
 '{"recommendations": [{"title": "Optimize Google Business Profile", "priority": "high", "impact": 85}, {"title": "Improve Citation Consistency", "priority": "medium", "impact": 72}]}',
 'completed', NOW() - INTERVAL '1 day');

-- Insert sample recommendations
INSERT INTO recommendations (audit_id, title, description, priority, impact, effort, category, steps) VALUES
((SELECT id FROM audit_results WHERE overall_score = 87), 'Optimize Google Business Profile', 'Your Google Business Profile is missing key information that AI systems use to understand your business.', 'high', 85, 'low', 'citations', 
 '["Add business hours and holiday hours", "Upload high-quality photos", "Add detailed business description", "Collect and respond to reviews", "Add services and products"]'),
((SELECT id FROM audit_results WHERE overall_score = 87), 'Improve Citation Consistency', 'Your business information is inconsistent across different directories and platforms.', 'high', 72, 'medium', 'citations',
 '["Audit all existing citations", "Standardize business information", "Update major directories", "Monitor consistency", "Build new citations"]');

-- Insert sample activity feed
INSERT INTO activity_feed (user_id, dealership_id, type, title, description, is_public) VALUES
((SELECT id FROM users WHERE email = 'demo@dealershipai.com'), (SELECT id FROM dealerships WHERE name = 'Demo Dealership'), 'audit_completed', 'AI Visibility Audit Completed', 'Your dealership scored 87/100 on the AI visibility audit.', true),
((SELECT id FROM users WHERE email = 'demo@dealershipai.com'), (SELECT id FROM dealerships WHERE name = 'Demo Dealership'), 'score_improvement', 'Trust Score Improved', 'Your trust score increased by 5 points this week.', false);

-- Create views for common queries
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.dealership,
    u.city,
    u.state,
    u.tier,
    u.role,
    d.ai_visibility_score,
    d.trust_score,
    d.citation_score,
    d.last_audit_at,
    s.status as subscription_status,
    s.current_period_end
FROM users u
LEFT JOIN dealerships d ON u.id = d.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.is_active = true;

CREATE VIEW recent_activity AS
SELECT 
    af.id,
    af.type,
    af.title,
    af.description,
    af.created_at,
    u.name as user_name,
    d.name as dealership_name
FROM activity_feed af
JOIN users u ON af.user_id = u.id
JOIN dealerships d ON af.dealership_id = d.id
WHERE af.is_public = true
ORDER BY af.created_at DESC
LIMIT 50;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read-only access to public views
GRANT SELECT ON user_dashboard TO anon, authenticated;
GRANT SELECT ON recent_activity TO anon, authenticated;