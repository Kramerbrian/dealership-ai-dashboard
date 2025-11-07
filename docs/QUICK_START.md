# Quick Start Guide - Integration Setup

## 🚀 5-Minute Setup

### Step 1: Environment Variables

```bash
# Copy example file
cp .env.example.integration .env.local

# Edit and fill in values
# At minimum, set Redis for BullMQ:
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
```

### Step 2: Set Up Redis (Upstash)

1. Go to https://console.upstash.com/
2. Click "Create Database"
3. Choose "Regional" → "Pay as you go"
4. Copy REST URL and REST Token
5. Add to `.env.local`

**Quick Link**: https://console.upstash.com/redis

### Step 3: Create Database Tables

**Option A: Using Prisma (Recommended)**
```bash
npx prisma migrate dev -n "add_telemetry_and_jobs"
```

**Option B: Manual SQL**
```bash
# Copy SQL from scripts/create-tables.sql
# Paste into Supabase SQL Editor
```

### Step 4: Verify Setup

```bash
# Run setup checker
npm run setup:check

# Or visit in browser
http://localhost:3000/api/setup/check
```

### Step 5: Start Development

```bash
npm run dev
```

## ✅ Verification Checklist

Run the setup checker to verify everything:

```bash
npm run setup:check
```

Expected output:
- ✅ Redis/BullMQ Queue: Configured
- ✅ Supabase: Connected and tables exist
- ⚠️  Data Sources: Not configured (will use mocks) - OK
- ⚠️  Slack: Not configured (alerts skipped) - OK

## 🧪 Test Integration

```bash
# Run integration tests
npm run test:integration

# Or manually test endpoints
curl http://localhost:3000/api/monitoring/queue
```

## 📊 Monitor in Production

### Queue Health
```bash
curl https://dash.dealershipAI.com/api/monitoring/queue
```

### Setup Status
```bash
curl https://dash.dealershipAI.com/api/setup/check
```

## 🔧 Troubleshooting

### Queue Not Working
1. Check Redis connection in `.env.local`
2. Verify worker initialized (check logs)
3. Test: `curl http://localhost:3000/api/monitoring/queue`

### Tables Missing
1. Run migration: `npx prisma migrate dev`
2. Or run SQL: `scripts/create-tables.sql`
3. Verify: Check Supabase dashboard

### Data Sources Using Mocks
- This is expected if APIs aren't configured
- Services gracefully fall back to mocks
- Configure API keys in `.env.local` when ready

## 📝 Next Steps

1. ✅ Environment variables set
2. ✅ Redis configured
3. ✅ Database tables created
4. ✅ Setup verified
5. 🔄 Configure data source APIs (optional)
6. 🔄 Set up Slack webhooks (optional)
7. 🚀 Deploy to production

## 🎯 Production Checklist

Before deploying:
- [ ] All environment variables set in Vercel
- [ ] Redis configured (Upstash)
- [ ] Database tables created
- [ ] Setup check passes
- [ ] Integration tests pass
- [ ] Monitoring endpoint accessible

## 📚 Additional Resources

- **Full Setup Guide**: `docs/SETUP_INTEGRATION.md`
- **Integration Guide**: `docs/REAL_DATA_INTEGRATION_GUIDE.md`
- **Status**: `docs/INTEGRATION_STATUS.md`
