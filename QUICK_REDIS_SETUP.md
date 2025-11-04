# 🚀 Quick Redis Setup for Background Jobs

## ✅ Current Status

Your Redis credentials are in `.env` and need to be added to Vercel.

---

## 📋 Step-by-Step: Add Redis to Vercel

### Step 1: Extract Redis Credentials from .env

Run this command to see your Redis credentials:

```bash
npm run check:redis
```

Or manually check your `.env` file for:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**:
   - https://vercel.com/YOUR_PROJECT/settings/environment-variables

2. **Add these two variables**:
   ```
   UPSTASH_REDIS_REST_URL=https://your-redis-db.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AX...your-token-here
   ```

3. **Select environments**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

4. **Click "Save"**

### Step 3: Redeploy

After adding variables:
- Vercel will automatically trigger a redeploy
- OR manually: Go to Deployments → Click "Redeploy"

### Step 4: Verify

Check deployment logs for:
```
[Instrumentation] Background job worker initialized ✅
```

If you see:
```
[Instrumentation] Background job worker skipped (Redis not configured)
```

Then the environment variables weren't added correctly. Double-check the names are exact.

---

## 🔍 Quick Check Commands

### Check if Redis is configured locally:
```bash
npm run check:redis
```

### Export all Vercel env vars (includes Redis if present):
```bash
npm run export:vercel-env
```

### Test Background Jobs (after deployment):
```bash
# Get queue stats
curl https://your-app.vercel.app/api/jobs/queue \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return: { "success": true, "data": { "enabled": true, ... } }
```

---

## 📝 Example: Copy from .env to Vercel

If your `.env` has:
```bash
UPSTASH_REDIS_REST_URL=https://dealership-redis-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX...long-token-here...
```

Then in Vercel, add:
- **Key**: `UPSTASH_REDIS_REST_URL`
- **Value**: `https://dealership-redis-12345.upstash.io`
- **Key**: `UPSTASH_REDIS_REST_TOKEN`
- **Value**: `AX...long-token-here...`

---

## ⚡ Quick Setup (2 minutes)

```bash
# 1. Check your Redis credentials
npm run check:redis

# 2. Copy the values
# 3. Go to Vercel Dashboard → Environment Variables
# 4. Add both variables
# 5. Redeploy
```

---

## 🎯 What Happens Next

Once Redis is added to Vercel:

1. ✅ **Worker starts automatically** on server startup
2. ✅ **Jobs can be queued** via `/api/jobs/queue`
3. ✅ **Queue stats available** via `/api/jobs/queue` GET
4. ✅ **Jobs process automatically** in background

---

## 🔗 Helpful Links

- **Vercel Env Vars**: https://vercel.com/YOUR_PROJECT/settings/environment-variables
- **Upstash Console**: https://console.upstash.com/
- **Full Setup Guide**: `UPSTASH_REDIS_SETUP.md`

---

**That's it!** Once you add the two Redis variables to Vercel and redeploy, background jobs will be active! 🚀

