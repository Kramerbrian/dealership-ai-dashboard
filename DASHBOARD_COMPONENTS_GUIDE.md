# 🎨 Dashboard Components Guide

## ✅ Status: DEPLOYED TO PRODUCTION

All 7 new dashboard components have been successfully:
- Created and committed to the repository
- Pushed to GitHub (commit: 0af5d2c8)
- Deployed to production at https://dealershipai.com
- Built successfully with Next.js

## 📦 Available Components

### 1. **DeltaIndicator** - Metric Change Indicator
`components/dashboard/DeltaIndicator.tsx`

Shows positive/negative changes with color-coded arrows.

```tsx
import { DeltaIndicator } from "@/components/dashboard/DeltaIndicator";

<DeltaIndicator delta={5.2} label="vs last 7 days" />
<DeltaIndicator delta={-3.1} label="vs last month" />
```

**Props:**
- `delta: number` - The change value (positive or negative)
- `label?: string` - Optional label (e.g., "vs last 7 days")

**Features:**
- Auto-detects positive (green) or negative (red) changes
- Animated arrow icons (ArrowUpRight / ArrowDownRight)
- Rounded badge design with gradient border

---

### 2. **MetricTrendSpark** - Sparkline Chart
`components/dashboard/MetricTrendSpark.tsx`

Compact trend visualization using Recharts.

```tsx
import { MetricTrendSpark } from "@/components/dashboard/MetricTrendSpark";

<MetricTrendSpark />
```

**Props:** None (currently uses demo data)

