-- Migration: Add API Keys and Usage Tracking
-- Created: 2025-01-11
-- Purpose: Enable API monetization with authentication and usage tracking

-- ============================================================================
-- API Keys Table
-- ============================================================================
-- Stores API keys for external access
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,

  -- Key information
  key_prefix text NOT NULL,           -- First 8 chars (visible to user)
  key_hash text NOT NULL,             -- bcrypt hash of full key
  name text NOT NULL,                 -- User-friendly name
  description text,

  -- Access control
  tier text NOT NULL DEFAULT 'free',  -- 'free', 'pro', 'enterprise', 'internal'
  scopes jsonb NOT NULL DEFAULT '["read"]'::jsonb,  -- ['read', 'write', 'admin']
  allowed_endpoints jsonb,            -- Specific endpoints allowed (null = all)

  -- Rate limiting
  requests_per_hour int,              -- Null = unlimited
  requests_per_day int,
  requests_per_month int,

  -- Usage tracking
  total_requests bigint DEFAULT 0,
  last_used_at timestamptz,

  -- Lifecycle
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid,
  revoked_reason text,

  -- Metadata
  created_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb,

  UNIQUE (key_hash)
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(is_active, expires_at) WHERE is_active = true;

-- ============================================================================
-- API Usage Table
-- ============================================================================
-- Tracks every API request for billing and analytics
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,

  -- Request details
  method text NOT NULL,               -- GET, POST, PUT, DELETE
  endpoint text NOT NULL,             -- /api/v1/aemd-metrics
  version text NOT NULL DEFAULT 'v1', -- API version

  -- Response details
  status_code int NOT NULL,
  response_time_ms int,
  response_size_bytes int,

  -- Usage metrics
  cached boolean DEFAULT false,
  error_message text,

  -- Timestamp
  timestamp timestamptz NOT NULL DEFAULT now(),

  -- Request metadata
  user_agent text,
  ip_address inet,
  request_id uuid DEFAULT gen_random_uuid(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Partition by month for performance
CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp DESC);
CREATE INDEX idx_api_usage_api_key ON api_usage(api_key_id, timestamp DESC);
CREATE INDEX idx_api_usage_tenant ON api_usage(tenant_id, timestamp DESC);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint, timestamp DESC);

-- ============================================================================
-- API Key Tiers Table
-- ============================================================================
-- Defines rate limits and features for each tier
CREATE TABLE IF NOT EXISTS api_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,          -- 'free', 'pro', 'enterprise'
  display_name text NOT NULL,

  -- Rate limits
  requests_per_hour int,
  requests_per_day int,
  requests_per_month int,

  -- Features
  allowed_scopes jsonb NOT NULL DEFAULT '["read"]'::jsonb,
  webhook_enabled boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  historical_data_days int DEFAULT 30,

  -- Pricing
  price_monthly numeric(10,2),
  price_per_request numeric(10,6),

  -- Display
  description text,
  features jsonb DEFAULT '[]'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default tiers
INSERT INTO api_tiers (name, display_name, requests_per_hour, requests_per_day, requests_per_month, price_monthly, description, features) VALUES
('free', 'Free Tier', 10, 100, 1000, 0, 'Perfect for testing and small projects',
  '["1,000 requests/month", "Read-only access", "30 days data retention", "Community support"]'::jsonb),
('pro', 'Pro Tier', 1000, 10000, 50000, 49, 'For growing businesses and applications',
  '["50,000 requests/month", "Read + Write access", "90 days data retention", "Webhook support", "Email support"]'::jsonb),
('enterprise', 'Enterprise Tier', null, null, null, 299, 'Unlimited access for large organizations',
  '["Unlimited requests", "Full API access", "Unlimited data retention", "Webhooks + Priority queue", "Dedicated support", "SLA guarantee"]'::jsonb),
('internal', 'Internal', null, null, null, 0, 'Internal system use only',
  '["Unlimited requests", "Full access", "No rate limits"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- API Usage Summary (Materialized View)
-- ============================================================================
-- Aggregated usage stats for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS api_usage_summary AS
SELECT
  api_key_id,
  tenant_id,
  endpoint,
  DATE(timestamp) as usage_date,
  COUNT(*) as request_count,
  AVG(response_time_ms) as avg_response_time,
  COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 300) as success_count,
  COUNT(*) FILTER (WHERE status_code >= 400) as error_count,
  SUM(response_size_bytes) as total_bytes
FROM api_usage
GROUP BY api_key_id, tenant_id, endpoint, DATE(timestamp);

CREATE UNIQUE INDEX idx_api_usage_summary_key ON api_usage_summary(api_key_id, endpoint, usage_date);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_api_usage_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY api_usage_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tiers ENABLE ROW LEVEL SECURITY;

