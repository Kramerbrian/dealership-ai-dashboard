-- ============================================================================
-- DealershipAI - Dealer Settings & Integration Audit System
-- Deploy this in Supabase SQL Editor
-- ============================================================================

-- 1. DEALER SETTINGS TABLE
-- Stores all dealer integration credentials and configuration
-- ============================================================================

CREATE TABLE IF NOT EXISTS dealer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT,

  -- Analytics & Tracking
  analytics JSONB NOT NULL DEFAULT '{
    "googleAnalytics": {"enabled": false, "measurementId": "", "propertyId": ""},
    "googleTagManager": {"enabled": false, "containerId": ""},
    "facebookPixel": {"enabled": false, "pixelId": ""},
    "tiktokPixel": {"enabled": false, "pixelId": ""},
    "linkedInInsightTag": {"enabled": false, "partnerId": ""},
    "microsoftClarity": {"enabled": false, "projectId": ""},
    "hotjar": {"enabled": false, "siteId": ""}
  }'::jsonb,

  -- Google Business Profile
  google_business_profile JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "placeId": "",
    "locationId": "",
    "cid": ""
  }'::jsonb,

  -- Google Services
  google_services JSONB NOT NULL DEFAULT '{
    "searchConsole": {"enabled": false, "siteUrl": "", "verificationCode": ""},
    "ads": {"enabled": false, "customerId": "", "conversionId": "", "conversionLabel": ""}
  }'::jsonb,

  -- Social Media
  social_media JSONB NOT NULL DEFAULT '{
    "facebook": {"enabled": false, "pageId": ""},
    "instagram": {"enabled": false, "businessAccountId": ""},
    "twitter": {"enabled": false, "username": ""},
    "linkedin": {"enabled": false, "companyId": ""},
    "youtube": {"enabled": false, "channelId": ""}
  }'::jsonb,

  -- Review Platforms
  reviews JSONB NOT NULL DEFAULT '{
    "googleReviews": {"enabled": false, "autoMonitor": false, "autoRespond": false},
    "yelp": {"enabled": false, "businessId": ""},
    "dealerRater": {"enabled": false, "dealerId": ""}
  }'::jsonb,

  -- CRM Systems
  crm JSONB NOT NULL DEFAULT '{
    "hubspot": {"enabled": false, "portalId": ""},
    "salesforce": {"enabled": false, "instanceUrl": ""},
    "activeCampaign": {"enabled": false, "apiUrl": ""}
  }'::jsonb,

  -- Automotive Platforms
  automotive JSONB NOT NULL DEFAULT '{
    "vinsolutions": {"enabled": false, "dealerId": ""},
    "dealerSocket": {"enabled": false, "dealerId": ""},
    "eleadCRM": {"enabled": false, "dealerId": ""},
    "cdk": {"enabled": false, "siteId": ""},
    "reynoldsReynolds": {"enabled": false, "dealerId": ""}
  }'::jsonb,

  -- Other Integrations
  integrations JSONB NOT NULL DEFAULT '{
    "zapier": {"enabled": false, "webhookUrl": ""},
    "slack": {"enabled": false, "webhookUrl": "", "channel": ""},
    "email": {"provider": "sendgrid", "fromEmail": "", "fromName": ""}
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_dealer_settings_dealer_id ON dealer_settings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_settings_tenant_id ON dealer_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dealer_settings_updated_at ON dealer_settings(updated_at DESC);

-- Row Level Security
ALTER TABLE dealer_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS dealer_settings_select_policy ON dealer_settings;
DROP POLICY IF EXISTS dealer_settings_update_policy ON dealer_settings;
DROP POLICY IF EXISTS dealer_settings_insert_policy ON dealer_settings;

-- Policies (permissive for now, can be tightened later)
CREATE POLICY dealer_settings_select_policy ON dealer_settings
  FOR SELECT USING (true);

CREATE POLICY dealer_settings_update_policy ON dealer_settings
  FOR UPDATE USING (true);

CREATE POLICY dealer_settings_insert_policy ON dealer_settings
  FOR INSERT WITH CHECK (true);

-- Trigger function to update timestamp
CREATE OR REPLACE FUNCTION update_dealer_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS dealer_settings_updated_at ON dealer_settings;
CREATE TRIGGER dealer_settings_updated_at
  BEFORE UPDATE ON dealer_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_settings_timestamp();

COMMENT ON TABLE dealer_settings IS 'Stores dealer-specific integration settings and credentials';

-- ============================================================================
-- 2. INTEGRATION AUDIT LOG TABLE
-- Tracks health checks and validation results for all integrations
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id TEXT NOT NULL,
  integration_name TEXT NOT NULL,

  -- Audit results
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'error', 'warning')),
  is_valid BOOLEAN NOT NULL DEFAULT false,
  message TEXT NOT NULL,

  -- Performance metrics
  response_time_ms INTEGER,
  data_points INTEGER,

  -- Error tracking
  error_details TEXT,

  -- Timestamps
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_dealer_id ON integration_audit_log(dealer_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_integration ON integration_audit_log(integration_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_status ON integration_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_checked_at ON integration_audit_log(checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_dealer_integration ON integration_audit_log(dealer_id, integration_name, checked_at DESC);

-- Row Level Security
ALTER TABLE integration_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS audit_log_select_policy ON integration_audit_log;
DROP POLICY IF EXISTS audit_log_insert_policy ON integration_audit_log;

-- Policies
CREATE POLICY audit_log_select_policy ON integration_audit_log
  FOR SELECT USING (true);

CREATE POLICY audit_log_insert_policy ON integration_audit_log
  FOR INSERT WITH CHECK (true);

-- Function to clean up old audit logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM integration_audit_log
  WHERE checked_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE integration_audit_log IS 'Tracks health checks and validation results for dealer integrations';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT
  '✅ Deployment successful!' as status,
  'dealer_settings and integration_audit_log tables created' as details,
  NOW() as deployed_at;
