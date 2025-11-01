# 🚀 Cognitive Ops Platform - Deployment Checklist

## Pre-Deployment Setup

### 1. Database Environment Variables

**Required for Prisma migrations:**

```env
DATABASE_URL="postgresql://user:password@host:5432/dealershipai"
DIRECT_URL="postgresql://user:password@host:5432/dealershipai"
```

**Note:** `DIRECT_URL` is required for migrations when using connection pooling. Set it to the same value as `DATABASE_URL` or your direct database connection string.

### 2. Cognitive Ops Platform Variables

Add to `.env.local` and Vercel:

```env
PLATFORM_MODE=CognitiveOps
ORCHESTRATOR_ROLE=AI_CSO
AUTONOMY_INTERVAL_HOURS=6
```

---

## Migration Steps

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Create Migration
```bash
npx prisma migrate dev --name add_orchestrator_state
```

This will:
- Create migration file in `prisma/migrations/`
- Apply migration to development database
- Generate updated Prisma client

### Step 3: Verify Migration
```bash
npx prisma studio
```

Check that `orchestrator_state` table exists with correct schema.

---

## Production Deployment

### Step 1: Push Migration to Production

**Option A: Using Prisma Migrate (Recommended)**
```bash
npx prisma migrate deploy
```

**Option B: Manual SQL (if needed)**
```sql
CREATE TABLE IF NOT EXISTS orchestrator_state (
  id TEXT PRIMARY KEY,
  dealer_id TEXT UNIQUE NOT NULL,
  confidence FLOAT DEFAULT 0.0,
  autonomy_enabled BOOLEAN DEFAULT true,
  current_mode TEXT DEFAULT 'AI_CSO',
  active_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_orchestration TIMESTAMPTZ,
  orchestration_count INTEGER DEFAULT 0,
  last_scan TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT orchestrator_state_dealer_id_fkey 
    FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS orchestrator_state_dealer_id_idx 
  ON orchestrator_state(dealer_id);
CREATE INDEX IF NOT EXISTS orchestrator_state_autonomy_enabled_idx 
  ON orchestrator_state(autonomy_enabled);
```

### Step 2: Set Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add:
- `PLATFORM_MODE=CognitiveOps`
- `ORCHESTRATOR_ROLE=AI_CSO`
- `AUTONOMY_INTERVAL_HOURS=6`

(Plus all your existing vars: DATABASE_URL, CLERK keys, etc.)

### Step 3: Deploy
```bash
npx vercel --prod
```

---

## Post-Deployment Verification

### 1. Test Dashboard
Visit: `https://dash.dealershipai.com/dashboard`

**Expected:**
- ✅ IntelligenceShell with dark glass aesthetic
- ✅ Cognition Bar showing confidence level
- ✅ OrchestratorView panel visible
- ✅ Zero-Click cards loading

### 2. Test Orchestrator APIs

**Status API:**
```bash
curl https://your-domain.com/api/orchestrator/status?dealerId=test
```

Should return:
```json
{
  "confidence": 0.92,
  "autonomyEnabled": true,
  "activeAgents": [],
  "currentMode": "AI_CSO"
}
```

**Run Orchestration:**
```bash
curl -X POST https://your-domain.com/api/orchestrator/run \
  -H "Content-Type: application/json" \
  -d '{"dealerId": "test"}'
```

### 3. Verify Scoring API

```bash
curl -X POST https://your-domain.com/api/ai/compute \
  -H "Content-Type: application/json" \
  -d '{
    "seo": {"cwv": 0.76, "crawlIndex": 0.68, "contentQuality": 0.72},
    "aeo": {"paaShare": 0.41, "faqSchema": 0.62, "localCitations": 0.55},
    "geo": {"csgv": 0.58, "hallucinationRisk": 0.12},
    "qai": {"lambdaPIQR": 1.08, "vdpQuality": 0.82},
    "eeat": {"eeatMultiplier": 0.74}
  }'
```

---

## Troubleshooting

### Migration Fails
- Check `DATABASE_URL` and `DIRECT_URL` are set correctly
- Verify database connection with `npx prisma db pull`
- Check if `dealers` table exists (orchestrator_state has foreign key)

### OrchestratorView Not Loading
- Check browser console for errors
- Verify `/api/orchestrator/status` endpoint is accessible
- Check Vercel function logs

### Cognition Bar Shows 0%
- Default confidence is 0.92, but may show as 0 if API fails
- Check network tab for failed requests
- Verify dealerId is passed correctly

---

## Next Enhancements

Once deployed and verified:

1. **Add Cron Job** - Auto-orchestration every 6 hours
   ```json
   {
     "crons": [
       {
         "path": "/api/orchestrator/cron",
         "schedule": "0 */6 * * *"
       }
     ]
   }
   ```

2. **Agentic Tiles** - Make KPI cards clickable → trigger analysis

3. **ASR Audit Log** - Track all autonomous decisions

4. **β-Calibration** - Implement self-training loop

---

**Status:** ✅ Ready for deployment after database migration
