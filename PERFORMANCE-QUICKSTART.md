# ⚡ Performance Budget Monitor - Quick Start

## 🎯 What This Does

Tracks **Core Web Vitals** (LCP, CLS, INP, FCP, TTFB) in real-time and provides **automated fix playbooks** to optimize your site's performance.

---

## 🚀 Installation (2 minutes)

### Option 1: Automated Install

```bash
cd /Users/briankramer/dealership-ai-dashboard
./install-performance-monitor.sh
```

### Option 2: Manual Install

```bash
npm install web-vitals swr
```

---

## ⚙️ Setup (3 minutes)

### 1. Enable Web Vitals Tracking

Edit `app/layout.tsx`:

```tsx
'use client';
import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    reportWebVitals();  // ← Add this
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Add to Dashboard

Edit your dashboard page (e.g., `app/dashboard/page.tsx`):

```tsx
import IntelligencePanel from '@/components/IntelligencePanel';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* Your existing content */}
      <main>
        <h1>Dashboard</h1>
        {/* ... */}
      </main>

      {/* Add this */}
      <IntelligencePanel mode="full" />
    </div>
  );
}
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test It Out

1. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Look for the **Intelligence Panel** on the right side
3. You should see:
   - **Performance Budget** section with Web Vitals
   - **Performance Fix Executor** with playbooks

---

## 🎨 What You Get

### Performance Budget Monitor
- **Overall Score**: 0-100 (Lighthouse-style)
- **5 Core Web Vitals**:
  - **LCP** - Largest Contentful Paint (loading)
  - **CLS** - Cumulative Layout Shift (stability)
  - **INP** - Interaction to Next Paint (responsiveness)
  - **FCP** - First Contentful Paint (initial load)
  - **TTFB** - Time to First Byte (server speed)
- **Week-over-Week Trends**: ↑/↓ indicators
- **Root Cause Diagnosis**: Why each metric is slow
- **Suggested Fixes**: What to do about it

### Performance Fix Executor
- **5 Automated Playbooks**:
  - Image Optimization (LCP)
  - JavaScript Reduction (INP)
  - Edge Caching (TTFB)
  - Layout Stability (CLS)
  - Font Optimization (FCP)
- **Dry Run Mode**: Preview changes safely
- **Safe Execution**: Auto-run low-risk fixes
- **Impact Estimates**: Expected improvements

---

## 📊 Example Output

### Performance Budget
```
┌─────────────────────────────────┐
│ Performance Budget              │
│ Core Web Vitals           Score │
│                              68  │
├─────────────────────────────────┤
│ ⚠️ 0 critical issues            │
├─────────────────────────────────┤
│ LCP  ⚠ Needs Work               │
│ 3200ms  ↑ +400ms WoW            │
│ Target: ≤ 2500ms                │
│ Cause: Hero image (2.4MB)       │
│ 💡 Convert to WebP              │
├─────────────────────────────────┤
│ CLS  ✓ Good                     │
│ 0.08  ↓ -0.02 WoW               │
│ Target: ≤ 0.1                   │
├─────────────────────────────────┤
│ INP  ⚠ Needs Work               │
│ 450ms  ↑ +180ms WoW             │
│ Target: ≤ 200ms                 │
│ Cause: Heavy JS on filters      │
│ 💡 Debounce inputs              │
└─────────────────────────────────┘
```

### Fix Executor
```
┌─────────────────────────────────┐
│ Performance Fix Executor        │
├─────────────────────────────────┤
│ Select Playbook:                │
│ [Image Optimization    ▼]       │
│                                 │
│ Impact: HIGH | Effort: LOW      │
│ Expected: LCP -1200ms           │
│                                 │
│ [Dry Run] [Execute]             │
├─────────────────────────────────┤
│ ✓ Executed 4 of 5 actions       │
│ ✓ Convert images to WebP        │
│ ✓ Add responsive srcset         │
│ ✓ Priority loading hints        │
│ ✓ Lazy-load below fold          │
│ ⚠ Manual: Next.js Image         │
└─────────────────────────────────┘
```

---

## 🧪 Testing

### 1. Generate Web Vitals Data

