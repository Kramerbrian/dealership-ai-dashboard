# Complete Setup Guide - Step by Step

## 🎯 Goal
Configure environment variables and create database tables to enable all integration features.

---

## Step 1: Verify Current Status

```bash
# Check what's configured
npm run setup:verify-env
```

This will show you exactly what's missing.

---

## Step 2: Configure Supabase

### 2.1 Get Supabase Credentials

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com/
   - Sign in or create account

2. **Select/Create Project**
   - Choose existing project or click "New Project"
   - Wait for project to be ready (2-3 minutes)

3. **Get API Credentials**
   - Click **Settings** (gear icon) in left sidebar
   - Click **API** in settings menu
   - You'll see:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public** key (starts with `eyJhbG...`)
     - **service_role** key (starts with `eyJhbG...`) - **Keep this secret!**

### 2.2 Update .env.local

Open `.env.local` and update:

```bash
# Replace placeholder with real URL
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co

# Replace placeholder with real service role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0aWQiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyfQ.xxxxx

# Optional: Also set anon key if needed
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 2.3 Verify

```bash
npm run setup:verify-env
```

Should show ✅ for Supabase variables.

---

## Step 3: Configure Redis (Upstash)

### 3.1 Create Upstash Account

1. **Go to Upstash**
   - Visit: https://console.upstash.com/
   - Sign in with GitHub/Google

2. **Create Redis Database**
   - Click **"Create Database"**
   - **Name**: `dealership-ai-queue` (or any name)
   - **Type**: Regional
   - **Plan**: Pay as you go (free tier available)
   - Click **"Create"**

3. **Get Credentials**
   - After creation, you'll see:
     - **REST URL** (e.g., `https://xxxxx.upstash.io`)
     - **REST Token** (long string starting with `AX...`)

### 3.2 Update .env.local

```bash
# Add these lines
UPSTASH_REDIS_REST_URL=https://your-actual-redis-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxx...your-actual-token
```

### 3.3 Verify

```bash
npm run setup:verify-env
```

Should show ✅ for Redis variables.

---

## Step 4: Create Database Tables

### 4.1 Open Supabase SQL Editor

1. Go to Supabase Dashboard
2. Click **SQL Editor** in left sidebar
3. Click **"New Query"**

### 4.2 Run SQL Script

1. **Open the SQL file**
   ```bash
   cat scripts/create-tables.sql
   ```

2. **Copy entire contents** (all SQL statements)

3. **Paste into Supabase SQL Editor**

4. **Click "Run"** (or press Cmd/Ctrl + Enter)

5. **Verify Success**
   - Should see: `✅ Integration tables created successfully!`
   - Should list: `telemetry_events, schema_fixes, reprobe_jobs, crawl_jobs`

### 4.3 Verify Tables Exist

Run this in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('telemetry_events', 'schema_fixes', 'reprobe_jobs', 'crawl_jobs')
ORDER BY table_name;
```

Should return 4 rows.

---

## Step 5: Final Verification

### 5.1 Check Environment Variables

```bash
npm run setup:verify-env
```

**Expected:**
```
✅ NEXT_PUBLIC_SUPABASE_URL: Configured
✅ SUPABASE_SERVICE_ROLE_KEY: Configured
✅ UPSTASH_REDIS_REST_URL: Configured
✅ UPSTASH_REDIS_REST_TOKEN: Configured
```

### 5.2 Check Setup Status

```bash
npm run setup:check
```

**Expected:**
```
✅ Redis/BullMQ Queue: Configured
✅ Supabase: Connected and tables exist
⚠️  Data Sources: Not configured (will use mocks) - OK
⚠️  Slack: Not configured (alerts skipped) - OK
```

### 5.3 Test Integration

**Start dev server** (if not running):
```bash
npm run dev
```

**In another terminal, run tests:**
```bash
npm run test:integration
```

**Expected:** Most tests should pass (some may require auth).

### 5.4 Test Queue Monitoring

```bash
npm run monitor:queue
```

**Expected:** JSON response with queue statistics.

---

## ✅ Success Criteria

You're done when:

- [x] `npm run setup:verify-env` shows all required variables ✅
- [x] `npm run setup:check` shows Redis and Supabase ✅
- [x] Database tables exist (verified in Supabase)
- [x] Queue monitoring endpoint returns data
- [x] No critical errors in dev server

---

## 🎉 You're Ready!

Once all checks pass:
- ✅ Jobs will queue to BullMQ
- ✅ Workers will process jobs
- ✅ Telemetry will store events
- ✅ Alerts will send (if Slack configured)
- ✅ Data sources will use real APIs (when configured)

**All integration features are now active!**

---

## 🆘 Need Help?

### Common Issues

**"supabaseUrl is required"**
- Check `NEXT_PUBLIC_SUPABASE_URL` is set (not `SUPABASE_URL`)
- Verify no quotes around the value
- Restart dev server after changes

**"Queue not configured"**
- Verify `UPSTASH_REDIS_REST_URL` is set
- Check URL format: `https://xxxxx.upstash.io`
- Restart dev server

**Tables not found**
- Verify SQL script ran successfully
- Check Supabase SQL Editor for errors
- Re-run `scripts/create-tables.sql`

**Tests failing**
- Some tests require authentication (expected)
- Verify dev server is running
- Check endpoint URLs are correct

---

## 📚 Next Steps

After setup is complete:

1. **Configure Data Sources** (optional)
   - Add API keys for Pulse, ATI, CIS, Probe
   - System works with mocks until configured

2. **Set Up Slack** (optional)
   - Add webhook URLs for alerts
   - Alerts skipped if not configured

3. **Monitor Production**
   - Use `/api/monitoring/queue` endpoint
   - Check telemetry events in Supabase
   - Monitor job processing

4. **Scale**
   - Adjust worker concurrency
   - Set up monitoring dashboards
   - Configure alert thresholds

---

**Happy coding! 🚀**

