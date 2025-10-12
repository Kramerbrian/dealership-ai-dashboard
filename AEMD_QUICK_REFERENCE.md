# AEMD & Accuracy Monitoring - Quick Reference

## 🚀 Quick Start (3 Steps)

```bash
# 1. Run migration
psql -h HOST -U USER -d DB -f supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql

# 2. Test endpoints
./scripts/test-aemd-accuracy.sh

# 3. Add dashboard to your app
```

```tsx
import { AEMDMonitoringDashboard } from '@/components/dashboard/AEMDMonitoringDashboard';

<AEMDMonitoringDashboard tenantId="your-tenant-id" />
```

---

## 📊 AEMD Formula (One-Liner)

```typescript
AEMD_final = ωDef × [(CTR_P3/CTR_FS × 0.30) + (VDP_total/VDP_ai × 0.50) + (Conv_total/Conv_paa × 0.20)]
```

---

## 🔌 API Quick Reference

### Record AEMD Metric
```bash
curl -X POST /api/aemd-metrics -H "Content-Type: application/json" -d '{
  "tenant_id": "uuid",
  "report_date": "2025-01-11",
  "ctr_p3": 0.0523, "ctr_fs": 0.0412,
  "total_vdp_views": 15000, "vdp_views_ai": 8500,
  "total_assisted_conversions": 245, "assisted_conversions_paa": 178
}'
```

### Record Accuracy Metric
```bash
curl -X POST /api/accuracy-monitoring -H "Content-Type: application/json" -d '{
  "tenant_id": "uuid",
  "issue_detection_accuracy": 0.88,
  "ranking_correlation": 0.72,
  "consensus_reliability": 0.92,
  "variance": 4.3
}'
```

### Get Metrics
```bash
curl "/api/aemd-metrics?tenant_id=uuid&limit=30"
curl "/api/accuracy-monitoring?tenant_id=uuid&include_alerts=true"
```

---

## 🎯 Default Thresholds

| Metric | Warning | Critical | Target |
|--------|---------|----------|--------|
| Issue Detection | 0.80 | 0.70 | 0.90 |
| Ranking Correlation | 0.65 | 0.55 | 0.80 |
| Consensus Reliability | 0.85 | 0.75 | 0.95 |

**Variance:** <5 = VERY_HIGH confidence

---

## 🔔 Alert Configuration

```typescript
// In accuracy_thresholds.notification_channels
[
  {
    "type": "email",
    "enabled": true,
    "config": {
      "recipients": ["admin@example.com"],
      "from": "alerts@dealershipai.com"
    }
  },
  {
    "type": "slack",
    "enabled": true,
    "config": {
      "webhookUrl": "https://hooks.slack.com/..."
    }
  }
]
```

**Cooldown:** 60 minutes (default)

---

## 🧪 Test Commands

```bash
# Full test suite
./scripts/test-aemd-accuracy.sh

# Test specific endpoint
curl -X POST localhost:3000/api/aemd-metrics -d @test-data.json
```

---

## 📦 Database Tables

```sql
aemd_metrics              -- AEMD calculations
accuracy_monitoring       -- Accuracy metrics
accuracy_thresholds       -- Alert configuration
accuracy_alerts           -- Alert history
```

**View:** `avi_monitoring_summary` (combined reporting)

---

## 🎨 Dashboard Components

- ✅ AEMD Score Tile (with industry comparison)
- ✅ Heatmap Module (ωDS segments)
- ✅ FastSearch Clarity (SCS/SIS/SCR gauges)
- ✅ Trust & Accuracy (live metrics)
- ✅ Active Alerts Banner
- ✅ ASR Execution (one-click)

---

## 🔧 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...           # Optional: for email alerts
```

---

## 📖 Full Documentation

- `AEMD_ACCURACY_MONITORING_GUIDE.md` - Complete guide
- `AEMD_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `scripts/test-aemd-accuracy.sh` - Test suite

---

## 🆘 Troubleshooting

### No data in dashboard
```typescript
// Check:
1. API returns data: curl /api/aemd-metrics?tenant_id=xxx
2. Tenant ID is correct
3. RLS policies allow access
```

### Alerts not triggering
```sql
-- Check thresholds
SELECT * FROM accuracy_thresholds WHERE tenant_id = 'xxx';

-- Check alert_enabled = true
UPDATE accuracy_thresholds SET alert_enabled = true WHERE tenant_id = 'xxx';
```

### AEMD calculation wrong
```typescript
// Verify:
const sum = fs_score + aio_score + paa_score;
const expected = omega_def × sum;
```

---

## 💡 Pro Tips

1. **Start with defaults** - Adjust thresholds after baseline established
2. **Monitor daily** - Check dashboard for active alerts
3. **Document resolutions** - Use resolution_notes when acknowledging alerts
4. **Review weekly** - Look at trends, not just point values
5. **Adjust cooldowns** - Reduce alert fatigue with appropriate cooldowns

---

## 🔗 Key Functions

```typescript
// Governance
import { validateAemdData, validateAccuracyData, getGovernanceMetrics } from '@/lib/governance';

// Alerting
import { sendAlert, acknowledgeAlert, getAlertStatistics } from '@/lib/alerting/accuracy-alerts';

// Usage
const check = validateAemdData({ aemd_final, fs_score, aio_score, paa_score });
const metrics = await getGovernanceMetrics(tenantId);
const stats = await getAlertStatistics(tenantId, 30);
```

---

## 📊 Example AEMD Score

| Component | Weight | Score | Contribution |
|-----------|--------|-------|--------------|
| FS | 30% | 0.38 | 0.114 |
| AIO | 50% | 0.88 | 0.440 |
| PAA | 20% | 0.27 | 0.054 |
| **AEMD** | - | **2.87** | - |

**vs Industry:** 2.45 → **+17% above average** ✅

---

## ✅ Success Checklist

- [ ] Migration applied
- [ ] Test suite passes
- [ ] Dashboard displays data
- [ ] Alerts configured
- [ ] Thresholds set
- [ ] Team trained
- [ ] Documentation reviewed

---

**Last Updated:** January 11, 2025
**Version:** 1.0.0
