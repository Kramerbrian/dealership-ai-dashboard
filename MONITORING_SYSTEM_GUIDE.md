# DealershipAI Monitoring System Guide

## Overview

Complete monitoring and alerting system for the autonomous AIV model infrastructure. Provides real-time health monitoring, automated alerts, and comprehensive dashboards.

## 🎯 Features

### 1. System Health Monitoring API

**Endpoint:** `/api/monitoring/system-health`

Query parameters:
- `executive-summary` - Complete system overview (default)
- `control-rules` - Model performance alerts (R² < 0.7 or RMSE > 3.5)
- `success-criteria` - Check if meeting targets (≥10% accuracy, ≥15% ROI, ≥0.8 R²)
- `cron-health` - All cron job statuses and execution history
- `critical-alerts` - Unified view of all critical issues
- `model-evolution` - Pillar weight changes over time
- `anomaly-summary` - FraudGuard scan results by date
- `forecast-accuracy` - Kalman forecast confidence levels

### 2. Automated Alerting System

**Endpoint:** `/api/monitoring/alerts`

**POST** - Check for alerts and optionally send notifications
```json
{
  "check": "all",  // or "model", "cron", "anomaly"
  "notify": false  // set to true to send notifications
}
```

**GET** - Retrieve recent alerts
```
GET /api/monitoring/alerts?hours=24
```

### 3. Dashboard Component

React component with auto-refresh, real-time alerts, and visual health indicators.

**Location:** `src/components/monitoring/SystemHealthDashboard.tsx`

## 📊 SQL Monitoring Queries

**Location:** `supabase/queries/cron_monitoring_queries.sql`

10 pre-built queries for comprehensive monitoring:

1. **Model Performance Control Rules** - `WHERE r2 < 0.7 OR rmse > 3.5`
2. **Success Criteria Dashboard** - Check if meeting all KPI targets
3. **Month-over-Month Trend Analysis** - Track improvement over time
4. **Cron Job Health Check** - All job statuses and missed executions
5. **Recent Execution History** - Last 24 hours of cron runs
6. **Anomaly Detection Summary** - FraudGuard results by day
7. **Forecast Accuracy Check** - Confidence levels and predictions
8. **Model Weight Evolution** - Pillar weight changes over time
9. **Critical Alerts Dashboard** - All items requiring attention
10. **Executive Summary** - One-query system overview

## 🚀 Quick Start

### 1. Deploy Database Migrations

```bash
# Apply all monitoring tables
supabase db push

# Or manually run:
psql $DATABASE_URL -f supabase/migrations/20250109_add_cron_monitoring_tables.sql
psql $DATABASE_URL -f supabase/migrations/20250109_add_system_alerts_table.sql
```

### 2. Test API Endpoints

```bash
# Executive summary
curl https://your-app.vercel.app/api/monitoring/system-health?query=executive-summary | jq

# Critical alerts
curl https://your-app.vercel.app/api/monitoring/system-health?query=critical-alerts | jq

# Check for new alerts
curl -X POST https://your-app.vercel.app/api/monitoring/alerts \
  -H "Content-Type: application/json" \
  -d '{"check": "all", "notify": false}' | jq
```

### 3. Add Dashboard to Your App

```tsx
// app/(dashboard)/monitoring/page.tsx
import { SystemHealthDashboard } from '@/components/monitoring/SystemHealthDashboard';

export default function MonitoringPage() {
  return <SystemHealthDashboard />;
}
```

### 4. Set Up Automated Alert Checking

Add a cron job to check alerts every 5 minutes:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/monitoring/alerts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Or use a separate monitoring service (recommended):

```bash
# Every 5 minutes via external monitor (UptimeRobot, etc.)
curl -X POST https://your-app.vercel.app/api/monitoring/alerts \
  -H "Content-Type: application/json" \
  -d '{"check": "all", "notify": true}'
```

## 🔔 Alert Thresholds

### Critical Alerts (Immediate Action Required)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Model R² | < 0.6 | Retrain model with fresh data |
| Model RMSE | > 5.0 | Review data quality |
| Cron Failures | 2+ consecutive | Check logs, verify env vars |

### Warning Alerts (Monitor Closely)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Model R² | < 0.7 | Monitor for degradation |
| Model RMSE | > 3.5 | Review recent predictions |
| Cron Failures | 1 failure | Watch next execution |
| Success Rate | < 80% | Review error logs |
| Accuracy Gain | < 10% MoM | Review training process |
| Ad Efficiency | < 15% | Review recommendations |

## 📧 Notification Integration

### Slack Webhook

