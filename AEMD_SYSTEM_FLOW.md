# AEMD System Flow Diagram

## Data Flow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA COLLECTION                              │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │  AEMD Raw Metrics │         │ Accuracy Metrics  │
        │                   │         │                   │
        │ • CTR_P3          │         │ • Issue Detection │
        │ • CTR_FS          │         │ • Ranking Corr.   │
        │ • VDP Views       │         │ • Consensus Rel.  │
        │ • Conversions     │         │ • Variance        │
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │   POST /api/      │         │   POST /api/      │
        │ aemd-metrics      │         │ accuracy-         │
        │                   │         │ monitoring        │
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  └──────────────┬──────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CALCULATION & VALIDATION                        │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │  Calculate AEMD   │     │ Validate Accuracy │
        │                   │     │                   │
        │ FS = CTR × 0.30   │     │ Check ranges      │
        │ AIO = VDP × 0.50  │     │ Calc confidence   │
        │ PAA = Conv × 0.20 │     │ Compare threshold │
        │ Final = ω × Σ     │     │                   │
        └─────────┬─────────┘     └─────────┬─────────┘
                  │                         │
                  ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │  Store in DB:     │     │  Store in DB:     │
        │  aemd_metrics     │     │  accuracy_        │
        │                   │     │  monitoring       │
        └─────────┬─────────┘     └─────────┬─────────┘
                  │                         │
                  │                         ▼
                  │              ┌───────────────────┐
                  │              │ 🔔 Trigger Check  │
                  │              │                   │
                  │              │ Is below          │
                  │              │ threshold?        │
                  │              └─────────┬─────────┘
                  │                        │
                  │                ┌───────┴────────┐
                  │                │                │
                  │                ▼                ▼
                  │           ┌────────┐      ┌────────┐
                  │           │  YES   │      │   NO   │
                  │           └────┬───┘      └────┬───┘
                  │                │               │
                  │                ▼               ▼
                  │      ┌──────────────┐    ┌──────────┐
                  │      │ Create Alert │    │   Skip   │
                  │      │              │    └──────────┘
                  │      │ accuracy_    │
                  │      │ alerts       │
                  │      └──────┬───────┘
                  │             │
                  │             ▼
                  │   ┌──────────────────┐
                  │   │ Check Cooldown   │
                  │   │                  │
                  │   │ Last alert       │
                  │   │ >60 min ago?     │
                  │   └─────────┬────────┘
                  │             │
                  │      ┌──────┴───────┐
                  │      │              │
                  │      ▼              ▼
                  │  ┌───────┐     ┌───────┐
                  │  │  YES  │     │  NO   │
                  │  └───┬───┘     └───┬───┘
                  │      │             │
                  │      ▼             ▼
                  │  ┌──────────┐  ┌──────────┐
                  │  │   Send   │  │ Suppress │
                  │  │  Alerts  │  │  Alert   │
                  │  └────┬─────┘  └──────────┘
                  │       │
                  │       ▼
                  │  ┌──────────────────────────┐
                  │  │  Multi-Channel Delivery  │
                  │  │                          │
                  │  │  ✉️  Email (Resend)      │
                  │  │  💬 Slack Webhook        │
                  │  │  🔗 Custom Webhook       │
                  │  │  📝 Console Log          │
                  │  └────┬─────────────────────┘
                  │       │
                  └───────┴─────────────┐
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           VISUALIZATION                              │
└─────────────────────────────────────────────────────────────────────┘
                                        │
                          ┌─────────────┴─────────────┐
                          │                           │
                          ▼                           ▼
              ┌───────────────────┐       ┌───────────────────┐
              │  GET /api/        │       │  GET /api/        │
              │  aemd-metrics     │       │  accuracy-        │
              │                   │       │  monitoring       │
              └─────────┬─────────┘       └─────────┬─────────┘
                        │                           │
                        └───────────┬───────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  Enhanced AVI Report  │
                        │                       │
                        │  GET /api/avi-report  │
                        │  + AEMD data          │
                        │  + Accuracy data      │
                        └───────────┬───────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │ AEMDMonitoring        │
                        │ Dashboard Component   │
                        └───────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐         ┌───────────────────┐
        │  Visual Elements  │         │   Interactive     │
        │                   │         │   Features        │
        │ • Heatmaps        │         │                   │
        │ • Gauges          │         │ • Time range      │
        │ • Comparison bars │         │ • Alert ack       │
        │ • Trend charts    │         │ • ASR trigger     │
        │ • Alert banners   │         │ • Refresh data    │
        └───────────────────┘         └───────────────────┘
