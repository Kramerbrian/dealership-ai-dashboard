# Production Setup Checklist

## Current Status
✅ Application deployed to Vercel
✅ Build completed successfully (0 errors)
✅ API endpoints working
⏳ Database migrations pending
⏳ Clerk authentication needs configuration
⏳ Custom domain DNS pending

## 1. Configure Database (REQUIRED)

### Step 1: Get Supabase Production Credentials
1. Go to https://supabase.com/dashboard
2. Select your production project
3. Navigate to **Settings** → **Database**
4. Copy **Connection Pooling** string (for DATABASE_URL)
5. Copy **Direct Connection** string (for DIRECT_URL)

### Step 2: Add to Vercel
1. Go to https://vercel.com/dashboard
2. Select project: `dealership-ai-dashboard`
3. Go to **Settings** → **Environment Variables**
4. Add for **Production** environment:

```bash
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-us-east-2.compute-1.amazonaws.com:5432/postgres
```

### Step 3: Deploy Migrations
After adding environment variables, run:

```bash
# Redeploy to load new environment variables
npx vercel --prod

# OR run migration script locally with production credentials
export DATABASE_URL="your-production-url"
./scripts/deploy-production-migrations.sh
```

## 2. Fix Clerk Authentication (REQUIRED)

### Current Error
```json
{
  "errors": [{
    "message": "Invalid host",
    "code": "host_invalid"
  }]
}
```

### Step 1: Update Clerk Allowed Origins
1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **Configure** → **API Keys**
4. Under **Allowed origins**, add:
   ```
   https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app
   https://dealership-ai-dashboard-b36208s4h-brian-kramer-dealershipai.vercel.app
   ```

### Step 2: Get Production Keys
1. In Clerk dashboard, go to **API Keys**
2. Copy **Publishable Key** (starts with `pk_live_` or `pk_test_`)
3. Copy **Secret Key** (starts with `sk_live_` or `sk_test_`)

### Step 3: Add to Vercel
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add/update for **Production**:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

### Step 4: Redeploy
```bash
npx vercel --prod
```

## 3. Custom Domain Setup (OPTIONAL)

### Current Status
❌ DNS not configured
❌ Domain not added to Vercel

### Step 1: Configure DNS
At your domain registrar (GoDaddy, Namecheap, etc.):

1. Add CNAME record:
   - **Name/Host:** `dash`
   - **Value/Points to:** `cname.vercel-dns.com`
   - **TTL:** 3600 (or default)

2. Wait 5-30 minutes for DNS propagation

3. Verify DNS is working:
   ```bash
   dig dash.dealershipai.com CNAME +short
   # Should return: cname.vercel-dns.com
   ```

### Step 2: Add Domain to Vercel
```bash
npx vercel domains add dash.dealershipai.com
```

### Step 3: Update Clerk for Custom Domain
1. Go to Clerk dashboard → **API Keys** → **Allowed origins**
2. Add: `https://dash.dealershipai.com`
3. Redeploy if needed

## 4. Verification Steps

### Test Database Connection
```bash
# After migrations complete
curl https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app/api/pulse/score?dealerId=demo-123
```

Expected response:
```json
{
  "success": true,
  "data": {
    "pulse_score": 77.4,
    "signals": {...},
    "trends": {...}
  }
}
```

### Test Clerk Authentication
1. Visit your production URL
2. Try to sign in/sign up
3. Should NOT see "Invalid host" error
4. Should successfully authenticate

### Test Pulse System APIs
```bash
# Score endpoint
curl https://[your-domain]/api/pulse/score?dealerId=demo-123

# Scenario endpoint
curl -X POST https://[your-domain]/api/pulse/scenario \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "demo-123",
    "adjustments": {"schema": 0.1, "ugc": 0.05}
  }'

# Trends endpoint
curl https://[your-domain]/api/pulse/trends?dealerId=demo-123&days=30

# Radar endpoint
curl https://[your-domain]/api/pulse/radar?limit=10
```

## 5. Production URLs

### Current Deployment
- **Production:** https://dealership-ai-dashboard-45lke0aoe-brian-kramer-dealershipai.vercel.app
- **Previous:** https://dealership-ai-dashboard-b36208s4h-brian-kramer-dealershipai.vercel.app
- **Inspect:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard

### Future Custom Domain
- **Planned:** https://dash.dealershipai.com

## 6. Environment Variables Needed

### Vercel Production Environment
```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Clerk Auth (REQUIRED)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx

# Stripe (if enabled)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redis (if enabled)
REDIS_URL=redis://...

# AI APIs (if enabled)
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_API_KEY=AIzaxxx
```

## 7. Monitoring & Next Steps

### Monitor Deployment
- Vercel Dashboard: https://vercel.com/dashboard
- Check logs for errors
- Monitor API response times

### Test All Features
- [ ] User authentication (sign up, sign in)
- [ ] Dashboard loads correctly
- [ ] Pulse Score API returns data
- [ ] Scenario simulator works
- [ ] Trend analysis functional
- [ ] Radar detection working

### Performance Optimization
- [ ] Enable caching for API routes
- [ ] Optimize database queries
- [ ] Add monitoring/alerting
- [ ] Set up error tracking (Sentry)

## Quick Commands Reference

```bash
# Deploy to production
npx vercel --prod

# Check deployment status
npx vercel ls

# View production logs
npx vercel logs [deployment-url]

# Run migrations (after DB configured)
./scripts/deploy-production-migrations.sh

# Add custom domain (after DNS configured)
npx vercel domains add dash.dealershipai.com

# Verify domain
dig dash.dealershipai.com CNAME +short
```

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Clerk Docs:** https://clerk.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs

## Completion Criteria

✅ **Ready for Production When:**
- [ ] Database migrations completed successfully
- [ ] Clerk authentication working (no "Invalid host" error)
- [ ] All API endpoints returning valid responses
- [ ] User can sign up and sign in
- [ ] Pulse System APIs functional
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Monitoring enabled
