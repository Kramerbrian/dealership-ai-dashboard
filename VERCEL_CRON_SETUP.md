# Vercel Cron Infrastructure Setup Guide

## Overview

This guide walks through the automated configuration of Vercel Cron Jobs for the DealershipAI autonomous AIV model training, evaluation, and reporting system.

## ✅ What Has Been Configured

### 1. API Route Endpoints

The following API endpoints have been created or verified:

- **`/api/train/reinforce`** - Daily model weight reinforcement (already existed)
- **`/api/train/evaluate`** - Weekly model evaluation with RMSE, R², MAPE logging (already existed)
- **`/api/anomaly/reviews`** - Every 6 hours FraudGuard anomaly detection (newly created)
- **`/api/predict/forecast`** - Weekly Kalman-smoothed 4-week AIV forecast (newly created)
- **`/api/reports/roi`** - Monthly ROI and ad-efficiency report (already existed)
- **`/api/cron/health`** - Cron job health monitoring endpoint (newly created)

### 2. Vercel Cron Jobs Configuration

The `vercel.json` has been updated with the following cron schedules:

```json
{
  "crons": [
    {
      "path": "/api/train/reinforce",
      "schedule": "0 0 * * *"  // Daily at midnight UTC
    },
    {
      "path": "/api/train/evaluate",
      "schedule": "0 0 * * 0"  // Weekly on Sunday at midnight UTC
    },
    {
      "path": "/api/anomaly/reviews",
      "schedule": "0 */6 * * *"  // Every 6 hours
    },
    {
      "path": "/api/predict/forecast",
      "schedule": "0 0 * * 0"  // Weekly on Sunday at midnight UTC
    },
    {
      "path": "/api/reports/roi",
      "schedule": "0 0 1 * *"  // Monthly on the 1st at midnight UTC
    }
  ]
}
```

### 3. Database Schema

The following tables have been created via Supabase migrations:

#### Core Tables (from `20241220000001_aiv_closed_loop_system.sql`):
- **`model_audit`** - Tracks RMSE, R², MAPE, ΔAccuracy, ΔROI for each run
- **`aiv_raw_signals`** - Stores raw dealer signals (SEO, AEO, GEO, UGC, etc.)
- **`model_weights`** - Evolution of pillar weights over time
- **`anomaly_detection`** - FraudGuard anomaly results
- **`predictive_forecasts`** - Stored AIV predictions
- **`reinforcement_history`** - Weight update history

#### New Monitoring Tables (from `20250109_add_cron_monitoring_tables.sql`):
- **`review_anomalies`** - Tracks review anomalies detected by FraudGuard
- **`forecasts`** - Stores Kalman-smoothed AIV forecasts
- **`cron_job_executions`** - Logs each cron execution with timing and status
- **`cron_job_health`** - Monitors overall health of cron jobs for alerting

### 4. Database Functions

The following stored procedures are available:

- **`log_cron_execution()`** - Logs cron job execution and updates health metrics
- **`get_cron_health_summary()`** - Returns health summary of all cron jobs
- **`recompute_elasticity_8w()`** - Computes 8-week rolling elasticity
- **`update_model_weights()`** - Updates model weights using RL
- **`detect_review_anomalies()`** - Detects review anomalies

## 📋 Deployment Checklist

### Step 1: Environment Variables

Ensure the following environment variables are set in Vercel:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Optional
NEXT_PUBLIC_APP_URL=https://your-deployment-url.vercel.app
```

**To verify:**
```bash
npx vercel env ls
```

### Step 2: Run Database Migrations

Apply the Supabase migrations to create all required tables:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase db push

# Option 2: Using psql directly
PGPASSWORD='your-password' psql 'postgresql://postgres.xxx@aws-0-us-west-1.pooler.supabase.com:6543/postgres' -f supabase/migrations/20241220000001_aiv_closed_loop_system.sql

PGPASSWORD='your-password' psql 'postgresql://postgres.xxx@aws-0-us-west-1.pooler.supabase.com:6543/postgres' -f supabase/migrations/20250109_add_cron_monitoring_tables.sql
```

### Step 3: Deploy to Vercel

Push changes to your repository and deploy:

```bash
# Commit changes
git add .
git commit -m "feat: configure Vercel cron infrastructure for autonomous AIV system

- Add /api/anomaly/reviews endpoint for FraudGuard
- Add /api/predict/forecast endpoint for Kalman forecasting
- Add /api/cron/health endpoint for monitoring
- Configure 5 cron jobs in vercel.json
- Create database tables for cron monitoring
- Implement log_cron_execution() function

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main branch
git push origin main
```

Vercel will automatically deploy and activate the cron jobs.

### Step 4: Verify Cron Jobs in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Functions → Cron Jobs**
3. Verify all 5 cron jobs are listed and active:
   - `retrain-aiv` (daily)
   - `evaluate-aiv` (weekly)
   - `fraudguard-scan` (every 6 hours)
   - `predict-forecast` (weekly)
   - `generate-roi-report` (monthly)

### Step 5: Test Endpoints

Test each endpoint manually to ensure they work:

