# 📊 Looker Studio RaR Dashboard Setup

**Quick 60-second demo setup for sales pitches** - Connect RaR data to Looker Studio for instant visualization.

---

## ✅ What's Included

1. **Schema Dictionary** (`rar-schema-dictionary.json`)
   - Complete field definitions
   - Calculated fields
   - Sample queries

2. **Minimal Dashboard** (`rar-minimal-dashboard.json`)
   - Pre-configured widgets
   - 60-second pitch flow
   - Talking points

---

## 🚀 Quick Setup (5 minutes)

### **Step 1: Create Data Source**

#### **Option A: PostgreSQL/Supabase Connection**

1. In Looker Studio, click **Create** → **Data Source**
2. Select **PostgreSQL** connector
3. Enter connection details:
   ```
   Host: [your-supabase-host].supabase.co
   Port: 5432
   Database: postgres
   Username: postgres
   Password: [your-password]
   ```
4. Select tables: `RaREvent`, `RaRMonthly`, `secondaryMetrics`

#### **Option B: REST API Connection**

1. In Looker Studio, click **Create** → **Data Source**
2. Select **Custom Connector** or **API Data Source**
3. Configure:
   ```
   Endpoint: https://dash.dealershipai.com/api/rar/summary
   Method: GET
   Auth: Bearer Token (use Clerk session token)
   Parameters: dealerId, month (optional)
   ```

---

### **Step 2: Import Dashboard JSON**

1. Open Looker Studio
2. Click **Create** → **Report**
3. Click **Resource** → **Manage added data sources**
4. Import `rar-minimal-dashboard.json` OR manually recreate widgets

**Or use the widgets directly:**

#### **Widget 1: Revenue at Risk Scorecard**
```json
{
  "type": "scorecard",
  "metric": "rar",
  "format": "currency",
  "comparison": "previous_period"
}
```

#### **Widget 2: Top Losing Intents Chart**
```json
{
  "type": "bar_chart",
  "dimension": "intent",
  "metric": "rar",
  "sort": "desc",
  "limit": 5
}
```

#### **Widget 3: Recovery Funnel**
```json
{
  "type": "funnel",
  "steps": [
    "Impressions",
    "AI Snippet Sessions",
    "Zero-Click Lost",
    "Lost Leads",
    "Lost Sales",
    "Revenue at Risk"
  ]
}
```

---

### **Step 3: Configure Calculated Fields**

Add these calculated fields in Looker Studio:

#### **Recovery Rate**
```
RECOVERY_RATE = (recoverable / rar) * 100
```

#### **Zero-Click Coverage**
```
ZERO_CLICK_COVERAGE = (lostSessions / (lostSessions + 10000)) * 100
```

#### **RaR per Session**
```
RAR_PER_SESSION = rar / lostSessions
```

#### **Extract Top Intent Name**
```
TOP_INTENT = JSON_EXTRACT(topLosingIntents, '$[0].intent')
```

#### **Extract Top Intent RaR**
```
TOP_INTENT_RAR = JSON_EXTRACT(topLosingIntents, '$[0].rar')
```

---

## 📊 60-Second Demo Flow

### **Talking Points:**

1. **"Revenue at Risk Scorecard"** (10 seconds)
   - "This shows how much revenue you're losing monthly to zero-click searches"
   - Point to the currency amount

2. **"Recoverable Now"** (10 seconds)
   - "This is what you can recover immediately with our AEO fixes"
   - "Currently showing 45% recovery rate"

3. **"Top 5 Losing Intents"** (20 seconds)
   - "These are the specific intents where AI is answering before shoppers visit your site"
   - "Service price, hours, oil change are the top losers"
   - "We can deploy fixes for these in under 5 minutes"

4. **"Recovery Funnel"** (15 seconds)
   - "See the funnel: Impressions → Lost Sessions → Lost Leads → Lost Sales → Revenue at Risk"
   - "Every step is quantified and recoverable"

5. **"Quick Stats Table"** (5 seconds)
   - "Compare across dealers"
   - "See recovery rates and ROI potential"

---

## 🎨 Customization Options

### **Add More Metrics**

```json
{
  "name": "Lost Leads Rate",
  "formula": "(lostLeads / impressions) * 100",
  "format": "percent"
}
```

### **Add Comparison Period**

- Duplicate widgets
- Change date range filter to "Previous Period"
- Side-by-side comparison

