-- DealershipAI Master v2.0 - Consolidated Database Schema
-- Three-tier SaaS platform: Free ($0), Professional ($499), Enterprise ($999)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dealers table (simplified multi-tenant)
CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    brand VARCHAR(100),
    tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    locations INTEGER DEFAULT 1,
    stripe_customer_id VARCHAR(255),
    subscription_id VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores table (three-pillar system)
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    
    -- Three pillars
    seo_score INTEGER CHECK (seo_score >= 0 AND seo_score <= 100),
    aeo_score INTEGER CHECK (aeo_score >= 0 AND aeo_score <= 100),
    geo_score INTEGER CHECK (geo_score >= 0 AND geo_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    
    -- E-E-A-T sub-scores
    experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100),
    expertise_score INTEGER CHECK (expertise_score >= 0 AND expertise_score <= 100),
    authoritativeness_score INTEGER CHECK (authoritativeness_score >= 0 AND authoritativeness_score <= 100),
    trustworthiness_score INTEGER CHECK (trustworthiness_score >= 0 AND trustworthiness_score <= 100),
    
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    scan_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_dealer_scores ON scores(dealer_id, created_at DESC)
);

-- Chat sessions table (Pro+)
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(50) NOT NULL,
    tokens_input INTEGER,
    tokens_output INTEGER,
    cost DECIMAL(10,6),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_dealer_sessions ON chat_sessions(dealer_id, timestamp DESC),
    INDEX idx_monthly_usage ON chat_sessions(dealer_id, date_trunc('month', timestamp))
);

-- Market scans table (geographic pooling)
CREATE TABLE market_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    dealers_mentioned JSONB,
    query_count INTEGER,
    total_cost DECIMAL(10,6),
    scan_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(city, state, scan_date::date),
    INDEX idx_market_location ON market_scans(city, state, scan_date DESC)
);

-- Mystery shops table (Enterprise only)
CREATE TABLE mystery_shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    shopper_name VARCHAR(255) NOT NULL,
    shopper_email VARCHAR(255) NOT NULL,
    shopper_phone VARCHAR(20),
    shopper_type VARCHAR(50),
    vehicle_model VARCHAR(100),
    trade_in VARCHAR(100),
    credit_tier VARCHAR(50),
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    score INTEGER DEFAULT 0,
    response_time INTEGER,
    has_otd_pricing BOOLEAN DEFAULT FALSE,
    has_trade_value BOOLEAN DEFAULT FALSE,
    response_quality VARCHAR(20),
    metadata JSONB,
    
    INDEX idx_dealer_shops ON mystery_shops(dealer_id, deployed_at DESC)
);

-- Reviews aggregation
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    rating DECIMAL(2,1),
    review_text TEXT,
    reviewer_name VARCHAR(255),
    review_date TIMESTAMP,
    responded BOOLEAN DEFAULT FALSE,
    response_time INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_dealer_reviews ON reviews(dealer_id, review_date DESC)
);

-- Competitor tracking
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    competitor_name VARCHAR(255) NOT NULL,
    competitor_domain VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    last_scan TIMESTAMP,
    ai_visibility_score INTEGER,
    
    INDEX idx_dealer_competitors ON competitors(dealer_id)
);

-- Action items (generated from E-E-A-T analysis)
CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    action TEXT NOT NULL,
    impact VARCHAR(100),
    effort VARCHAR(100),
    cost VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    INDEX idx_dealer_actions ON action_items(dealer_id, status)
);

-- Usage tracking for billing
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    billing_period DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_dealer_usage ON usage_tracking(dealer_id, billing_period)
);

-- Create views for quick analytics
CREATE VIEW dealer_analytics AS
SELECT 
    d.id,
    d.name,
    d.tier,
    d.city,
    d.state,
    s.overall_score,
    s.seo_score,
    s.aeo_score,
    s.geo_score,
    s.experience_score,
    s.expertise_score,
    s.authoritativeness_score,
    s.trustworthiness_score,
    COUNT(DISTINCT cs.id) as total_chat_sessions,
    COUNT(DISTINCT ms.id) as total_mystery_shops,
    AVG(ms.score) as avg_mystery_score,
    COUNT(DISTINCT ai.id) as pending_action_items
