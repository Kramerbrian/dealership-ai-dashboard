# ✅ Zero-Click Tracking Implementation Complete

## 📊 What Was Built

### 1. Database Schema ✅
- **ZeroClickDaily** model: Tracks daily zero-click metrics per tenant
- **CtrBaseline** model: Stores CTR baselines by device/cohort
- Unique constraints: `tenantId + date` for daily data, `tenantId + device + cohort` for baselines

### 2. Math Utilities ✅
**File**: `lib/zero-click/math.ts`
- `calcZCR()`: Calculate Zero-Click Rate from GSC data
- `calcZCCO()`: Calculate GBP save-rate (on-SERP conversions)
- `calcAIRI()`: Calculate AI Replacement Index
- `adjustedZeroClick()`: Final adjusted metric (ZCR - ZCCO)

### 3. Data Fetchers ✅
**File**: `lib/zero-click/fetchers.ts`
- `fetchGscDaily()`: Stub for Google Search Console API
- `fetchGbpDaily()`: Stub for Google Business Profile API
- `fetchAIPresenceRate()`: Stub for AI probe data
- `chooseBaselineCtr()`: Blend baselines across cohorts

### 4. API Routes ✅

#### `/api/zero-click/recompute` (POST)
- Accepts `tenantId` and optional `date`
- Pulls GSC, GBP, and AI presence data
- Computes all metrics
- Upserts to `ZeroClickDaily` table
- Returns saved record

#### `/api/zero-click/summary` (GET)
- Accepts `tenantId` and optional `days` (default: 30)
- Returns time series of zero-click metrics
- Ordered by date ascending

### 5. React Components ✅

#### Cards
- **ZeroClickCard**: Shows adjusted zero-click % with trend chart
- **AiriCard**: Shows AI Replacement Index with area chart
- Both include info modals

#### Modals
- **WhereDidClicksGo**: Explains ZCR, ZCCO, and adjusted metrics
- **AiriExplainer**: Explains AIRI calculation and action items

### 6. Cron Job ✅
**File**: `vercel.json`
- Scheduled: `15 2 * * *` (2:15 AM daily)
- Path: `/api/zero-click/recompute`
- Automatically computes metrics nightly

### 7. Seed Script ✅
**File**: `scripts/seed-ctr-baseline.ts`
- Creates sample CTR baselines for testing
- Supports multiple device/cohort combinations

---

## 🚀 Next Steps

### 1. Run Migration
```bash
npx prisma migrate dev -n "zero_click_daily_and_baseline"
npx prisma generate
```

### 2. Seed Baselines (Optional)
```bash
TENANT_ID=demo-tenant npx tsx scripts/seed-ctr-baseline.ts
```

### 3. Connect Real APIs

Update `lib/zero-click/fetchers.ts` with real API clients:

#### Google Search Console
```typescript
// Install: npm install googleapis
import { google } from 'googleapis';

export async function fetchGscDaily(tenantId: string, dateISO: string) {
  const auth = await getGscAuth(tenantId); // Your auth logic
  const gsc = google.searchconsole('v1');
  
  const response = await gsc.searchanalytics.query({
    auth,
    siteUrl: `https://${getDomainForTenant(tenantId)}`,
    requestBody: {
      startDate: dateISO,
      endDate: dateISO,
      dimensions: ['device', 'query'],
      rowLimit: 10000
    }
  });
  
  // Transform to CohortRow[]
  return transformGscResponse(response.data);
}
```

#### Google Business Profile
```typescript
// Install: npm install googleapis
import { google } from 'googleapis';

