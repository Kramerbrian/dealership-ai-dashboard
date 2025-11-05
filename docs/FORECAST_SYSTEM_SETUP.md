# Adaptive Forecasting System - Setup Guide

## Overview

The adaptive forecasting system provides:
- ✅ **30-day KPI forecasts** with learned growth multipliers
- ✅ **Confidence intervals** for statistical reliability
- ✅ **Automatic drift detection** with Slack/email alerts
- ✅ **Historical tracking** in database
- ✅ **Visual dashboard** for trend analysis

## Current Status

The system is **fully functional** and will:
- Generate forecasts ✅
- Log predictions (gracefully handles missing DB table) ✅
- Send drift alerts ✅
- Display dashboard (shows empty state until DB is set up) ✅

## Database Setup (Optional but Recommended)

To enable persistent forecast storage, run the migration:

### Step 1: Run Database Migration

Execute this SQL in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/create_forecast_logs_table.sql
CREATE TABLE IF NOT EXISTS forecast_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  dealers TEXT[] NOT NULL,
  forecast JSONB NOT NULL,
  ci TEXT,
  leads_forecast INTEGER,
  revenue_forecast INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forecast_logs_timestamp ON forecast_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_forecast_logs_forecast ON forecast_logs USING GIN(forecast);
```

### Step 2: Update Prisma Schema (if using Prisma)

Add this model to your `schema.prisma`:

```prisma
model ForecastLog {
  id            String   @id @default(uuid())
  timestamp     DateTime @map("timestamp")
  dealers       String[]
  forecast      Json
  ci            String?
  leadsForecast Int?     @map("leads_forecast")
  revenueForecast Int?   @map("revenue_forecast")
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("forecast_logs")
}
```

Then run:
```bash
npx prisma generate
```

### Step 3: Verify

After setup, forecasts will automatically persist to the database. The Forecast Review Dashboard will populate with historical data.

## Environment Variables

### Required for Alerts

```bash
# Slack webhook for regular digests
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional: Separate webhook for drift alerts
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/ALERT/WEBHOOK/URL

# Email service (optional)
RESEND_API_KEY=re_xxxxxxxxxx
EXECUTIVE_EMAIL=executives@dealershipgroup.com
```

## How It Works

### 1. Forecast Generation

When a user clicks **"Show Forecast"** in Group Executive Summary:
- Model calculates 30-day projections using exponential smoothing (α=0.3)
- Learns from historical dealer performance
- Generates confidence intervals (90% CI)
- Projects lead volume and revenue

### 2. Drift Detection

The system automatically detects negative trends:
- AIV drops >2 points
- CVI drops >2 points  
- DPI drops >2 points

When detected, sends Slack alert:
```
⚠️ Downward KPI Drift Detected

Projected AIV 76.8, CVI 84.3, DPI 78.2.

Recommended: Verify schema freshness and conversion flow.
```

### 3. Historical Logging

Each forecast is logged with:
- Timestamp
- Dealer list
- Forecast values (AIV, ATI, CVI, ORI, GRI, DPI)
- Confidence interval
- Lead/revenue projections

### 4. Dashboard Visualization

The Forecast Review Dashboard shows:
- **Logged Forecasts Count**: Total predictions stored
- **Last Forecast Date**: Most recent projection
- **Avg Confidence Interval**: Statistical reliability
- **Model Reliability Score**: Forecast accuracy (100 = perfect)
- **DPI Trend Chart**: Visual projection with CI bands
- **KPI Comparison**: AIV vs CVI trends over time

## Model Details

### Exponential Smoothing

- **Alpha (α)**: 0.3 (30% weight to recent changes)
- **Learning Rate**: Adjusts growth multipliers based on actual vs. predicted
- **Bounds**: Growth rates clamped between 0.97x and 1.05x (3% decline to 5% growth)

### Confidence Interval

- Calculated using variance across all KPIs
- 90% confidence level (1.645 standard deviations)
- Shown as ±CI in forecast display

### Revenue Projection

- Base lead volume: 450/month
- Elasticity: 0.008 per KPI point
- Revenue per lead: $1,200

## Troubleshooting

### Dashboard Shows "No logged forecasts yet"

**Solution**: This is normal if:
- Database table hasn't been created yet
- No forecasts have been generated yet

The system works without the database table - it just won't persist history. Generate a forecast to see it in action.

### Alerts Not Sending

**Check**:
1. `SLACK_WEBHOOK_URL` is set in environment variables
2. Webhook URL is valid (test with curl)
3. Check server logs for error messages

### Database Errors

**If you see table errors**:
- The system gracefully degrades (returns empty arrays)
- No functionality is broken
- Simply run the migration when ready

## Next Steps

1. ✅ **System is ready to use** - Generate forecasts immediately
2. 🔄 **Optional**: Run database migration for persistent storage
3. 🔄 **Optional**: Configure Slack webhooks for alerts
4. 📊 **Monitor**: Check Forecast Review Dashboard for trends

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify environment variables are set correctly
- Review the Forecast Review Dashboard for visualization insights

