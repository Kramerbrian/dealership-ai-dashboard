# 📊 Weekly AI Visibility Leaderboard Automation

**Status**: ✅ **IMPLEMENTED**

---

## 📋 Overview

Automated weekly leaderboard that aggregates A/B variant metrics and live **AIV™ / CTR / Conversion** data per dealer, then publishes a ranked leaderboard every Monday morning to your executive Slack channel.

---

## ✅ What Was Implemented

### 1. **Leaderboard Generator Script** (`scripts/generate-leaderboard.js`)
- ✅ Fetches AI scores from `/api/ai-scores` for each dealer
- ✅ Loads A/B test metrics from CSV
- ✅ Computes composite AIV Score using formula:
  ```
  AIV_Score = ((QAI + AIV + VAI + PIQR) / 4) × (1 + ((avgCTR + avgConv) / 2))
  ```
- ✅ Ranks dealers by AIV Score
- ✅ Generates formatted Slack message with Block Kit
- ✅ Saves JSON snapshot for historical tracking
- ✅ Includes action buttons (View Dashboard, View Full Report)

### 2. **GitHub Actions Workflow** (`.github/workflows/weekly-leaderboard.yml`)
- ✅ Runs every Monday at 9:00 AM EST (13:00 UTC)
- ✅ Can be manually triggered (workflow_dispatch)
- ✅ Fetches dealer scores from API
- ✅ Uploads JSON artifacts for retention
- ✅ Provides summary in GitHub Actions

### 3. **Slack Integration**
- ✅ Rich Block Kit formatting
- ✅ Top performer highlights
- ✅ Action buttons for dashboard access
- ✅ Recommendations for top performers

---

## 🔄 How It Works

```
1. GitHub Actions triggers every Monday 9 AM EST
   ↓
2. Generate Leaderboard Script
   - Fetches scores from /api/ai-scores for each dealer
   - Loads A/B test metrics from CSV
   - Computes composite AIV Score
   - Ranks dealers
   ↓
3. Save JSON Snapshot
   - Creates leaderboard_YYYY-MM-DD.json
   - Stores in public/audit-reports/
   ↓
4. Post to Slack
   - Formatted leaderboard message
   - Top performer highlights
   - Action buttons
```

---

## 📊 Example Slack Output

```
📊 DealershipAI Weekly Visibility Leaderboard
AIV™ Composite Score • Monday, November 4, 2025
> Weighted by AI search visibility, CTR, and Conversion signals

─────────────────────────────────────

1. NAPLES TOYOTA — AIV: 91.8 | QAI★: 4.7 | PIQR: 93.2
2. FORT MYERS HONDA — AIV: 88.6 | QAI★: 4.5 | PIQR: 89.7
3. SARASOTA FORD — AIV: 85.1 | QAI★: 4.3 | PIQR: 84.9
4. MIAMI BMW — AIV: 79.3 | QAI★: 4.1 | PIQR: 81.0

─────────────────────────────────────

🏆 Top Performer              💡 Recommendation
NAPLES TOYOTA                 Review NAPLES TOYOTA content
AIV Score: 91.8               schema to replicate signals.

                              QAI★: 4.7
                              PIQR: 93.2

[View Dashboard] [View Full Report]
```

---

## 🔧 Configuration

### Required Environment Variables

Add to GitHub Secrets:

```bash
# Required
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional (with defaults)
DEALER_IDS=naples-toyota,fortmyers-honda,sarasota-ford,miami-bmw
API_URL=https://dealershipai.com/api/ai-scores
NEXT_PUBLIC_APP_URL=https://dealershipai.com
API_AUTH_TOKEN=your-auth-token  # If API requires authentication
```

### Setting Up Dealer IDs

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `DEALER_IDS`
   - **Value**: Comma-separated list of dealer IDs (e.g., `naples-toyota,fortmyers-honda,sarasota-ford,miami-bmw`)

---

## 📈 AIV Score Formula

The composite AIV Score combines:

1. **Technical Visibility Metrics**:
   - QAI (Quality AI Score)
   - AIV (AI Visibility Index)
   - VAI (Visibility AI Index)
   - PIQR (Performance Index Quality Rating)

2. **Engagement Signals** (from A/B testing):
   - Average CTR (Click-Through Rate)
   - Average Conversion Rate

