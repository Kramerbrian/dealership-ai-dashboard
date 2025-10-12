# AEMD & Accuracy Monitoring System

**AI Economic Metric Dashboard with Comprehensive Accuracy Tracking**

## 🎯 What Is This?

A complete monitoring system for AI visibility metrics that tracks:

1. **AEMD Score** - Financial impact of AI initiatives (Formula: `ωDef × Σ(Metric_i × ΩFin_i)`)
2. **Accuracy Metrics** - AI model performance (Issue Detection: 88%, Ranking: 72%, Consensus: 92%)
3. **Alerts** - Automatic threshold-based notifications
4. **Visualizations** - Beautiful dashboard with heatmaps, gauges, and trend indicators

---

## ⚡ Quick Start (3 Commands)

```bash
# 1. Deploy (one command does everything)
./scripts/deploy-aemd-monitoring.sh

# 2. Start dev server
npm run dev

# 3. Add to your app
```

```tsx
import { AEMDMonitoringDashboard } from '@/components/dashboard/AEMDMonitoringDashboard';

<AEMDMonitoringDashboard tenantId="your-tenant-id" />
```

**Time to deploy:** ~5 minutes

---

## 📊 Dashboard Features

### 1. AEMD Score Tile
- Large score display (e.g., 2.87)
- Component breakdown: AEO/AIO (50%), FS (30%), PAA (20%)
- Industry comparison (you vs 2.45 average)

### 2. Heatmap Module
- Visual intensity based on contribution
- Color-coded segments (Form Submissions, AI Outcomes, Predicted Actions)
- Trend indicators (↑↓→)

### 3. FastSearch Clarity Gauges
- **SCS** (Schema Clarity Score): 85%
- **SIS** (Structured Info Score): 78%
- **SCR** (Schema Coverage Rate): 82%
- Circular progress indicators

### 4. Trust & Accuracy Monitoring
- Issue Detection: 88% (target: 90%)
- Ranking Correlation: 72% (target: 80%)
- Consensus Reliability: 92% (target: 95%)
- Confidence badges (VERY_HIGH when variance <5)

### 5. Active Alerts
- Prominent banner for threshold breaches
- Alert count and severity
- Direct links to resolution

### 6. ASR Execution
- One-click schema updates
- Content rewrite queue
- Automated optimization triggers

---

## 🔌 API Examples

### Record AEMD Metric

```bash
curl -X POST http://localhost:3000/api/aemd-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "uuid",
    "report_date": "2025-01-11",
    "ctr_p3": 0.0523,
    "ctr_fs": 0.0412,
    "total_vdp_views": 15000,
    "vdp_views_ai": 8500,
    "total_assisted_conversions": 245,
    "assisted_conversions_paa": 178
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "aemd_final": 2.87,
    "fs_score": 0.38,
    "aio_score": 0.88,
    "paa_score": 0.27
  }
}
```

### Record Accuracy Metric

```bash
curl -X POST http://localhost:3000/api/accuracy-monitoring \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "uuid",
    "issue_detection_accuracy": 0.88,
    "ranking_correlation": 0.72,
    "consensus_reliability": 0.92,
    "variance": 4.3
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "confidence_level": "VERY_HIGH",
    "is_below_threshold": false
  },
  "alerts": []
}
```

---

## 📐 AEMD Formula

```typescript
AEMD_final = ωDef × [
  (CTR_P3/CTR_FS × 0.30) +           // Form Submissions (30%)
  (Total_VDP/VDP_AI × 0.50) +        // AI Outcomes (50%)
  (Total_Conv/Conv_PAA × 0.20)       // Predicted Actions (20%)
]
```

**Example Calculation:**
- FS: (0.0523/0.0412 × 0.30) = 0.38
- AIO: (15000/8500 × 0.50) = 0.88
- PAA: (245/178 × 0.20) = 0.27
- **AEMD**: 1.0 × (0.38 + 0.88 + 0.27) = **2.87**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   AEMDMonitoringDashboard           │  React Component
│   - Heatmaps, Gauges, Alerts        │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   API Routes                         │
│   /api/aemd-metrics                 │  Next.js API
│   /api/accuracy-monitoring          │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   Business Logic                     │
│   - Governance validation           │  TypeScript
│   - Alerting system                 │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   Database (Supabase PostgreSQL)    │
│   - aemd_metrics                    │  PostgreSQL
│   - accuracy_monitoring             │
│   - accuracy_thresholds             │
│   - accuracy_alerts                 │
│   + Triggers, RLS, Views            │
└──────────────┬──────────────────────┘
               │
