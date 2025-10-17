# 🚀 Performance Budget Monitor - Integration Guide

## Overview

The Performance Budget Monitor tracks Core Web Vitals in real-time and provides automated fix playbooks to optimize page performance. This creates a unique competitive advantage in the automotive dealer space.

---

## 📦 What's Included

### API Routes

1. **`/app/api/web-vitals/route.ts`**
   - GET: Retrieve current Web Vitals data
   - POST: Report client-side metrics
   - Tracks: LCP, CLS, INP, FCP, TTFB

2. **`/app/api/perf-fix/route.ts`**
   - GET: List available optimization playbooks
   - POST: Execute performance fixes (dry-run or live)
   - Playbooks: Image optimization, JS reduction, caching, layout stability, fonts

### Components

1. **`/components/PerformanceBudgetMonitor.tsx`**
   - Visual dashboard for Core Web Vitals
   - Color-coded ratings (good/needs-improvement/poor)
   - Week-over-week trend tracking
   - Root cause diagnosis + fix suggestions

2. **`/components/PerfFixExecutor.tsx`**
   - Playbook selector with impact/effort ratings
   - Dry-run mode for safe previews
   - Automated execution of safe optimizations
   - Action tracking (safe vs manual)

### Utilities

1. **`/lib/web-vitals.ts`**
   - Client-side Web Vitals tracking
   - Automatic reporting to analytics endpoint
   - Custom metric support
   - Slow connection detection

---

## 🔧 Integration Steps

### 1. Install Dependencies

```bash
npm install web-vitals swr
```

### 2. Add Web Vitals Tracking to Your App

#### Option A: App Router (Next.js 13+)

Create or update `app/layout.tsx`:

```tsx
import { reportWebVitals } from '@/lib/web-vitals';
import { useEffect } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web Vitals tracking on client side
    reportWebVitals();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

#### Option B: Pages Router (Next.js 12)

Update `pages/_app.tsx`:

```tsx
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return <Component {...pageProps} />;
}
```

### 3. Add Components to Dashboard

#### Intelligence Right-Rail Layout

```tsx
import dynamic from 'next/dynamic';

const PerformanceBudgetMonitor = dynamic(
  () => import('@/components/PerformanceBudgetMonitor'),
  { ssr: false }
);

const PerfFixExecutor = dynamic(
  () => import('@/components/PerfFixExecutor'),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      {/* Main Content */}
      <main>
        {/* Your existing dashboard content */}
      </main>

      {/* Right Rail - Intelligence Panel */}
      <aside className="hidden lg:block space-y-4">
        <PerformanceBudgetMonitor />
        <PerfFixExecutor />
      </aside>
    </div>
  );
}
```

#### Full-Width Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <PerformanceBudgetMonitor />
  <PerfFixExecutor />
</div>
```

---

## 📊 API Usage Examples

### Fetch Web Vitals

```bash
# Get all metrics
curl http://localhost:3000/api/web-vitals

# Filter by page
curl http://localhost:3000/api/web-vitals?page=/inventory
```

Response:
```json
{
  "vitals": [
    {
      "name": "LCP",
      "value": 3200,
      "rating": "needs-improvement",
      "target": 2500,
      "unit": "ms",
      "trend": 400,
      "diagnosis": "Hero image (2.4MB) loaded without optimization",
      "suggestedFix": "Convert to WebP, implement responsive images"
    }
  ],
  "overallScore": 68,
  "criticalIssues": 0,
  "lastChecked": "2025-10-15T12:00:00Z"
}
```

### Execute Performance Fix

```bash
# Dry run (preview only)
curl -X POST http://localhost:3000/api/perf-fix \
  -H "Content-Type: application/json" \
  -d '{"playbookId": "optimize-images", "dryRun": true}'

# Execute safe actions
curl -X POST http://localhost:3000/api/perf-fix \
  -H "Content-Type: application/json" \
  -d '{"playbookId": "optimize-images", "dryRun": false}'
```

### List Available Playbooks

```bash
# All playbooks
curl http://localhost:3000/api/perf-fix

# Filter by metric
curl http://localhost:3000/api/perf-fix?metric=LCP

# Filter by impact
curl http://localhost:3000/api/perf-fix?impact=high
```

---

## 🎯 Available Playbooks

| Playbook ID          | Metric | Impact | Effort | Expected Improvement       |
| -------------------- | ------ | ------ | ------ | -------------------------- |
| optimize-images      | LCP    | High   | Low    | -1200ms (3200ms → 2000ms)  |
| reduce-js-execution  | INP    | High   | Medium | -250ms (450ms → 200ms)     |
| edge-caching         | TTFB   | High   | Low    | -700ms (1200ms → 500ms)    |
| layout-stability     | CLS    | Medium | Low    | -0.05 (0.15 → 0.10)        |
| font-optimization    | FCP    | Medium | Low    | -300ms (1900ms → 1600ms)   |

---

## 🔗 Integration with DealerGPT 2.0

Connect performance monitoring to AI-driven recommendations:

