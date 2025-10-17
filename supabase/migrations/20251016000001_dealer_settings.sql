-- Dealer Settings Table
-- Stores configuration and integration credentials for each dealer

CREATE TABLE IF NOT EXISTS dealer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT,

  -- Analytics & Tracking (JSONB for flexibility)
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

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dealer_settings_dealer_id ON dealer_settings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_settings_tenant_id ON dealer_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dealer_settings_updated_at ON dealer_settings(updated_at DESC);

-- Row Level Security
ALTER TABLE dealer_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access settings for their own dealership
CREATE POLICY dealer_settings_select_policy ON dealer_settings
  FOR SELECT
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR tenant_id = current_setting('app.current_tenant_id', true)
    OR current_setting('app.user_role', true) = 'admin'
  );

-- Policy: Users can update their own dealer settings
CREATE POLICY dealer_settings_update_policy ON dealer_settings
  FOR UPDATE
  USING (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR tenant_id = current_setting('app.current_tenant_id', true)
    OR current_setting('app.user_role', true) = 'admin'
  );

-- Policy: Allow inserts for new dealers
CREATE POLICY dealer_settings_insert_policy ON dealer_settings
  FOR INSERT
  WITH CHECK (
    dealer_id = current_setting('app.current_dealer_id', true)
    OR tenant_id = current_setting('app.current_tenant_id', true)
    OR current_setting('app.user_role', true) = 'admin'
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dealer_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER dealer_settings_updated_at
  BEFORE UPDATE ON dealer_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_settings_timestamp();

-- Add comment
COMMENT ON TABLE dealer_settings IS 'Stores dealer-specific integration settings and credentials';