export async function fetchGbpDaily(tenantId: string, dateISO: string) {
  const auth = await getGbpAuth(tenantId);
  const mybusiness = google.mybusinessaccountmanagement('v1');
  
  // Use Business Profile Performance API
  const response = await mybusiness.locations.getInsights({
    name: `locations/${getLocationId(tenantId)}`,
    // ... date filters
  });
  
  return transformGbpResponse(response.data);
}
```

#### AI Presence Rate
```typescript
// Query your AiAnswerObservation or AiStratumScore tables
export async function fetchAIPresenceRate(
  tenantId: string,
  from: Date,
  to: Date
) {
  const observations = await prisma.aiAnswerObservation.findMany({
    where: {
      tenantId,
      observedAt: { gte: from, lte: to }
    }
  });
  
  // Calculate weighted average
  const total = observations.length;
  const present = observations.filter(o => o.present).length;
  
  return present / total;
}
```

### 4. Integrate into Dashboard

Add cards to your dashboard page:

```tsx
// app/dash/page.tsx or app/(dashboard)/dashboard/page.tsx
import ZeroClickCard from '@/components/zero-click/ZeroClickCard';
import AiriCard from '@/components/zero-click/AiriCard';

export default function Dashboard({ params }: { params: { tenant: string } }) {
  const tenantId = params.tenant; // or get from auth
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ZeroClickCard tenantId={tenantId} />
      <AiriCard tenantId={tenantId} />
      {/* Existing AVI cards */}
    </div>
  );
}
```

### 5. Test the System

1. **Manual recompute**:
   ```bash
   curl -X POST http://localhost:3000/api/zero-click/recompute \
     -H "Content-Type: application/json" \
     -d '{"tenantId": "demo-tenant", "date": "2025-01-31"}'
   ```

2. **Fetch summary**:
   ```bash
   curl http://localhost:3000/api/zero-click/summary?tenantId=demo-tenant&days=30
   ```

3. **Verify cron** (after deploy):
   - Check Vercel dashboard → Cron Jobs
   - Verify job runs at 2:15 AM daily

---

## 📐 Formulas Implemented

### Zero-Click Rate (ZCR)
```
ZCR = 1 - (Clicks / Impressions)
```

### GBP Save-Rate (ZCCO)
```
ZCCO = (Calls + Directions + Messages + Bookings) / GBP Views
```

### AI Replacement Index (AIRI)
```
AIRI = AI Presence Rate × max(0, CTR_baseline - CTR_actual)
```

### Adjusted Zero-Click
```
Adjusted = clamp(ZCR - ZCCO, 0, 1)
```

---

## 🎨 Component Features

### ZeroClickCard
- Large display of adjusted zero-click %
- 30-day trend line chart
- Breakdown: Raw ZCR, GBP Save-Rate, Net Adjusted
- Info modal for explanations

### AiriCard
- AIRI score with trend area chart
- AI presence rate indicator
- Info modal with color-coded severity

### Modals
- Clean, dealer-friendly explanations
- Color-coded insights
- Actionable recommendations

---

## 🔧 Configuration

### Environment Variables
No new env vars required for stubs. When connecting real APIs:
- `GSC_CLIENT_ID`
- `GSC_CLIENT_SECRET`
- `GBP_API_KEY`
- Database connection (already configured)

### Vercel Cron
Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/zero-click/recompute",
      "schedule": "15 2 * * *"
    }
  ]
}
```

---

## ✅ Testing Checklist

- [ ] Run Prisma migration
- [ ] Seed CTR baselines
- [ ] Test `/api/zero-click/recompute` endpoint
- [ ] Test `/api/zero-click/summary` endpoint
- [ ] Add cards to dashboard
- [ ] Verify charts render correctly
- [ ] Test modal interactions
- [ ] Connect real GSC API (when ready)
- [ ] Connect real GBP API (when ready)
- [ ] Connect AI probe data (when ready)
- [ ] Verify cron job runs (after deploy)

---

## 📚 Key Files

```
prisma/schema.prisma                 # Database models
lib/zero-click/math.ts               # Core calculations
lib/zero-click/fetchers.ts           # Data source stubs
app/api/zero-click/recompute/route.ts # Computation endpoint
app/api/zero-click/summary/route.ts  # Time series endpoint
components/zero-click/ZeroClickCard.tsx
components/zero-click/AiriCard.tsx
components/zero-click/modals/WhereDidClicksGo.tsx
components/zero-click/modals/AiriExplainer.tsx
scripts/seed-ctr-baseline.ts         # Baseline seeding
vercel.json                          # Cron configuration
```

---

**Status**: ✅ **Ready for integration** (stubs ready, real APIs pending)

