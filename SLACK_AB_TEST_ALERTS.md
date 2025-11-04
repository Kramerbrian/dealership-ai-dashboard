# 🚨 Slack A/B Test Performance Alerts

**Status**: ✅ **IMPLEMENTED**

---

## 📋 Overview

Automated Slack alerts for A/B test variant performance that detect when any variant outperforms others by >10% in CTR or conversion rate, and automatically posts alerts with highlights.

---

## ✅ What Was Implemented

### 1. **Slack Performance Alert Script** (`scripts/slack-performance-alert.js`)
- ✅ Reads A/B test metrics from CSV
- ✅ Detects variants outperforming by >10% in CTR or Conversion
- ✅ Calculates performance differences
- ✅ Posts formatted Slack alerts with highlights
- ✅ Includes action buttons (View Report, View Dashboard)
- ✅ Gracefully handles missing files

### 2. **Slack Anomaly Summary Script** (`scripts/slack-anomaly-summary.js`)
- ✅ Provides weekly digest of performance anomalies
- ✅ Tracks CTR, Conversion, and Performance score anomalies
- ✅ Detects LCP degradation (>0.5s)
- ✅ Configurable thresholds (CTR: 7.5%, Conversion: 5%)
- ✅ Always runs after audit reports

### 3. **GitHub Actions Workflow** (`.github/workflows/abtest-deploy.yml`)
- ✅ Automatically runs after report generation
- ✅ Executes Slack performance alert
- ✅ Executes Slack anomaly summary (if: always())
- ✅ Uploads audit reports as artifacts
- ✅ Continues on error (non-blocking)

---

## 🔄 How It Works

```
1. GitHub Actions triggers on push/PR
   ↓
2. Generate Audit Report (scripts/generate-report.js)
   ↓
3. Slack Performance Alert (scripts/slack-performance-alert.js)
   - Reads abtest_metrics.csv
   - Detects >10% outperformance
   - Posts alert if threshold exceeded
   ↓
4. Slack Anomaly Summary (scripts/slack-anomaly-summary.js)
   - Analyzes all anomalies
   - Posts weekly digest
   - Always runs (even on errors)
```

---

## 📊 Example Slack Messages

### Scenario A: Alert Triggered (>10% Outperformance)

```
🚨 A/B Variant Outperformance Detected!

> POWER leads CTR by 12.6%
  CTR: 12.45% (vs 9.21% avg)
> INNOVATE leads Conversion by 14.8%
  Conversion: 6.23% (vs 4.35% avg)

Average CTR: 9.21%
Average Conversion: 4.35%

View Report → https://dealershipai.com/audit-reports/abtest_report.pdf

[View Report] [View Dashboard]
```

### Scenario B: No Significant Change

```
✅ No variant exceeded 10% performance threshold.

Average CTR: 8.84%
Average Conversion: 3.92%

Top Performers:
• CTR: POWER (9.45%)
• Conversion: INNOVATE (4.12%)
```

### Scenario C: Anomaly Summary

```
📊 A/B Test Anomaly Summary

⚠️ Detected 3 anomalies:

1. ⬆️ POWER - CTR
   +12.6% (12.45% vs 9.21% avg)

2. ⬆️ INNOVATE - Conversion
   +14.8% (6.23% vs 4.35% avg)

3. 🟡 FEAR - Performance
   LCP degradation: 3.2s (vs 2.5s avg)

Summary:
• Average CTR: 9.21%
• Average Conversion: 4.35%
• Average Performance Score: 94

View Full Report → https://dealershipai.com/audit-reports/abtest_report.pdf

[View Report] [View Dashboard]
```

---

## 🔧 Configuration

### Environment Variables

Add to GitHub Secrets (Settings → Secrets and variables → Actions):

```bash
# Required
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional (for report links)
NEXT_PUBLIC_APP_URL=https://dealershipai.com
GOOGLE_PAGESPEED_API_KEY=your-api-key
```

### Threshold Configuration

Edit `scripts/slack-performance-alert.js` to adjust thresholds:

```javascript
// Current threshold (line ~45)
const threshold = 10; // 10% outperformance

// Adjust as needed:
const threshold = 7.5; // More sensitive (early detection)
const threshold = 15;  // Less sensitive (only major changes)
```

### Anomaly Detection Thresholds

Edit `scripts/slack-anomaly-summary.js`:

```javascript
// CTR anomaly threshold (line ~45)
if (Math.abs(ctrDiff) > 7.5) { // 7.5% variance

// Conversion anomaly threshold (line ~55)
if (Math.abs(convDiff) > 5) { // 5% variance

// Performance degradation threshold (line ~65)
if (d.lcp > avgLCP + 0.5) { // 0.5s LCP degradation
```

---

## 📁 File Structure