Navigate between pages:
- Homepage → Inventory → Vehicle Detail → Back

Web Vitals will be automatically collected and sent to `/api/web-vitals`.

### 2. View Metrics

Refresh the dashboard to see updated metrics.

### 3. Test Playbook Execution

1. Select "Image Optimization" playbook
2. Click **Dry Run** to preview
3. Review the actions that would be taken
4. Click **Execute** to run safe optimizations

---

## 📚 Full Documentation

| File                                  | Purpose                          |
| ------------------------------------- | -------------------------------- |
| `PERFORMANCE-BUDGET-SUMMARY.md`       | Overview & features              |
| `PERFORMANCE-BUDGET-INTEGRATION.md`   | Detailed integration guide       |
| `PERFORMANCE-EXAMPLE.tsx`             | 8 code examples                  |
| `PERFORMANCE-ARCHITECTURE.md`         | System design & data flow        |
| `PERFORMANCE-DEPENDENCIES.md`         | Dependency information           |
| `PERFORMANCE-QUICKSTART.md`           | This file                        |

---

## 🔧 Customization

### Show Only Performance Panel

```tsx
<IntelligencePanel mode="performance" />
```

### Custom Component Selection

```tsx
<IntelligencePanel
  mode="custom"
  showPerformanceBudget={true}
  showPerfFix={true}
  showWhatChanged={false}
  showFixLoop={false}
/>
```

### Tabbed Layout (Mobile-Friendly)

```tsx
import { IntelligencePanelTabs } from '@/components/IntelligencePanel';

<IntelligencePanelTabs />
```

### Inline Widgets

```tsx
import PerformanceBudgetMonitor from '@/components/PerformanceBudgetMonitor';
import PerfFixExecutor from '@/components/PerfFixExecutor';

<div className="grid md:grid-cols-2 gap-6">
  <PerformanceBudgetMonitor />
  <PerfFixExecutor />
</div>
```

---

## 🐛 Troubleshooting

### "Cannot find module 'web-vitals'"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Components Not Rendering

Ensure you added `'use client'` at the top of files using hooks:

```tsx
'use client';
import { useEffect } from 'react';
```

### Web Vitals Not Reporting

Check browser console for errors. Ensure `reportWebVitals()` is called in a client component.

### API Routes Not Working

Verify files exist:
- `app/api/web-vitals/route.ts`
- `app/api/perf-fix/route.ts`

---

## 🎯 Success Criteria

After setup, you should see:

- ✅ **Performance Budget Monitor** displaying 5 metrics
- ✅ **Overall score** calculated (e.g., 68/100)
- ✅ **Week-over-week trends** with arrows
- ✅ **Playbook selector** with 5 options
- ✅ **Dry Run** button working
- ✅ **Execute** button working

---

## 🚢 Ready for Production?

### Before Deploying:

1. **Connect Real Monitoring**
   ```bash
   npm install @vercel/analytics
   ```

2. **Set Up Database Storage**
   - Store Web Vitals in PostgreSQL
   - Add time-series for historical trends

3. **Configure Alerts**
   - Slack webhooks for regressions
   - Email notifications for critical issues

4. **Enable Authentication**
   - Protect `/api/perf-fix` routes
   - Add audit logging

5. **Test on Real Devices**
   - Mobile performance often worse than desktop
   - Test on 3G/4G connections

---

## 📞 Need Help?

1. **Read the docs**: Start with `PERFORMANCE-BUDGET-INTEGRATION.md`
2. **Check examples**: See `PERFORMANCE-EXAMPLE.tsx`
3. **Review architecture**: Read `PERFORMANCE-ARCHITECTURE.md`
4. **Inspect code**: All files have inline comments

---

## 🎉 You're Done!

**Time to ship:** 5 minutes
**Impact:** Massive competitive advantage
**Cost:** $0 (open source)

**Next steps:**
1. ✅ Install dependencies
2. ✅ Add to dashboard
3. ✅ Test in dev mode
4. 🚀 **Deploy to production**

---

**Questions?** Review the full integration guide:

```bash
open PERFORMANCE-BUDGET-INTEGRATION.md
```

**Happy optimizing!** ⚡
