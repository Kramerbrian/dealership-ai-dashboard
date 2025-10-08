-- DealershipAI User Hierarchy Database Schema
-- PostgreSQL with Row Level Security (RLS)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('superadmin', 'enterprise_admin', 'dealership_admin', 'user');
CREATE TYPE tenant_type AS ENUM ('enterprise', 'dealership', 'single');

-- Tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type tenant_type NOT NULL,
  parent_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dealership data table
CREATE TABLE dealership_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dealership_url TEXT NOT NULL,
  dealership_name TEXT,
  ai_visibility_score INTEGER DEFAULT 0,
  zero_click_score INTEGER DEFAULT 0,
  ugc_health_score INTEGER DEFAULT 0,
  geo_trust_score INTEGER DEFAULT 0,
  sgp_integrity_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  schema_audit JSONB DEFAULT '{}',
  last_analyzed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (existing, updated for tenant hierarchy)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT,
  email TEXT UNIQUE NOT NULL,
  dealership_url TEXT,
  dealership_name TEXT,
  
  -- Stripe fields
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'trialing',
  plan TEXT DEFAULT 'pro',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  
  -- Metadata
  utm_source TEXT,
  utm_campaign TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table (existing, updated for tenant hierarchy)
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dealership_url TEXT NOT NULL,
  
  -- Results
  ai_visibility_score INTEGER,
  results JSONB,
  
  -- Access control
  is_premium BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_tenants_parent_id ON tenants(parent_id);
CREATE INDEX idx_tenants_type ON tenants(type);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_dealership_data_tenant_id ON dealership_data(tenant_id);
CREATE INDEX idx_dealership_data_url ON dealership_data(dealership_url);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_tenant_id ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_subscriptions_tenant_id ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_analyses_tenant_id ON analyses(tenant_id);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_url ON analyses(dealership_url);

-- Enable Row Level Security (RLS)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants
CREATE POLICY "Users can view own tenant" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "SuperAdmin can view all tenants" ON tenants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role = 'superadmin'
    )
  );

CREATE POLICY "Enterprise Admin can view enterprise tenants" ON tenants
  FOR SELECT USING (
    id IN (
      SELECT t.id FROM tenants t
      JOIN users u ON u.tenant_id = t.id OR u.tenant_id = t.parent_id
      WHERE u.clerk_id = auth.jwt() ->> 'sub' 
      AND u.role = 'enterprise_admin'
    )
  );

-- RLS Policies for users
CREATE POLICY "Users can view own tenant users" ON users
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "SuperAdmin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE clerk_id = auth.jwt() ->> 'sub' 
      AND role = 'superadmin'
    )
  );

-- RLS Policies for dealership_data
CREATE POLICY "Users can view own tenant data" ON dealership_data
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own tenant data" ON dealership_data
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own tenant data" ON dealership_data
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- RLS Policies for audit_log
CREATE POLICY "Users can view own tenant audit logs" ON audit_log
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own tenant audit logs" ON audit_log
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own tenant subscriptions" ON subscriptions
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- RLS Policies for analyses
CREATE POLICY "Users can view own tenant analyses" ON analyses
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_tenant_id(user_clerk_id TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM users WHERE clerk_id = user_clerk_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_clerk_id TEXT)
RETURNS user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM users WHERE clerk_id = user_clerk_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_accessible_tenants(user_clerk_id TEXT)
RETURNS UUID[] AS $$
DECLARE
  user_tenant_id UUID;
  user_role_val user_role;
BEGIN
  SELECT tenant_id, role INTO user_tenant_id, user_role_val
  FROM users WHERE clerk_id = user_clerk_id;
  
  IF user_role_val = 'superadmin' THEN
    RETURN ARRAY(SELECT id FROM tenants);
  ELSIF user_role_val = 'enterprise_admin' THEN
    RETURN ARRAY(
      SELECT id FROM tenants 
      WHERE id = user_tenant_id OR parent_id = user_tenant_id
    );
  ELSE
    RETURN ARRAY[user_tenant_id];
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealership_data_updated_at BEFORE UPDATE ON dealership_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default SuperAdmin tenant and user
INSERT INTO tenants (id, name, type, settings) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'DealershipAI Platform',
  'enterprise',
  '{"features_enabled": ["all"], "billing_tier": "enterprise"}'
);

-- Note: You'll need to insert the actual SuperAdmin user after Clerk setup
-- INSERT INTO users (clerk_id, tenant_id, role, permissions) VALUES (
--   'your-superadmin-clerk-id',
--   '00000000-0000-0000-0000-000000000001',
--   'superadmin',
--   '{"can_view_analytics": true, "can_export_data": true, "can_manage_users": true, "can_manage_settings": true, "can_view_billing": true, "can_manage_billing": true, "can_access_admin_panel": true, "can_view_all_tenants": true, "can_manage_tenants": true}'
-- );

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant service role permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
