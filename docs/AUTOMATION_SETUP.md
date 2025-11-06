# Automated Actual Scores Submission

## Overview

Automation allows you to automatically submit actual KPI scores for forecasts without manual intervention. This can be set up via:

1. **Cron Jobs** - Scheduled monthly execution
2. **Webhooks** - Real-time updates from external systems
3. **API Integration** - Direct integration with your data sources
4. **Vercel Cron** - Serverless scheduled functions

## Setup Options

### Option 1: Vercel Cron (Recommended for Production)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/submit-actual-scores",
      "schedule": "0 9 1 * *"
    }
  ]
}
```

Create `app/api/cron/submit-actual-scores/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { automateActualScores } from "@/scripts/automate-actual-scores";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await automateActualScores();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Option 2: Traditional Cron Job

Add to your crontab (`crontab -e`):

```bash
# Run on the 1st of each month at 9 AM
0 9 1 * * cd /path/to/dealership-ai-dashboard && npm run automate:actual-scores >> /var/log/forecast-automation.log 2>&1
```

### Option 3: GitHub Actions

Create `.github/workflows/automate-actual-scores.yml`:

```yaml
name: Automate Actual Scores

on:
  schedule:
    - cron: '0 9 1 * *'  # First day of month at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  submit-actual-scores:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run automation
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.APP_URL }}
          AUTOMATION_API_KEY: ${{ secrets.AUTOMATION_API_KEY }}
        run: npm run automate:actual-scores
```

### Option 4: Webhook Integration

Set up webhook endpoint in your external system:

```typescript
// Your external system calls this when KPIs are updated
POST https://your-domain.com/api/forecast-actual/automate
Authorization: Bearer YOUR_AUTOMATION_API_KEY
Content-Type: application/json

{
  "forecastId": "abc123",
  "actualScores": {
    "AIV": 82,
    "ATI": 76,
    "CVI": 88,
    "ORI": 72,
    "GRI": 80,
    "DPI": 80
  },
  "actualLeads": 485,
  "actualRevenue": 582000,
  "source": "google_analytics"
}
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Automation API Key (for secure webhook access)
AUTOMATION_API_KEY=your-secure-random-key-here

# App URL (for API calls)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Vercel Cron Secret (if using Vercel cron)
CRON_SECRET=your-cron-secret

# Your data source API keys (examples)
KPI_API_KEY=your-kpi-api-key
KPI_API_URL=https://your-kpi-api.com
GOOGLE_ANALYTICS_KEY=your-ga-key
```

### Implementing Data Source Integration

1. **Edit `scripts/automate-actual-scores.ts`**:
   - Update `getActualKPIs()` function with your data source
   - Update `getActualRevenue()` function with your revenue source

2. **Example Integration** (see `scripts/integrations/kpi-data-source-example.ts`):
   - Google Analytics
   - Database queries
   - External API
   - CSV files
   - Webhooks

## API Endpoints

### `POST /api/forecast-actual/automate`

Automated submission endpoint (requires API key).

**Headers:**
```
Authorization: Bearer YOUR_AUTOMATION_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "forecastId": "string",
  "actualScores": {
    "AIV": number,
    "ATI": number,
    "CVI": number,
    "ORI": number,
    "GRI": number,
    "DPI": number
  },
  "actualLeads": number,
  "actualRevenue": number,
  "source": "string"
}
```

### `GET /api/forecast-actual/automate`

Get list of forecasts ready for automation (30+ days old, no actual scores).

**Response:**
```json
{
  "ready": [
    {
      "id": "string",
      "timestamp": "ISO date",
      "dealers": ["string"],
      "forecast": {},
      "daysSince": number
    }
  ],
  "count": number
}
```

## Testing

### Test Automation Script

```bash
npm run automate:actual-scores
```

### Test API Endpoint

```bash
# Get ready forecasts
curl http://localhost:3000/api/forecast-actual/automate

# Submit actual scores
curl -X POST http://localhost:3000/api/forecast-actual/automate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "forecastId": "your_forecast_id",
    "actualScores": {
      "AIV": 82,
      "ATI": 76,
      "CVI": 88,
      "ORI": 72,
      "GRI": 80,
      "DPI": 80
    },
    "source": "test"
  }'
```

## Monitoring

### Logs

Automation script logs:
- ✅ Successful submissions
- ⏭️ Skipped forecasts (no data available)
- ❌ Errors

Check logs:
```bash
# If using cron
tail -f /var/log/forecast-automation.log

# If using Vercel
# Check Vercel dashboard → Functions → Logs
```

### Verification

After automation runs, verify results:

```bash
# Check accuracy stats
curl http://localhost:3000/api/forecast-actual?limit=10

# Check Forecast Accuracy Tracker in UI
# Navigate to /dashboard/compare
```

## Troubleshooting

### No Forecasts Found

- Ensure forecasts are being generated
- Check that forecasts are 30+ days old
- Verify database connection

### Data Source Errors

- Check API keys and credentials
- Verify data source connectivity
- Review error logs for specific issues

### Authentication Errors

- Verify `AUTOMATION_API_KEY` is set correctly
- Check Authorization header format
- Ensure API key matches in both systems

## Security

1. **Use Strong API Keys**: Generate random keys for `AUTOMATION_API_KEY`
2. **HTTPS Only**: Always use HTTPS for webhook endpoints
3. **Rate Limiting**: Implement rate limiting on automation endpoints
4. **Audit Logging**: Log all automation activities

## Next Steps

1. Choose your automation method (Vercel Cron recommended)
2. Implement your data source integration
3. Set up environment variables
4. Test with a few forecasts
5. Monitor and adjust as needed

For detailed integration examples, see `scripts/integrations/kpi-data-source-example.ts`.

