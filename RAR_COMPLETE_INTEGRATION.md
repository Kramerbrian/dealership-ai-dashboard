# ✅ RaR Complete Integration - DealershipAI Orchestrator 3.0

**Revenue at Risk (RaR)** is now fully integrated into the DealershipAI Orchestrator with learning loops, scoring adjustments, and comprehensive visualization.

---

## 🎯 What's Included

### **1. Data Pipeline**
- ✅ `app/api/rar/ingest/route.ts` - Event ingestion endpoint
- ✅ `app/api/rar/compute/route.ts` - Manual computation trigger
- ✅ `app/api/rar/summary/route.ts` - Monthly summary retrieval
- ✅ `lib/rar/calc.ts` - Core RaR calculation logic
- ✅ `lib/rar/scoreSync.ts` - AI score integration

### **2. Learning Loop Integration**
- ✅ `lib/scoring/rar-integration.ts` - RaR pressure application to AIV/ATI/QAI
- ✅ `lib/scoring/algorithm.ts` - Updated with RaR adjustments
- ✅ `lib/algorithmic-framework.ts` - Async metrics calculation with RaR
- ✅ `app/components/ui/ScoreDeltaBadge.tsx` - Visual delta indicators

### **3. Queue System**
- ✅ `lib/queues/rarQueue.ts` - BullMQ queue for async computation
- ✅ `lib/queues/bootstrap-rar-worker.ts` - Worker initialization
- ✅ `lib/slack.ts` - Slack notifications

### **4. UI Components**
- ✅ `app/(dashboard)/intelligence/widgets/RaRCard.tsx` - Main RaR card
- ✅ `app/(dashboard)/intelligence/widgets/RaRModal.tsx` - Detailed modal
- ✅ `app/components/MysteryShopRaRIntegration.tsx` - Mystery Shop tab integration
- ✅ `app/components/CompetitiveBattlePlanRaR.tsx` - Competitive Battle Plan integration

### **5. Monitoring & Alerts**
- ✅ `prometheus/alert-rules-p0.yml` - P0 alert for high RaR pressure
- ✅ `app/api/orchestrate/agentic-fix-pack/route.ts` - Auto-mitigation endpoint

### **6. Data Templates**
- ✅ `templates/rar-ingest-template.csv` - CSV template for bulk ingest
- ✅ `scripts/seed-rar-demo.ts` - Enhanced seed script for 3 rooftops
- ✅ `looker-studio/rar-dashboard-config.json` - Looker Studio configuration

---

## 📊 RaR → Scoring Integration

### **Formula Integration**

**AIV (AI Visibility Index):**
```
AIV' = AIV × (1 - 0.04 × rar_pressure)
```
- Max penalty: **4%** when `rar_pressure = 1.0`
- Applied automatically in `lib/scoring/algorithm.ts`

**ATI (Algorithmic Trust Index):**
```
ATI' = ATI × (1 - 0.03 × rar_pressure)
```
- Max penalty: **3%** when `rar_pressure = 1.0`
- Applied automatically in scoring engine

**QAI (Quality AI Index):**
```
QAI' = QAI × (1 - 0.02 × trend_up_flag)
```
- Penalizes when RaR trend is **increasing** over 2+ cycles
- Max penalty: **2%**

### **RaR Pressure Calculation**
```typescript
rar_pressure = clamp(RaR / $100k, 0..1)
```
- Normalized to 0-1 scale
- Stored in `secondaryMetrics` table
- Automatically updates AI scores

---

## 🎨 Delta Badges

Visual indicators show RaR pressure impact on scores:

```tsx
<ScoreDeltaBadge 
  label="AIV" 
  delta={-2.1} 
  reason="RaR pressure" 
/>
```

**Example Output:**
```
AIV −2.1% (RaR pressure)
ATI −1.6% (RaR pressure)
```

---

## 🔔 P0 Alert System

### **Alert Condition**
```
rar_pressure > 0.6 AND 
Zero-Click Coverage > 45% AND 
Schema Coverage < 70%
```

### **Auto-Mitigation**
When P0 alert fires, triggers Agentic Fix Pack:
1. **Generate intent FAQs** (AEO)
2. **Inject JSON-LD** (Schema)
3. **GBP parity sync** (NAP/hours/services)

**Endpoint:** `POST /api/orchestrate/agentic-fix-pack`

---

## 📍 Where RaR Appears

### **1. Dashboard - Tier-1 KPI Row**
- **Location:** `/dash` → Overview tab
- **Component:** `<RaRCard dealerId="..." />`
- **Shows:** RaR, Recoverable, Top Losing Intents

### **2. Intelligence Dashboard**
- **Location:** `/intelligence`
- **Component:** `<RaRCard />` in cards grid
- **Modal:** Click to open detailed view

