# DealershipAI Dashboard Setup

## ✅ Default Dashboard Configuration

The **DealershipAIDashboardLA** component is now the default dashboard for the entire DealershipAI project.

### Current Setup

1. **Main Dashboard Route**: `/app/dashboard/page.tsx`
   - Uses `DealershipAIDashboardLA` component
   - Accessible at: `https://dealershipai.com/dashboard`

2. **Routing Configuration**: `next.config.js`
   - `/dash` redirects to `/dashboard` (backwards compatibility)
   - `/admin` redirects to `/dashboard?tab=admin`

### Routes

| Route | Component | Status |
|-------|-----------|--------|
| `/dashboard` | `DealershipAIDashboardLA` | ✅ Default |
| `/dash` | Redirects to `/dashboard` | ✅ Backwards compat |
| `/admin` | Redirects to `/dashboard?tab=admin` | ✅ Backwards compat |

### Component Location

```
app/components/DealershipAIDashboardLA.tsx
```

### Features

- **Tab-based Navigation**: Overview, AI Health, Website, Schema, Reviews, War Room, Settings
- **Cognitive Dashboard Modal**: Accessible via header button
- **HAL-9000 Chatbot**: Integrated AI assistant
- **Real-time Metrics**: SEO, AEO, GEO visibility scores
- **Opportunities Engine**: AI-powered recommendations
- **Competitive Analysis**: Widget integration
- **Quick Wins**: Revenue optimization tools

### Making Dashboard the Homepage (Optional)

If you want the dashboard to be the default homepage (`/`), update `app/page.tsx`:

```typescript
'use client';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

Or render the dashboard directly:

```typescript
'use client';
import DealershipAIDashboardLA from '@/app/components/DealershipAIDashboardLA';

export default function Home() {
  return <DealershipAIDashboardLA />;
}
```

### Testing

1. Visit `http://localhost:3000/dashboard` - Should show DealershipAIDashboardLA
2. Visit `http://localhost:3000/dash` - Should redirect to `/dashboard`
3. Visit `http://localhost:3000/admin` - Should redirect to `/dashboard?tab=admin`

### Notes

- The dashboard uses `'use client'` directive (client-side only)
- Uses `dynamic = 'force-dynamic'` to avoid SSR issues
- All styling is scoped within the component using `<style jsx>`
- Integrates with:
  - `CompetitiveComparisonWidget`
  - `WhatIfRevenueCalculator`
  - `QuickWinsWidget`
  - `DAICognitiveDashboardModal`
  - `HAL9000Chatbot`

