# AEMD & Accuracy Monitoring System

Comprehensive guide to the AI Economic Metric Dashboard (AEMD) and Accuracy Monitoring System.

## Overview

This system provides advanced monitoring and governance for AI visibility metrics, including:

1. **AEMD Metrics** - Financial impact scoring with weighted components
2. **Accuracy Monitoring** - AI model accuracy and reliability tracking
3. **Alerting System** - Threshold-based notifications
4. **Governance Framework** - Data quality and compliance controls

---

## 1. AEMD Metrics

### Formula

```
AEMD_final = ωDef × Σ(Metric_i × ΩFin_i)
```

### Components

#### ΩFin (Financial Weights)

- **FS** (Form Submissions): `CTR_P3/CTR_FS × 0.30`
- **AIO** (AI Outcomes): `(Total_VDP_Views / VDP_Views_AI) × 0.50`
- **PAA** (Predicted Assisted Actions): `(Total_Assisted_Conversions / Assisted_Conversions_PAA) × 0.20`

### Database Schema

**Table: `aemd_metrics`**

```sql
CREATE TABLE aemd_metrics (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  report_date date NOT NULL,

  -- Raw metrics
  ctr_p3 numeric(8,4),
  ctr_fs numeric(8,4),
  total_vdp_views int,
  vdp_views_ai int,
  total_assisted_conversions int,
  assisted_conversions_paa int,

  -- Calculated scores
  fs_score numeric(10,4),
  aio_score numeric(10,4),
  paa_score numeric(10,4),
  aemd_final numeric(12,4),

  -- Weights
  omega_fs numeric(6,4) DEFAULT 0.30,
  omega_aio numeric(6,4) DEFAULT 0.50,
  omega_paa numeric(6,4) DEFAULT 0.20,
  omega_def numeric(6,4) DEFAULT 1.0,

  UNIQUE (tenant_id, report_date)
);
```

### API Endpoints

#### POST /api/aemd-metrics
Calculate and store AEMD metrics.

**Request:**
```json
{
  "tenant_id": "uuid",
  "report_date": "2025-01-11",
  "ctr_p3": 0.0523,
  "ctr_fs": 0.0412,
  "total_vdp_views": 15000,
  "vdp_views_ai": 8500,
  "total_assisted_conversions": 245,
  "assisted_conversions_paa": 178,
  "omega_def": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "aemd_final": 2.87,
    "fs_score": 0.38,
    "aio_score": 0.88,
    "paa_score": 0.27
  },
  "calculation": {
    "fs_score": 0.38,
    "aio_score": 0.88,
    "paa_score": 0.27,
    "aemd_final": 2.87
  }
}
```

#### GET /api/aemd-metrics
Retrieve AEMD metrics with statistics.

**Query Parameters:**
- `tenant_id` (required)
- `start_date` (optional)
- `end_date` (optional)
- `limit` (optional, default: 30)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "count": 30,
    "avg_aemd_final": 2.65,
    "max_aemd_final": 3.12,
    "min_aemd_final": 2.18,
    "avg_fs_score": 0.35,
    "avg_aio_score": 0.82,
    "avg_paa_score": 0.24
  }
}
```

---

## 2. Accuracy Monitoring

### Metrics

1. **Issue Detection Accuracy** (0.88 = 88%)
   - Minimum: 0.70
   - Target: 0.90

2. **Ranking Correlation** (0.72 = 72%)
   - Minimum: 0.55
   - Target: 0.80

3. **Consensus Reliability** (0.92 = 92%)
   - Minimum: 0.75
   - Target: 0.95

4. **Confidence Interval**
   - `variance < 5` → VERY_HIGH
   - `variance < 10` → HIGH
   - `variance < 15` → MEDIUM
   - `variance >= 15` → LOW

### Database Schema

**Table: `accuracy_monitoring`**

```sql
CREATE TABLE accuracy_monitoring (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  measurement_date timestamptz NOT NULL,

  -- Core metrics
  issue_detection_accuracy numeric(5,4),
  ranking_correlation numeric(5,4),
  consensus_reliability numeric(5,4),

  -- Confidence
  variance numeric(8,4),
  confidence_level text,
  confidence_threshold numeric(5,2) DEFAULT 5.0,

  -- Alerting
  is_below_threshold boolean DEFAULT false,
  alert_triggered_at timestamptz,
  alert_acknowledged_at timestamptz
);
```

**Table: `accuracy_thresholds`**

```sql
CREATE TABLE accuracy_thresholds (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  metric_name text NOT NULL,

  warning_threshold numeric(5,4),
  critical_threshold numeric(5,4),
  target_threshold numeric(5,4),

  alert_enabled boolean DEFAULT true,
  alert_cooldown_minutes int DEFAULT 60,
  notification_channels jsonb,

  UNIQUE (tenant_id, metric_name)
);
```

**Table: `accuracy_alerts`**

```sql
CREATE TABLE accuracy_alerts (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  accuracy_monitoring_id uuid REFERENCES accuracy_monitoring(id),

  metric_name text,
  metric_value numeric(5,4),
  threshold_value numeric(5,4),
  severity text, -- 'warning' | 'critical'

  triggered_at timestamptz DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at timestamptz,

  notifications_sent jsonb
);
```

### API Endpoints

#### POST /api/accuracy-monitoring
Record new accuracy measurements.

**Request:**
```json
{
  "tenant_id": "uuid",
  "measurement_date": "2025-01-11T12:00:00Z",
  "issue_detection_accuracy": 0.88,
  "ranking_correlation": 0.72,
  "consensus_reliability": 0.92,
  "variance": 4.3,
  "sample_size": 1000,
  "model_version": "v2.3.1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "confidence_level": "VERY_HIGH",
    "is_below_threshold": false
  },
  "alerts": []
}
```

#### GET /api/accuracy-monitoring
Retrieve accuracy metrics with statistics.

**Query Parameters:**
- `tenant_id` (required)
- `start_date` (optional)
- `end_date` (optional)
- `limit` (optional, default: 30)
- `include_alerts` (optional, boolean)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "count": 30,
    "avg_issue_detection": 0.86,
    "avg_ranking_correlation": 0.74,
    "avg_consensus_reliability": 0.91,
    "alerts_triggered": 3,
    "confidence_distribution": {
      "VERY_HIGH": 22,
      "HIGH": 6,
      "MEDIUM": 2,
      "LOW": 0
    }
  },
  "alerts": [...]
}
```