### **3. Mystery Shop Tab**
- **Location:** Dashboard → Mystery Shop tab
- **Component:** `<MysteryShopRaRIntegration />`
- **Shows:** Zero-Click Coverage, RaR, Recoverable

### **4. Competitive Battle Plan**
- **Location:** Dashboard → Competitive tab
- **Component:** `<CompetitiveBattlePlanRaR />`
- **Shows:** Top Losing Intents ranked by RaR with playbooks

---

## 📊 Looker Studio Integration

**Configuration:** `looker-studio/rar-dashboard-config.json`

**Features:**
- Real-time RaR summary
- Top 10 losing intents chart
- Channel breakdown table
- Zero-click conversion funnel
- ARR trend over time

**Connect:** Use Supabase or REST API data source

---

## 🧪 Testing & Demo

### **Seed Demo Data**

```bash
# Seed 3 rooftops with RaR data
npx tsx scripts/seed-rar-demo.ts
```

**Rooftops:**
- `germain-toyota-naples`
- `lou-grubbs-motors`
- `demo-rooftop`

### **Manual Ingest (CSV)**

1. Download `templates/rar-ingest-template.csv`
2. Fill in your dealer data
3. POST to `/api/rar/ingest` for each row

### **Verify Integration**

```bash
# Check RaR summary
curl "http://localhost:3000/api/rar/summary?dealerId=germain-toyota-naples"

# Check RaR pressure
curl "http://localhost:3000/api/ai-scores/rar-pressure?dealerId=germain-toyota-naples"

# Trigger computation
curl -X POST "http://localhost:3000/api/rar/compute" \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "germain-toyota-naples", "month": "2025-11-01"}'
```

---

## 🔄 Data Flow

```
GA4/SERP Crawl
    ↓
POST /api/rar/ingest (per channel/intent)
    ↓
RaREvent (stored)
    ↓
rarQueue.add('computeMonthly')
    ↓
rarWorker processes job
    ↓
computeMonthlyRaR()
    ↓
RaRMonthly (aggregated)
    ↓
updateAIScores() → secondaryMetrics (rar_pressure)
    ↓
AIV/ATI/QAI adjusted (via rar-integration.ts)
    ↓
Dashboard shows adjusted scores + delta badges
```

---

## 📈 Scoring Adjustments

### **Example Calculation**

**Base Scores:**
- AIV: 85.0
- ATI: 78.0
- RaR: $45,000 → `rar_pressure = 0.45`

**Adjusted Scores:**
- AIV' = 85.0 × (1 - 0.04 × 0.45) = **83.47** (-1.53)
- ATI' = 78.0 × (1 - 0.03 × 0.45) = **76.95** (-1.05)

**Delta Badges Show:**
```
AIV −1.5% (RaR pressure)
ATI −1.1% (RaR pressure)
```

---

## 🚀 Nightly Auto-Ingest

### **Vercel Cron**

Already configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/rar-nightly",
    "schedule": "0 3 * * *"
  }]
}
```

**What it does:**
1. Finds all distinct `dealerId` + `month` combinations
2. Enqueues `computeMonthly` jobs for each
3. Workers compute monthly rollups
4. Updates AI scores automatically

---

## ✅ Status Checklist

- ✅ Database models (`RaREvent`, `RaRMonthly`)
- ✅ API endpoints (ingest, compute, summary)
- ✅ Queue system (BullMQ + Redis)
- ✅ Learning loop (RaR → AIV/ATI/QAI)
- ✅ UI components (Card, Modal, Badges)
- ✅ Dashboard integration (Tier-1 KPI row)
- ✅ Mystery Shop tab integration
- ✅ Competitive Battle Plan integration
- ✅ P0 alert rules
- ✅ Agentic fix pack endpoint
- ✅ CSV template
- ✅ Seed script
- ✅ Looker Studio config

---

## 📚 Next Steps

1. **Set Environment Variables:**
   ```bash
   REDIS_URL=...
   SLACK_WEBHOOK_RAR=...
   NEXT_PUBLIC_RAR_ENABLED=true
   ```

2. **Run Migration:**
   ```bash
   npx prisma migrate dev -n add_rar_models
   ```

3. **Seed Demo Data:**
   ```bash
   npx tsx scripts/seed-rar-demo.ts
   ```

4. **View Dashboard:**
   - Navigate to `/dash` → Overview tab
   - Click "⚠️ Revenue at Risk" card
   - See modal with full details

5. **Monitor Alerts:**
   - Check Prometheus for P0 alerts
   - Review Slack notifications
   - Monitor score deltas

---

**🎉 RaR is fully integrated and learning!** The orchestrator now adapts scores based on zero-click revenue loss, creating a closed feedback loop that improves over time.

