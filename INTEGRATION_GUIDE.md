# Dashboard Integration Guide

## Seamlessly Integrating ROI Dashboard & Components into dash.dealershipai.com

### Overview

This guide shows how to integrate the ROI Dashboard, Attribution API, Explainability features, and Governance components into the existing `DealershipAIDashboardLA` component.

---

## 1. Add ROI Tab to Dashboard

### Update `app/components/DealershipAIDashboardLA.tsx`

```typescript
// Add import at top
import { ROIDashboard } from '@/components/dashboard/ROIDashboard';

// In the tabs array (around line 482)
{[
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'ai-health', icon: '🤖', label: 'AI Health' },
  { id: 'aiv', icon: '👁️', label: 'AIV™' },
  { id: 'roi', icon: '💰', label: 'ROI' },  // ← NEW
  { id: 'website', icon: '🌐', label: 'Website' },
  { id: 'schema', icon: '🔍', label: 'Schema' },
  { id: 'reviews', icon: '⭐', label: 'Reviews' },
  { id: 'war-room', icon: '⚔️', label: 'War Room' },
  { id: 'settings', icon: '⚙️', label: 'Settings' }
].map((tab, idx) => (
  // ... existing tab rendering
))}

// Add ROI tab content (after AIV tab, around line 770)
{/* ROI Tab */}
<div className={`tab-content ${activeTab === 'roi' ? 'active' : ''}`} id="roi">
  <div className="p-6">
    <ROIDashboard dealershipId={effectiveDealerId || user?.id || 'current'} />
  </div>
</div>
```

---

## 2. Add Explainability to AI Health Tab

### Update AI Health Tab Content

```typescript
// Add imports
import ExplainCard from '@/app/dashboards/explain/ExplainCard';
import ExplainChart from '@/app/dashboards/explain/ExplainChart';

// Update AI Health tab (around line 739)
<div className={`tab-content ${activeTab === 'ai-health' ? 'active' : ''}`} id="ai-health">
  <div className="p-6 space-y-6">
    {/* Existing AI Health content */}
    
    {/* Add Explainability Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ExplainCard />
      <ExplainChart decisionId="current" />
    </div>
  </div>
</div>
```

---

## 3. Add Governance Link in Settings

### Update Settings Tab

```typescript
// In Settings tab (around line 796)
<div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`} id="settings">
  <h2 className="section-header">Settings</h2>
  
  {/* Add Governance section */}
  <div className="card mb-6">
    <h3 className="font-semibold mb-4">Governance & AI Health</h3>
    <div className="space-y-3">
      <a 
        href="/dashboard/governance" 
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span>AI Health Index</span>
        <ArrowRight className="w-4 h-4" />
      </a>
      <a 
        href="/dashboard/explainability" 
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span>Decision Explainability</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  </div>
  
  {/* Existing settings content */}
</div>
```

---

## 4. Add Quick ROI Card to Overview Tab

### Add ROI Summary Card

```typescript
// In Overview tab (around line 506)
<div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`} id="overview">
  {/* Existing overview cards */}
  
  {/* Add ROI Summary Card */}
  <div className="card gradient mb-6">
    <div className="flex-between mb-4">
      <h3 className="font-semibold text-lg">💰 Revenue Impact</h3>
      <button 
        onClick={() => handleTabClick('roi')}
        className="text-sm text-blue-600 hover:underline"
      >
        View Full Report →
      </button>
    </div>
    <ROISummaryCard dealershipId={effectiveDealerId} />
  </div>
</div>
```

### Create `components/dashboard/ROISummaryCard.tsx`

```typescript
'use client';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

export function ROISummaryCard({ dealershipId }: { dealershipId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/attribution?dealership=${dealershipId}&period=30`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [dealershipId]);

  if (loading) return <div className="animate-pulse h-24 bg-gray-200 rounded" />;
  if (!data) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-sm text-gray-600 mb-1">Attributed Revenue</div>
        <div className="text-2xl font-bold text-green-600">
          ${data.attributed?.revenue?.toLocaleString() || '0'}
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-1">ROI Multiple</div>
        <div className="text-2xl font-bold text-blue-600">
          {data.roi?.roi_multiple || 0}x
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-600 mb-1">Monthly Gain</div>
        <div className="text-2xl font-bold text-purple-600">
          ${data.attributed?.monthly_gain?.toLocaleString() || '0'}
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Add Navigation Links in Header

### Update Header Buttons

