# Monitoring & Observability Guide

## Overview
DealershipAI uses a comprehensive monitoring stack to track errors, performance, and user experience metrics.

## Stack

### 1. Sentry Error Monitoring
**Purpose**: Track and debug production errors

**Configuration**: [`sentry.client.config.ts`](../sentry.client.config.ts)

**Features**:
- **Error Tracking**: Automatic error capture with stack traces
- **Performance Monitoring**: 10% sample rate in production
- **Session Replay**: Record user sessions on errors
- **Release Tracking**: Tied to Vercel git commits
- **Sensitive Data Filtering**: Removes cookies and auth headers

**Sample Rates**:
- Production traces: 10%
- Development traces: 100%
- Session replays: 10% normal, 100% on error

**Environment Setup**:
```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
VERCEL_GIT_COMMIT_SHA=auto_set_by_vercel
```

### 2. Core Web Vitals Tracking
**Purpose**: Monitor real user performance metrics

**Implementation**: [`lib/monitoring/web-vitals.ts`](../lib/monitoring/web-vitals.ts)

**Metrics Tracked**:
- **CLS** (Cumulative Layout Shift): Visual stability
  - Good: < 0.1
  - Needs Improvement: < 0.25
  - Poor: ≥ 0.25

- **FID** (First Input Delay): Interactivity
  - Good: < 100ms
  - Needs Improvement: < 300ms
  - Poor: ≥ 300ms

- **FCP** (First Contentful Paint): Loading speed
  - Good: < 1.8s
  - Needs Improvement: < 3.0s
  - Poor: ≥ 3.0s

- **LCP** (Largest Contentful Paint): Loading performance
  - Good: < 2.5s
  - Needs Improvement: < 4.0s
  - Poor: ≥ 4.0s

- **TTFB** (Time to First Byte): Server response time
  - Good: < 800ms
  - Needs Improvement: < 1.8s
  - Poor: ≥ 1.8s

**API Endpoint**: [`/api/analytics/web-vitals`](../app/api/analytics/web-vitals/route.ts)

**Data Collection**:
```typescript
import { reportWebVitals } from '@/lib/monitoring/web-vitals';

// In your app
reportWebVitals();
```

**Storage**: Metrics stored in Supabase `web_vitals` table with:
- Metric name, value, rating, delta
- User agent, geo location (country, city)
- Navigation type, timestamp

### 3. Vercel Analytics
**Purpose**: Real-user monitoring and Web Vitals

**Integration**: Automatic via `<Analytics />` component in layout

**Metrics**:
- Page views and unique visitors
- Core Web Vitals (CLS, FID, LCP)
- Geography and device breakdown
- Traffic sources