```
.github/
└── workflows/
    └── abtest-deploy.yml       # GitHub Actions workflow

scripts/
├── generate-report.js          # Existing report generator
├── slack-performance-alert.js  # Performance alert script
└── slack-anomaly-summary.js   # Anomaly summary script

public/
└── audit-reports/
    ├── abtest_metrics.csv      # Input CSV file
    └── abtest_report.pdf       # Report PDF
```

---

## 🚀 Setup Instructions

### 1. Add Slack Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create Incoming Webhook
3. Copy webhook URL
4. Add to GitHub Secrets: `SLACK_WEBHOOK_URL`

### 2. Configure GitHub Secrets

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `SLACK_WEBHOOK_URL` (required)
   - `NEXT_PUBLIC_APP_URL` (optional, for report links)
   - `GOOGLE_PAGESPEED_API_KEY` (optional, for report generation)

### 3. Test Locally

```bash
# Generate test report
node scripts/generate-report.js

# Test performance alert
SLACK_WEBHOOK_URL=your-webhook-url node scripts/slack-performance-alert.js

# Test anomaly summary
SLACK_WEBHOOK_URL=your-webhook-url node scripts/slack-anomaly-summary.js
```

### 4. Verify in GitHub Actions

1. Push to `main` or `develop` branch
2. Check GitHub Actions tab
3. Watch for "Slack Performance Alert" step
4. Verify Slack message received

---

## 🎯 Features

### ✅ Performance Alert
- Detects >10% CTR outperformance
- Detects >10% Conversion outperformance
- Highlights top-performing variants
- Includes action buttons
- Graceful error handling

### ✅ Anomaly Summary
- Tracks CTR anomalies (>7.5% variance)
- Tracks Conversion anomalies (>5% variance)
- Detects LCP degradation (>0.5s)
- Provides weekly digest
- Always runs (even on errors)

### ✅ Integration
- Automatic execution in CI/CD
- Non-blocking (continue-on-error)
- Artifact uploads
- Configurable thresholds

---

## 📈 Recommended Thresholds

| Metric | Default | Early Detection | Major Changes Only |
|--------|---------|-----------------|-------------------|
| CTR Diff | >10% | >7.5% | >15% |
| Conv Diff | >10% | >5% | >15% |
| Perf Degradation | >0.5s | >0.3s | >1.0s |

---

## 🐛 Troubleshooting

### Issue: Slack alerts not sending
- **Check**: `SLACK_WEBHOOK_URL` is set in GitHub Secrets
- **Check**: Webhook URL is valid (starts with `https://hooks.slack.com`)
- **Check**: GitHub Actions logs for errors
- **Test**: Run script locally with webhook URL

### Issue: No alerts triggered
- **Check**: CSV file exists at `public/audit-reports/abtest_metrics.csv`
- **Check**: CSV format matches expected structure
- **Check**: Threshold settings (may need to lower for early detection)
- **Verify**: Variants are actually outperforming by threshold amount

### Issue: Anomaly summary not showing
- **Check**: Script runs after audit report generation
- **Check**: `if: always()` condition in workflow
- **Check**: Anomalies actually exist (check CSV data)
- **Verify**: Thresholds are appropriate for your data range

---

## 📊 CSV Format Expected

```csv
Variant,LCP(s),CLS,INP(s),PerfScore,CTR,ConversionRate
fear,2.3,0.05,180,95,0.08,0.04
power,2.1,0.03,165,97,0.12,0.06
innovate,2.4,0.04,190,93,0.09,0.05
boardroom,2.2,0.03,170,96,0.11,0.07
```

**Columns:**
- `Variant`: Variant name (fear, power, innovate, boardroom)
- `LCP(s)`: Largest Contentful Paint in seconds
- `CLS`: Cumulative Layout Shift score
- `INP(s)`: Interaction to Next Paint in seconds
- `PerfScore`: Lighthouse performance score (0-100)
- `CTR`: Click-through rate (0-1, displayed as percentage)
- `ConversionRate`: Conversion rate (0-1, displayed as percentage)

---

## 🎯 Next Steps (Optional)

### 1. Weekly AI Visibility Leaderboard
Pull real dealership AIV™ / CTR / Conversion deltas into a single Slack report for executives and PMs. This would integrate with:
- `/api/ai-scores` endpoint
- AIV schema models
- Weekly aggregation cron job

### 2. Real-time Webhook Integration
Instead of waiting for CI/CD, trigger Slack alerts immediately when:
- A/B test completes
- Significant performance change detected
- User-triggered report generation

### 3. Email Reports
Send automated email reports alongside Slack alerts:
- Weekly digest emails
- Executive summary PDFs
- Trend analysis charts

---

## ✅ Completion Summary

You now have:

* ✅ Full A/B testing rotation + persistence
* ✅ Lighthouse + Core Web Vitals audits
* ✅ Automated PDF/CSV report generation
* ✅ Interactive Audit Viewer dashboard
* ✅ Slack alerting for high-performing variants
* ✅ Weekly anomaly summaries
* ✅ CI/CD integration

---

**All features are implemented and ready for configuration!** 🎉

