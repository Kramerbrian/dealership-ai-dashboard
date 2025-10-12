# Autonomous Systems - Quick Reference

## 🔄 Beta Recalibration

**Purpose:** Auto-adjust DTRI beta coefficient when drift >5%

**API Endpoints:**
```bash
# Trigger recalibration
POST /api/beta/recalibrate

# Check status
GET /api/beta/recalibrate
```

**Schedule:** Sunday 3:00 AM (via BullMQ)

**Key Logic:**
```typescript
if (abs(beta_new - beta_old) / beta_old) < 0.05) {
  // Ignore drift <5%
  return "No update needed";
}
```

---

## 🛡️ Sentinel Monitoring

**Purpose:** Autonomous SOW triggering based on real-time metrics

**API Endpoints:**
```bash
# Run monitoring sweep
POST /api/cron/sentinel-monitor

# Get status
GET /api/cron/sentinel-monitor
```

**Schedule:** Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)

### 4 Autonomous Triggers

#### 1️⃣ Review Crisis
```typescript
if (avg_response_time > 4h && velocity < 0.85) {
  trigger('REVIEW_CRISIS_SOW');
}
```

#### 2️⃣ VDP Speed Violation
```typescript
if (lcp > 3.0s) {
  trigger('VDP_OPTIMIZATION_SOW');
}
```

#### 3️⃣ Economic Stress
```typescript
if (tsm > 1.4) {
  trigger('TSM_DEFENSIVE_MODE');
}
```

#### 4️⃣ Competitive Threat
```typescript
if (dtri_delta > 10pts) {
  trigger('COMPETITIVE_ATTACK_SOW');
}
```

---

## 📊 Database Quick Queries

### View Active Alerts
```sql
SELECT * FROM sentinel_active_alerts
ORDER BY severity DESC;
```

### Check Current Beta
```sql
SELECT * FROM beta_calibration_summary;
```

### Recent Beta Changes
```sql
SELECT * FROM dtri_calibration_log
ORDER BY created_at DESC
LIMIT 5;
```

### Dealer DTRI Health
```sql
SELECT * FROM dtri_dealer_health
ORDER BY avg_dtri_score DESC;
```

---

## 🚀 Common Tasks

### Enable Sentinel for Dealer
```sql
INSERT INTO sentinel_config (dealer_id, enabled, webhook_url)
VALUES ('naples-001', true, 'https://hooks.slack.com/...');
```

### Acknowledge Alert
```sql
UPDATE sentinel_events
SET acknowledged = true,
    acknowledged_by = 'admin@example.com',
    acknowledged_at = NOW(),
    resolution_notes = 'Fixed review response time'
WHERE id = 'uuid-here';
```

### Manual Beta Recalibration
```bash
curl -X POST https://yourdomain.com/api/beta/recalibrate
```

### Test Sentinel
```bash
curl -X POST http://localhost:3000/api/cron/sentinel-monitor
```

---

## ⏰ Cron Schedule

| Time | Job | Purpose |
|------|-----|---------|
| 02:00 Mon | NCM Sync | Benchmark data |
| 03:00 Daily | DTRI Nightly | Dealer analysis |
| 03:00 Sun | Beta Recal | Update coefficient |
| 04:00 Mon | ADA Training | Adaptive learning |
| 05:00 Daily | AEMD Analysis | AI visibility |
| Every 6h | Sentinel | Monitor & alert |

---

## 🔧 Thresholds (Default)

### Review Monitoring
- Response Time: >4 hours
- Velocity: <0.85
- Negativity Rate: >0.20

### PageSpeed
- LCP: >3.0s
- FID: >100ms
- CLS: >0.1

### Economic
- TSM Critical: >1.4
- TSM Warning: >1.2

### Competitive
- DTRI Delta: >10 points

### System
- Beta Drift: >5%
- Alert Cooldown: 60 min

---

## 🧪 React Test Component

```tsx
const TestAutonomousSystems = () => {
  const [betaResult, setBetaResult] = useState(null);
  const [sentinelResult, setSentinelResult] = useState(null);

  const testBeta = async () => {
    const res = await fetch('/api/beta/recalibrate', { method: 'POST' });
    setBetaResult(await res.json());
  };

  const testSentinel = async () => {
    const res = await fetch('/api/cron/sentinel-monitor', { method: 'POST' });
    setSentinelResult(await res.json());
  };

  return (
    <div>
      <button onClick={testBeta}>Test Beta Recalibration</button>
      <button onClick={testSentinel}>Test Sentinel</button>

      {betaResult && (
        <div>
          <h3>Beta Result:</h3>
          <pre>{JSON.stringify(betaResult, null, 2)}</pre>
        </div>
      )}

      {sentinelResult && (
        <div>
          <h3>Sentinel Result:</h3>
          <pre>{JSON.stringify(sentinelResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
```

---

## 📱 Webhook Payload Format

```json
{
  "text": "*CRITICAL ALERT:* Review Response Lag – naples-001\nAverage response time is 5.2h, velocity=0.82. Triggering CRISIS SOW."
}
```

Works with:
- Slack
- Discord
- Microsoft Teams
- Any webhook-compatible service

---

## ⚠️ Troubleshooting

### Beta not updating?
1. Check drift is >5%
2. Verify sample size >0
3. Check DTRI analysis data exists
4. Review logs: `SELECT * FROM dtri_calibration_log`

### Sentinel not alerting?
1. Check dealer enabled: `SELECT * FROM sentinel_config WHERE dealer_id = 'xxx'`
2. Verify not in cooldown
3. Check webhook URL is correct
4. Review recent events: `SELECT * FROM sentinel_events ORDER BY created_at DESC LIMIT 10`

### BullMQ jobs not running?
1. Check Redis connection
2. Verify worker is running: `npm run dtri:worker`
3. Check job queue: `await dtriQueue.getJobs(['waiting', 'active'])`

---

## 🎯 Key Files

```
app/api/beta/recalibrate/route.ts          # Beta API
app/api/cron/sentinel-monitor/route.ts     # Sentinel API
jobs/dtriNightly.ts                         # Job scheduler
jobs/dtriProcessor.ts                       # Job worker
supabase/migrations/20250112000001_*.sql   # Database
vercel.json                                 # Cron config
```

---

**Version:** 1.0.0
**Last Updated:** January 12, 2025
**Status:** ✅ Production Ready
