# 🏗️ Performance Budget Monitor - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Dashboard Page (app/dashboard/page.tsx)                     │  │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐   │  │
│  │  │  Main Content Area      │  │  IntelligencePanel     │   │  │
│  │  │  - Metrics              │  │  ┌──────────────────┐  │   │  │
│  │  │  - Charts               │  │  │ Performance      │  │   │  │
│  │  │  - Tables               │  │  │ Budget Monitor   │  │   │  │
│  │  │                         │  │  └──────────────────┘  │   │  │
│  │  │                         │  │  ┌──────────────────┐  │   │  │
│  │  │                         │  │  │ Perf Fix         │  │   │  │
│  │  │                         │  │  │ Executor         │  │   │  │
│  │  │                         │  │  └──────────────────┘  │   │  │
│  │  └─────────────────────────┘  └─────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                │                      │
│                              ▼                ▼                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Web Vitals Library (lib/web-vitals.ts)                      │  │
│  │  - Tracks LCP, CLS, INP, FCP, TTFB                           │  │
│  │  - Sends metrics to API via navigator.sendBeacon()           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              │ POST /api/web-vitals
                              │ (Real User Metrics)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js API Routes                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /app/api/web-vitals/route.ts                                │  │
│  │  - GET: Fetch current metrics + trends                       │  │
│  │  - POST: Receive client-side Web Vitals                      │  │
│  │  - Calculate ratings (good/needs-improvement/poor)            │  │
│  │  - Detect regressions & trigger alerts                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  /app/api/perf-fix/route.ts                                  │  │
│  │  - GET: List available playbooks                             │  │
│  │  - POST: Execute optimization playbooks                      │  │
│  │  - Dry-run mode for safe preview                             │  │
│  │  - Safe action filtering by risk level                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ (Future: Database Integration)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Data Storage (Optional)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   PostgreSQL     │  │   Redis Cache    │  │   Time-Series    │  │
│  │   - Metrics      │  │   - Vehicle data │  │   DB (InfluxDB)  │  │
│  │   - Playbooks    │  │   - Quick queries│  │   - Historical   │  │
│  │   - Audit logs   │  │                  │  │     metrics      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
app/
├── layout.tsx
│   └── useEffect(() => reportWebVitals())  ← Initialize tracking
│
└── dashboard/
    └── page.tsx
        ├── Main Content Area
        └── IntelligencePanel (mode="full")
            ├── Section: "AI Visibility"
            │   ├── WhatChangedAnalyzer
            │   └── FixLoopExecutor
            │
            └── Section: "Performance"
                ├── PerformanceBudgetMonitor
                │   ├── Overall Score
                │   ├── Critical Issues Alert
                │   └── Web Vitals List
                │       ├── LCP (metric card)
                │       ├── CLS (metric card)
                │       ├── INP (metric card)
                │       ├── FCP (metric card)
                │       └── TTFB (metric card)
                │
                └── PerfFixExecutor
                    ├── Playbook Selector
                    ├── Action Buttons (Dry Run / Execute)
                    └── Response Display
                        ├── Status Message
                        ├── Safe Actions List
                        ├── Manual Actions List
                        └── Verification Link
```

---

## Data Flow

### 1. Web Vitals Collection

```
┌──────────┐
│  Page    │
│  Load    │
└────┬─────┘
     │
     ▼
┌──────────────────┐
│ web-vitals lib   │
│ - onLCP()        │
│ - onCLS()        │  ← Observes browser events
│ - onINP()        │
│ - onFCP()        │
│ - onTTFB()       │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ sendToAnalytics()│
│ - navigator.     │  ← Sends to API
│   sendBeacon()   │    (even if page unloads)
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ POST             │
│ /api/web-vitals  │  ← Store in database
└──────────────────┘
```

### 2. Metric Display

```
┌──────────────────────┐
│ PerformanceBudget    │
│ Monitor              │
└────┬─────────────────┘
     │
     ▼ useSWR('/api/web-vitals')
