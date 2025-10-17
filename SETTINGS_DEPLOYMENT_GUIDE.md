# Dealer Settings Deployment Guide

## Quick Deployment Steps

### 1. Deploy Database Schema

You have two options:

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: `gzlgfghpkbqlhgfozjkb`
3. Navigate to **SQL Editor**
4. Copy the contents of `/tmp/dealer_settings_only.sql` (shown below)
5. Click **Run** to execute

#### Option B: Via Command Line
```bash
# Copy the SQL file to your clipboard
pbcopy < /tmp/dealer_settings_only.sql

# Then paste into Supabase SQL Editor
```

### 2. Verify Environment Variables

Ensure these are set in your Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://gzlgfghpkbqlhgfozjkb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy to Vercel

```bash
cd /Users/briankramer/dealership-ai-dashboard
vercel --prod
```

### 4. Test the Settings Page

Navigate to:
```
https://dash.dealershipai.com/settings
```

## SQL Schema to Deploy

Copy this entire script into Supabase SQL Editor:

```sql
-- Dealer Settings Table (standalone - safe to run)

CREATE TABLE IF NOT EXISTS dealer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_id TEXT NOT NULL UNIQUE,
  tenant_id TEXT,

  analytics JSONB NOT NULL DEFAULT '{
    "googleAnalytics": {"enabled": false, "measurementId": "", "propertyId": ""},
    "googleTagManager": {"enabled": false, "containerId": ""},
    "facebookPixel": {"enabled": false, "pixelId": ""},
    "tiktokPixel": {"enabled": false, "pixelId": ""},
    "linkedInInsightTag": {"enabled": false, "partnerId": ""},
    "microsoftClarity": {"enabled": false, "projectId": ""},
    "hotjar": {"enabled": false, "siteId": ""}
  }'::jsonb,

  google_business_profile JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "placeId": "",
    "locationId": "",
    "cid": ""
  }'::jsonb,

  google_services JSONB NOT NULL DEFAULT '{
    "searchConsole": {"enabled": false, "siteUrl": "", "verificationCode": ""},
    "ads": {"enabled": false, "customerId": "", "conversionId": "", "conversionLabel": ""}
  }'::jsonb,

  social_media JSONB NOT NULL DEFAULT '{
    "facebook": {"enabled": false, "pageId": ""},
    "instagram": {"enabled": false, "businessAccountId": ""},
    "twitter": {"enabled": false, "username": ""},
    "linkedin": {"enabled": false, "companyId": ""},
    "youtube": {"enabled": false, "channelId": ""}
  }'::jsonb,

  reviews JSONB NOT NULL DEFAULT '{
    "googleReviews": {"enabled": false, "autoMonitor": false, "autoRespond": false},
    "yelp": {"enabled": false, "businessId": ""},
    "dealerRater": {"enabled": false, "dealerId": ""}
  }'::jsonb,

  crm JSONB NOT NULL DEFAULT '{
    "hubspot": {"enabled": false, "portalId": ""},
    "salesforce": {"enabled": false, "instanceUrl": ""},
    "activeCampaign": {"enabled": false, "apiUrl": ""}
  }'::jsonb,

  automotive JSONB NOT NULL DEFAULT '{
    "vinsolutions": {"enabled": false, "dealerId": ""},
    "dealerSocket": {"enabled": false, "dealerId": ""},
    "eleadCRM": {"enabled": false, "dealerId": ""},
    "cdk": {"enabled": false, "siteId": ""},
    "reynoldsReynolds": {"enabled": false, "dealerId": ""}
  }'::jsonb,

  integrations JSONB NOT NULL DEFAULT '{
    "zapier": {"enabled": false, "webhookUrl": ""},
    "slack": {"enabled": false, "webhookUrl": "", "channel": ""},
    "email": {"provider": "sendgrid", "fromEmail": "", "fromName": ""}
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dealer_settings_dealer_id ON dealer_settings(dealer_id);
CREATE INDEX IF NOT EXISTS idx_dealer_settings_tenant_id ON dealer_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dealer_settings_updated_at ON dealer_settings(updated_at DESC);

-- RLS
ALTER TABLE dealer_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS dealer_settings_select_policy ON dealer_settings;
DROP POLICY IF EXISTS dealer_settings_update_policy ON dealer_settings;
DROP POLICY IF EXISTS dealer_settings_insert_policy ON dealer_settings;

-- Select policy
CREATE POLICY dealer_settings_select_policy ON dealer_settings
  FOR SELECT
  USING (true);

-- Update policy
CREATE POLICY dealer_settings_update_policy ON dealer_settings
  FOR UPDATE
  USING (true);

-- Insert policy
CREATE POLICY dealer_settings_insert_policy ON dealer_settings
  FOR INSERT
  WITH CHECK (true);

-- Function for timestamp
CREATE OR REPLACE FUNCTION update_dealer_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS dealer_settings_updated_at ON dealer_settings;

-- Create trigger
CREATE TRIGGER dealer_settings_updated_at
  BEFORE UPDATE ON dealer_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_dealer_settings_timestamp();

-- Comment
COMMENT ON TABLE dealer_settings IS 'Stores dealer-specific integration settings and credentials';

-- Success message
SELECT 'dealer_settings table created successfully!' as status;
```

