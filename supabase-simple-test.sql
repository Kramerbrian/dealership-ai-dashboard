-- DealershipAI Database Schema - Simple Test Version
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE tenant_type AS ENUM ('single', 'dealership', 'enterprise');
CREATE TYPE user_role AS ENUM ('superadmin', 'enterprise_admin', 'dealership_admin', 'user');
CREATE TYPE subscription_tier AS ENUM ('test_drive', 'tier_1', 'tier_2', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'trialing');
CREATE TYPE review_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push', 'webhook');

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

-- Insert test data
INSERT INTO tenants (name, type) VALUES ('Test Tenant', 'single');

SELECT '✅ Simple test schema deployed!' AS status;