┌──────────────────────┐
│ GET /api/web-vitals  │  ← Fetches current state
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Returns:             │
│ {                    │
│   vitals: [...]      │
│   overallScore: 68   │
│   criticalIssues: 0  │
│ }                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Renders:             │
│ - Score card         │
│ - Alert banners      │
│ - Metric cards       │
│ - Trend indicators   │
└──────────────────────┘
```

### 3. Fix Execution

```
┌──────────────────┐
│ User selects     │
│ playbook         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Clicks           │
│ "Dry Run" or     │
│ "Execute"        │
└────┬─────────────┘
     │
     ▼ POST /api/perf-fix
┌──────────────────┐
│ API determines:  │
│ - Safe actions   │  ← automated=true, risk=safe
│ - Manual actions │  ← needs human review
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ If dry-run:      │
│   Return preview │
│ Else:            │
│   Execute safe   │  ← Image conversion, cache headers
│   actions        │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Returns:         │
│ - Status         │
│ - Actions taken  │
│ - ETA            │
│ - Verification   │
│   URL            │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Display results  │
│ in UI            │
└──────────────────┘
```

---

## API Contract

### GET /api/web-vitals

**Request:**
```
GET /api/web-vitals?page=/inventory
```

**Response:**
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
      "pageUrl": "/inventory/2024-honda-accord",
      "diagnosis": "Hero image (2.4MB) loaded without optimization",
      "suggestedFix": "Convert to WebP, implement responsive images"
    }
  ],
  "overallScore": 68,
  "criticalIssues": 0,
  "lastChecked": "2025-10-15T12:00:00Z"
}
```

### POST /api/web-vitals

**Request:**
```json
[
  {
    "name": "LCP",
    "value": 3245,
    "rating": "needs-improvement",
    "delta": 45,
    "id": "v4-1234567890",
    "navigationType": "navigate",
    "pageUrl": "/inventory",
    "timestamp": 1697385600000
  }
]
```

**Response:**
```json
{
  "ok": true,
  "received": 1,
  "alerts": [
    {
      "metric": "LCP",
      "value": 3245,
      "severity": "medium",
      "action": "Monitor for further degradation"
    }
  ]
}
```

### GET /api/perf-fix

**Request:**
```
GET /api/perf-fix?metric=LCP&impact=high
```

**Response:**
```json
{
  "playbooks": [
    {
      "id": "optimize-images",
      "name": "Image Optimization",
      "metric": "LCP",
      "category": "images",
      "impact": "high",
      "effort": "low",
      "description": "Convert images to WebP/AVIF...",
      "expectedImprovement": "LCP: -1200ms (3200ms → 2000ms)",
      "actions": [
        {
          "id": "img-1",
          "description": "Convert all hero images to WebP",
          "automated": true,
          "risk": "safe"
        }
      ]
    }
  ]
}
```

### POST /api/perf-fix

**Request:**
```json
{
  "playbookId": "optimize-images",
  "dryRun": false,
  "autoApprove": false
}
```

**Response:**
```json
{
  "ok": true,
  "mode": "executed",
  "playbook": "Image Optimization",
  "message": "Executed 4 of 5 actions",
  "executedActions": [
    {
      "id": "img-1",
      "description": "Convert all hero images to WebP (2.4MB → 480KB)",
      "automated": true,
      "risk": "safe"
    }
  ],
  "pendingManualActions": 1,
  "expectedImprovement": "LCP: -1200ms (3200ms → 2000ms)",
  "estimatedCompletionTime": "~15 minutes",
  "verificationUrl": "/api/web-vitals?verify=true"
}
```

---

## Security Model

### API Route Protection

```typescript
// middleware.ts (future)
export function middleware(req: NextRequest) {
  // Authenticate user
  const session = await getSession(req);
  if (!session) {
    return NextResponse.redirect('/login');
  }

  // Rate limiting
  if (isRateLimited(session.userId)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Audit logging for perf-fix executions
  if (req.url.includes('/api/perf-fix') && req.method === 'POST') {
    logAuditEvent({
      userId: session.userId,
      action: 'perf-fix-execute',
      timestamp: Date.now()
    });
  }

  return NextResponse.next();
}
```

### Input Validation

```typescript
// In /app/api/perf-fix/route.ts
const schema = z.object({
  playbookId: z.enum(['optimize-images', 'reduce-js-execution', ...]),
  dryRun: z.boolean().optional(),
  autoApprove: z.boolean().optional()
});

const validated = schema.parse(await req.json());
```

---

## Performance Considerations

### Component Optimization