## Testing Checklist

After deployment, verify:

- [ ] Settings page loads at `/dash/settings`
- [ ] All 5 tabs are accessible
- [ ] Form fields accept input
- [ ] Toggle switches work
- [ ] Save button triggers API call
- [ ] Success message displays
- [ ] Settings persist after page refresh
- [ ] API returns default settings for new dealers

## API Test Commands

### Fetch Settings
```bash
curl "https://dash.dealershipai.com/api/settings/dealer?dealerId=lou-grubbs-motors"
```

### Save Settings
```bash
curl -X POST "https://dash.dealershipai.com/api/settings/dealer" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "lou-grubbs-motors",
    "section": "analytics",
    "data": {
      "googleAnalytics": {
        "enabled": true,
        "measurementId": "G-TEST123456",
        "propertyId": ""
      },
      "googleTagManager": {
        "enabled": false,
        "containerId": ""
      },
      "facebookPixel": {
        "enabled": false,
        "pixelId": ""
      },
      "tiktokPixel": {
        "enabled": false,
        "pixelId": ""
      },
      "linkedInInsightTag": {
        "enabled": false,
        "partnerId": ""
      },
      "microsoftClarity": {
        "enabled": false,
        "projectId": ""
      },
      "hotjar": {
        "enabled": false,
        "siteId": ""
      }
    }
  }'
```

## Files Created

### UI Components
- `app/dash/settings/page.tsx` - Main settings page
- `app/dash/settings/components/AnalyticsSettings.tsx`
- `app/dash/settings/components/GoogleBusinessSettings.tsx`
- `app/dash/settings/components/GoogleServicesSettings.tsx`
- `app/dash/settings/components/SocialMediaSettings.tsx`
- `app/dash/settings/components/ReviewPlatformsSettings.tsx`

### Backend
- `app/api/settings/dealer/route.ts` - API endpoint with database integration
- `lib/types/dealer-settings.ts` - TypeScript interfaces

### Database
- `supabase/migrations/20251016000001_dealer_settings.sql` - Schema migration
- `/tmp/dealer_settings_only.sql` - Standalone deployment script

### Documentation
- `DEALER_SETTINGS_SYSTEM.md` - Complete feature documentation
- `SETTINGS_DEPLOYMENT_GUIDE.md` - This file

## Troubleshooting

### "Table already exists" error
The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. If you see this error, the table already exists and you're good to go.

### Settings not saving
1. Check Supabase logs for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Ensure RLS policies allow the operation
4. Check browser console for client-side errors

### Can't access settings page
1. Verify Vercel deployment succeeded
2. Check that the route exists: `app/dash/settings/page.tsx`
3. Ensure all component files are present
4. Check for TypeScript errors in build logs

## Next Steps After Deployment

1. **Test with Real Data**: Enter actual tracking IDs and verify they save
2. **Update Dashboard**: Modify dashboard components to use dealer-specific IDs
3. **Add Integration Health**: Monitor which integrations are active/working
4. **Implement Data Collection**: Use the stored IDs to fetch enhanced metrics
5. **Add More Platforms**: Expand to CRM and automotive platforms

## Support

For issues or questions:
- Check logs in Supabase Dashboard
- Review Vercel deployment logs
- Test API endpoints directly with curl
- Inspect browser console for client errors

---

**Status**: Ready for deployment
**Date**: October 16, 2025
**Version**: 1.0.0
