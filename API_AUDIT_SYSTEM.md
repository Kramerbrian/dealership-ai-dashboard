# API Connection Audit System

## Overview

The API Connection Audit System validates and monitors all dealer integrations, ensuring that credentials are valid, connections are active, and data is flowing correctly. It provides real-time health monitoring, automatic testing, and detailed logging.

## Features

### 1. **Integration Health Dashboard**
- Real-time status of all integrations
- Overall health score (Healthy / Degraded / Critical)
- One-click health check button
- Detailed status for each integration
- Performance metrics (response time, data points)
- Historical audit log

### 2. **Automated Validation**
Each integration is tested with:
- **Format Validation**: Checks ID/credential format
- **Connection Test**: Verifies API accessibility
- **Data Flow Check**: Confirms data is being received
- **Performance Metrics**: Measures response time
- **Error Detection**: Captures and logs errors

### 3. **Audit Logging**
Every health check is logged with:
- Timestamp of check
- Integration name
- Status (active/warning/error/inactive)
- Response time
- Data points received
- Error details (if failed)
- Validation results

## Supported Integrations

### Currently Audited
✅ **Google Analytics 4** - Validates measurement ID format and data flow
✅ **Google Business Profile** - Verifies Place ID and location access
✅ **Facebook Pixel** - Checks pixel ID and event tracking
✅ **Google Search Console** - Validates site ownership and data access

### Easy to Add
The system is designed to easily add more:
- Google Tag Manager
- TikTok Pixel
- LinkedIn Insight Tag
- Microsoft Clarity
- Hotjar
- Social Media APIs
- Review Platforms
- CRM Systems

## Architecture

### Components

```
lib/services/integration-audit.ts
├── auditGoogleAnalytics()          # Test GA4 connection
├── auditGoogleBusinessProfile()    # Test GBP connection
├── auditFacebookPixel()            # Test Facebook Pixel
├── auditGoogleSearchConsole()      # Test Search Console
├── auditAllIntegrations()          # Run all tests
└── logAuditResult()                # Save to database

app/api/settings/audit/route.ts
├── POST /api/settings/audit        # Run new audit
└── GET /api/settings/audit         # Get latest results

app/dash/settings/components/IntegrationHealth.tsx
└── Integration Health Dashboard UI

database
└── integration_audit_log           # Audit history table
```

## Usage

### Run Health Check (UI)

1. Navigate to `/dash/settings`
2. Click "Integration Health" tab
3. Click "Run Health Check" button
4. View results with color-coded status

### Run Audit (API)

```bash
# Run a new audit
curl -X POST https://dash.dealershipai.com/api/settings/audit \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "lou-grubbs-motors"}'

# Response
{
  "dealerId": "lou-grubbs-motors",
  "overall": "healthy",
  "totalIntegrations": 4,
  "activeIntegrations": 3,
  "failedIntegrations": 1,
  "integrations": [
    {
      "integration": "Google Analytics 4",
      "status": "active",
      "isValid": true,
      "message": "Connection successful, receiving data",
      "lastChecked": "2025-10-16T10:30:00Z",
      "responseTime": 145,
      "dataPoints": 1250
    }
  ],
  "lastAudit": "2025-10-16T10:30:00Z"
}
```

### Get Latest Results (API)

```bash
# Get cached results
curl https://dash.dealershipai.com/api/settings/audit?dealerId=lou-grubbs-motors

# Same response format as above
```

## Status Codes

### Overall Health
- **🟢 Healthy**: All integrations working
- **🟡 Degraded**: Some integrations failing (< 50%)
- **🔴 Critical**: Most integrations failing (≥ 50%)

### Integration Status
- **✓ Active**: Connected and receiving data
- **⚠ Warning**: Connected but issues detected
- **✗ Error**: Connection failed or invalid
- **○ Inactive**: Integration disabled

## Database Schema

```sql
CREATE TABLE integration_audit_log (
  id UUID PRIMARY KEY,
  dealer_id TEXT NOT NULL,
  integration_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'error', 'warning')),
  is_valid BOOLEAN,
  message TEXT,
  response_time_ms INTEGER,
  data_points INTEGER,
  error_details TEXT,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

## Adding New Integration Tests

To add a new integration audit:

### 1. Create Audit Function

```typescript
// lib/services/integration-audit.ts

export async function auditNewIntegration(
  credentialId: string
): Promise<AuditResult> {
  const startTime = Date.now();

  try {
    // Validate format
    if (!isValidFormat(credentialId)) {
      return {
        integration: 'New Integration',
        status: 'error',
        isValid: false,
        message: 'Invalid credential format',
        lastChecked: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      };
    }

    // Test connection
    const response = await fetch(`https://api.service.com/test?id=${credentialId}`);

    if (response.ok) {
      const data = await response.json();
      return {
        integration: 'New Integration',
        status: 'active',
        isValid: true,
        message: 'Connection successful',
        lastChecked: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        dataPoints: data.count,
      };
    }

    return {
      integration: 'New Integration',
      status: 'error',
      isValid: false,
      message: 'Connection failed',
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      integration: 'New Integration',
      status: 'error',
      isValid: false,
      message: 'Connection failed',
      lastChecked: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      errorDetails: error.message,
    };
  }
}
```

### 2. Add to Comprehensive Audit

```typescript
// lib/services/integration-audit.ts