1. **Lazy Loading**
   - All components use `dynamic()` imports
   - Only load when visible on screen
   - Reduces initial bundle size

2. **Data Fetching**
   - SWR provides automatic caching
   - Stale-while-revalidate pattern
   - 30-second refresh interval (configurable)

3. **Memoization**
   ```typescript
   const expensiveCalculation = useMemo(() => {
     return calculateOverallScore(vitals);
   }, [vitals]);
   ```

### API Optimization

1. **Caching Strategy**
   ```typescript
   export const revalidate = 30; // ISR: Revalidate every 30s
   ```

2. **Database Indexes**
   ```sql
   CREATE INDEX idx_web_vitals_metric ON web_vitals(metric_name);
   CREATE INDEX idx_web_vitals_created ON web_vitals(created_at);
   ```

3. **CDN Edge Caching**
   ```typescript
   export const config = {
     runtime: 'edge', // Run at edge for low latency
   };
   ```

---

## Monitoring & Observability

### Metrics to Track

1. **System Health**
   - API response times
   - Error rates
   - Cache hit rates
   - Database query performance

2. **Business Metrics**
   - Number of playbook executions
   - Success rate of fixes
   - Time to resolution
   - User engagement with dashboard

3. **Performance Impact**
   - Before/after Web Vitals scores
   - Improvement from each playbook
   - ROI calculation

### Logging Strategy

```typescript
// lib/logger.ts
export function logPerformanceEvent(event: {
  type: 'metric_collected' | 'playbook_executed' | 'alert_triggered';
  data: any;
}) {
  console.log(`[Performance] ${event.type}:`, event.data);

  // Send to external monitoring
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/telemetry', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }
}
```

---

## Deployment Checklist

### Development
- [x] Components built
- [x] API routes created
- [x] Web Vitals tracking implemented
- [x] Documentation written

### Staging
- [ ] Install dependencies
- [ ] Test all components render
- [ ] Verify API routes work
- [ ] Test dry-run execution
- [ ] Execute one playbook
- [ ] Check mobile responsiveness

### Production
- [ ] Connect to real RUM service
- [ ] Set up database storage
- [ ] Configure alert webhooks
- [ ] Enable API authentication
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Configure CDN caching
- [ ] Run load tests

---

## File Structure

```
dealership-ai-dashboard/
├── app/
│   ├── api/
│   │   ├── perf-fix/
│   │   │   └── route.ts          ← Playbook executor
│   │   └── web-vitals/
│   │       └── route.ts          ← Metrics endpoint
│   ├── layout.tsx                ← Initialize tracking here
│   └── dashboard/
│       └── page.tsx              ← Add IntelligencePanel here
│
├── components/
│   ├── IntelligencePanel.tsx    ← Unified container
│   ├── PerformanceBudgetMonitor.tsx
│   ├── PerfFixExecutor.tsx
│   ├── WhatChangedAnalyzer.tsx  ← From previous build
│   └── FixLoopExecutor.tsx      ← From previous build
│
├── lib/
│   └── web-vitals.ts            ← Client-side tracking
│
├── PERFORMANCE-BUDGET-INTEGRATION.md
├── PERFORMANCE-BUDGET-SUMMARY.md
├── PERFORMANCE-DEPENDENCIES.md
├── PERFORMANCE-EXAMPLE.tsx
└── PERFORMANCE-ARCHITECTURE.md  ← This file
```

---

## Technology Stack

| Layer          | Technology      | Purpose                        |
| -------------- | --------------- | ------------------------------ |
| Framework      | Next.js 15      | React framework                |
| UI Components  | React 19        | Component library              |
| Data Fetching  | SWR             | Client-side caching            |
| Metrics        | web-vitals      | Core Web Vitals tracking       |
| Styling        | Tailwind CSS    | Utility-first CSS              |
| API            | Next.js Routes  | Backend endpoints              |
| Database       | PostgreSQL      | (Future) Metrics storage       |
| Cache          | Redis           | (Future) Query caching         |
| Monitoring     | Vercel Analytics| (Future) Production RUM        |

---

**Next Steps**: Follow [PERFORMANCE-BUDGET-INTEGRATION.md](./PERFORMANCE-BUDGET-INTEGRATION.md) to integrate into your dashboard.