┌──────────────┴──────────────────────┐
│   Notifications                      │
│   - Email (Resend)                  │  External APIs
│   - Slack Webhooks                  │
│   - Custom Webhooks                 │
└─────────────────────────────────────┘
```

---

## 📁 File Structure

```
dealership-ai-dashboard/
├── supabase/
│   └── migrations/
│       └── 20250111000001_add_aemd_accuracy_monitoring.sql  ← Database schema
│
├── src/
│   ├── app/api/
│   │   ├── aemd-metrics/route.ts                           ← AEMD API
│   │   ├── accuracy-monitoring/route.ts                    ← Accuracy API
│   │   └── avi-report/route.ts                             ← Enhanced AVI
│   │
│   ├── components/dashboard/
│   │   └── AEMDMonitoringDashboard.tsx                     ← Dashboard UI
│   │
│   └── lib/
│       ├── alerting/
│       │   └── accuracy-alerts.ts                          ← Alert system
│       └── governance.ts                                    ← Validation
│
├── scripts/
│   ├── deploy-aemd-monitoring.sh                           ← One-command deploy
│   └── test-aemd-accuracy.sh                               ← Test suite
│
└── docs/
    ├── AEMD_ACCURACY_MONITORING_GUIDE.md                   ← Complete guide
    ├── AEMD_IMPLEMENTATION_SUMMARY.md                      ← Implementation
    ├── AEMD_QUICK_REFERENCE.md                             ← Quick ref
    ├── DEPLOY_AEMD.md                                      ← Deploy guide
    └── AEMD_README.md                                      ← This file
```

---

## 🎨 UI Components

### Color System
- **VERY_HIGH confidence**: Green (`bg-green-500`)
- **HIGH confidence**: Blue (`bg-blue-500`)
- **MEDIUM confidence**: Yellow (`bg-yellow-500`)
- **LOW confidence**: Red (`bg-red-500`)

### Visualizations
- **Heatmaps**: Color intensity = contribution percentage
- **Gauges**: SVG circles with animated progress
- **Comparison Bars**: Horizontal bars with percentage labels
- **Alert Banners**: Prominent destructive alerts

---

## 🔔 Alerting

### Notification Channels
1. **Email** (via Resend)
2. **Slack** (webhooks)
3. **Custom Webhooks**
4. **Console** (development)

### Alert Lifecycle
1. Metric falls below threshold → **Triggered**
2. Notifications sent → **Notified**
3. Team member reviews → **Acknowledged**
4. Issue fixed → **Resolved**

### Configuration
```json
{
  "type": "email",
  "enabled": true,
  "config": {
    "recipients": ["admin@example.com"],
    "from": "alerts@dealershipai.com"
  }
}
```

### Cooldown
Default: 60 minutes (prevents alert spam)

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOY_AEMD.md](DEPLOY_AEMD.md) | **Start here** - One-command deployment |
| [AEMD_ACCURACY_MONITORING_GUIDE.md](AEMD_ACCURACY_MONITORING_GUIDE.md) | Complete technical guide (11 sections) |
| [AEMD_QUICK_REFERENCE.md](AEMD_QUICK_REFERENCE.md) | Quick reference card for developers |
| [AEMD_IMPLEMENTATION_SUMMARY.md](AEMD_IMPLEMENTATION_SUMMARY.md) | What was built and how it works |

---

## 🧪 Testing

### Run Full Test Suite
```bash
./scripts/test-aemd-accuracy.sh
```

### Manual Testing
```bash
# Test AEMD endpoint
curl -X POST localhost:3000/api/aemd-metrics -d @aemd-test.json

# Test accuracy endpoint
curl -X POST localhost:3000/api/accuracy-monitoring -d @accuracy-test.json