#### PATCH /api/accuracy-monitoring?action=acknowledge-alert
Acknowledge an alert.

**Request:**
```json
{
  "alert_id": "uuid",
  "acknowledged_by": "user_id",
  "resolution_notes": "Investigated - temporary model drift, resolved with retraining"
}
```

---

## 3. Alerting System

### Configuration

Alerts are triggered automatically when metrics fall below thresholds.

#### Notification Channels

Configure in `accuracy_thresholds.notification_channels`:

```json
[
  {
    "type": "email",
    "enabled": true,
    "config": {
      "recipients": ["admin@example.com"],
      "from": "alerts@dealershipai.com",
      "dashboardUrl": "https://dash.dealershipai.com/monitoring"
    }
  },
  {
    "type": "slack",
    "enabled": true,
    "config": {
      "webhookUrl": "https://hooks.slack.com/services/..."
    }
  },
  {
    "type": "webhook",
    "enabled": true,
    "config": {
      "url": "https://api.example.com/alerts",
      "headers": {
        "Authorization": "Bearer token"
      }
    }
  },
  {
    "type": "console",
    "enabled": true
  }
]
```

### Alert Lifecycle

1. **Triggered** - Metric falls below threshold
2. **Notified** - Alerts sent via configured channels
3. **Acknowledged** - Team member reviews and acknowledges
4. **Resolved** - Issue fixed, alert marked resolved

### Cooldown Period

Default: 60 minutes. Prevents alert spam.

### Programmatic Usage

```typescript
import { sendAlert, acknowledgeAlert, getAlertStatistics } from '@/lib/alerting/accuracy-alerts';

// Send alert
await sendAlert({
  id: 'alert-id',
  tenantId: 'tenant-id',
  metricName: 'issue_detection_accuracy',
  metricValue: 0.68,
  thresholdValue: 0.70,
  severity: 'warning',
  triggeredAt: new Date().toISOString(),
  message: 'Alert message'
});

// Acknowledge alert
await acknowledgeAlert('alert-id', 'user-id', 'Resolution notes');

// Get statistics
const stats = await getAlertStatistics('tenant-id', 30);
```

---

## 4. Dashboard Integration

### Component Usage

```tsx
import { AEMDMonitoringDashboard } from '@/components/dashboard/AEMDMonitoringDashboard';

export default function MonitoringPage() {
  return (
    <AEMDMonitoringDashboard
      tenantId="your-tenant-id"
      className="p-6"
    />
  );
}
```

### Features

1. **AEMD Score Tile** - Current score vs industry average
2. **Heatmap Module** - Top ωDS segments visualization
3. **FastSearch Clarity** - SCS/SIS/SCR gauges
4. **Trust & Accuracy** - Live accuracy metrics with confidence levels
5. **Active Alerts** - Unacknowledged threshold breaches
6. **ASR Execution** - One-click schema rewrite

---

## 5. Governance Integration

### Data Quality Checks

```typescript
import { validateAemdData, validateAccuracyData } from '@/lib/governance';

// Validate AEMD
const aemdCheck = validateAemdData({
  aemd_final: 2.87,
  fs_score: 0.38,
  aio_score: 0.88,
  paa_score: 0.27
});

// Validate Accuracy
const accuracyCheck = validateAccuracyData({
  issue_detection_accuracy: 0.88,
  ranking_correlation: 0.72,
  consensus_reliability: 0.92,
  variance: 4.3
});
```

### Governance Metrics

