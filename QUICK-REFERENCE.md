# 🚀 DealershipAI Dashboard - Quick Reference Card

## 📦 What's Shipped

### 1. Performance Budget Monitor
✅ Core Web Vitals tracking (LCP, CLS, INP, FCP, TTFB)
✅ 5 automated optimization playbooks
✅ Dry-run execution mode

### 2. Permissions Inspector
✅ RBAC visualization modal
✅ Plan-based feature gating (Free/Pro/Enterprise)
✅ Clear remediation guidance

### 3. SLO Monitoring System
✅ Real-time API performance tracking
✅ p95 latency monitoring (250ms read, 500ms write)
✅ Automatic breach alerts

### 4. Marketing & Analytics
✅ GA4 event tracking
✅ HubSpot newsletter integration
✅ Shareable audit reports (UUID-based, 30-day expiration)

### 5. Dashboard Bulk Fetcher
✅ Single-request data loading
✅ Edge caching with 30s ISR
✅ Graceful degradation

---

## ⚡ Quick Integration

### 1. Add Web Vitals Tracking (app/layout.tsx)

```tsx
'use client';
import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => { reportWebVitals(); }, []);
  return <html><body>{children}</body></html>;
}
```

### 2. Add Intelligence Panel (dashboard page)

```tsx
import IntelligencePanel from '@/components/IntelligencePanel';

<div className="grid lg:grid-cols-[1fr_360px] gap-6">
  <main>{/* Your content */}</main>
  <IntelligencePanel mode="full" />
</div>
```

### 3. Track GA4 Events

```tsx
import { trackCTAClick, trackShareCreated } from '@/lib/ga';

<button onClick={() => trackCTAClick('run-audit')}>Run Audit</button>
```

### 4. Add Permissions Inspector

```tsx
import { PermissionInspectorButton } from '@/components/PermissionsInspectorModal';

<button disabled>
  Execute Fix
  <PermissionInspectorButton feature="auto-fix-execution" context={{ plan, role }} />
</button>
```

---

## 🔑 Environment Variables

```bash
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_GA=G-XXXXXXXXXX
HUBSPOT_PORTAL_ID=12345678
HUBSPOT_FORM_GUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
KV_URL=https://your-kv-endpoint

# Optional
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
VERCEL_ANALYTICS_ID=your_project_id
```

---

## 📊 Key API Endpoints

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/dashboard/overview` | Bulk fetch all dashboard data | GET |
| `/api/web-vitals` | Core Web Vitals metrics | GET/POST |
| `/api/perf-fix` | Execute performance playbooks | GET/POST |
| `/api/permissions/inspect` | Check feature permissions | POST |
| `/api/slo` | SLO monitoring reports | GET |
| `/api/newsletter` | Newsletter subscription | POST |
| `/api/share/create` | Create shareable report | POST |

---

## 🎯 SLO Targets

| Metric | Target | Status |
|--------|--------|--------|
| API Read Latency (p95) | ≤ 250ms | ✅ Monitored |
| API Write Latency (p95) | ≤ 500ms | ✅ Monitored |
| Error Rate | < 1% | ✅ Monitored |
| Availability | > 99.9% | ✅ Monitored |
| LCP | < 2.5s | ⚠️ 3.2s (fixable) |
| CLS | < 0.1 | ✅ 0.08 |
| INP | < 200ms | ⚠️ 450ms (fixable) |

---

## 📚 Documentation

| File | Use Case |
|------|----------|
| `PERFORMANCE-QUICKSTART.md` | 5-min setup |
| `PERFORMANCE-BUDGET-INTEGRATION.md` | Full guide |
| `PERFORMANCE-EXAMPLE.tsx` | Code examples |
| `DEPLOYMENT-SUMMARY.md` | Complete overview |
| `QUICK-REFERENCE.md` | This file |

---

## 🛠️ Common Tasks

### Test Performance Playbook
```bash
curl -X POST http://localhost:3000/api/perf-fix \
  -H "Content-Type: application/json" \
  -d '{"playbookId":"optimize-images","dryRun":true}'
```

### Check SLO Status
```bash
curl http://localhost:3000/api/slo
```

### Create Shareable Report
```bash
curl -X POST http://localhost:3000/api/share/create \
  -H "Content-Type: application/json" \
  -d '{"snapshot":{"scores":{"aiVisibility":78}}}'
```

---

## 🚨 Troubleshooting

### Web Vitals not appearing
1. Check `reportWebVitals()` is called in layout.tsx
2. Verify `'use client'` directive is present
3. Navigate between pages to generate metrics

### Permissions modal not loading
1. Check API endpoint: `/api/permissions/inspect`
2. Verify feature name matches defined features
3. Check browser console for errors

### SLO dashboard empty
1. Make some API requests first
2. Wait 1-2 minutes for metrics to collect
3. Refresh the page

---

## 💡 Pro Tips

1. **Start with Performance Monitor** - Easiest win, immediate value
2. **Use dry-run mode first** - Test playbooks safely
3. **Monitor SLOs from day 1** - Catch issues early
4. **Enable Slack alerts** - Stay informed of breaches
5. **Share reports externally** - Great for demos and sales

---

## 🎉 Ready to Ship!

**All systems production-ready. Start with PERFORMANCE-QUICKSTART.md.**

---

**Version:** 1.0.0 | **Last Updated:** October 15, 2025
