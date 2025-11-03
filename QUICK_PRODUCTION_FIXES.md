# ⚡ Quick Production Fixes - Immediate Actions

## ✅ Already Fixed

1. **Image Configuration** ✅
   - Updated `next.config.js` to use `remotePatterns` instead of deprecated `domains`
   - Added device sizes and image sizes for better optimization

2. **Health Check Endpoint** ✅
   - Already implemented at `/api/health`
   - Checks database connectivity and system metrics

---

## 🚀 Critical Actions (Do Now)

### 1. Add Missing Environment Variables to Vercel

```bash
# Required for Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealershipai.com
NEXTAUTH_URL=https://dealershipai.com

# Clerk (if not already set)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Database (already have connection string format)
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Optional but Recommended
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

**How to Add:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Redeploy after adding

---

### 2. Add Database Indexes (5 minutes)

Run this SQL in Supabase SQL Editor:

```sql
-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(id);
CREATE INDEX IF NOT EXISTS idx_dealerships_domain ON dealerships(domain);
CREATE INDEX IF NOT EXISTS idx_scores_dealership_date ON scores(dealershipId, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions("userId");
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS idx_audits_dealership_date ON audits("dealershipId", "createdAt" DESC);
```

---

### 3. Test Production Build Locally

```bash
# Check build works
npm run build

# Check for bundle size issues
ANALYZE=true npm run build

# Review bundle-analysis.html in project root
```

---

### 4. Verify Health Check

```bash
# After deployment, test:
curl https://dealershipai.com/api/health

# Should return JSON with:
# - status: "healthy"
# - database.status: "healthy"
# - responseTime: <100ms
```

---

## 🔧 High Priority Optimizations (This Week)

### 1. Implement Structured Logging

Create `lib/logger.ts`:

```typescript
import { Logtail } from '@logtail/node';

const logger = process.env.LOGTAIL_TOKEN 
  ? new Logtail(process.env.LOGTAIL_TOKEN)
  : {
      info: console.log,
      error: console.error,
      warn: console.warn,
      debug: console.debug,
    };

export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, { 
    error: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

export function logInfo(message: string, context?: Record<string, any>) {
  logger.info(message, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

export default logger;
```

---

### 2. Add API Response Caching

Create `lib/api-response.ts`:

```typescript
import { NextResponse } from 'next/server';

export function cachedResponse(
  data: any,
  maxAge = 60,
  staleWhileRevalidate = 300
) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  });
}

export function noCacheResponse(data: any) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
```

---

### 3. Add Request ID Tracking

Create `lib/request-id.ts`:

```typescript
import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

export function getRequestId(req: NextRequest): string {
  const headerId = req.headers.get('x-request-id');
  if (headerId) return headerId;
  
  return nanoid();
}

export function setRequestIdHeader(response: Response, id: string) {
  response.headers.set('x-request-id', id);
}
```

Use in API routes:
```typescript
const requestId = getRequestId(req);
logger.info('API request', { requestId, path: req.nextUrl.pathname });
```

---

## 📊 Performance Monitoring

### Core Web Vitals Tracking

Update `app/layout.tsx` to track Web Vitals:

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

if (typeof window !== 'undefined') {
  function sendToAnalytics(metric: any) {
    // Send to GA4
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_category: 'Web Vitals',
        event_label: metric.id,
        non_interaction: true,
      });
    }
    
    // Send to API for logging
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
    }).catch(console.error);
  }

  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

---

## 🎯 Production Readiness Checklist

- [ ] All environment variables added to Vercel
- [ ] Database indexes created
- [ ] Health check tested and working
- [ ] Production build successful
- [ ] Bundle size analyzed
- [ ] Structured logging implemented
- [ ] API response caching added
- [ ] Request ID tracking added
- [ ] Core Web Vitals tracking enabled
- [ ] Error boundaries tested
- [ ] Rate limiting verified
- [ ] Security headers validated
- [ ] SSL certificate verified
- [ ] CDN configured (Vercel automatically handles this)
- [ ] Monitoring dashboards set up (Sentry/LogTail)
- [ ] Alert thresholds configured
- [ ] Rollback procedure documented

---

## 🚨 Critical Issues to Resolve

1. **Database Migration Sync** 🔴
   - Need to resolve migration conflicts
   - Run: `supabase migration repair` for mismatched migrations

2. **Network Restrictions** ✅ (Fixed)
   - IP restrictions removed
   - All connections allowed

3. **Prisma Schema Sync** 🟡
   - Need to apply latest Prisma migrations
   - Verify all tables exist

---

## ✅ Next Steps

1. **Deploy to Production**
   ```bash
   vercel --prod
   ```

2. **Verify Deployment**
   - Check `/api/health` endpoint
   - Test authentication flow
   - Verify database connections

3. **Monitor Performance**
   - Set up Sentry alerts
   - Monitor Core Web Vitals
   - Track error rates

4. **Optimize Based on Metrics**
   - Review bundle analysis
   - Optimize slow API endpoints
   - Add caching where needed

---

**Target: Deploy within 1 hour** ⚡