```

---

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │  View Dashboard   │         │ Acknowledge Alert │
        │                   │         │                   │
        │ • Load page       │         │ • Click button    │
        │ • Select date     │         │ • Add notes       │
        │ • Refresh data    │         │ • Mark resolved   │
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │ React Component   │         │  PATCH /api/      │
        │ Renders UI        │         │  accuracy-        │
        │                   │         │  monitoring       │
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │  Fetch APIs       │         │ Update Alert      │
        │                   │         │ Status            │
        │ • AEMD metrics    │         │                   │
        │ • Accuracy data   │         │ • acknowledged_at │
        │ • Active alerts   │         │ • resolution_notes│
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │  Process Data     │         │ Return Success    │
        │                   │         │                   │
        │ • Calculate stats │         │ • Alert updated   │
        │ • Format charts   │         │ • UI refreshes    │
        │ • Apply styling   │         │                   │
        └─────────┬─────────┘         └───────────────────┘
                  │
                  ▼
        ┌───────────────────┐
        │  Render UI        │
        │                   │
        │ • Heatmaps        │
        │ • Gauges          │
        │ • Tables          │
        │ • Alerts          │
        └───────────────────┘
```

---

## Database Trigger Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│               INSERT INTO accuracy_monitoring                        │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────┐
        │  TRIGGER: trg_calculate_confidence_level  │
        │  (BEFORE INSERT OR UPDATE)                │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Function: calculate_confidence_level()   │
        │                                           │
        │  variance < 5     → VERY_HIGH            │
        │  variance < 10    → HIGH                 │
        │  variance < 15    → MEDIUM               │
        │  variance >= 15   → LOW                  │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Set NEW.confidence_level                 │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  TRIGGER: trg_accuracy_monitoring_alerts  │
        │  (AFTER INSERT OR UPDATE)                 │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Function: trg_check_accuracy_thresholds()│
        │                                           │
        │  FOR EACH metric in                      │
        │    (issue_detection,                     │
        │     ranking_correlation,                 │
        │     consensus_reliability)               │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Get threshold from accuracy_thresholds   │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Compare metric_value to thresholds       │
        └─────────────────┬─────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
    ┌───────────────────┐  ┌───────────────────┐
    │ Below critical    │  │ Below warning     │
    │ threshold?        │  │ threshold?        │
    └─────────┬─────────┘  └─────────┬─────────┘
              │                      │
              ▼                      ▼
    ┌───────────────────┐  ┌───────────────────┐
    │ severity =        │  │ severity =        │
    │ 'critical'        │  │ 'warning'         │
    └─────────┬─────────┘  └─────────┬─────────┘
              │                      │
              └──────────┬───────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  INSERT INTO accuracy_alerts       │
        │                                    │
        │  • tenant_id                       │
        │  • metric_name                     │
        │  • metric_value                    │
        │  • threshold_value                 │
        │  • severity                        │
        │  • triggered_at                    │
        └────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  Set flags on accuracy_monitoring: │
        │                                    │
        │  • is_below_threshold = true       │
        │  • alert_triggered_at = now()      │
        └────────────────────────────────────┘
