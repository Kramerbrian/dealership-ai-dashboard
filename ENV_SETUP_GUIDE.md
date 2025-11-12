# 🔑 Environment Variables Setup Guide

## Current Status

✅ **SUPABASE_URL** - Already set  
❌ **SUPABASE_SERVICE_KEY** - **REQUIRED** - Get from Supabase Dashboard  
⚠️ **UPSTASH_REDIS_REST_URL** - Optional (for rate limiting)  
⚠️ **UPSTASH_REDIS_REST_TOKEN** - Optional (for rate limiting)

## Quick Setup

### 1. Get SUPABASE_SERVICE_KEY (Required)

**From Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** → **API**
4. Scroll to **Project API keys**
5. Find the **`service_role`** key (⚠️ Secret - never expose publicly)
6. Copy it

**Add to .env.local:**
```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Get Upstash Credentials (Optional but Recommended)

**From Upstash Console:**
1. Go to https://console.upstash.com
2. Create a new Redis database (free tier: 10K commands/day)
3. Go to database details
4. Copy **REST URL** and **REST TOKEN**

**Add to .env.local:**
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### 3. From Vercel (If Deployed)

If your keys are in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Copy the values
3. Add them to `.env.local` for local development

## Verify Setup

Run the check script:
```bash
node scripts/check-env.js
```

## Test After Setup

Once you've added the keys:

1. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test telemetry endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/telemetry \
     -H "Content-Type: application/json" \
     -d '{"type":"test","payload":{"test":true},"ts":1234567890}'
   ```

3. **Check admin setup:**
   ```bash
   curl http://localhost:3000/api/admin/setup
   ```

## What Each Variable Does

- **SUPABASE_URL** - Your Supabase project URL (already set ✅)
- **SUPABASE_SERVICE_KEY** - Allows API to write to database (required ❌)
- **UPSTASH_REDIS_REST_URL** - For rate limiting (optional ⚠️)
- **UPSTASH_REDIS_REST_TOKEN** - For rate limiting (optional ⚠️)
- **SCHEMA_ENGINE_URL** - Schema validation service (optional)
- **NEXT_PUBLIC_BASE_URL** - App base URL (already set ✅)

## Security Notes

⚠️ **Never commit .env.local to git** (already in .gitignore ✅)  
⚠️ **Never expose service_role key** in client-side code  
✅ Service role key is safe in `.env.local` (server-side only)

## Troubleshooting

### "Supabase not configured"
- Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
- Restart dev server after adding vars

### "Table does not exist"
- Create the table using SQL from `supabase/migrations/001_telemetry_events.sql`
- Run in Supabase SQL Editor

### Rate limiting not working
- Upstash is optional - endpoints will work without it
- Rate limiting just won't be enforced without Upstash