```typescript
// app/api/monitoring/alerts/route.ts
// In sendAlertNotifications() function:

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

if (criticalAlerts.length > 0) {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 ${criticalAlerts.length} Critical Alerts Detected`,
      blocks: criticalAlerts.map(alert => ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${alert.title}*\n${alert.message}\n_Action:_ ${alert.action}`
        }
      }))
    })
  });
}
```

### Email (Resend)

```typescript
const RESEND_API_KEY = process.env.RESEND_EMAIL_API;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (criticalAlerts.length > 0) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'alerts@dealershipai.com',
      to: ADMIN_EMAIL,
      subject: `🚨 ${criticalAlerts.length} Critical System Alerts`,
      html: generateAlertEmailHTML(criticalAlerts)
    })
  });
}
```

## 📈 Monitoring Best Practices

### 1. Regular Health Checks

- **Every 5 minutes**: Check for critical alerts
- **Every 15 minutes**: Monitor cron job health
- **Every hour**: Review executive summary
- **Daily**: Analyze success criteria trends

### 2. Alert Response Workflow

1. **Critical Alert Triggered** → Immediate notification sent
2. **Review Alert Details** → Check API response and logs
3. **Investigate Root Cause** → Query relevant tables
4. **Take Corrective Action** → Fix underlying issue
5. **Acknowledge Alert** → Mark as resolved in database

### 3. Dashboard Usage

- Keep dashboard open during business hours
- Set up alerts in separate monitoring tool
- Review trends weekly for proactive improvements
- Share executive summary with stakeholders monthly

## 🔍 Troubleshooting

### "No evaluation data available"

**Problem:** Model hasn't been evaluated yet.

**Solution:**
```bash
# Trigger manual evaluation
curl -X POST https://your-app.vercel.app/api/train/evaluate \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test-dealer"}'
```

### High alert volume

**Problem:** Too many warning alerts.

**Solution:**
- Adjust thresholds in `app/api/monitoring/alerts/route.ts`
- Focus on critical alerts only
- Implement alert rate limiting

### Cron job showing as "missed execution"

**Problem:** Job hasn't run in expected timeframe.

**Solution:**
1. Check Vercel dashboard → Functions → Cron Jobs
2. Verify cron schedule in `vercel.json`
3. Check if project is on Pro plan (required for crons)
4. Review Vercel logs for errors

### Alerts not being stored in database

**Problem:** `system_alerts` table doesn't exist.

**Solution:**
```bash
# Run migration
psql $DATABASE_URL -f supabase/migrations/20250109_add_system_alerts_table.sql
```

## 📊 Dashboard Examples

### Executive Summary JSON Response

```json
{
  "success": true,
  "timestamp": "2025-01-09T20:00:00Z",
  "overall_status": "OPTIMAL",
  "status_icon": "✅",
  "model_performance": {
    "r2": "0.847",
    "rmse": "2.85",
    "accuracy_gain_mom": "12.50",
    "ad_efficiency_gain": "18.30",
    "last_evaluation": "2025-01-09T00:00:00Z"
  },
  "success_criteria": {
    "status": "MEETING ALL TARGETS",
    "icon": "✅",
    "r2_target": true,
    "accuracy_target": true,
    "roi_target": true
  },
  "cron_health": {
    "status": "HEALTHY",
    "icon": "✅",
    "total_jobs": 5,
    "healthy": 5,
    "degraded": 0,
    "critical": 0
  },
  "anomaly_detection": {
    "last_24h": 3,
    "unresolved_high_severity": 0
  }
}
```

### Critical Alert JSON Response

```json
{
  "success": true,
  "alert_count": 1,
  "critical_count": 1,
  "alerts": [
    {
      "category": "Model Performance",
      "severity": "critical",
      "title": "Critical Model Accuracy Degradation",
      "message": "Model R² is critically low: 0.550 (threshold: 0.6)",
      "action": "Immediate investigation required. Model may need retraining with fresh data.",
      "icon": "🚨",
      "timestamp": "2025-01-09T00:00:00Z"
    }
  ]
}
```

## 🎯 Success Metrics

Your monitoring system is working correctly when:

- ✅ Executive summary shows "OPTIMAL" or "NOMINAL" status
- ✅ All cron jobs show "healthy" status
- ✅ Success criteria are being met (≥10% accuracy, ≥15% ROI, ≥0.8 R²)
- ✅ Alert count < 5 warnings, 0 critical
- ✅ Dashboard auto-refreshes without errors
- ✅ Notifications are sent for critical alerts

## 📚 Related Documentation

- [VERCEL_CRON_SETUP.md](VERCEL_CRON_SETUP.md) - Cron infrastructure setup
- [supabase/queries/cron_monitoring_queries.sql](supabase/queries/cron_monitoring_queries.sql) - SQL query examples
- [app/api/monitoring/system-health/route.ts](app/api/monitoring/system-health/route.ts:1) - API implementation
- [src/components/monitoring/SystemHealthDashboard.tsx](src/components/monitoring/SystemHealthDashboard.tsx:1) - Dashboard component

## 🆘 Support

If you encounter issues:

1. Check Vercel logs: `npx vercel logs --follow`
2. Query Supabase directly using SQL queries
3. Test API endpoints manually with curl
4. Review error messages in `system_alerts` table
