# Google Analytics Data API Setup Guide

This guide walks you through setting up Google Analytics Data API integration for real-time dealership analytics.

## Prerequisites

- Google Analytics 4 (GA4) property set up for your dealership
- Google Cloud Console access
- Node.js project with `@google-analytics/data` installed

## Step 1: Enable Google Analytics Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Analytics Data API"
5. Click **Enable**

## Step 2: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in service account details:
   - **Name**: `dealershipai-analytics`
   - **Description**: `Service account for DealershipAI analytics integration`
4. Click **Create and Continue**
5. Grant the service account the **Viewer** role
6. Click **Done**

## Step 3: Generate Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Select **JSON** format
5. Click **Create**
6. Save the downloaded JSON file securely (e.g., `google-analytics-credentials.json`)

## Step 4: Grant Access in Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 property
3. Click **Admin** (gear icon in bottom left)
4. Under **Property**, click **Property Access Management**
5. Click **Add users** (+ icon)
6. Enter the service account email (e.g., `dealershipai-analytics@your-project.iam.gserviceaccount.com`)
7. Select **Viewer** role
8. Click **Add**

## Step 5: Get Your Property ID

1. In Google Analytics Admin, select your property
2. Click **Property Settings**
3. Copy your **Property ID** (format: `123456789`)

## Step 6: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Google Analytics Data API
GA_PROPERTY_ID="123456789"
GOOGLE_APPLICATION_CREDENTIALS="./google-analytics-credentials.json"

# Alternative: Use service account JSON directly (for production)
GA_SERVICE_ACCOUNT_EMAIL="dealershipai-analytics@your-project.iam.gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
```

### For Production (Vercel/Environment Variables)

Instead of using a file path, use the JSON content directly:

```bash
# Option 1: Full JSON as base64
GOOGLE_CREDENTIALS_BASE64="<base64-encoded-json>"

# Option 2: Individual fields
GA_PROPERTY_ID="123456789"
GA_SERVICE_ACCOUNT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GA_PROJECT_ID="your-gcp-project-id"
```

## Step 7: Set Up Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GA_PROPERTY_ID` | Your GA4 Property ID | Production, Preview, Development |
| `GA_SERVICE_ACCOUNT_EMAIL` | Service account email | Production, Preview, Development |
| `GA_PRIVATE_KEY` | Private key from JSON | Production, Preview, Development |
| `GA_PROJECT_ID` | GCP Project ID | Production, Preview, Development |

**Important**: When adding the private key, keep the `\n` characters as-is. Vercel will handle them correctly.

## Step 8: Test the Integration

Run the test script:

```bash
npm run test:analytics
```

Or create a test API endpoint at `app/api/test-analytics/route.ts`:

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GA_PROJECT_ID,
    });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }],
    });

    return NextResponse.json({
      success: true,
      data: response.rows,
    });
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
```

Visit `http://localhost:3000/api/test-analytics` to test.

## Step 9: Integrate into Dashboard

Create a reusable analytics client at `lib/analytics/google-analytics-client.ts`:

```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export class GoogleAnalyticsClient {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;

  constructor() {
    this.propertyId = process.env.GA_PROPERTY_ID!;

    this.client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      projectId: process.env.GA_PROJECT_ID,
    });
  }

  async getActiveUsers(startDate: string = '30daysAgo', endDate: string = 'today') {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: 'activeUsers' }],
    });

    return response;
  }

  async getUserEngagement(startDate: string = '30daysAgo', endDate: string = 'today') {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    return response;
  }

  async getTopPages(startDate: string = '30daysAgo', endDate: string = 'today', limit: number = 10) {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
      limit,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    });

    return response;
  }
}
```

## Common Metrics Available

| Metric Name | Description |
|-------------|-------------|
| `activeUsers` | Number of distinct users who visited |
| `sessions` | Total number of sessions |
| `engagementRate` | Percentage of engaged sessions |
| `averageSessionDuration` | Average length of sessions |
| `screenPageViews` | Total page views |
| `conversions` | Number of conversion events |
| `eventCount` | Total events triggered |

## Common Dimensions Available

| Dimension Name | Description |
|----------------|-------------|
| `date` | Date of the activity |
| `city` | City of the user |
| `country` | Country of the user |
| `deviceCategory` | Device type (mobile, desktop, tablet) |
| `pagePath` | URL path of the page |
| `pageTitle` | Title of the page |
| `eventName` | Name of the event |
| `source` | Traffic source |
| `medium` | Traffic medium |

## Troubleshooting

### Error: "Permission denied"
- Verify the service account has Viewer access in GA4
- Check that you're using the correct Property ID

### Error: "Invalid credentials"
- Ensure the private key includes `\n` characters properly escaped
- Verify the service account email is correct

### Error: "Property not found"
- Confirm the GA_PROPERTY_ID is correct (numeric only, no "properties/" prefix)
- Ensure the service account has been added to the property

### Rate Limits
- Google Analytics Data API has quotas (25,000 tokens per day for free tier)
- Implement caching to reduce API calls
- Consider using Redis to cache responses for 5-15 minutes

## Next Steps

1. Set up data caching layer
2. Create dashboard widgets using real analytics data
3. Implement error handling and fallbacks
4. Set up monitoring for API quota usage
5. Create automated reports

## Resources

- [Google Analytics Data API Documentation](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [API Reference](https://googleapis.dev/nodejs/analytics-data/latest/)
- [Quota Information](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas)
