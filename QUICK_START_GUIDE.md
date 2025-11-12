# 🚀 DealershipAI Quick Start Guide

This guide will help you get the new features up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Upstash account (free tier works) - for rate limiting
- (Optional) dAI Schema Engine URL

## Step 1: Install Dependencies ✅

Already done! The packages are installed:
- ✅ @supabase/supabase-js
- ✅ @upstash/ratelimit
- ✅ @upstash/redis
- ✅ zustand
- ✅ recharts

## Step 2: Set Up Environment Variables

### Option A: Interactive Setup (Recommended)

```bash
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

### Option B: Manual Setup

Create `.env.local` in the project root:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Schema Engine (optional)
SCHEMA_ENGINE_URL=https://your-schema-engine.com

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Getting Your Keys

**Supabase:**
1. Go to https://supabase.com/dashboard
2. Select your project (or create one)
3. Go to Settings → API
4. Copy "Project URL" → `SUPABASE_URL`
5. Copy "service_role" key → `SUPABASE_SERVICE_KEY`

**Upstash:**
1. Go to https://console.upstash.com
2. Create a Redis database (free tier: 10K commands/day)
3. Copy "UPSTASH_REDIS_REST_URL"
4. Copy "UPSTASH_REDIS_REST_TOKEN"

## Step 3: Create Supabase Table

### Option A: SQL Editor (Easiest)

1. Go to Supabase Dashboard → SQL Editor
2. Copy SQL from `supabase/migrations/001_telemetry_events.sql`
3. Paste and click "Run"

### Option B: Check if Table Exists

```bash
curl http://localhost:3000/api/admin/setup
```

If it says `tableExists: false`, run the SQL migration.

### Option C: Use Supabase CLI

```bash
supabase migration up
```

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Test Everything

### Quick Test Script

```bash
chmod +x scripts/test-endpoints.sh
./scripts/test-endpoints.sh
```

### Manual Testing

#### 1. Test Telemetry
```bash
# POST an event
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"type":"test","payload":{"test":true},"ts":1234567890}'

# GET events
curl http://localhost:3000/api/telemetry
```

#### 2. Test Pulse API
```bash
# Pulse Impacts
curl -X POST http://localhost:3000/api/pulse/impacts \
  -H "Content-Type: application/json" \
  -d '{"dealers":["dealer1"],"model":"Model3"}'

# Pulse Radar
curl "http://localhost:3000/api/pulse/radar?marketId=us_default&window=7d"
```

#### 3. Test Schema Validation
```bash
curl "http://localhost:3000/api/schema/validate?url=https://example.com"
```

## Step 6: Access Pages

### Onboarding Flow
Visit: http://localhost:3000/onboarding

Features:
- Step 1: Enter dealership URL
- Step 2: Share to unlock or email
- Step 3: Select competitors
- Step 4: Complete onboarding

### Admin Dashboard
Visit: http://localhost:3000/admin

Features:
- Daily events chart
- Funnel visualization
- Event table
- CSV export

## Troubleshooting

### "Table does not exist"
- Run the SQL migration in Supabase SQL Editor
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct

### "Rate limit exceeded"
- Telemetry: 30 req/min per IP
- Pulse API: 60 req/min per IP
- Wait 60 seconds or check your Upstash configuration

### "Supabase not configured"
- Check `.env.local` exists
- Verify environment variables are loaded
- Restart dev server: `npm run dev`

### "Upstash error"
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Verify Upstash database is active
- Check usage limits in Upstash dashboard

## Verification Checklist

- [ ] Dependencies installed
- [ ] `.env.local` created with all variables
- [ ] Supabase table `telemetry_events` created
- [ ] Dev server running (`npm run dev`)
- [ ] `/api/telemetry` endpoint works
- [ ] `/api/pulse/impacts` endpoint works
- [ ] `/api/pulse/radar` endpoint works
- [ ] `/onboarding` page loads
- [ ] `/admin` page loads and shows charts

## Next Steps

1. **Integrate telemetry tracking** in your app:
   ```typescript
   await fetch('/api/telemetry', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       type: 'page_view',
       payload: { page: '/landing' },
       ts: Date.now()
     })
   });
   ```

2. **Connect Pulse API** to your compute jobs (replace demo data)

3. **Configure Schema Engine** URL if you have one

4. **Customize onboarding** flow for your needs

5. **Set up admin access** controls (currently open)

## Support

- See `README_TELEMETRY_SETUP.md` for detailed telemetry setup
- Check Supabase logs for database issues
- Check Upstash dashboard for rate limiting issues

---

**Ready to go!** 🎉 Start tracking events and building your analytics dashboard.