# Get metrics
curl "localhost:3000/api/aemd-metrics?tenant_id=test&limit=10"
```

---

## 🚀 Production Checklist

- [ ] Database migration applied
- [ ] Test suite passes (12/12 tests)
- [ ] Environment variables configured
- [ ] Dashboard displays data
- [ ] Alerts configured (email/Slack)
- [ ] Thresholds set per tenant
- [ ] Team trained on alert workflow
- [ ] Documentation reviewed
- [ ] Backup strategy in place
- [ ] Monitoring dashboards bookmarked

---

## 💡 Best Practices

1. **Data Collection**
   - Collect AEMD metrics daily or weekly
   - Record accuracy after each model evaluation
   - Use consistent tenant IDs

2. **Threshold Management**
   - Start with defaults, adjust after baseline
   - Review and refine monthly
   - Document threshold changes

3. **Alert Response**
   - Acknowledge alerts within 1 hour
   - Always add resolution notes
   - Track MTTR (Mean Time To Resolution)

4. **Dashboard Usage**
   - Check daily for active alerts
   - Review trends weekly
   - Share with stakeholders monthly

---

## 🆘 Troubleshooting

### Problem: Dashboard shows no data
**Solution:**
1. Verify tenant_id is correct
2. Check API returns data: `curl /api/aemd-metrics?tenant_id=xxx`
3. Review browser console for errors
4. Check RLS policies allow access

### Problem: Alerts not triggering
**Solution:**
1. Check `alert_enabled = true` in `accuracy_thresholds`
2. Verify thresholds are configured correctly
3. Check database triggers are active
4. Review cooldown period

### Problem: AEMD calculation incorrect
**Solution:**
1. Verify input metrics are non-zero
2. Check omega weights (should sum as expected)
3. Validate: `ωDef × (fs_score + aio_score + paa_score)`

---

## 🎯 Success Metrics

Track these KPIs:

- **AEMD Score**: Target >2.5 (industry average: 2.45)
- **Issue Detection**: Target ≥90% (current: 88%)
- **Ranking Correlation**: Target ≥80% (current: 72%)
- **Consensus Reliability**: Target ≥95% (current: 92%)
- **Confidence Level**: VERY_HIGH >80% of time
- **Alert Response Time**: <1 hour average
- **Data Quality Score**: >95%

---

## 🔗 Quick Links

- **Deploy**: Run `./scripts/deploy-aemd-monitoring.sh`
- **Test**: Run `./scripts/test-aemd-accuracy.sh`
- **Dashboard**: Import from `@/components/dashboard/AEMDMonitoringDashboard`
- **API Docs**: See [AEMD_ACCURACY_MONITORING_GUIDE.md](AEMD_ACCURACY_MONITORING_GUIDE.md)
- **Support**: Check troubleshooting sections

---

## 📊 Example Data

### Good Performance
```json
{
  "aemd_final": 2.87,  // Above industry average (2.45)
  "issue_detection_accuracy": 0.88,  // Good
  "ranking_correlation": 0.72,  // Acceptable
  "consensus_reliability": 0.92,  // Excellent
  "variance": 4.3,  // VERY_HIGH confidence (<5)
  "confidence_level": "VERY_HIGH"
}
```

### Needs Attention
```json
{
  "aemd_final": 2.12,  // Below average
  "issue_detection_accuracy": 0.68,  // Below threshold (0.70)
  "ranking_correlation": 0.58,  // Acceptable
  "consensus_reliability": 0.81,  // Below target
  "variance": 7.2,  // HIGH confidence (5-10)
  "confidence_level": "HIGH",
  "is_below_threshold": true  // ⚠️ Alert triggered
}
```

---

## ✨ Key Features

✅ **Complete AEMD Implementation** - Accurate weighted formula
✅ **Real-time Accuracy Tracking** - Live model performance metrics
✅ **Beautiful Dashboard** - Modern UI with all visualizations
✅ **Multi-channel Alerting** - Email, Slack, webhooks
✅ **Governance Integration** - Data quality & validation
✅ **Production Ready** - RLS, triggers, error handling
✅ **Comprehensive Documentation** - 4 detailed guides
✅ **Test Suite** - 12 automated tests

---

**Version**: 1.0.0
**Release Date**: January 11, 2025
**Status**: ✅ Production Ready
**License**: Proprietary

---

## 🎉 Ready to Deploy?

Run this command to get started:

```bash
./scripts/deploy-aemd-monitoring.sh
```

Questions? Check [DEPLOY_AEMD.md](DEPLOY_AEMD.md) for detailed instructions.