**Formula:**
```
AIV_Score = ((QAI + AIV + VAI + PIQR) / 4) × (1 + ((avgCTR + avgConv) / 2))
```

This creates a unified "AI Era ROI Index" that balances technical visibility with behavioral engagement.

---

## 📁 Output Files

### JSON Snapshot

Saved to: `public/audit-reports/leaderboard_YYYY-MM-DD.json`

```json
[
  {
    "dealerId": "naples-toyota",
    "AIV_Score": 91.8,
    "QAI": 4.7,
    "AIV": 88.3,
    "VAI": 87.5,
    "PIQR": 93.2,
    "HRP": 0.82,
    "avgCTR": 0.124,
    "avgConv": 0.062,
    "timestamp": "2025-11-04T13:00:00.000Z"
  }
]
```

### Historical Tracking

- JSON files are retained for 90 days (GitHub Actions artifacts)
- Can be used for:
  - YoY comparisons
  - Trend analysis
  - Executive reporting
  - Dashboard visualizations

---

## 🧪 Testing

### Test Locally:

```bash
# 1. Set environment variables
export DEALER_IDS="naples-toyota,fortmyers-honda"
export SLACK_WEBHOOK_URL="your-webhook-url"
export API_URL="http://localhost:3000/api/ai-scores"
export NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 2. Run script
node scripts/generate-leaderboard.js
```

### Test in GitHub Actions:

1. Go to **Actions** tab
2. Select **DealershipAI Weekly AI Visibility Leaderboard**
3. Click **Run workflow** → **Run workflow**
4. Watch for execution
5. Check Slack for message

---

## 📊 Schedule

- **Frequency**: Weekly
- **Day**: Monday
- **Time**: 9:00 AM EST (13:00 UTC)
- **Manual Trigger**: Available via GitHub Actions UI

---

## 🎯 Optional Enhancements

### 1. Executive PDF Summary

Generate visual leaderboard chart with YoY change:
- Add PDF generation using Puppeteer
- Include charts and trends
- Email delivery to dealer principals

### 2. Email Delivery

Automatic email delivery every week:
- SendGrid integration
- Or Slack file upload
- Include PDF attachment
- Send to dealer principals and marketing leads

### 3. Historical Comparison

Add week-over-week and YoY changes:
- Compare with previous week
- Show percentage changes
- Highlight movers (up/down)

### 4. Custom Thresholds

Alert when dealers drop below thresholds:
- Minimum AIV Score threshold
- Alert if dealer drops >10% week-over-week
- Notify stakeholders

---

## 🐛 Troubleshooting

### Issue: No dealers fetched
- **Check**: `DEALER_IDS` is set in GitHub Secrets
- **Check**: Dealer IDs are valid
- **Check**: API endpoint is accessible

### Issue: API errors
- **Check**: `API_URL` is correct
- **Check**: `API_AUTH_TOKEN` if required
- **Check**: API endpoint returns expected format
- **Check**: Network connectivity

### Issue: Slack not receiving messages
- **Check**: `SLACK_WEBHOOK_URL` is set
- **Check**: Webhook URL is valid
- **Check**: GitHub Actions logs for errors

### Issue: A/B data not loading
- **Check**: `public/audit-reports/abtest_metrics.csv` exists
- **Check**: CSV format matches expected structure
- **Check**: Script uses defaults if CSV missing

---

## 📚 Integration Points

### API Endpoint: `/api/ai-scores`

Expected response structure:
```json
{
  "kpi_scoreboard": {
    "QAI_star": 4.7,
    "OCI": 88.3,
    "VAI_Penalized": 87.5,
    "PIQR": 93.2,
    "HRP": 0.82
  }
}
```

### A/B Test CSV: `public/audit-reports/abtest_metrics.csv`

Expected format:
```csv
Variant,LCP(s),CLS,INP(s),PerfScore,CTR,ConversionRate
fear,2.3,0.05,180,95,0.08,0.04
power,2.1,0.03,165,97,0.12,0.06
```

---

## ✅ Completion Checklist

- [x] Leaderboard generator script created
- [x] GitHub Actions workflow created
- [x] Slack integration with Block Kit
- [x] JSON snapshot saving
- [x] Error handling
- [x] Documentation
- [x] Historical tracking
- [x] Manual trigger support

---

**Ready for configuration and testing!** 🎉