```typescript
// In header section (around line 403)
<div className="flex gap-10 items-center">
  <button
    onClick={() => setCognitiveModalOpen(true)}
    className="btn primary"
  >
    🧠 Cognitive Dashboard
  </button>
  
  {/* Add ROI Quick Access */}
  <button
    onClick={() => handleTabClick('roi')}
    className="btn secondary"
    style={{ whiteSpace: 'nowrap' }}
  >
    💰 ROI Report
  </button>
  
  <button
    onClick={() => {
      setAIVModalOpen(true);
      handleTabClick('aiv');
    }}
    className="btn primary"
  >
    👁️ AIV™ Score
  </button>
  
  {/* Existing profile/dealer info */}
</div>
```

---

## 6. Create Governance Dashboard Route

### Create `app/dashboard/governance/page.tsx`

```typescript
'use client';
import { useEffect, useState } from 'react';
import ExplainCard from '@/app/dashboards/explain/ExplainCard';
import ExplainChart from '@/app/dashboards/explain/ExplainChart';

export default function GovernanceDashboard() {
  const [healthIndex, setHealthIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/governance/health')
      .then(r => r.json())
      .then(data => setHealthIndex(data.ai_health_index))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Governance & AI Health</h1>
        
        {/* AI Health Index Gauge */}
        {healthIndex !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border">
            <h2 className="text-xl font-semibold mb-4">AI Health Index</h2>
            <div className="text-6xl font-light text-center mb-4">
              {healthIndex.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  healthIndex >= 90 ? 'bg-green-500' :
                  healthIndex >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${healthIndex}%` }}
              />
            </div>
          </div>
        )}

        {/* Explainability Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExplainCard />
          <ExplainChart decisionId="current" />
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Update API Route Mounting

### Ensure routes are accessible

All API routes should already work:
- `/api/attribution` - ✅ Created
- `/api/explain/recent` - ✅ Created
- `/api/explain/chart` - ✅ Created
- `/api/governance/health` - Needs creation (see below)

### Create `app/api/governance/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // Mock health index - replace with actual Prometheus query
  const healthIndex = 92.5;
  
  return NextResponse.json({ ai_health_index: healthIndex });
}
```

---

## 8. Use Shared Constants (Optional Optimization)

### Replace inline arrays with constants

```typescript
// At top of DealershipAIDashboardLA.tsx
import { FEATURES_LIST, PRICING_TIERS, FAQ_DATA } from '@/lib/shared/constants';
import { Container, Card, Button, Badge, ListCheck } from '@/components/ui/primitives';

// Replace inline features array with:
const features = FEATURES_LIST;

// Use primitives in JSX:
<Container maxWidth="7xl">
  <Card variant="elevated" hover>
    {/* content */}
  </Card>
</Container>
```

---

## 9. Testing Checklist

- [ ] ROI tab appears in navigation
- [ ] ROI Dashboard loads with attribution data
- [ ] Explainability cards render in AI Health tab
- [ ] Governance dashboard accessible
- [ ] API endpoints return valid JSON
- [ ] Navigation links work correctly
- [ ] Mobile responsive layout maintained

---

## 10. File Structure Summary

```
app/
├── api/
│   ├── attribution/route.ts          ✅ Created
│   ├── explain/route.ts               ✅ Created
│   ├── explainChart.ts                ✅ Created
│   └── governance/health/route.ts     ⚠️  Needs creation
├── dashboard/
│   ├── page.tsx                       ✅ Exists
│   └── governance/page.tsx            ⚠️  Needs creation
└── components/
    └── DealershipAIDashboardLA.tsx   ⚠️  Needs updates

components/
├── dashboard/
│   ├── ROIDashboard.tsx               ✅ Created
│   └── ROISummaryCard.tsx             ⚠️  Needs creation
└── ui/
    └── primitives.tsx                 ✅ Created

lib/
├── shared/
│   └── constants.ts                   ✅ Created
└── attribution/
    └── revenue-calculator.ts          ✅ Created
```

---

## Quick Integration Steps

1. **Add ROI Tab**: Update `DealershipAIDashboardLA.tsx` tabs array + content
2. **Add Explainability**: Insert `ExplainCard` and `ExplainChart` in AI Health tab
3. **Create Governance Route**: Add `app/dashboard/governance/page.tsx`
4. **Add API Route**: Create `app/api/governance/health/route.ts`
5. **Test**: Verify all tabs load and data displays correctly

---

## Benefits

- ✅ Seamless integration with existing dashboard
- ✅ No breaking changes to current functionality
- ✅ Reusable components reduce code duplication
- ✅ Consistent UI/UX across all features
- ✅ Easy to extend with additional metrics

---

**Total Integration Time: ~15 minutes** ⏱️
