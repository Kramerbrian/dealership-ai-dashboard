-- GPT Analysis Results Schema
-- Stores GPT-5 analysis results with RBAC and service token support

CREATE TABLE IF NOT EXISTS gpt_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  analysis_type VARCHAR(50) NOT NULL, -- 'comprehensive', 'aiv', 'ati', 'elasticity', 'shap'
  prompt TEXT NOT NULL,
  gpt_response TEXT NOT NULL,
  reasoning TEXT,
  computed_metrics JSONB DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  gpt_model VARCHAR(50) DEFAULT 'gpt-5',
  reasoning_effort VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  service_token VARCHAR(100), -- Track which service token was used
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service tokens table for GPT system access
CREATE TABLE IF NOT EXISTS service_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_name VARCHAR(100) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL, -- Hashed token for security
  role VARCHAR(50) NOT NULL, -- 'role:system', 'role:admin', etc.
  capabilities TEXT[] NOT NULL, -- Array of capabilities
  tenant_scope UUID[], -- Array of tenant IDs this token can access (empty = all)
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RBAC roles and permissions
CREATE TABLE IF NOT EXISTS rbac_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) NOT NULL UNIQUE,
  capabilities TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User role assignments
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_name VARCHAR(50) NOT NULL REFERENCES rbac_roles(role_name),
  tenant_id UUID NOT NULL,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gpt_analysis_tenant_id ON gpt_analysis_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gpt_analysis_type ON gpt_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_gpt_analysis_created_at ON gpt_analysis_results(created_at);
CREATE INDEX IF NOT EXISTS idx_service_tokens_name ON service_tokens(token_name);
CREATE INDEX IF NOT EXISTS idx_service_tokens_role ON service_tokens(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name);

-- Enable RLS
ALTER TABLE gpt_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE rbac_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for gpt_analysis_results
CREATE POLICY "Users can view gpt_analysis_results for their tenant" ON gpt_analysis_results
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

CREATE POLICY "Service tokens can insert gpt_analysis_results" ON gpt_analysis_results
  FOR INSERT WITH CHECK (true); -- Service tokens bypass RLS

-- RLS policies for service_tokens (admin only)
CREATE POLICY "Admins can view service_tokens" ON service_tokens
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN rbac_roles rr ON ur.role_name = rr.role_name
      WHERE ur.user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
      AND 'admin' = ANY(rr.capabilities)
    )
  );

-- RLS policies for rbac_roles (admin only)
CREATE POLICY "Admins can manage rbac_roles" ON rbac_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN rbac_roles rr ON ur.role_name = rr.role_name
      WHERE ur.user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
      AND 'admin' = ANY(rr.capabilities)
    )
  );

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt() ->> 'sub')
    OR tenant_id IN (
      SELECT tenant_id FROM users WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  );

-- Insert default RBAC roles
INSERT INTO rbac_roles (role_name, capabilities, description) VALUES
  ('role:admin', ARRAY['full'], 'Full system access'),
  ('role:manager', ARRAY['read', 'prioritize'], 'Read access with prioritization capabilities'),
  ('role:marketing', ARRAY['view_aoer', 'view_tasks'], 'Marketing agent with limited access'),
  ('role:system', ARRAY['compute_metrics', 'access_tenant_data'], 'System service token for GPT access')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default service token for GPT (in production, this should be generated securely)
INSERT INTO service_tokens (token_name, token_hash, role, capabilities, tenant_scope) VALUES
  ('gpt-service-token', 'hashed_token_value_here', 'role:system', ARRAY['compute_metrics', 'access_tenant_data'], ARRAY[]::UUID[])
ON CONFLICT (token_name) DO NOTHING;

-- Create a view for easy access to user capabilities
CREATE OR REPLACE VIEW user_capabilities AS
SELECT 
  u.id as user_id,
  u.clerk_id,
  u.tenant_id,
  ur.role_name,
  rr.capabilities,
  ur.is_active as role_active,
  ur.expires_at as role_expires_at
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
LEFT JOIN rbac_roles rr ON ur.role_name = rr.role_name
WHERE u.id IS NOT NULL;

-- Function to check user capabilities
CREATE OR REPLACE FUNCTION check_user_capability(
  p_user_id UUID,
  p_capability TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_capabilities 
    WHERE user_id = p_user_id 
    AND p_capability = ANY(capabilities)
    AND role_active = true
    AND (role_expires_at IS NULL OR role_expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tenant-scoped service token
CREATE OR REPLACE FUNCTION get_service_token_for_tenant(
  p_token_name TEXT,
  p_tenant_id UUID
) RETURNS TABLE (
  token_hash TEXT,
  role TEXT,
  capabilities TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.token_hash,
    st.role,
    st.capabilities
  FROM service_tokens st
  WHERE st.token_name = p_token_name
  AND st.is_active = true
  AND (st.expires_at IS NULL OR st.expires_at > NOW())
  AND (
    array_length(st.tenant_scope, 1) IS NULL 
    OR p_tenant_id = ANY(st.tenant_scope)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