**Features:**
- 7-point trend line
- Emerald green color (#34d399)
- Responsive container (40px height)
- No axes or labels for minimal footprint

**TODO:** Accept `data` prop for dynamic data

---

### 3. **TrustScoreHero** - Main Trust Score Display
`components/dashboard/TrustScoreHero.tsx`

Hero section showing the algorithmic trust score with gradient backgrounds.

```tsx
import { TrustScoreHero } from "@/components/dashboard/TrustScoreHero";

<TrustScoreHero
  score={87}
  delta={5.2}
  trustLabel="Excellent"
/>
```

**Props:**
- `score: number` - Trust score value (0-100)
- `delta: number` - Change from previous period
- `trustLabel: string` - Status label (e.g., "Excellent", "Good", "Fair")

**Features:**
- Large gradient text for score
- Radial gradient background (blue/cyan/emerald)
- Responsive layout (stacks on mobile)
- Integrated DeltaIndicator
- Detailed description text

---

### 4. **PillarCard** - Individual Pillar Metric
`components/dashboard/PillarCard.tsx`

Displays individual pillar scores (SEO, AEO, GEO, QAI).

```tsx
import { PillarCard } from "@/components/dashboard/PillarCard";

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
  <PillarCard title="SEO Score" score={89} status="Strong" />
  <PillarCard title="AEO Score" score={72} status="Good" />
  <PillarCard title="GEO Score" score={65} status="Fair" />
  <PillarCard title="QAI Score" score={91} status="Excellent" />
</div>
```

**Props:**
- `title: string` - Pillar name
- `score: number` - Score value (0-100)
- `status: string` - Status label

**Features:**
- Color-coded scores:
  - ≥85: Emerald (excellent)
  - ≥70: Cyan (good)
  - <70: Amber (needs work)
- Integrated sparkline trend
- Compact card design

---

### 5. **SignalTicker** - Live Signal Ticker
`components/dashboard/SignalTicker.tsx`

Animated scrolling ticker showing live Pulse signals.

```tsx
import { SignalTicker } from "@/components/dashboard/SignalTicker";

<SignalTicker />
```

**Props:** None (currently uses demo signals)

**Features:**
- Infinite horizontal scroll animation (30s duration)
- Gradient background (slate-950 to slate-900)
- "Live Pulse" badge
- Emoji + text format for signals

**TODO:** Accept `signals` prop for dynamic data

---

### 6. **OCIFinancialPanel** - Opportunity Cost Display
`components/dashboard/OCIFinancialPanel.tsx`

Shows estimated monthly revenue at risk from unfixed gaps.

```tsx
import { OCIFinancialPanel } from "@/components/dashboard/OCIFinancialPanel";

<OCIFinancialPanel
  monthlyRisk={43000}
  topIssues={[
    "Missing AutoDealer Schema (-$12K/mo)",
    "Low review response rate (-$8K/mo)",
    "Incomplete FAQ schema (-$5K/mo)"
  ]}
/>
```

**Props:**
- `monthlyRisk: number` - Total monthly revenue at risk
- `topIssues: string[]` - Array of issue descriptions

**Features:**
- Large gradient revenue number
- Red/amber/emerald gradient
- Bullet point issue list
- CTA button ("Generate 14-day fix plan")
- Responsive layout

---

### 7. **PulseCardsPanel** - Pulse Signal Cards
`components/dashboard/PulseCardsPanel.tsx`

Displays Pulse signals in grid or timeline layout.

```tsx
import { PulseCardsPanel } from "@/components/dashboard/PulseCardsPanel";

// Grid layout (default)
<PulseCardsPanel variant="grid" />

// Timeline layout
<PulseCardsPanel variant="timeline" />
```

**Props:**
- `variant?: "grid" | "timeline"` - Layout style (default: "grid")

**Features:**
- 3 built-in demo signals:
  - Used prices climb (auction signal)
  - Zero-Click coverage lagging (AI search signal)
  - Review velocity cooling (reputation signal)
- Icon indicators (Zap, LineChart, ThermometerSun)
- Impact estimates
- Action buttons with ArrowUpRight icon
- Responsive grid (1 col mobile, 3 cols desktop)
- Hover effects

**TODO:** Accept `signals` prop for dynamic data

---

## 🚀 Quick Start: Build a Dashboard

### Complete Dashboard Example

Create `app/(dashboard)/dashboard/page.tsx`:

```tsx
"use client";
import React from "react";
import { TrustScoreHero } from "@/components/dashboard/TrustScoreHero";
import { PillarCard } from "@/components/dashboard/PillarCard";
import { SignalTicker } from "@/components/dashboard/SignalTicker";
import { OCIFinancialPanel } from "@/components/dashboard/OCIFinancialPanel";
import { PulseCardsPanel } from "@/components/dashboard/PulseCardsPanel";

export default function DashboardPage() {
  // TODO: Replace with real API data
  const trustData = {
    score: 87,
    delta: 5.2,
    trustLabel: "Excellent"
  };

  const pillars = [
    { title: "SEO Score", score: 89, status: "Strong" },
    { title: "AEO Score", score: 72, status: "Good" },
    { title: "GEO Score", score: 65, status: "Fair" },
    { title: "QAI Score", score: 91, status: "Excellent" }
  ];

  const ociData = {
    monthlyRisk: 43000,
    topIssues: [
      "Missing AutoDealer Schema (-$12K/mo)",
      "Low review response rate (-$8K/mo)",
      "Incomplete FAQ schema (-$5K/mo)"
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">AI Visibility Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Real-time insights into your dealership's AI presence
          </p>
        </div>

        {/* Signal Ticker */}
        <SignalTicker />

        {/* Trust Score Hero */}
        <TrustScoreHero {...trustData} />

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.title} {...pillar} />
          ))}
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* OCI Panel (1/3 width) */}
          <div className="lg:col-span-1">
            <OCIFinancialPanel {...ociData} />
          </div>

          {/* Pulse Cards (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <h2 className="mb-4 text-lg font-semibold text-white">Pulse Signals</h2>
              <PulseCardsPanel variant="timeline" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000/dashboard

---

## 🔌 Wiring to Real APIs

### Example: Fetch Trust Score from API

```tsx
"use client";
import { useEffect, useState } from "react";
import { TrustScoreHero } from "@/components/dashboard/TrustScoreHero";

export default function DashboardPage() {
  const [trustData, setTrustData] = useState(null);

  useEffect(() => {
    async function fetchTrustScore() {
      const res = await fetch('/api/trust-score');
      const data = await res.json();
      setTrustData(data);
    }
    fetchTrustScore();
  }, []);

  if (!trustData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <TrustScoreHero
        score={trustData.score}
        delta={trustData.delta}
        trustLabel={trustData.label}
      />
    </div>
  );
}
```

### Example: Wire PulseCardsPanel to Real Data

Modify `PulseCardsPanel.tsx` to accept signals prop:

```tsx
interface PulseSignal {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  body: string;
  impact: string;
  action: string;
}

interface Props {
  variant?: "grid" | "timeline";
  signals?: PulseSignal[]; // Add this
}

export function PulseCardsPanel({ variant = "grid", signals }: Props) {
  const items = signals || baseItems; // Use provided signals or defaults

  // ... rest of component
}
```

Then use it:

```tsx
const [pulseSignals, setPulseSignals] = useState([]);

useEffect(() => {
  async function fetchSignals() {
    const res = await fetch('/api/pulse/signals');
    const data = await res.json();
    setPulseSignals(data.signals);
  }
  fetchSignals();
}, []);

<PulseCardsPanel variant="timeline" signals={pulseSignals} />
```

---

## 🎨 Design System

All components follow the **North Star Design System**:

### Colors
- **Background:** `bg-slate-950` (main) / `bg-slate-900` (secondary)
- **Borders:** `border-slate-800` / `border-slate-700` (hover)
- **Text:**
  - Primary: `text-white` / `text-slate-200`
  - Secondary: `text-slate-300` / `text-slate-400`
- **Accents:**
  - Positive: `text-emerald-300` / `bg-emerald-400`
  - Warning: `text-amber-300` / `bg-amber-400`
  - Danger: `text-rose-300` / `bg-rose-400`
  - Info: `text-cyan-300` / `bg-cyan-400`

### Typography
- **Headings:** Bold, white text
- **Body:** Regular, slate-300
- **Labels:** Uppercase, tracking-wide, slate-400

### Spacing
- **Consistent gaps:** `gap-3`, `gap-6` for layouts
- **Padding:** `p-3` (cards), `p-4` (panels), `p-6` (pages)
- **Rounded corners:** `rounded-2xl` (cards), `rounded-3xl` (hero)

### Animations
- **Hover:** `hover:bg-slate-900/80`, `hover:border-slate-700`
- **Transitions:** `transition-all`, `transition-colors`
- **Scroll:** `animate-scroll` (SignalTicker)

---

## 📊 API Endpoints to Build

To fully wire these components, create these API endpoints:

### 1. Trust Score API
`GET /api/trust-score`

```json
{
  "score": 87,
  "delta": 5.2,
  "label": "Excellent",
  "lastUpdated": "2025-11-14T02:00:00Z"
}
```

### 2. Pillars API
`GET /api/pillars`

```json
{
  "pillars": [
    { "id": "seo", "title": "SEO Score", "score": 89, "status": "Strong", "trend": [72, 74, 71, 76, 78, 80, 82] },
    { "id": "aeo", "title": "AEO Score", "score": 72, "status": "Good", "trend": [...] },
    { "id": "geo", "title": "GEO Score", "score": 65, "status": "Fair", "trend": [...] },
    { "id": "qai", "title": "QAI Score", "score": 91, "status": "Excellent", "trend": [...] }
  ]
}
```

### 3. OCI (Opportunity Cost) API
`GET /api/oci`

```json
{
  "monthlyRisk": 43000,
  "topIssues": [
    "Missing AutoDealer Schema (-$12K/mo)",
    "Low review response rate (-$8K/mo)",
    "Incomplete FAQ schema (-$5K/mo)"
  ],
  "breakdown": {
    "schema": 12000,
    "reviews": 8000,
    "faq": 5000,
    "other": 18000
  }
}
```

### 4. Pulse Signals API
`GET /api/pulse/signals`

```json
{
  "signals": [
    {
      "id": 1,
      "type": "auction",
      "label": "Used prices climb toward 18-month high",
      "body": "Wholesale lanes show +2.1% MoM; clean late-model SUVs and trucks leading.",
      "impact": "+$420/unit potential if retail reacts in sync",
      "action": "Open AIM valuation view",
      "actionUrl": "/auction/aim",
      "timestamp": "2025-11-14T01:30:00Z"
    },
    ...
  ]
}
```

---

## ✅ Production Deployment Status

### GitHub
- **Repository:** https://github.com/Kramerbrian/dealership-ai-dashboard
- **Latest Commit:** 0af5d2c8 - "Add complete dashboard component suite"
- **Status:** ✅ Pushed successfully

### Vercel
- **Production URL:** https://dealershipai.com
- **Status:** ✅ Deployed (HTTP 200)
- **Build:** ✅ Successful (Next.js 15.5.6)

### Components
- ✅ DeltaIndicator.tsx
- ✅ MetricTrendSpark.tsx
- ✅ TrustScoreHero.tsx
- ✅ PillarCard.tsx
- ✅ SignalTicker.tsx
- ✅ OCIFinancialPanel.tsx
- ✅ PulseCardsPanel.tsx

### CSS Animations
- ✅ Scroll animation added to `app/globals.css`

---

## 🎯 Next Steps

1. **Create Dashboard Page** - Copy the Quick Start example to `app/(dashboard)/dashboard/page.tsx`
2. **Build API Endpoints** - Create the 4 API routes listed above
3. **Wire Components** - Replace demo data with real API calls
4. **Add SWR** - Use `useSWR` for auto-refreshing data
5. **Add Loading States** - Show skeletons while loading
6. **Add Error Handling** - Handle API errors gracefully
7. **Add Interactivity** - Click handlers for actions (e.g., "Generate 14-day fix plan")
8. **Test Responsiveness** - Verify mobile/tablet layouts
9. **Performance Audit** - Run Lighthouse
10. **User Testing** - Get feedback from dealerships

---

## 📚 Additional Resources

- **North Star Design System:** [THEME_SPEC.md](THEME_SPEC.md)
- **API Documentation:** [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md)
- **Production Status:** [PRODUCTION_STATUS.md](PRODUCTION_STATUS.md)
- **Quick Start:** [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

---

**Ready to build! All components are deployed and waiting for you to wire them up.** 🚀
