-- Add tier and billing fields to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tier text DEFAULT 'free' CHECK (tier IN ('free', 'growth', 'pro', 'enterprise'));
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_id text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_tier ON tenants(tier);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_id ON tenants(subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON tenants(is_active);

-- Create API logs table for usage tracking
CREATE TABLE IF NOT EXISTS api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  route text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_tenant_id ON api_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_route ON api_logs(route);

-- Create webhook logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  webhook_type text NOT NULL,
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_tenant_id ON webhook_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- Create bandit allocations table
CREATE TABLE IF NOT EXISTS bandit_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  variant_id text NOT NULL,
  traffic_allocated integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bandit_allocations_tenant_id ON bandit_allocations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bandit_allocations_created_at ON bandit_allocations(created_at);

-- Create tenant usage summary view
CREATE OR REPLACE VIEW tenant_usage_summary AS
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  t.tier,
  COALESCE(api_counts.api_calls, 0) as api_calls_this_month,
  COALESCE(webhook_counts.webhook_calls, 0) as webhook_calls_this_month,
  COALESCE(bandit_counts.bandit_allocations, 0) as bandit_allocations_this_month,
  t.created_at,
  t.updated_at
FROM tenants t
LEFT JOIN (
  SELECT 
    tenant_id,
    COUNT(*) as api_calls
  FROM api_logs 
  WHERE created_at >= date_trunc('month', now())
  GROUP BY tenant_id
) api_counts ON t.id = api_counts.tenant_id
LEFT JOIN (
  SELECT 
    tenant_id,
    COUNT(*) as webhook_calls
  FROM webhook_logs 
  WHERE created_at >= date_trunc('month', now())
  GROUP BY tenant_id
) webhook_counts ON t.id = webhook_counts.tenant_id
LEFT JOIN (
  SELECT 
    tenant_id,
    COUNT(*) as bandit_allocations
  FROM bandit_allocations 
  WHERE created_at >= date_trunc('month', now())
  GROUP BY tenant_id
) bandit_counts ON t.id = bandit_counts.tenant_id;