```tsx
// Example: Trigger auto-fix when metric degrades
useEffect(() => {
  if (data?.vitals) {
    const poorMetrics = data.vitals.filter(v => v.rating === 'poor');

    if (poorMetrics.length > 0) {
      // Alert DealerGPT
      poorMetrics.forEach(metric => {
        fetch('/api/dealergpt/alert', {
          method: 'POST',
          body: JSON.stringify({
            type: 'performance_degradation',
            metric: metric.name,
            value: metric.value,
            recommendation: metric.suggestedFix
          })
        });
      });
    }
  }
}, [data]);
```

---

## 📈 Production Setup

### 1. Real User Monitoring (RUM)

Replace mock data with real metrics from:

- **Vercel Analytics** (built-in for Vercel deployments)
- **Google Analytics 4** (free, comprehensive)
- **Sentry Performance** (error tracking + performance)
- **New Relic** (enterprise-grade APM)

### 2. Database Storage

Store metrics in your database for historical analysis:

```sql
CREATE TABLE web_vitals (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(10) NOT NULL,
  metric_value FLOAT NOT NULL,
  rating VARCHAR(20) NOT NULL,
  page_url VARCHAR(255) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_web_vitals_metric ON web_vitals(metric_name);
CREATE INDEX idx_web_vitals_page ON web_vitals(page_url);
CREATE INDEX idx_web_vitals_created ON web_vitals(created_at);
```

### 3. Alert Thresholds

Set up alerts for regressions:

```typescript
// In /app/api/web-vitals/route.ts POST handler
if (vital.rating === 'poor' && vital.trend > thresholdDelta) {
  // Send to Slack/PagerDuty/Email
  await sendAlert({
    channel: '#performance-alerts',
    message: `⚠️ ${vital.name} degraded to ${vital.value}ms (was ${vital.value - vital.trend}ms)`,
    action: `Run playbook: /api/perf-fix?metric=${vital.name}`
  });
}
```

### 4. Automated Fix Execution

Enable safe auto-fix for trusted playbooks:

```typescript
// Automatically execute safe fixes when metrics degrade
if (vital.rating === 'poor' && hasSafePlaybook(vital.name)) {
  await fetch('/api/perf-fix', {
    method: 'POST',
    body: JSON.stringify({
      playbookId: getPlaybookForMetric(vital.name),
      dryRun: false,
      autoApprove: true
    })
  });
}
```

---

## 🎨 Customization

### Custom Thresholds

Edit thresholds in `/app/api/web-vitals/route.ts`:

```typescript
const THRESHOLDS = {
  LCP: { good: 2000, poor: 3500 },  // Stricter than default
  CLS: { good: 0.05, poor: 0.15 },  // Stricter
  // ...
};
```

### Custom Playbooks

Add new playbooks in `/app/api/perf-fix/route.ts`:

```typescript
const PLAYBOOKS: PerformancePlaybook[] = [
  // ... existing playbooks
  {
    id: 'video-optimization',
    name: 'Video Optimization',
    metric: 'LCP',
    category: 'media',
    impact: 'high',
    effort: 'medium',
    description: 'Optimize video loading and delivery',
    actions: [
      {
        id: 'video-1',
        description: 'Convert videos to HLS adaptive streaming',
        automated: false,
        risk: 'medium'
      }
    ],
    expectedImprovement: 'LCP: -800ms'
  }
];
```

---

## 📱 Mobile Responsiveness

Components are fully responsive:

- Desktop: Full details + charts
- Tablet: Compact view with key metrics
- Mobile: Stacked cards with collapsible details

---

## 🔒 Security Considerations

1. **Rate Limiting**: Add rate limits to POST endpoints
2. **Authentication**: Require auth for `/api/perf-fix` execution
3. **Input Validation**: Validate all playbook IDs and parameters
4. **Audit Logging**: Log all fix executions to `/api/lineage`

---

## 🚦 Next Steps

1. ✅ **Test the integration** - Visit dashboard and verify components render
2. ✅ **Generate traffic** - Navigate pages to collect real Web Vitals
3. ✅ **Run a dry-run** - Test playbook execution in preview mode
4. ✅ **Execute a fix** - Apply image optimization playbook
5. ✅ **Monitor improvements** - Check Web Vitals after 24 hours
6. ✅ **Set up alerts** - Configure Slack/email notifications
7. ✅ **Connect to production RUM** - Integrate Vercel Analytics or GA4

---

## 📚 Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)
- [Next.js Performance Best Practices](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [Vercel Analytics](https://vercel.com/docs/analytics)

---

## 💡 Pro Tips

1. **Focus on LCP first** - Largest impact on user experience
2. **Monitor mobile separately** - Mobile metrics often worse than desktop
3. **Test on real devices** - Simulators don't reflect real performance
4. **Track business impact** - Correlate Web Vitals with conversion rates
5. **Iterate weekly** - Set performance budgets and review regularly

---

**Questions?** Check the inline comments in each file or reach out to the team.