### 4. Security Headers
**Configuration**: [`next.config.js:28-103`](../next.config.js#L28-L103)

**Enabled Headers**:
- **HSTS**: Force HTTPS with subdomain inclusion
- **CSP**: Strict content security policy
- **X-Content-Type-Options**: Prevent MIME sniffing
- **X-Frame-Options**: Prevent clickjacking
- **X-XSS-Protection**: Legacy XSS protection
- **Permissions-Policy**: Restrict browser features

## Database Schema

### web_vitals Table
```sql
CREATE TABLE web_vitals (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(10) NOT NULL,
  metric_value FLOAT NOT NULL,
  metric_rating VARCHAR(20) NOT NULL,
  metric_delta FLOAT NOT NULL,
  metric_id VARCHAR(100) NOT NULL,
  navigation_type VARCHAR(50),
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX idx_web_vitals_created_at ON web_vitals(created_at);
CREATE INDEX idx_web_vitals_rating ON web_vitals(metric_rating);
```

## Monitoring Dashboards

### Sentry Dashboard
**URL**: https://sentry.io/organizations/dealershipai/

**Key Views**:
1. **Issues**: Grouped errors with frequency and affected users
2. **Performance**: Transaction traces and slow queries
3. **Releases**: Deploy tracking and error attribution
4. **Session Replay**: Visual reproduction of errors

### Vercel Analytics
**URL**: https://vercel.com/[your-project]/analytics

**Key Metrics**:
- Real User Monitoring (RUM)
- Core Web Vitals scores
- Page load distribution
- Geographic performance

### Custom Web Vitals Dashboard

Query Supabase for custom analytics:

```sql
-- Average metrics by day
SELECT
  DATE(created_at) as date,
  metric_name,
  AVG(metric_value) as avg_value,
  COUNT(*) as sample_count,
  COUNT(CASE WHEN metric_rating = 'good' THEN 1 END) as good_count,
  COUNT(CASE WHEN metric_rating = 'needs-improvement' THEN 1 END) as needs_improvement_count,
  COUNT(CASE WHEN metric_rating = 'poor' THEN 1 END) as poor_count
FROM web_vitals
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), metric_name
ORDER BY date DESC, metric_name;

-- Performance by geography
SELECT
  country,
  metric_name,
  AVG(metric_value) as avg_value,
  COUNT(*) as sample_count
FROM web_vitals
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY country, metric_name
HAVING COUNT(*) > 10
ORDER BY country, metric_name;

-- 95th percentile by metric
SELECT
  metric_name,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75,
  AVG(metric_value) as avg
FROM web_vitals
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY metric_name;
```

## Performance Budgets

### Bundle Size Targets
- **Middleware**: < 100 kB (current: 76.1 kB ✅)
- **First Load JS (shared)**: < 150 kB (current: 102 kB ✅)
- **Individual Pages**: < 200 kB
- **API Routes**: < 50 kB

### Runtime Performance Targets
- **LCP**: < 2.5s for 75% of page loads
- **FID**: < 100ms for 95% of interactions
- **CLS**: < 0.1 for 75% of page loads
- **TTFB**: < 800ms for 75% of requests

### Build Performance
- **Build Time**: < 3 minutes
- **Static Pages**: 98 pages (current ✅)
- **Edge Functions**: < 1 MB per function

## Alerting

### Sentry Alerts
Configure in Sentry dashboard:
1. **Error Spike**: > 100 errors in 5 minutes
2. **Performance Degradation**: P95 > 3s for 10 minutes
3. **New Error**: First occurrence of new error type
4. **Release Regression**: 10x error increase after deploy

### Custom Alerts (Supabase)
Set up cron jobs to check:
```sql
-- Alert if LCP p75 > 4s in last hour
SELECT
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) as p75_lcp
FROM web_vitals
WHERE metric_name = 'LCP'
  AND created_at >= NOW() - INTERVAL '1 hour'
HAVING PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY metric_value) > 4000;
```

## Debugging Production Issues

### 1. Check Sentry
1. Go to Issues tab
2. Filter by time range and environment
3. Click on error for full stack trace
4. Review breadcrumbs and context

### 2. Review Web Vitals
```bash
# SSH into server or query Supabase
psql $DATABASE_URL -c "
  SELECT metric_name, AVG(metric_value), COUNT(*)
  FROM web_vitals
  WHERE created_at >= NOW() - INTERVAL '1 hour'
  GROUP BY metric_name;
"
```

### 3. Check Vercel Logs
```bash
npx vercel logs [deployment-url] --follow
```

### 4. Session Replay
If error has replay enabled:
1. Open error in Sentry
2. Click "Replay" tab
3. Watch user session leading to error

## Best Practices

### Error Handling
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  // Risky operation
  await someApiCall();
} catch (error) {
  // Add context before sending to Sentry
  Sentry.captureException(error, {
    tags: {
      component: 'PulseInbox',
      action: 'loadCards',
    },
    extra: {
      userId: currentUserId,
      timestamp: Date.now(),
    },
  });

  // Show user-friendly error
  toast.error('Failed to load cards. Please try again.');
}
```

### Performance Tracking
```typescript
import * as Sentry from '@sentry/nextjs';

const transaction = Sentry.startTransaction({
  op: 'pulseInbox.load',
  name: 'Load Pulse Inbox',
});

try {
  const cards = await fetchCards();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Web Vitals Optimization
1. **Improve LCP**:
   - Optimize images (use next/image)
   - Preload critical resources
   - Use CDN for static assets

2. **Reduce CLS**:
   - Set explicit dimensions for images/iframes
   - Avoid inserting content above existing content
   - Use transform instead of position/width/height

3. **Optimize FID**:
   - Break up long tasks
   - Defer non-critical JavaScript
   - Use web workers for heavy computation

4. **Reduce TTFB**:
   - Use Edge functions
   - Optimize database queries
   - Enable caching

## Troubleshooting

### Issue: Web Vitals Not Being Reported
**Symptoms**: No data in `/api/analytics/web-vitals`

**Solutions**:
1. Check browser console for errors
2. Verify `WebVitalsReporter` is mounted in layout
3. Check network tab for beacon requests
4. Verify Supabase table exists and has permissions

### Issue: Sentry Not Capturing Errors
**Symptoms**: Errors not appearing in Sentry dashboard

**Solutions**:
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check `sentry.client.config.ts` is loaded
3. Verify environment (dev/prod) matches expected
4. Check `beforeSend` filter isn't blocking errors

### Issue: High Performance Metrics
**Symptoms**: LCP > 4s consistently

**Solutions**:
1. Run Lighthouse audit for specific pages
2. Check bundle size with `ANALYZE=true npm run build`
3. Review largest assets in Network tab
4. Check for render-blocking resources

## Maintenance

### Weekly Tasks
- [ ] Review Sentry error trends
- [ ] Check Web Vitals averages vs targets
- [ ] Review slow API endpoints (> 1s)
- [ ] Check for new error patterns

### Monthly Tasks
- [ ] Review and update performance budgets
- [ ] Analyze Web Vitals by geography
- [ ] Review Sentry quotas and usage
- [ ] Update alert thresholds based on trends
- [ ] Clean up old web_vitals data (> 90 days)

### Quarterly Tasks
- [ ] Security header audit
- [ ] CSP policy review and tightening
- [ ] Performance budget adjustment
- [ ] Monitoring coverage assessment

## References

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals Thresholds](https://web.dev/defining-core-web-vitals-thresholds/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)