```bash
# Get base URL
export BASE_URL="https://your-deployment.vercel.app"

# Test /api/kpis/latest
curl "$BASE_URL/api/kpis/latest"

# Test /api/train/evaluate (GET)
curl "$BASE_URL/api/train/evaluate?dealerId=test-dealer-id"

# Test /api/cron/health
curl "$BASE_URL/api/cron/health"

# Test /api/anomaly/reviews (POST)
curl -X POST "$BASE_URL/api/anomaly/reviews" \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test-dealer-id"}'

# Test /api/predict/forecast (POST)
curl -X POST "$BASE_URL/api/predict/forecast" \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test-dealer-id", "forecastPeriod": 4}'
```

Expected: All endpoints return `{ "success": true, ... }` or HTTP 200.

### Step 6: Monitor Cron Job Health

Access the monitoring dashboard:

```bash
# Check cron job health
curl "$BASE_URL/api/cron/health" | jq
```

Expected response:
```json
{
  "success": true,
  "overall_health": {
    "status": "healthy",
    "total_jobs": 5,
    "healthy": 5,
    "degraded": 0,
    "critical": 0,
    "avg_success_rate": "100.00%",
    "last_checked": "2025-01-09T..."
  },
  "jobs": [...],
  "recent_executions": [...],
  "alerts": []
}
```

## 🎯 Success Criteria

According to the original specification, the system meets success criteria when:

- ✅ **5 Cron Jobs Active** - All cron jobs listed and running in Vercel
- ✅ **Accuracy Gain MoM ≥ 10%** - Tracked in `model_audit.accuracy_gain_mom`
- ✅ **Ad Efficiency Gain ≥ 15%** - Tracked in `model_audit.delta_roi`
- ✅ **Model R² ≥ 0.8** - Tracked in `model_audit.r2`

### Monitoring These Metrics

Query Supabase to check if success criteria are met:

```sql
-- Check latest model evaluation
SELECT
  run_date,
  r2,
  accuracy_gain_mom,
  delta_roi as ad_efficiency_gain,
  CASE
    WHEN r2 >= 0.8 AND accuracy_gain_mom >= 10 AND delta_roi >= 15
    THEN 'MEETING SUCCESS CRITERIA'
    ELSE 'BELOW TARGET'
  END as status
FROM model_audit
WHERE run_type = 'evaluate'
ORDER BY run_date DESC
LIMIT 1;
```

## 🚨 Error Handling & Alerts

### Automatic Alerting

The system will automatically detect:

1. **Consecutive Failures** - If a job fails 2+ times in a row, status becomes "critical"
2. **Missed Executions** - If a job hasn't run within expected timeframe
3. **Low Success Rate** - If success rate drops below 80%

### Viewing Alerts

```bash
curl "$BASE_URL/api/cron/health" | jq '.alerts'
```

### Manual Intervention

If alerts are triggered:

1. Check Vercel logs: `npx vercel logs --follow`
2. Review `cron_job_executions` table for error messages
3. Test endpoint manually to reproduce issue
4. Fix underlying issue and redeploy

## 📊 Dashboard Integration

To display cron health in your dashboard, create a component:

```typescript
// src/components/dashboard/CronHealthWidget.tsx
import { useEffect, useState } from 'react';

export function CronHealthWidget() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/cron/health')
      .then(res => res.json())
      .then(setHealth);
  }, []);

  if (!health) return <div>Loading...</div>;

  return (
    <div className="cron-health-widget">
      <h3>System Health</h3>
      <div className={`status ${health.overall_health.status}`}>
        {health.overall_health.status.toUpperCase()}
      </div>
      <div>Success Rate: {health.overall_health.avg_success_rate}</div>
      {health.alerts.length > 0 && (
        <div className="alerts">
          {health.alerts.map((alert, i) => (
            <div key={i} className={`alert ${alert.severity}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Cron Jobs Not Running

**Issue:** Cron jobs aren't executing on schedule.

**Solution:**
1. Check Vercel project settings → Functions → Cron Jobs
2. Ensure you're on a Pro plan (cron jobs require Pro+)
3. Verify `vercel.json` is in the repository root
4. Redeploy the project

### Database Connection Errors

**Issue:** Endpoints return "Failed to connect to Supabase"

**Solution:**
1. Verify environment variables are set correctly
2. Check Supabase project is not paused
3. Test connection manually: `curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/"`

### High Failure Rate

**Issue:** Success rate is below 80%

**Solution:**
1. Review error logs in `cron_job_executions` table
2. Check if API rate limits are being hit (OpenAI, Supabase)
3. Verify sufficient dealer data exists in `aiv_raw_signals`
4. Consider adding retry logic or increasing timeouts

## 📚 Additional Resources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

## 🎉 Next Steps

Once deployed, the system will:

1. **Train daily** - Model weights updated based on latest data
2. **Evaluate weekly** - Performance metrics logged to `model_audit`
3. **Detect anomalies** - FraudGuard scans every 6 hours
4. **Forecast weekly** - 4-week predictions generated
5. **Report monthly** - Comprehensive ROI reports

All operations are autonomous and self-improving. Monitor via `/api/cron/health` endpoint.
