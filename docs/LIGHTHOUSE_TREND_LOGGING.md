# Lighthouse Trend Logging System

## Overview

The Lighthouse Trend Logging system provides continuous monitoring of site performance, accessibility, best practices, and SEO metrics. It runs nightly via Vercel Cron and logs historical data for trend analysis.

## Components

### 1. Nightly Lighthouse Audit (`/api/nightly-lighthouse`)

**Schedule:** `0 3 * * *` (3 AM UTC daily)

**What it does:**
- Runs Google PageSpeed Insights API audit
- Calculates Performance, Accessibility, Best Practices, and SEO scores
- Logs results to `/data/lighthouse-history.json` (local/dev) or database (production)
- Sends Slack notifications with metrics and alerts
- Detects threshold violations (Performance < 75%, Accessibility < 90%, SEO < 80%)

**Environment Variables:**
- `DEPLOY_URL` or `NEXT_PUBLIC_BASE_URL` - Site URL to audit (default: `https://dealershipai.com`)
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications

**Response Format:**
```json
{
  "status": "ok",
  "perf": 93,
  "acc": 97,
  "bp": 100,
  "seo": 96,
  "avg": 96,
  "timestamp": "2025-11-06T03:00:12.774Z",
  "logged": true
}
```

### 2. Lighthouse Trends API (`/api/lighthouse-trends`)

**Purpose:** Returns rolling averages and chart-ready data for dashboard visualization.

**Query Parameters:**
- `days` - Number of days to include (default: 7)
- `metric` - Metric to analyze: `perf` | `acc` | `bp` | `seo` | `avg` (default: `avg`)

**Response Format:**
```json
{
  "metric": "avg",
  "days": 7,
  "trends": [
    {
      "date": "2025-11-04T03:00:10.320Z",
      "perf": 92,
      "acc": 97,
      "bp": 100,
      "seo": 96,
      "avg": 96
    }
  ],
  "rollingAverage": 96,
  "change": 0,
  "changePercent": 0,
  "current": 96,
  "min": 95,
  "max": 97,
  "count": 7
}
```

## Data Storage

### Local/Development
- **Location:** `/data/lighthouse-history.json`
- **Format:** Array of timestamped entries
- **Retention:** Last 365 days (auto-pruned)

### Production (Vercel)
- **Note:** Filesystem is read-only in Vercel serverless functions
- **Recommended:** Use Supabase, Vercel KV, or PostgreSQL for production storage
- **Migration:** Update `app/api/nightly-lighthouse/route.ts` to write to your database

## Integration Examples

### Dashboard Chart Component

```tsx
'use client';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

export function LighthouseTrendChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/lighthouse-trends?days=30&metric=avg')
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <Line
      data={{
        labels: data.trends.map((t) => new Date(t.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Average Score',
            data: data.trends.map((t) => t.avg),
            borderColor: 'rgb(6, 182, 212)',
          },
        ],
      }}
    />
  );
}
```

### Quarterly Digest Integration

```typescript
// Read historical data for quarterly report
const history = await fs.readFile('data/lighthouse-history.json', 'utf8');
const data = JSON.parse(history);

// Filter to last quarter
const quarterStart = new Date();
quarterStart.setMonth(quarterStart.getMonth() - 3);
const quarterData = data.filter(
  (entry) => new Date(entry.timestamp) > quarterStart
);

// Calculate trends
const avgStart = quarterData[0]?.avg || 0;
const avgEnd = quarterData[quarterData.length - 1]?.avg || 0;
const trend = avgEnd - avgStart;
```

## Slack Notifications

### Success Message
```
🌙 Nightly Lighthouse Audit — 11/06/2025
• Performance: 93 %
• Accessibility: 97 %
• Best Practices: 100 %
• SEO: 96 %
• Avg: 96 %
https://dealershipai.com
```

### Alert Message
```
⚠️ Performance below threshold (75%)
⚠️ SEO below threshold (80%)

🌙 Nightly Lighthouse Audit — 11/06/2025
• Performance: 72 %
• Accessibility: 97 %
• Best Practices: 100 %
• SEO: 78 %
• Avg: 87 %
https://dealershipai.com
```

## Production Migration

To use database storage in production:

1. **Create a database table:**
```sql
CREATE TABLE lighthouse_history (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  perf INTEGER NOT NULL,
  acc INTEGER NOT NULL,
  bp INTEGER NOT NULL,
  seo INTEGER NOT NULL,
  avg INTEGER NOT NULL,
  url TEXT NOT NULL
);
```

2. **Update the route to use Prisma:**
```typescript
import { prisma } from '@/lib/prisma';

// Replace filesystem write with:
await prisma.lighthouseHistory.create({
  data: {
    timestamp: new Date(),
    perf,
    acc,
    bp,
    seo,
    avg,
    url: DEPLOY_URL,
  },
});

// Replace filesystem read with:
const recent = await prisma.lighthouseHistory.findMany({
  where: {
    timestamp: { gte: cutoff },
  },
  orderBy: { timestamp: 'asc' },
});
```

## Monitoring

- **Vercel Cron Logs:** Check Vercel dashboard → Cron Jobs → `/api/nightly-lighthouse`
- **Slack Channel:** Monitor webhook notifications for alerts
- **Trend API:** Use `/api/lighthouse-trends` to verify data is being logged

## Troubleshooting

### No data in trends API
- Check if cron job is running (Vercel dashboard)
- Verify `DEPLOY_URL` is set correctly
- Check Slack notifications for errors

### File system errors in production
- Expected: Vercel serverless functions have read-only filesystem
- Solution: Migrate to database storage (see Production Migration)

### PageSpeed API errors
- Verify API quota limits
- Check network connectivity
- Review error logs in Vercel dashboard