-- API Keys Policies
CREATE POLICY api_keys_tenant_select ON api_keys FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY api_keys_tenant_insert ON api_keys FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY api_keys_tenant_update ON api_keys FOR UPDATE
  USING (tenant_id = current_setting('app.tenant')::uuid);

-- API Usage Policies
CREATE POLICY api_usage_tenant_select ON api_usage FOR SELECT
  USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY api_usage_tenant_insert ON api_usage FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

-- API Tiers Policies (public read)
CREATE POLICY api_tiers_public_select ON api_tiers FOR SELECT
  USING (true);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS text AS $$
DECLARE
  key text;
BEGIN
  -- Generate: sk_live_[32 random chars]
  key := 'sk_live_' || encode(gen_random_bytes(24), 'base64');
  key := replace(key, '+', '');
  key := replace(key, '/', '');
  key := replace(key, '=', '');
  RETURN substr(key, 1, 40);
END;
$$ LANGUAGE plpgsql;

-- Function to validate API key and check rate limits
CREATE OR REPLACE FUNCTION validate_api_key_and_check_limits(
  key_hash_input text,
  endpoint_input text
)
RETURNS TABLE(
  is_valid boolean,
  api_key_id uuid,
  tenant_id uuid,
  tier text,
  rate_limit_exceeded boolean,
  requests_remaining int
) AS $$
DECLARE
  key_record RECORD;
  hourly_count int;
  daily_count int;
  monthly_count int;
  tier_limits RECORD;
BEGIN
  -- Get API key
  SELECT * INTO key_record
  FROM api_keys
  WHERE api_keys.key_hash = key_hash_input
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::uuid, NULL::text, false, 0;
    RETURN;
  END IF;

  -- Get tier limits
  SELECT * INTO tier_limits
  FROM api_tiers
  WHERE name = key_record.tier;

  -- Check rate limits
  IF tier_limits.requests_per_hour IS NOT NULL THEN
    SELECT COUNT(*) INTO hourly_count
    FROM api_usage
    WHERE api_usage.api_key_id = key_record.id
      AND timestamp > now() - interval '1 hour';

    IF hourly_count >= tier_limits.requests_per_hour THEN
      RETURN QUERY SELECT true, key_record.id, key_record.tenant_id, key_record.tier,
                          true, tier_limits.requests_per_hour - hourly_count;
      RETURN;
    END IF;
  END IF;

  -- Check daily limit
  IF tier_limits.requests_per_day IS NOT NULL THEN
    SELECT COUNT(*) INTO daily_count
    FROM api_usage
    WHERE api_usage.api_key_id = key_record.id
      AND timestamp > now() - interval '1 day';

    IF daily_count >= tier_limits.requests_per_day THEN
      RETURN QUERY SELECT true, key_record.id, key_record.tenant_id, key_record.tier,
                          true, tier_limits.requests_per_day - daily_count;
      RETURN;
    END IF;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT true, key_record.id, key_record.tenant_id, key_record.tier,
                      false, COALESCE(tier_limits.requests_per_day - daily_count, 999999);
END;
$$ LANGUAGE plpgsql;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_api_key_id uuid,
  p_tenant_id uuid,
  p_method text,
  p_endpoint text,
  p_status_code int,
  p_response_time_ms int DEFAULT NULL,
  p_response_size_bytes int DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  usage_id uuid;
BEGIN
  INSERT INTO api_usage (
    api_key_id, tenant_id, method, endpoint, status_code,
    response_time_ms, response_size_bytes, user_agent, ip_address
  ) VALUES (
    p_api_key_id, p_tenant_id, p_method, p_endpoint, p_status_code,
    p_response_time_ms, p_response_size_bytes, p_user_agent, p_ip_address
  ) RETURNING id INTO usage_id;

  -- Update API key last_used_at and total_requests
  UPDATE api_keys
  SET last_used_at = now(),
      total_requests = total_requests + 1
  WHERE id = p_api_key_id;

  RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update updated_at on api_tiers
CREATE OR REPLACE FUNCTION update_api_tiers_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_api_tiers_updated_at
BEFORE UPDATE ON api_tiers
FOR EACH ROW EXECUTE FUNCTION update_api_tiers_timestamp();

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Composite index for rate limiting queries
CREATE INDEX idx_api_usage_rate_limit ON api_usage(api_key_id, timestamp)
  WHERE timestamp > now() - interval '1 day';

-- Index for analytics
CREATE INDEX idx_api_usage_analytics ON api_usage(tenant_id, endpoint, status_code, timestamp);

COMMENT ON TABLE api_keys IS 'API keys for external access with rate limiting and usage tracking';
COMMENT ON TABLE api_usage IS 'Logs every API request for billing and analytics';
COMMENT ON TABLE api_tiers IS 'Defines rate limits and features for API access tiers';
COMMENT ON MATERIALIZED VIEW api_usage_summary IS 'Aggregated API usage statistics refreshed daily';
