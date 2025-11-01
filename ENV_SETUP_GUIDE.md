# Environment Variables Setup Guide

This guide explains how to set up the required environment variables in Vercel for the DealershipAI Fleet Agent integration.

## Required Environment Variables

### 1. FLEET_API_BASE
**Description:** Base URL for the fleet API service  
**Example:** `https://api.internal.dealershipai.com`  
**Required for:** Fleet dashboard, bulk operations, cron jobs

### 2. X_API_KEY
**Description:** API key for authenticating with the fleet API  
**Example:** `sk_live_xxxxxxxxxxxxx`  
**Required for:** All fleet API requests

### 3. CRON_SECRET
**Description:** Secret token for securing cron job endpoints  
**Example:** Generate a strong random string (32+ characters)  
**Required for:** Fleet refresh cron jobs  
**Security:** Keep this secret - it protects your cron endpoints

### 4. UPSTASH_REDIS_REST_URL
**Description:** Upstash Redis REST API URL  
**Example:** `https://your-redis.upstash.io`  
**Required for:** Caching AI scores and fleet data

### 5. UPSTASH_REDIS_REST_TOKEN
**Description:** Upstash Redis REST API token  
**Example:** `AXxxxxxxxxxxxxxxxxxxxxx`  
**Required for:** Redis authentication

## Setting Up in Vercel

### Method 1: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name:** Variable name (e.g., `FLEET_API_BASE`)
   - **Value:** Your actual value
   - **Environment:** Select `Production`, `Preview`, and `Development` as needed
4. Click **Save**

### Method 2: Vercel CLI
```bash
# Set environment variables
vercel env add FLEET_API_BASE production
vercel env add X_API_KEY production
vercel env add CRON_SECRET production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# Pull to local .env.local (for development)
vercel env pull .env.local
```

### Method 3: Bulk Import
Create a `.env.production` file:
```bash
FLEET_API_BASE=https://api.internal.dealershipai.com
X_API_KEY=sk_live_xxxxxxxxxxxxx
CRON_SECRET=your-secret-token-here-32-chars-min
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxx
```

Then use:
```bash
vercel env pull .env.production production
```

## Generating CRON_SECRET

Use a secure random generator:
```bash
# Using openssl
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Verification

After setting variables, verify they're working:

1. **Check Status Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/status
   ```

2. **Test Fleet Dashboard:**
   - Visit `/fleet` after authentication
   - Should load rooftop list (even if empty)

3. **Test AI Scores Proxy:**
   ```bash
   curl "https://your-app.vercel.app/api/ai-scores?origin=https://example.com"
   ```

## Local Development Setup

Create `.env.local`:
```bash
FLEET_API_BASE=https://api.internal.dealershipai.com
X_API_KEY=sk_live_xxxxxxxxxxxxx
CRON_SECRET=dev-secret-for-local-testing
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxxxxxxxxxxxxxxxxxx
```

**Never commit `.env.local` to git!** It's already in `.gitignore`.

## Troubleshooting

### Issue: "FLEET_API_BASE not set"
- Ensure variable is set in Vercel for the correct environment
- Redeploy after adding variables
- Check variable name matches exactly (case-sensitive)

### Issue: "unauthorized" from cron jobs
- Verify `CRON_SECRET` is set correctly
- Check authorization header format: `Bearer YOUR_SECRET`
- Ensure secret matches between Vercel cron config and environment variable

### Issue: Redis connection failures
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check Upstash dashboard for active Redis instance
- Ensure Redis is in same region as your Vercel deployment for best performance

## Security Best Practices

1. **Never commit secrets** to git
2. **Use different secrets** for production/preview/development
3. **Rotate secrets regularly** (especially if exposed)
4. **Use Vercel's secret management** instead of hardcoding
5. **Restrict API keys** to necessary permissions only

## Next Steps

After setting up environment variables:
1. Deploy to production: `npx vercel --prod`
2. Test the Free Audit Widget on landing page
3. Test Fleet Dashboard at `/fleet`
4. Verify cron jobs are scheduled in Vercel dashboard
5. Test manual cron trigger (see `TESTING_GUIDE.md`)

