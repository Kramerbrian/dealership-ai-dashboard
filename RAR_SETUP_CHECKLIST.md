# ✅ RaR Integration Setup Checklist

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install bullmq ioredis zod
# or
pnpm i bullmq ioredis zod
```

**Note:** `swr` is already installed ✅

### 2. Run Database Migration
```bash
# Option A: Prisma migrate
npx prisma migrate dev --name add_rar_models

# Option B: Direct SQL (in Supabase SQL Editor)
cat prisma/migrations/20251101_add_rar_models.sql
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Set Environment Variables

Add to `.env.local`:

```bash
# Redis (required for queue)
REDIS_URL=redis://localhost:6379
# OR for Upstash:
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io

# Slack (optional - for alerts)
SLACK_WEBHOOK_RAR=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Feature flag
NEXT_PUBLIC_RAR_ENABLED=true
```

### 5. Add RaR Card to Dashboard

Find your intelligence dashboard page and add:

```tsx
import RaRCard from '@/app/(dashboard)/intelligence/widgets/RaRCard';

// In your component
<RaRCard dealerId={dealershipId} />
```

### 6. Test Endpoints

```bash
# Ingest test event
curl -X POST http://localhost:3000/api/rar/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "test-dealer",
    "month": "2025-11-01",
    "channel": "google_search",
    "impressions": 50000,
    "shareAISnippet": 0.35,
    "ctrBaseline": 0.08,
    "ctrDropWhenAI": 0.15,
    "leadCR": 0.12,
    "closeRate": 0.25,
    "avgGross": 2500,
    "recoverableShare": 0.4
  }'
```

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`bullmq`, `ioredis`, `zod`)
- [ ] Migration run (`npx prisma migrate dev`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Environment variables set (`.env.local`)
- [ ] Redis connection working
- [ ] RaRCard added to dashboard
- [ ] Test event ingested successfully
- [ ] Summary endpoint returns data
- [ ] Dashboard displays RaR values

---

## 🎯 Integration with AI Scoring

To use `rar_pressure` in your AI score calculations:

```typescript
// Get pressure value
const pressure = await prisma.secondaryMetrics.findFirst({
  where: {
    dealerId: dealerId,
    key: 'rar_pressure'
  }
});

// Apply penalty to AI Visibility Index (AIV)
const aivPenalty = (pressure?.valueNum || 0) * 0.05; // Max 5% reduction
const adjustedAIV = baseAIV * (1 - aivPenalty);

// Apply penalty to Algorithmic Trust Index (ATI)
const atiPenalty = (pressure?.valueNum || 0) * 0.03; // Max 3% reduction
const adjustedATI = baseATI * (1 - atiPenalty);
```

---

## 📊 Files Created

✅ `prisma/migrations/20251101_add_rar_models.sql`
✅ `prisma/schema.prisma` (updated with RaR models)
✅ `app/api/rar/ingest/route.ts`
✅ `app/api/rar/compute/route.ts`
✅ `app/api/rar/summary/route.ts`
✅ `app/api/ai-scores/rar-pressure/route.ts`
✅ `app/api/pulse/hooks/rar/route.ts`
✅ `lib/rar/calc.ts`
✅ `lib/rar/scoreSync.ts`
✅ `lib/queues/rarQueue.ts`
✅ `lib/slack.ts`
✅ `app/(dashboard)/intelligence/widgets/RaRCard.tsx`
✅ `openapi/rar.yml`

---

**See `RAR_INTEGRATION_GUIDE.md` for complete documentation!**