FROM dealers d
LEFT JOIN scores s ON d.id = s.dealer_id
LEFT JOIN chat_sessions cs ON d.id = cs.dealer_id
LEFT JOIN mystery_shops ms ON d.id = ms.dealer_id
LEFT JOIN action_items ai ON d.id = ai.dealer_id AND ai.status = 'pending'
GROUP BY d.id, d.name, d.tier, d.city, d.state, s.overall_score, s.seo_score, s.aeo_score, s.geo_score, 
         s.experience_score, s.expertise_score, s.authoritativeness_score, s.trustworthiness_score;

-- Tier-based feature access view
CREATE VIEW tier_limits AS
SELECT 
    d.id as dealer_id,
    d.tier,
    CASE 
        WHEN d.tier = 'free' THEN 0
        WHEN d.tier = 'pro' THEN 50
        WHEN d.tier = 'enterprise' THEN 200
    END as chat_sessions_limit,
    CASE 
        WHEN d.tier = 'free' THEN 1
        WHEN d.tier = 'pro' THEN 2
        WHEN d.tier = 'enterprise' THEN 30
    END as scans_per_month_limit,
    CASE 
        WHEN d.tier = 'free' THEN 0
        WHEN d.tier = 'pro' THEN 5
        WHEN d.tier = 'enterprise' THEN 15
    END as competitors_limit,
    CASE 
        WHEN d.tier = 'free' THEN 0
        WHEN d.tier = 'pro' THEN 0
        WHEN d.tier = 'enterprise' THEN 4
    END as mystery_shops_limit
FROM dealers d;

-- Functions for tier validation
CREATE OR REPLACE FUNCTION check_tier_limit(
    p_dealer_id UUID,
    p_metric VARCHAR(50),
    p_current_count INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_limit INTEGER;
    v_tier VARCHAR(20);
BEGIN
    SELECT tier INTO v_tier FROM dealers WHERE id = p_dealer_id;
    
    CASE p_metric
        WHEN 'chat_sessions' THEN
            v_limit := CASE v_tier
                WHEN 'free' THEN 0
                WHEN 'pro' THEN 50
                WHEN 'enterprise' THEN 200
            END;
        WHEN 'scans_per_month' THEN
            v_limit := CASE v_tier
                WHEN 'free' THEN 1
                WHEN 'pro' THEN 2
                WHEN 'enterprise' THEN 30
            END;
        WHEN 'mystery_shops' THEN
            v_limit := CASE v_tier
                WHEN 'free' THEN 0
                WHEN 'pro' THEN 0
                WHEN 'enterprise' THEN 4
            END;
        ELSE
            RETURN TRUE;
    END CASE;
    
    RETURN p_current_count < v_limit;
END;
$$ LANGUAGE plpgsql;

-- Seed data
INSERT INTO dealers (name, domain, city, state, brand, tier, locations) VALUES 
('Terry Reid Hyundai', 'terryreidhyundai.com', 'Naples', 'FL', 'Hyundai', 'pro', 1),
('Naples Nissan', 'naplesnessan.com', 'Naples', 'FL', 'Nissan', 'pro', 1),
('Honda of Fort Myers', 'hondaoffortmyers.com', 'Fort Myers', 'FL', 'Honda', 'enterprise', 3),
('Test Dealership', 'testdealership.com', 'Miami', 'FL', 'Toyota', 'free', 1);

-- Sample scores
INSERT INTO scores (dealer_id, seo_score, aeo_score, geo_score, overall_score, 
                   experience_score, expertise_score, authoritativeness_score, trustworthiness_score, 
                   confidence, scan_type) 
SELECT 
    d.id,
    87, 92, 78, 86,
    85, 78, 82, 91,
    0.94, 'full_scan'
FROM dealers d 
WHERE d.name = 'Terry Reid Hyundai';

-- Sample action items
INSERT INTO action_items (dealer_id, category, priority, action, impact, effort, cost)
SELECT 
    d.id,
    'Experience',
    'high',
    'Add customer testimonials with photos',
    '+15 points',
    '2 hours',
    '$0'
FROM dealers d 
WHERE d.name = 'Terry Reid Hyundai';

-- Create indexes for performance
CREATE INDEX idx_dealers_tier ON dealers(tier);
CREATE INDEX idx_dealers_domain ON dealers(domain);
CREATE INDEX idx_scores_created_at ON scores(created_at);
CREATE INDEX idx_chat_sessions_timestamp ON chat_sessions(timestamp);
CREATE INDEX idx_mystery_shops_status ON mystery_shops(status);
CREATE INDEX idx_action_items_status ON action_items(status);
