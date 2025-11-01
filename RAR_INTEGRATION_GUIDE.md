# 🎯 Revenue at Risk (RaR) → DealershipAI Orchestrator 3.0

Complete wiring kit for integrating Revenue at Risk tracking into your dashboard.

---

## ✅ What's Been Created

### **Database**
- ✅ Prisma migration: `prisma/migrations/20251101_add_rar_models.sql`
- ✅ Prisma models: `RaREvent`, `RaRMonthly` added to schema
- ✅ Indexes for performance on `dealerId` + `month`

### **API Routes**
- ✅ `POST /api/rar/ingest` - Ingest RaR events
- ✅ `POST /api/rar/compute` - Manual computation trigger
- ✅ `GET /api/rar/summary` - Get monthly RaR summary
- ✅ `GET /api/ai-scores/rar-pressure` - Get pressure score for AI weighting
- ✅ `POST /api/pulse/hooks/rar` - Pulse integration hook

### **Queue & Workers**
- ✅ `lib/queues/rarQueue.ts` - BullMQ queue for async computation
- ✅ Automatic job enqueuing on ingest
- ✅ Handles Redis/Upstash connections

### **Calculation Engine**
- ✅ `lib/rar/calc.ts` - Monthly RaR computation
- ✅ Aggregates lost sessions → leads → sales → revenue
- ✅ Extracts top losing intents

### **AI Score Integration**
- ✅ `lib/rar/scoreSync.ts` - Updates `rar_pressure` in secondaryMetrics
- ✅ Pressure score (0-1) for AI Visibility/Trust weighting
- ✅ Slack alerts for awareness

### **UI Component**
- ✅ `app/(dashboard)/intelligence/widgets/RaRCard.tsx`
- ✅ Beautiful Cupertino-styled card
- ✅ Shows RaR, recoverable, top intents
- ✅ Auto-refreshes with SWR

### **Documentation**
- ✅ `openapi/rar.yml` - Complete API specification

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install bullmq ioredis zod swr
# or
pnpm i bullmq ioredis zod swr
```

### Step 2: Run Migration

```bash
npx prisma migrate dev --name add_rar_models
# or apply the SQL directly:
# cat prisma/migrations/20251101_add_rar_models.sql
```

### Step 3: Set Environment Variables

Add to `.env.local`:

```bash
# Redis (required)
REDIS_URL=redis://localhost:6379
# OR for Upstash:
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io

# Slack (optional)
SLACK_WEBHOOK_RAR=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Feature flag
NEXT_PUBLIC_RAR_ENABLED=true
```

### Step 4: Add RaR Card to Dashboard

In your intelligence dashboard page:

```tsx
import RaRCard from '@/app/(dashboard)/intelligence/widgets/RaRCard';

// Add to your dashboard
<RaRCard dealerId="dealer123" />
```

### Step 5: Start Ingesting Data

Send events to `/api/rar/ingest`:

```bash
curl -X POST http://localhost:3000/api/rar/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "dealer123",
    "month": "2025-11-01",
    "channel": "google_search",
    "impressions": 50000,
    "shareAISnippet": 0.35,
    "ctrBaseline": 0.08,
    "ctrDropWhenAI": 0.15,
    "leadCR": 0.12,
    "closeRate": 0.25,
    "avgGross": 2500,
    "recoverableShare": 0.4,
    "intentCluster": "ev_inventory_search"
  }'
```

---

## 📊 How It Works

### Data Flow

```
1. Events Ingested → POST /api/rar/ingest
   ↓
2. Event Stored → RaREvent table
   ↓
3. Job Enqueued → rarQueue.add('computeMonthly')
   ↓
4. Worker Processes → computeMonthlyRaR()
   ↓
5. Calculates → lostSessions → lostLeads → lostSales → RaR
   ↓
6. Stores Result → RaRMonthly table
   ↓
7. Updates AI Scores → secondaryMetrics.rar_pressure
   ↓
8. Slack Alert → (if configured)
   ↓
9. Dashboard Displays → RaRCard component
```

### Calculation Formula

```
sessAI = impressions × shareAISnippet × ctrBaseline
zcs = sessAI × ctrDropWhenAI  (zero-click sessions lost)
lostLeads = zcs × leadCR
lostSales = lostLeads × closeRate
RaR = lostSales × avgGross
recoverable = RaR × recoverableShare
```

---

## 🔧 Integration with Orchestrator 3.0

### Learning Loop

The `rar_pressure` value (0-1) is stored in `secondaryMetrics` and can be consumed by your AI scoring engine:

```typescript
// In your AI score calculation
const rarPressure = await prisma.secondaryMetrics.findUnique({
  where: { dealerId_key: { dealerId, key: 'rar_pressure' } }
});

// Apply as negative weight (adjust visibility/trust down when RaR is high)
const visibilityPenalty = rarPressure * 0.05; // Max 5% reduction
const trustPenalty = rarPressure * 0.03; // Max 3% reduction
```

### Pulse Integration

When Pulse detects OEM/incentive changes, trigger RaR recomputation:

```typescript
// In your Pulse handler
await fetch('/api/pulse/hooks/rar', {
  method: 'POST',
  body: JSON.stringify({ dealerId, month: '2025-11-01' })
});
```

---

## 📈 Using RaR Card

### Basic Usage

```tsx
<RaRCard dealerId="dealer123" />
```

### With Specific Month

```tsx
<RaRCard dealerId="dealer123" month="2025-11-01" />
```

### In Dashboard Grid

```tsx
<div className="grid grid-cols-3 gap-6">
  <RaRCard dealerId={dealershipId} />
  {/* Other KPI cards */}
</div>
```

---

## 🧪 Testing

### Test Ingest

```bash
# Send test event
curl -X POST http://localhost:3000/api/rar/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test-rar-event.json
```

### Test Compute

```bash
curl -X POST http://localhost:3000/api/rar/compute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"dealerId": "dealer123", "month": "2025-11-01"}'
```

### Test Summary

```bash
curl "http://localhost:3000/api/rar/summary?dealerId=dealer123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Next Steps

1. **Run Migration**: `npx prisma migrate dev`
2. **Set Redis URL**: Add to `.env.local`
3. **Add to Dashboard**: Import and use `RaRCard`
4. **Start Ingesting**: Send events from your data pipeline
5. **Integrate AI Scores**: Use `rar_pressure` in your scoring formulas

---

## 🎉 Done!

Your RaR integration is complete and ready to:
- ✅ Track Revenue at Risk from AI snippet visibility
- ✅ Compute monthly aggregates automatically
- ✅ Surface in dashboard with beautiful UI
- ✅ Feed into AI score weighting for continuous learning

**All files created and ready to use!** 🚀

