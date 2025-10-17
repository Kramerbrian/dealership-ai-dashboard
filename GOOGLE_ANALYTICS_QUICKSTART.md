# Google Analytics Integration - Quick Start

This is a condensed version of the full setup guide. For detailed instructions, see [GOOGLE_ANALYTICS_SETUP.md](./GOOGLE_ANALYTICS_SETUP.md).

## Quick Setup (5 minutes)

### 1. Enable API & Create Service Account

```bash
# Go to Google Cloud Console
open https://console.cloud.google.com/

# Enable Google Analytics Data API
# Create Service Account → Download JSON key
```

### 2. Add Service Account to GA4

```bash
# Go to Google Analytics Admin
open https://analytics.google.com/

# Admin → Property Access Management → Add Users
# Add: your-service-account@project.iam.gserviceaccount.com
# Role: Viewer
```

### 3. Configure Environment Variables

Add to `.env.local`:

```bash
GA_PROPERTY_ID="123456789"
GA_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GA_PROJECT_ID="your-gcp-project-id"
```

### 4. Test the Integration

```bash
# Install dependencies (already done)
npm install

# Run test script
npm run test:analytics

# Or test via API endpoint
npm run dev
# Then visit: http://localhost:3000/api/test-analytics
```

## Usage in Code

```typescript
import { getAnalyticsClient } from '@/lib/analytics/google-analytics-client';

const client = getAnalyticsClient();

// Get active users
const activeUsers = await client.getActiveUsers('30daysAgo', 'today');

// Get realtime users
const realtimeUsers = await client.getRealtimeUsers();

// Get engagement data
const engagement = await client.getUserEngagement('7daysAgo', 'today');

// Get top pages
const topPages = await client.getTopPages('30daysAgo', 'today', 10);
```

## Production Deployment (Vercel)

Add these environment variables in Vercel dashboard:

```bash
GA_PROPERTY_ID=123456789
GA_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GA_PROJECT_ID=your-gcp-project-id
```

**Important**: Keep the `\n` characters in GA_PRIVATE_KEY as-is.

## Available Commands

```bash
npm run test:analytics        # Run comprehensive test suite
npm run analytics:test-api    # Quick API endpoint test
npm run dev                   # Start dev server
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Permission denied" | Add service account to GA4 with Viewer role |
| "Invalid credentials" | Check private key formatting (keep `\n` chars) |
| "Property not found" | Verify GA_PROPERTY_ID (numeric only, no prefix) |
| "API not enabled" | Enable Google Analytics Data API in GCP |

## Next Steps

1. ✅ Integration tested and working
2. 🔄 Implement caching layer (Redis recommended)
3. 📊 Create dashboard widgets with real data
4. 🔔 Set up alerts for quota limits
5. 📈 Build automated reports

## Resources

- [Full Setup Guide](./GOOGLE_ANALYTICS_SETUP.md)
- [API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Quota Information](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas)
