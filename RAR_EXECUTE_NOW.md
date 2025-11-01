# 🚀 RaR → Orchestrator 3.0: Execute-Now Play

Complete setup checklist to light up Revenue at Risk tracking.

---

## ✅ Step 1: Flip the Switches

### Environment Variables (Vercel → `prj_n5a2az9ZjfIyAtv6izWeSb5vvVQH`)

Add to **Vercel Dashboard → Environment Variables**:

```bash
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
# OR
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io

SLACK_WEBHOOK_RAR=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

NEXT_PUBLIC_RAR_ENABLED=true
```

### Run Migration

```bash
npx prisma migrate dev -n add_rar_models
npx prisma generate
```

### Bootstrap Worker

The worker auto-initializes when `lib/queues/bootstrap-rar-worker.ts` is imported. To ensure it runs:

**Option A: Import in layout (server-side only)**

```tsx
// app/layout.tsx
import '@/lib/queues/bootstrap-rar-worker'; // Add this
```

**Option B: Create dedicated worker script**

```tsx
// lib/workers/start-rar.ts
import '@/lib/queues/bootstrap-rar-worker';
```

---

## ✅ Step 2: Smoke Test the API

### Test Ingest

```bash
curl -X POST https://dash.dealershipai.com/api/rar/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ClerkSessionToken>" \
  -d '{
    "dealerId": "germain-toyota-naples",
    "month": "2025-11-01",
    "channel": "google_organic",
    "impressions": 300000,
    "shareAISnippet": 0.35,
    "ctrBaseline": 0.055,
    "ctrDropWhenAI": 0.35,
    "leadCR": 0.04,
    "closeRate": 0.18,
    "avgGross": 2100,
    "recoverableShare": 0.45,
    "intentCluster": "service_price"
  }'
```

### Test Summary

```bash
curl "https://dash.dealershipai.com/api/rar/summary?dealerId=germain-toyota-naples&month=2025-11-01" \
  -H "Authorization: Bearer <ClerkSessionToken>"
```

---

## ✅ Step 3: Add RaR Card to Dashboard

Find your intelligence dashboard and add:

```tsx
// app/intelligence/page.tsx (or wherever your dashboard is)
import RaRCard from '@/app/(dashboard)/intelligence/widgets/RaRCard';

// In your component
<div className="grid grid-cols-3 gap-6">
  {/* Existing KPIs */}
  <RaRCard dealerId="germain-toyota-naples" month="2025-11-01" />
</div>
```

---

## ✅ Step 4: Map RaR → Learning Loop (AIV/ATI/QAI)

### Implementation Example

```typescript
// lib/scoring/ai-visibility-index.ts
import { prisma } from '@/lib/prisma';

export async function calculateAIV(dealerId: string, baseAIV: number): Promise<number> {
  // Get RaR pressure
  const rarPressure = await prisma.secondaryMetrics.findFirst({
    where: { dealerId, key: 'rar_pressure' } as any
  });

  const pressure = rarPressure?.valueNum || 0;
  
  // Apply penalty: AIV' = AIV × (1 - 0.04 × rar_pressure)
  const aivPenalty = pressure * 0.04; // Max 4% reduction
  const adjustedAIV = baseAIV * (1 - aivPenalty);

  return Math.max(0, adjustedAIV); // Floor at 0
}

// lib/scoring/algorithmic-trust-index.ts
export async function calculateATI(dealerId: string, baseATI: number): Promise<number> {
  const rarPressure = await prisma.secondaryMetrics.findFirst({
    where: { dealerId, key: 'rar_pressure' } as any
  });

  const pressure = rarPressure?.valueNum || 0;
  
  // Apply penalty: ATI' = ATI × (1 - 0.03 × rar_pressure)
  const atiPenalty = pressure * 0.03; // Max 3% reduction
  const adjustedATI = baseATI * (1 - atiPenalty);

  return Math.max(0, adjustedATI);
}

// lib/scoring/quantum-authority-index.ts
export async function calculateQAI(
  dealerId: string,
  baseQAI: number,
  rarTrendUp: number // 0-1, computed from last 2+ cycles
): Promise<number> {
  // Apply trend-based penalty: (1 - 0.02 × trend_up)
  const trendPenalty = rarTrendUp * 0.02; // Max 2% reduction
  const adjustedQAI = baseQAI * (1 - trendPenalty);

  return Math.max(0, adjustedQAI);
}
```

### Surface Delta Badges

