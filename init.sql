-- DealershipAI Database Schema
-- PostgreSQL initialization script

-- Create database if not exists
SELECT 'CREATE DATABASE dealershipai'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dealershipai')\gexec

-- Connect to the database
\c dealershipai;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS dealership;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Users table
CREATE TABLE IF NOT EXISTS dealership.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'viewer',
    dealership_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Dealerships table
CREATE TABLE IF NOT EXISTS dealership.dealerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    tier VARCHAR(50) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analytics.analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealership.dealerships(id),
    analysis_type VARCHAR(50),
    visibility_score DECIMAL(5,2),
    revenue_at_risk DECIMAL(12,2),
    market_position INTEGER,
    total_competitors INTEGER,
    sov_percentage DECIMAL(5,2),
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform visibility scores
CREATE TABLE IF NOT EXISTS analytics.platform_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES analytics.analysis_results(id),
    platform VARCHAR(50),
    score DECIMAL(5,2),
    mentioned BOOLEAN,
    snippet TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor tracking
CREATE TABLE IF NOT EXISTS analytics.competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealership.dealerships(id),
    competitor_name VARCHAR(255),
    competitor_url VARCHAR(255),
    visibility_score DECIMAL(5,2),
    market_share DECIMAL(5,2),
    last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS analytics.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealership_id UUID REFERENCES dealership.dealerships(id),
    priority VARCHAR(10),
    category VARCHAR(50),
    task TEXT,
    impact VARCHAR(20),
    effort VARCHAR(50),
    roi_score DECIMAL(3,1),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Audit log
CREATE TABLE IF NOT EXISTS dealership.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES dealership.users(id),
    action VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON dealership.users(email);
CREATE INDEX idx_users_dealership ON dealership.users(dealership_id);
CREATE INDEX idx_analysis_dealership ON analytics.analysis_results(dealership_id);
CREATE INDEX idx_analysis_created ON analytics.analysis_results(created_at DESC);
CREATE INDEX idx_platform_analysis ON analytics.platform_scores(analysis_id);
CREATE INDEX idx_competitors_dealership ON analytics.competitors(dealership_id);
CREATE INDEX idx_recommendations_dealership ON analytics.recommendations(dealership_id);
CREATE INDEX idx_recommendations_status ON analytics.recommendations(status);
CREATE INDEX idx_audit_user ON dealership.audit_log(user_id);
CREATE INDEX idx_audit_created ON dealership.audit_log(created_at DESC);

-- Create views for common queries
CREATE OR REPLACE VIEW analytics.latest_analysis AS
SELECT DISTINCT ON (dealership_id)
    dealership_id,
    id as analysis_id,
    visibility_score,
    revenue_at_risk,
    market_position,
    total_competitors,
    sov_percentage,
    created_at
FROM analytics.analysis_results
ORDER BY dealership_id, created_at DESC;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON dealership.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealerships_updated_at BEFORE UPDATE ON dealership.dealerships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO dealership.dealerships (name, url, location, city, state, tier)
VALUES 
    ('Toyota of Naples', 'https://toyotaofnaples.com', 'Naples, FL', 'Naples', 'FL', 'enterprise'),
    ('Demo Dealership', 'https://demo.dealership.com', 'Miami, FL', 'Miami', 'FL', 'basic')
ON CONFLICT DO NOTHING;

-- Create read-only user for analytics
CREATE USER analytics_reader WITH PASSWORD 'analytics_readonly_password';
GRANT USAGE ON SCHEMA analytics TO analytics_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO analytics_reader;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA dealership TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA dealership TO CURRENT_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO CURRENT_USER;