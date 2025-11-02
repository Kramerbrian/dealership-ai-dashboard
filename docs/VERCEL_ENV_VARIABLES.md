# Vercel Environment Variables Setup

## Required Environment Variables

Add these to **Vercel Dashboard → Your Project → Settings → Environment Variables**:

### 🔐 Authentication
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuZGVhbGVyc2hicGFpLmNvbSQ
CLERK_SECRET_KEY=sk_live_...
```

### 🗄️ Database
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 🤖 AI Services
```bash
ANTHROPIC_API_KEY=sk-ant-api03-... (your key here)
```

### 📊 Monitoring (Optional but Recommended)
```bash
# Get from sentry.io (free tier works)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 🚦 Rate Limiting (Optional but Recommended)
```bash
# Get from upstash.com (free tier works)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### 📈 Analytics (Optional)
```bash
NEXT_PUBLIC_GA=G-XXX
```

---

## Quick Setup Steps

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Add Each Variable**
   - Click **Add New**
   - Enter variable name
   - Enter variable value
   - Select environments: **Production**, **Preview**, **Development** (select all)
   - Click **Save**

3. **Verify**
   - After adding, trigger a new deployment
   - Check build logs for any missing variables

---

## Notes

- ✅ **Already Configured:** `ANTHROPIC_API_KEY` (you provided this)
- ⚠️ **Needs Setup:** Sentry DSN (for error tracking)
- ⚠️ **Needs Setup:** Upstash Redis (for rate limiting)

**Without Sentry/Upstash:**
- ✅ App still works
- ✅ Features degrade gracefully
- ❌ No error tracking
- ❌ No rate limiting (falls back to per-request)

**With Sentry/Upstash:**
- ✅ Full error tracking
- ✅ Distributed rate limiting
- ✅ Production-grade monitoring

---

**Recommendation:** Set up Sentry and Upstash for production deployment! 🚀

