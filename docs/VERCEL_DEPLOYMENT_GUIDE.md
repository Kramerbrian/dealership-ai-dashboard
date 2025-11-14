# Vercel Deployment Guide - DealershipAI

**Status:** Production Ready  
**Domains:** `dealershipai.com` + `dash.dealershipai.com`

## 🎯 Deployment Architecture

### Current Setup: Single Project

Both domains point to the **same Vercel project** with domain-based routing:

- **Landing:** `dealershipai.com` → `/` (public)
- **Dashboard:** `dash.dealershipai.com` → `/dashboard` (protected)

### Alternative: Monorepo (Two Projects)

If you want separate deployments:

- **Landing Project:** `apps/landing/` → `dealershipai.com`
- **Dashboard Project:** `apps/dashboard/` → `dash.dealershipai.com`

## 🚀 Quick Deploy (Single Project)

### Step 1: Link Project

```bash
vercel link
```

### Step 2: Add Domains

```bash
# Add landing domain
vercel domains add dealershipai.com

# Add dashboard domain
vercel domains add dash.dealershipai.com
```

### Step 3: Set Environment Variables

```bash
# Add Clerk keys
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

# Add database
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Add Redis
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

### Step 4: Deploy

```bash
vercel --prod
```

## 🔧 Configuration Files

### `vercel.json` (Current)

Already configured for single project deployment with:
- Build commands
- Cron jobs
- Security headers
- Domain routing via middleware

### `vercel-dashboard.json` (Alternative)

For separate dashboard project:
- Root directory: `.`
- Domain: `dash.dealershipai.com`
- Redirects `/` to `/dashboard`

### `vercel-landing.json` (Alternative)

For separate landing project:
- Root directory: `.`
- Domains: `dealershipai.com`, `www.dealershipai.com`

## 📋 Environment Variables Checklist

### Required for Dashboard

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Optional

```bash
# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
NEXT_PUBLIC_GA=G-...
```

## 🧪 Testing Deployment

### Test Landing

```bash
curl -I https://dealershipai.com
# Should return 200
```

### Test Dashboard

```bash
curl -I https://dash.dealershipai.com
# Should redirect to /dashboard or /sign-in
```

### Test API

```bash
curl https://dash.dealershipai.com/api/health
# Should return health status
```

## 🔍 Troubleshooting

### Issue: Domain Not Resolving

**Check:**
1. DNS records are correct
2. Domain is added in Vercel dashboard
3. SSL certificate is issued (automatic, takes ~5 min)

**Fix:**
```bash
# Check domain status
vercel domains ls

# Verify DNS
dig dash.dealershipai.com
```

### Issue: Build Fails

**Check:**
1. Environment variables are set
2. Build command is correct
3. Dependencies are installed

**Fix:**
```bash
# Test build locally
npm run build

# Check build logs
vercel logs [deployment-url]
```

### Issue: Wrong Page Shows

**Check:**
1. Middleware routing is correct
2. Domain detection works
3. Redirects are configured

**Fix:**
- Verify `middleware.ts` has domain routing
- Check `vercel.json` redirects
- Test domain detection in middleware

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Specific deployment
vercel logs [deployment-url]
```

### Check Status

```bash
# List deployments
vercel ls

# Get deployment info
vercel inspect [deployment-url]
```

## 🔗 Resources

- **Vercel Docs:** https://vercel.com/docs
- **Domain Setup:** https://vercel.com/docs/concepts/projects/domains
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

**Last Updated:** 2025-01-20