```tsx
// components/ScoreBadge.tsx
'use client';

export function RaRPressureBadge({ dealerId }: { dealerId: string }) {
  const { data } = useSWR(`/api/ai-scores/rar-pressure?dealerId=${dealerId}`, fetcher);
  const pressure = data?.pressure || 0;

  if (pressure === 0) return null;

  const aivDelta = -(pressure * 0.04 * 100).toFixed(1);
  const atiDelta = -(pressure * 0.03 * 100).toFixed(1);

  return (
    <div className="text-xs text-amber-600">
      <span>AIV {aivDelta}% (RaR pressure)</span>
      <span className="ml-2">ATI {atiDelta}% (RaR pressure)</span>
    </div>
  );
}
```

---

## ✅ Step 5: Nightly Auto-Ingest (Vercel Cron)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/rar/compute",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Or use a dedicated cron route:

```typescript
// app/api/cron/rar-nightly/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { rarQueue } from '@/lib/queues/rarQueue';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all active dealers (from your database)
  const dealers = await getActiveDealers();
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  // Enqueue compute for each dealer
  for (const dealer of dealers) {
    await rarQueue.add(
      'computeMonthly',
      { dealerId: dealer.id, month: currentMonth },
      { jobId: `${dealer.id}:${currentMonth}` }
    );
  }

  return NextResponse.json({ ok: true, queued: dealers.length });
}
```

---

## ✅ Step 6: Seed Data (Fast Demo)

```bash
# Set environment variables
export SEED_DEALER_ID="demo-rooftop"
export SEED_MONTH="2025-11-01"

# Run seed script
npx tsx scripts/seed-rar.ts
```

This creates 5 test events with different intent clusters.

---

## ✅ Step 7: Alerts & Ops

### P0 Alert Rule

```typescript
// lib/alerts/rar-p0-check.ts
import { prisma } from '@/lib/prisma';

export async function checkRaRP0Alert(dealerId: string) {
  const [rarPressure, zcc, schemaCoverage] = await Promise.all([
    prisma.secondaryMetrics.findFirst({
      where: { dealerId, key: 'rar_pressure' } as any
    }),
    prisma.secondaryMetrics.findFirst({
      where: { dealerId, key: 'zero_click_coverage' } as any
    }),
    prisma.secondaryMetrics.findFirst({
      where: { dealerId, key: 'schema_coverage_ratio' } as any
    })
  ]);

  const pressure = rarPressure?.valueNum || 0;
  const zccValue = zcc?.valueNum || 0;
  const schemaValue = schemaCoverage?.valueNum || 0;

  if (pressure > 0.6 && zccValue > 45 && schemaValue < 70) {
    // Trigger "Agentic Fix Pack"
    await triggerAgenticFixPack(dealerId, [
      'Generate intent FAQs (AEO)',
      'Inject JSON-LD (Schema)',
      'GBP parity sync (NAP/hours/services)'
    ]);

    return true;
  }

  return false;
}
```

---

## ✅ Step 8: QA Checks

### Idempotency Test

```bash
# Send same event twice
curl -X POST .../api/rar/ingest -d '{...same payload...}'
curl -X POST .../api/rar/ingest -d '{...same payload...}'

# Should only create one monthly row
```

### Boundary Test

```bash
# Should reject
curl -X POST .../api/rar/ingest -d '{"shareAISnippet": 1.5}' # > 1
curl -X POST .../api/rar/ingest -d '{"shareAISnippet": -0.1}' # < 0
```

### Visibility Test

```tsx
// With no data, RaRCard shows "—"
<RaRCard dealerId="new-dealer" />
// Should render: "—" for RaR and recoverable
```

---

## ✅ Step 9: Where It Shows Up Next

### Mystery Shop Tab

```tsx
// Add to Mystery Shop summary
<div className="space-y-2">
  <div>Zero-Click Coverage: {zcc}%</div>
  <div>RaR: ${rar}/mo</div>
  <div>Recoverable: ${recoverable}/mo</div>
</div>
```

### Competitive Battle Plan

```tsx
// Rank Top Losing Intents by $RaR
const topIntents = raRMonthly.topLosingIntents
  .sort((a, b) => b.rar - a.rar)
  .map(intent => ({
    ...intent,
    playbook: getOneClickPlaybook(intent.intent) // "Add FAQ", "Sync GBP", "Fix Schema"
  }));
```

---

## 🎉 Done!

Your RaR integration is **live and learning**. The system will:

1. ✅ Track Revenue at Risk from AI snippet visibility
2. ✅ Auto-compute monthly aggregates
3. ✅ Feed pressure scores into AI indices
4. ✅ Surface in dashboard with beautiful UI
5. ✅ Trigger alerts for P0 conditions
6. ✅ Provide actionable recovery playbooks

**Next:** Integrate `rar_pressure` into your AIV/ATI/QAI calculations using the examples above!