export async function auditAllIntegrations(
  dealerId: string,
  settings: any
): Promise<IntegrationHealth> {
  const results: AuditResult[] = [];

  // Add your new integration
  if (settings.newIntegration?.enabled) {
    const result = await auditNewIntegration(
      settings.newIntegration.credentialId
    );
    results.push(result);
  }

  // ... rest of function
}
```

### 3. Done!
The UI will automatically display the new integration in the health dashboard.

## Automated Monitoring

### Set Up Cron Job (Optional)

Run automated health checks on a schedule:

```typescript
// app/api/cron/health-check/route.ts

export async function GET(req: NextRequest) {
  // Verify cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all dealers with integrations
  const dealers = await getAllDealersWithIntegrations();

  // Run audits for each
  for (const dealer of dealers) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/settings/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealerId: dealer.id }),
    });
  }

  return NextResponse.json({ success: true, checked: dealers.length });
}
```

Add to Vercel Cron:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/health-check",
    "schedule": "0 */6 * * *"  // Every 6 hours
  }]
}
```

## Alerts & Notifications

### Send Alerts on Failure

```typescript
// lib/services/integration-audit.ts

export async function sendAlertIfNeeded(result: AuditResult, dealerId: string) {
  if (result.status === 'error' || result.status === 'critical') {
    // Send email alert
    await sendEmail({
      to: 'dealer@example.com',
      subject: `Integration Alert: ${result.integration} Failed`,
      body: `
        Your ${result.integration} integration is experiencing issues.

        Status: ${result.status}
        Message: ${result.message}
        Error: ${result.errorDetails || 'N/A'}

        Please check your settings at: ${process.env.NEXT_PUBLIC_APP_URL}/dash/settings
      `,
    });

    // Send Slack notification
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Integration Alert for ${dealerId}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${result.integration}* is experiencing issues\n\n*Status:* ${result.status}\n*Message:* ${result.message}`,
            },
          },
        ],
      }),
    });
  }
}
```

## Benefits

### For Dealers
- **Visibility**: See exactly which integrations are working
- **Confidence**: Know data is flowing correctly
- **Quick Fixes**: Identify issues immediately
- **Peace of Mind**: Automated monitoring

### For Platform
- **Quality Assurance**: Ensure data accuracy
- **Proactive Support**: Fix issues before dealers notice
- **Better Data**: Higher quality metrics from valid connections
- **Trust**: Demonstrate platform reliability

## Deployment

### 1. Deploy Database Schema

```bash
# Copy SQL from supabase/migrations/20251016000002_integration_audit_log.sql
# Paste into Supabase SQL Editor and run
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

### 3. Test

```bash
# Navigate to settings page
open https://dash.dealershipai.com/settings

# Click "Integration Health" tab
# Click "Run Health Check"
# Verify results appear
```

## Monitoring & Maintenance

### View Audit Logs

```sql
-- Get recent audits for a dealer
SELECT * FROM integration_audit_log
WHERE dealer_id = 'lou-grubbs-motors'
ORDER BY checked_at DESC
LIMIT 20;

-- Get failure rate by integration
SELECT
  integration_name,
  COUNT(*) as total_checks,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failures,
  ROUND(100.0 * SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) / COUNT(*), 2) as failure_rate
FROM integration_audit_log
WHERE checked_at > NOW() - INTERVAL '7 days'
GROUP BY integration_name
ORDER BY failure_rate DESC;

-- Get average response time
SELECT
  integration_name,
  AVG(response_time_ms) as avg_response_time,
  MIN(response_time_ms) as min_response_time,
  MAX(response_time_ms) as max_response_time
FROM integration_audit_log
WHERE checked_at > NOW() - INTERVAL '24 hours'
  AND response_time_ms IS NOT NULL
GROUP BY integration_name;
```

### Clean Up Old Logs

```sql
-- Manually delete old logs (older than 30 days)
DELETE FROM integration_audit_log
WHERE checked_at < NOW() - INTERVAL '30 days';

-- Or use the provided function
SELECT cleanup_old_audit_logs();
```

## Next Steps

1. ✅ Deploy audit system
2. ⏳ Add more integration validators
3. ⏳ Set up automated monitoring (cron)
4. ⏳ Implement email/Slack alerts
5. ⏳ Build analytics dashboard for audit trends
6. ⏳ Add self-healing (auto-retry failed connections)

---

**Status**: ✅ Complete and ready for deployment
**Last Updated**: October 16, 2025
**Version**: 1.0.0