```typescript
import { getGovernanceMetrics } from '@/lib/governance';

const metrics = await getGovernanceMetrics('tenant-id');
// Returns: { avi: {...}, aemd: {...}, accuracy: {...} }
```

---

## 6. Testing

### Manual Testing

```bash
# Test AEMD endpoint
curl -X POST http://localhost:3000/api/aemd-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "report_date": "2025-01-11",
    "ctr_p3": 0.0523,
    "ctr_fs": 0.0412,
    "total_vdp_views": 15000,
    "vdp_views_ai": 8500,
    "total_assisted_conversions": 245,
    "assisted_conversions_paa": 178
  }'

# Test accuracy endpoint
curl -X POST http://localhost:3000/api/accuracy-monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "issue_detection_accuracy": 0.88,
    "ranking_correlation": 0.72,
    "consensus_reliability": 0.92,
    "variance": 4.3
  }'

# Get AEMD metrics
curl "http://localhost:3000/api/aemd-metrics?tenant_id=test-tenant&limit=10"

# Get accuracy metrics
curl "http://localhost:3000/api/accuracy-monitoring?tenant_id=test-tenant&include_alerts=true"
```

---

## 7. Migration & Setup

### Run Migration

```bash
# Apply database migration
psql -h HOST -U USER -d DATABASE -f supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql
```

### Environment Variables

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Alerting (optional)
RESEND_API_KEY=your-resend-api-key  # For email alerts
```

### Default Thresholds

Default accuracy thresholds are inserted for tenant `00000000-0000-0000-0000-000000000000`:

- Issue Detection: Warning 0.80, Critical 0.70, Target 0.90
- Ranking Correlation: Warning 0.65, Critical 0.55, Target 0.80
- Consensus Reliability: Warning 0.85, Critical 0.75, Target 0.95

---

## 8. Best Practices

### Data Collection

1. **AEMD Metrics**: Collect daily or weekly
2. **Accuracy Metrics**: Collect after each model evaluation
3. **Batch Processing**: Use background jobs for historical data

### Threshold Configuration

1. Start with default thresholds
2. Adjust based on baseline performance
3. Review monthly and refine

### Alert Management

1. Acknowledge alerts promptly
2. Document resolution notes
3. Adjust cooldown periods if needed
4. Review alert statistics monthly

### Dashboard Usage

1. Monitor daily for active alerts
2. Review trends weekly
3. Investigate anomalies immediately
4. Track AEMD vs industry benchmarks

---

## 9. Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Layer                     │
│  ┌──────────────────────────────────────────────┐  │
│  │    AEMDMonitoringDashboard Component         │  │
│  │  - AEMD Score Tile                           │  │
│  │  - Heatmap Visualization                     │  │
│  │  - FastSearch Clarity Gauges                 │  │
│  │  - Accuracy Monitoring                       │  │
│  │  - Active Alerts                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                    API Layer                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  /api/aemd-metrics          (GET, POST, PUT) │  │
│  │  /api/accuracy-monitoring   (GET, POST, PATCH)│ │
│  │  /api/avi-report            (GET - Enhanced) │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                  Business Logic                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Governance Framework                        │  │
│  │  - validateAemdData()                        │  │
│  │  - validateAccuracyData()                    │  │
│  │  - getGovernanceMetrics()                    │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Alerting System                             │  │
│  │  - sendAlert()                               │  │
│  │  - acknowledgeAlert()                        │  │
│  │  - processUnacknowledgedAlerts()             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                 Database Layer                       │
│  ┌──────────────────────────────────────────────┐  │
│  │  aemd_metrics                                │  │
│  │  accuracy_monitoring                         │  │
│  │  accuracy_thresholds                         │  │
│  │  accuracy_alerts                             │  │
│  │  avi_reports (enhanced)                      │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  Database Triggers                           │  │
│  │  - Auto-calculate confidence level           │  │
│  │  - Check thresholds & create alerts          │  │
│  │  - Update timestamps                         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              Notification Layer                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  Email (Resend)                              │  │
│  │  Slack Webhooks                              │  │
│  │  Custom Webhooks                             │  │
│  │  Console Logging                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 10. Troubleshooting

### AEMD Calculation Issues

**Problem**: AEMD score seems incorrect

**Solution**:
1. Verify input metrics are non-zero
2. Check omega weights sum to expected values
3. Validate calculation: `ωDef × (fs_score + aio_score + paa_score)`

### Alerts Not Triggering

**Problem**: No alerts when metrics below threshold

**Solution**:
1. Check `alert_enabled` in `accuracy_thresholds`
2. Verify thresholds are configured correctly
3. Check database triggers are active
4. Review cooldown period

### Dashboard Not Loading Data

**Problem**: Dashboard shows no data

**Solution**:
1. Verify tenant_id is correct
2. Check API endpoints return data
3. Review browser console for errors
4. Verify RLS policies allow access

---

## Support

For issues or questions:
1. Check logs: Browser console and server logs
2. Review database constraints and triggers
3. Test API endpoints with curl
4. Contact support with error details
