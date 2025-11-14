# Pulse Cards Integration Guide

## Overview

Pulse Cards have been integrated into the dashboard system. This guide shows how to use them in your components.

## Components

### 1. `PulseCardGrid` Component

**Location:** `components/pulse/PulseCardGrid.tsx`

**Usage:**
```tsx
import { PulseCardGrid } from "@/components/pulse/PulseCardGrid";

<PulseCardGrid 
  domain="exampledealer.com"
  tenant="default"
  role="dealer"
  onCardClick={(card) => {
    // Handle card click - open detail drawer, navigate, etc.
    console.log('Card clicked:', card);
  }}
/>
```

**Props:**
- `domain` (required): Dealer domain
- `tenant` (optional): Tenant ID
- `role` (optional): User role
- `onCardClick` (optional): Callback when card is clicked

**Features:**
- ✅ Auto-fetches cards from `/api/analyzePulseTelemetry`
- ✅ Displays summary stats (total cards, revenue at risk, AVI, critical issues)
- ✅ Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)
- ✅ Severity-based styling (critical=red, high=orange, medium=yellow, low=green)
- ✅ Category icons and badges
- ✅ Loading and error states
- ✅ Cards sorted by severity (critical first)

## Integration Points

### Already Integrated

✅ **PulseOverview Component** (`components/dashboard/PulseOverview.tsx`)
- Pulse cards now appear below Priority Actions
- Uses the domain from props
- Cards are clickable (logs to console, ready for drawer integration)

### Where to Add Next

1. **Dashboard Home Page** (`app/dash/page.tsx`)
   - Add Pulse cards as a main section
   - Show top 3 critical cards prominently

2. **Priority Actions Panel**
   - Filter cards by severity (critical/high only)
   - Show as actionable items

3. **Card Detail Drawer**
   - Create a drawer component that opens when card is clicked
   - Show full card details, historical trends, related actions

## Customization

### Card Messages

Card messages are customized in `lib/pulse/fromClarity.ts` based on score ranges:

**AVI Card:**
- 80+: "You're doing well, but there's still room to improve"
- 60-79: "AI knows you exist, but you're not standing out"
- 40-59: "AI knows you exist, but you are easy to skip"
- <40: "AI barely knows you exist. This is costing you customers."

**Schema Card:**
- 80+: "Most pages have structured data, but a few gaps remain"
- 60-79: Shows specific issue
- <60: "This is hurting your AI visibility"

### Adding Custom Cards

To add a new card type, edit `lib/pulse/fromClarity.ts`:

```typescript
// Add after existing cards
cards.push({
  key: 'custom_metric',
  title: 'Custom Metric',
  severity: severityFromScore(customScore),
  summary: 'Your custom metric description...',
  whyItMatters: 'Why this matters to dealers...',
  recommendedAction: 'What to do about it...',
  estimatedImpact: 'Expected impact...',
  category: 'Visibility' // or Schema, GBP, UGC, Competitive, Narrative
});
```

## API Usage

### Direct API Calls

```typescript
// Get cards
const res = await fetch('/api/analyzePulseTelemetry?domain=exampledealer.com');
const { cards, summary } = await res.json();

// Get metrics
const metricsRes = await fetch('/api/getPulseMetrics?domain=exampledealer.com');
const { metrics } = await metricsRes.json();
```

### React Hook (Optional)

Create a custom hook for easier usage:

```typescript
// hooks/usePulseCards.ts
import { useState, useEffect } from 'react';
import type { PulseCard } from '@/types/pulse';

export function usePulseCards(domain: string) {
  const [cards, setCards] = useState<PulseCard[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/analyzePulseTelemetry?domain=${domain}`)
      .then(res => res.json())
      .then(data => {
        setCards(data.cards || []);
        setSummary(data.summary || null);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [domain]);

  return { cards, summary, loading, error };
}
```

## Testing

### Test Page

Visit: `http://localhost:3000/test/pulse-cards`

Features:
- Test both endpoints
- View cards with styling
- See aggregated metrics
- Copy usage examples

### Test Script

```bash
./scripts/test-pulse-endpoints.sh exampledealer.com
```

## Next Steps

1. ✅ **Test endpoints** - Run test script
2. ✅ **Visit test page** - `/test/pulse-cards`
3. ✅ **Integrated into PulseOverview** - Cards appear in dashboard
4. 🔄 **Add card detail drawer** - Create drawer component
5. 🔄 **Add to dashboard home** - Show top cards on main dashboard
6. 🔄 **Add filtering** - Filter by severity/category
7. 🔄 **Add historical trends** - Show card score changes over time

## Files

- `components/pulse/PulseCardGrid.tsx` - Main card grid component
- `components/dashboard/PulseOverview.tsx` - Integrated Pulse cards
- `lib/pulse/fromClarity.ts` - Card generation logic
- `types/pulse.ts` - Type definitions
- `app/api/analyzePulseTelemetry/route.ts` - Cards endpoint
- `app/api/getPulseMetrics/route.ts` - Metrics endpoint
- `app/test/pulse-cards/page.tsx` - Test page

