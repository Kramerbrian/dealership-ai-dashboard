# 🚀 Pulse Dashboard - 100% Activation Guide

**Status:** Ready for Production  
**Route:** `/pulse` or `/dashboard`  
**Domain:** `dash.dealershipai.com`

## ✅ Pre-Activation Checklist

### 1. Core Components ✅
- [x] Pulse Dashboard Page: `app/(dashboard)/pulse/page.tsx`
- [x] PulseInbox Component: `app/components/pulse/PulseInbox.tsx`
- [x] API Routes: `/api/pulse/*`
- [x] Authentication: Clerk middleware configured
- [x] Layout: Dashboard layout with auth protection

### 2. Required Environment Variables

**Critical (Must Have):**
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Redis (Upstash) - For Pulse inbox tiles
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Database (Supabase/PostgreSQL) - For Pulse cards storage
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Optional (Recommended):**
```bash
# AI Providers (for agentic features)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
NEXT_PUBLIC_GA=G-...
```

### 3. API Routes Status

**Core Pulse APIs:**
- ✅ `/api/pulse` - Main Pulse inbox endpoint
- ✅ `/api/pulse/snapshot` - Current snapshot with registry tiles
- ✅ `/api/pulse/trends` - Historical trends
- ✅ `/api/pulse/score` - Pulse scoring
- ✅ `/api/pulse/inbox/push` - Agent tile injection

**Supporting APIs:**
- ✅ `/api/pulse-session-init` - Session initialization
- ✅ `/api/pulse-session` - Session management
- ✅ `/api/marketpulse/compute` - Market pulse computation

## 🎯 Activation Steps

### Step 1: Verify Environment Variables

```bash
# Check if all required vars are set
npm run verify:env

# Or manually check in Vercel
# Go to: Project Settings → Environment Variables
```

### Step 2: Test Pulse API Locally

```bash
# Start dev server
npm run dev

# Test Pulse endpoint (requires auth)
curl -H "Cookie: __session=..." http://localhost:3000/api/pulse

# Test snapshot (public)
curl http://localhost:3000/api/pulse/snapshot?tenant=demo-tenant
```

### Step 3: Verify Redis Connection

```bash
# Test Redis connection
node -e "
const { redis } = require('./lib/redis');
redis.ping().then(() => console.log('✅ Redis connected')).catch(e => console.error('❌ Redis error:', e));
"
```

### Step 4: Verify Database Schema

Ensure these tables exist in your database:
- `pulse_cards` - Main Pulse card storage
- `pulse_digest` - Digest summaries
- `pulse_threads` - Thread conversations

**Check with Prisma:**
```bash
npx prisma db pull
npx prisma generate
```

### Step 5: Deploy to Production

```bash
# Build and deploy
npm run build
vercel --prod

# Or push to main branch (auto-deploy)
git add .
git commit -m "Activate Pulse Dashboard"
git push origin main
```

### Step 6: Verify Production Access

1. **Visit Dashboard:**
   ```
   https://dash.dealershipai.com/pulse
   ```

2. **Check Authentication:**
   - Should redirect to sign-in if not authenticated
   - Should show Pulse inbox if authenticated

3. **Test API:**
   ```bash
   curl https://dash.dealershipai.com/api/pulse/snapshot?tenant=demo-tenant
   ```

## 🔧 Troubleshooting

### Issue: "Unauthorized" Error
**Solution:**
- Verify Clerk keys are set correctly
- Check middleware is allowing `/pulse` route
- Ensure user is signed in

### Issue: "Redis connection failed"
**Solution:**
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Check Upstash dashboard for active instance
- Test connection: `redis.ping()`

### Issue: "Database not configured"
**Solution:**
- Verify `DATABASE_URL` is set
- Check Supabase project is active
- Run migrations: `npx prisma migrate deploy`

### Issue: Empty Pulse Inbox
**Solution:**
- Check Redis has data: `redis.get('pulse:inbox:${tenant}')`
- Verify registry tiles are loading
- Check API logs for errors

## 📊 Monitoring

### Health Check
```bash
# Check Pulse API health
curl https://dash.dealershipai.com/api/health | jq '.services.pulse'
```

### Logs
```bash
# Vercel logs
vercel logs --follow

# Check for Pulse-related errors
vercel logs | grep -i pulse
```

## 🎉 Success Criteria

✅ **Dashboard is Live When:**
1. `/pulse` route loads without errors
2. PulseInbox component renders
3. API returns data (even if empty)
4. Authentication works correctly
5. No console errors in browser
6. Redis connection successful
7. Database queries succeed

## 📝 Post-Activation

### Next Steps:
1. **Seed Initial Data:**
   ```bash
   # Create demo Pulse cards
   curl -X POST https://dash.dealershipai.com/api/pulse/inbox/push \
     -H "Content-Type: application/json" \
     -d '{"tenant":"demo-tenant","tiles":[...]}'
   ```

2. **Configure Auto-Refresh:**
   - Pulse inbox auto-refreshes every 10 seconds
   - Configure in `PulseInbox.tsx` if needed

3. **Set Up Monitoring:**
   - Add Sentry error tracking
   - Set up Vercel Analytics
   - Monitor API response times

## 🔗 Related Documentation

- **Pulse API Docs:** `docs/PULSE_INBOX_SYSTEM.md`
- **Deployment Guide:** `docs/DEPLOYMENT_PLAN_CLERK_SSO.md`
- **Environment Setup:** `docs/STREAMING_LLM_ENV_SETUP.md`

---

**Status:** ✅ Ready for Activation  
**Last Updated:** 2025-01-20