### **Add Geographic View**

```json
{
  "type": "geo_chart",
  "dimension": "dealer_location",
  "metric": "rar",
  "format": "currency"
}
```

### **Add Alert Thresholds**

```json
{
  "type": "scorecard",
  "metric": "rar",
  "thresholds": {
    "low": 0,
    "medium": 10000,
    "high": 50000
  },
  "colors": {
    "low": "#10b981",
    "medium": "#f59e0b",
    "high": "#dc2626"
  }
}
```

---

## 🔗 Sample Queries

### **Monthly RaR by Dealer**
```sql
SELECT 
  dealerId,
  month,
  rar,
  recoverable,
  (recoverable / rar) * 100 as recoveryRate
FROM RaRMonthly
ORDER BY month DESC, rar DESC
```

### **Top Losing Intents**
```sql
SELECT 
  dealerId,
  JSON_EXTRACT(topLosingIntents, '$[*].intent') as intent,
  JSON_EXTRACT(topLosingIntents, '$[*].rar') as rar
FROM RaRMonthly
WHERE month = '2025-11-01'
```

### **Channel Breakdown**
```sql
SELECT 
  channel,
  intentCluster,
  SUM(impressions * shareAISnippet * ctrBaseline * ctrDropWhenAI * leadCR * closeRate * avgGross) as rar
FROM RaREvent
GROUP BY channel, intentCluster
ORDER BY rar DESC
```

---

## 📈 Advanced Visualizations

### **Time Series with Forecast**
- Add trendline to RaR trend chart
- Show 3-month forecast based on historical data

### **Heatmap by Intent × Channel**
- X-axis: Intent clusters
- Y-axis: Channels
- Color: RaR amount

### **Recovery Opportunity Matrix**
- X-axis: RaR amount
- Y-axis: Recovery rate
- Bubble size: Lost sessions

---

## 🔐 Security Notes

### **API Authentication**

If using REST API connector:
- Store Clerk token securely
- Use Looker Studio's parameterized authentication
- Rotate tokens periodically

### **RLS Policies**

If using Supabase:
- Ensure Row-Level Security (RLS) policies are enabled
- Filter by `dealerId` in Looker Studio filters
- Use service role key for dashboard (server-side only)

---

## 🧪 Testing

### **Test Data Sources**

1. Verify connection:
   ```sql
   SELECT COUNT(*) FROM RaRMonthly;
   ```

2. Test calculated fields:
   ```sql
   SELECT 
     rar,
     recoverable,
     (recoverable / rar) * 100 as recoveryRate
   FROM RaRMonthly
   LIMIT 1;
   ```

3. Test JSON extraction:
   ```sql
   SELECT 
     JSON_EXTRACT(topLosingIntents, '$[0].intent') as topIntent
   FROM RaRMonthly
   LIMIT 1;
   ```

---

## 🎯 Sales Pitch Script

**Opening (10 seconds):**
> "I want to show you exactly how much revenue you're losing to zero-click searches - where AI answers the question before shoppers even visit your site."

**Show RaR Scorecard (10 seconds):**
> "Right now, you're losing $[amount] per month in revenue at risk. This is quantifiable, measurable, and we can show you the exact intents where it's happening."

**Show Top Intents (20 seconds):**
> "See these top 5 losing intents? Service price, hours, oil change - these are where Google's AI Overview is answering instead of sending traffic to your site. We can fix all of these with one-click playbooks."

**Show Recovery (15 seconds):**
> "The good news? $[recoverable] of this is recoverable immediately with our AEO fixes. That's [percentage]% recovery rate. Want to see how we deploy the fix pack?"

**Close (5 seconds):**
> "DealershipAI Orchestrator 3.0 automatically learns from this data and adjusts your AI scores in real-time. Want a live demo of the orchestration?"

---

## ✅ Checklist

- [ ] Data source connected (PostgreSQL or REST API)
- [ ] Tables visible in Looker Studio
- [ ] Calculated fields added
- [ ] Widgets created (scorecard, chart, funnel, table)
- [ ] Filters configured (dealer, month range)
- [ ] Theme customized (brand colors)
- [ ] Test data loaded
- [ ] 60-second demo script practiced
- [ ] Talking points memorized

---

**🎉 Your Looker Studio dashboard is ready for sales pitches!**

Use the schema dictionary and minimal dashboard JSON to get up and running in under 5 minutes.

