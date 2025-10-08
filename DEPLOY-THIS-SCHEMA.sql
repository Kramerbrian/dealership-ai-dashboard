-- Minimal working schema for testing
-- This creates just the essential tables without complex RLS

-- Drop existing tables if they have issues
DROP TABLE IF EXISTS review_templates CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS ai_query_results CASCADE;
DROP TABLE IF EXISTS dealership_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- Drop types
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS review_sentiment CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS tenant_type CASCADE;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create types
CREATE TYPE tenant_type AS ENUM ('single', 'dealership', 'enterprise');
CREATE TYPE user_role AS ENUM ('superadmin', 'enterprise_admin', 'dealership_admin', 'user');
CREATE TYPE subscription_tier AS ENUM ('test_drive', 'tier_1', 'tier_2', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');

-- Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type tenant_type NOT NULL DEFAULT 'single',
    subscription_tier subscription_tier NOT NULL DEFAULT 'test_drive',
    subscription_status subscription_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dealership_data table
CREATE TABLE dealership_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ai_visibility_score INTEGER CHECK (ai_visibility_score >= 0 AND ai_visibility_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now (enable later in production)
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_data DISABLE ROW LEVEL SECURITY;

-- Insert test data
INSERT INTO tenants (name, type) VALUES ('Test Tenant', 'dealership');
INSERT INTO users (clerk_id, tenant_id, email, full_name) VALUES 
  ('test_user_1', (SELECT id FROM tenants LIMIT 1), 'test@example.com', 'Test User');
INSERT INTO dealership_data (tenant_id, ai_visibility_score) VALUES
  ((SELECT id FROM tenants LIMIT 1), 85);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

SELECT 'Minimal schema deployed successfully!' AS status;
SELECT 'Tenants: ' || COUNT(*)::text FROM tenants;
SELECT 'Users: ' || COUNT(*)::text FROM users;
SELECT 'Dealerships: ' || COUNT(*)::text FROM dealership_data;
