# Monitoring & Analytics Setup Guide

## Overview

DealershipAI is configured with comprehensive monitoring and analytics across three layers:

- **Error Tracking**: Sentry for production error monitoring
- **Performance**: Vercel Analytics & Speed Insights
- **Product Analytics**: PostHog for user behavior tracking

---

## Quick Start

### 1. Add Environment Variables to Vercel

```bash
# Sentry (optional but recommended)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste your Sentry DSN when prompted

# PostHog (optional but recommended)
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# Paste your PostHog Project API Key when prompted

# Optional: Custom PostHog host
vercel env add NEXT_PUBLIC_POSTHOG_HOST production
# Default: https://app.posthog.com

# Google Analytics (optional)
vercel env add NEXT_PUBLIC_GA production
# Paste your GA4 Measurement ID (G-XXXXXXXXXX)
```

### 2. Verify Setup

```bash
# Health check endpoint
curl https://your-app.vercel.app/api/health

# Should return:
{
  "status": "healthy",
  "checks": { ... },
  "timestamp": "..."
}
```

---

## Services

### Sentry

**Purpose**: Error tracking, performance monitoring, session replay

**Setup**:
1. Sign up at [sentry.io](https://sentry.io)
2. Create a Next.js project
3. Copy DSN from project settings
4. Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel

**Features**:
- Automatic error capture
- Performance monitoring (10% sample rate in production)
- Session replay (100% on errors, 10% normal sessions)
- Release tracking via Vercel git commits
- Sensitive data filtering

**Usage**:
```typescript
import { captureError, captureMessage } from '@/lib/monitoring/sentry';

try {
  // risky code
} catch (error) {
  captureError(error, { context: 'important_action' });
}

captureMessage('Custom event', 'info');
```

### PostHog

**Purpose**: Product analytics, feature flags, session recordings

**Setup**:
1. Sign up at [posthog.com](https://posthog.com)
2. Create a project
3. Copy Project API Key from settings
4. Add `NEXT_PUBLIC_POSTHOG_KEY` to Vercel

**Features**:
- Automatic page view tracking
- Custom event tracking
- User identification
- Session recordings (disabled in dev)
- Feature flags
- Conversion tracking

**Usage**:
```typescript
import { trackEvent, identifyUser, trackConversion } from '@/lib/monitoring/analytics';

trackEvent('custom_action', { category: 'user', value: 42 });
identifyUser(userId, { email, tier: 'pro' });
trackConversion('signup', 499); // $499 MRR
```

### Vercel Analytics & Speed Insights

**Purpose**: Automatic web vitals, performance metrics, real user monitoring

**Setup**: 
- Automatically enabled when deployed to Vercel
- No configuration needed

**Metrics Tracked**:
- Page views
- Web Vitals (LCP, FID, CLS)
- Real User Monitoring (RUM)
- Performance metrics

**Access**: View in Vercel Dashboard → Analytics tab

### Health Check API

**Endpoint**: `/api/health`

**Purpose**: Monitor system health for all critical services

**Response**:
```json
{
  "status": "healthy" | "degraded" | "critical",
  "checks": {
    "database": { "healthy": true, "latency": 45 },
    "redis": { "healthy": true, "latency": 12 },
    "anthropic": { "healthy": true, "latency": 230 },
    "openai": { "healthy": true, "latency": 180 }
  },
  "timestamp": "2025-01-31T..."
}
```

**Usage**:
- Monitor with UptimeRobot, Better Uptime, or Vercel's built-in monitoring
- Set up alerts for `status !== "healthy"`

---

## Custom Event Tracking

### Business Metrics

```typescript
import { 
  trackPulseScore, 
  trackScenarioRun, 
  trackShareToUnlock 
} from '@/lib/monitoring/analytics';

// Pulse score calculation
trackPulseScore(87.3, 'dealer-id-123');

// Scenario simulation
trackScenarioRun('dealer-id-123', 'schema_fix_scenario');

// Share-to-unlock feature
trackShareToUnlock('twitter', 'Competitive Comparison');
```

---

## Monitoring Provider

The `MonitoringProvider` component automatically:
- Initializes Sentry on mount
- Initializes PostHog on mount
- Tracks page views on route changes
- Sets user context when authenticated
- Integrates with Clerk for user identification

**Location**: `components/providers/MonitoringProvider.tsx`

**Usage**: Already integrated in `app/layout.tsx`

---

## File Structure

```
lib/monitoring/
├── sentry.ts           # Sentry initialization & helpers
├── analytics.ts        # PostHog & event tracking
└── health-check.ts     # Health check utilities

components/providers/
└── MonitoringProvider.tsx  # Client-side monitoring init

app/
├── api/
│   └── health/
│       └── route.ts    # Health check endpoint
└── layout.tsx         # Monitoring providers integrated

instrumentation.ts      # Next.js instrumentation (Sentry auto-init)

sentry.client.config.ts
sentry.server.config.ts
sentry.edge.config.ts
```

---

## Dashboards

### Sentry Dashboard
- **URL**: https://sentry.io/organizations/[org]/issues/
- **View**: Errors, performance, release health
- **Alerts**: Configure in project settings

### PostHog Dashboard
- **URL**: https://app.posthog.com/project/[id]
- **View**: Product analytics, funnels, session recordings
- **Insights**: Custom dashboards and cohorts

### Vercel Analytics
- **URL**: https://vercel.com/dashboard/[project]/analytics
- **View**: Page views, Web Vitals, top pages
- **Real-time**: Live visitor tracking

---

## Troubleshooting

### Sentry not capturing errors
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set
- Check Sentry dashboard for project status
- Test with: `throw new Error('Test')` in browser console

### PostHog not tracking events
- Verify `NEXT_PUBLIC_POSTHOG_KEY` is set
- Check browser console for PostHog initialization
- Verify PostHog project is active

### Health check failing
- Check individual service health in response
- Verify environment variables for services
- Check database and Redis connections

---

## Best Practices

1. **Don't track PII**: Never include names, emails, or phone numbers in event properties
2. **Use stable IDs**: Use `dealer_id`, `user_id` instead of names
3. **Batch events**: For high-frequency events, batch in memory before sending
4. **Test in dev**: Monitoring is configured to log in development mode
5. **Monitor costs**: Track API usage and adjust sampling rates as needed

---

## Next Steps

1. ✅ Monitoring infrastructure complete
2. ⏭️ Add environment variables to Vercel
3. ⏭️ Set up alerts in Sentry for critical errors
4. ⏭️ Create PostHog dashboards for key metrics
5. ⏭️ Configure health check monitoring (UptimeRobot, etc.)

---

**Status**: ✅ Complete and ready for production