```

---

## Alert Delivery Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Alert Created in Database                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────┐
        │  Application detects new alert            │
        │  (via API response or polling)            │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Call: sendAlert(notification)            │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Check cooldown period                    │
        │  (default: 60 minutes)                    │
        └─────────────────┬─────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
                ▼                   ▼
    ┌───────────────────┐  ┌───────────────────┐
    │ Last alert >60min?│  │ Last alert <60min?│
    │      YES          │  │       NO          │
    └─────────┬─────────┘  └─────────┬─────────┘
              │                      │
              ▼                      ▼
    ┌───────────────────┐  ┌───────────────────┐
    │ Get notification  │  │ Suppress alert    │
    │ channels          │  │ (cooldown)        │
    └─────────┬─────────┘  └───────────────────┘
              │
              ▼
    ┌───────────────────────────────────┐
    │  For each enabled channel:        │
    └───────────────┬───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐     ┌───────────────┐
│  Email?       │     │  Slack?       │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Format HTML   │     │ Format JSON   │
│ email         │     │ message       │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ POST Resend   │     │ POST Slack    │
│ API           │     │ Webhook       │
└───────┬───────┘     └───────┬───────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│  Webhook?     │     │  Console?     │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ Format JSON   │     │ Format text   │
│ payload       │     │ message       │
└───────┬───────┘     └───────┬───────┘
        │                     │
        ▼                     ▼
┌───────────────┐     ┌───────────────┐
│ POST custom   │     │ console.log() │
│ webhook       │     │               │
└───────┬───────┘     └───────┬───────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
        ┌────────────────────────────┐
        │ Record notification status │
        │ in accuracy_alerts:        │
        │                            │
        │ notifications_sent = {     │
        │   "email": true,           │
        │   "slack": true,           │
        │   "webhook": false,        │
        │   "console": true          │
        │ }                          │
        └────────────────────────────┘
```

---

## Governance & Validation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│               Data Received (AEMD or Accuracy)                       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │ validateAemdData()│         │validateAccuracyData()
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐         ┌───────────────────┐
        │ Check ranges      │         │ Check ranges      │
        │                   │         │                   │
        │ • 0 ≤ AEMD ≤ 10   │         │ • 0 ≤ accuracy ≤ 1│
        │ • Components ≥ 0  │         │ • variance ≥ 0    │
        │ • Sum matches     │         │ • meets minimums  │
        └─────────┬─────────┘         └─────────┬─────────┘
                  │                             │
        ┌─────────┴─────────┐       ┌─────────┴─────────┐
        │                   │       │                   │
        ▼                   ▼       ▼                   ▼
  ┌──────────┐      ┌──────────┐ ┌──────────┐   ┌──────────┐
  │ Valid?   │      │ Invalid? │ │ Valid?   │   │ Invalid? │
  │   YES    │      │   NO     │ │   YES    │   │   NO     │
  └────┬─────┘      └────┬─────┘ └────┬─────┘   └────┬─────┘
       │                 │            │              │
       ▼                 ▼            ▼              ▼
  ┌──────────┐      ┌──────────┐ ┌──────────┐   ┌──────────┐
  │ Continue │      │ Reject   │ │ Continue │   │ Reject   │
  │ to DB    │      │ Return   │ │ to DB    │   │ Return   │
  │          │      │ 400 error│ │          │   │ 400 error│
  └────┬─────┘      └──────────┘ └────┬─────┘   └──────────┘
       │                              │
       └───────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Log to audit_log     │
        │                      │
        │ • action             │
        │ • resource_id        │
        │ • changes            │
        │ • timestamp          │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Calculate quality    │
        │ score (0-100)        │
        │                      │
        │ • No violations: 100 │
        │ • Warnings: -10 each │
        │ • Violations: -20    │
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Update governance    │
        │ metrics              │
        │                      │
        │ • totalMetrics++     │
        │ • avgScore updated   │
        │ • qualityScore calc  │
        └──────────────────────┘
```

---

## Time-based Refresh Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    User Opens Dashboard                              │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
        ┌───────────────────────────────────────────┐
        │  useEffect(() => {                        │
        │    fetchMetrics()                         │
        │  }, [tenantId, selectedTimeRange])        │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Fetch from APIs:                         │
        │                                           │
        │  • GET /api/aemd-metrics?                 │
        │    tenant_id=xxx&start_date=xxx           │
        │                                           │
        │  • GET /api/accuracy-monitoring?          │
        │    tenant_id=xxx&include_alerts=true      │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Process data & render UI                 │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  User interacts:                          │
        │                                           │
        │  • Changes time range (7d/30d/90d)        │
        │  • Clicks refresh button                  │
        │  • Acknowledges alert                     │
        └─────────────────┬─────────────────────────┘
                          │
                          ▼
        ┌───────────────────────────────────────────┐
        │  Re-fetch data                            │
        │  (triggers useEffect again)               │
        └───────────────────────────────────────────┘
```

---

This system provides a complete, production-ready monitoring solution for AI visibility metrics with automatic alerting, beautiful visualizations, and comprehensive governance controls.
