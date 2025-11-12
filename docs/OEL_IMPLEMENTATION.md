# OEL (Opportunity Efficiency Loss) - Implementation Guide

## Overview

OEL quantifies the combined dollar value of wasted ad spend and lost qualified leads due to visibility gaps. It's a CFO-friendly metric that answers "Where is my money leaking?"

## Formula

```
OEL = (Wasted Ad Spend) + (Lost Qualified Lead Value) - (Recovered)

Where:
- Wasted Ad Spend = Ad Spend × Ad Waste %
- Lost Qualified Lead Value = Visitors × Visibility Loss % × Lead Conv Rate × Avg Lead Value
- Recovered = Recovered revenue from fixes
```

## Components

### 1. API Endpoint

**Path:** `/api/metrics/oel`

**Method:** GET

**Parameters:**
- `domain` (required): Dealership domain
- `adSpend` (optional): Monthly ad spend in USD (default: 12000)
- `adWastePct` (optional): Waste percentage 0-1 (default: 0.45)
- `visitors` (optional): Monthly visitors (default: 2500)
- `visibilityLossPct` (optional): Visibility loss 0-1 (default: 0.25)
- `leadConvPct` (optional): Lead conversion rate 0-1 (default: 0.05)
- `leadValue` (optional): Average lead value in USD (default: 450)
- `recovered` (optional): Recovered revenue (default: 3800)
- `months` (optional): Number of months for trend (default: 6)

**Response:**
```json
{
  "domain": "terryreidhyundai.com",
  "inputs": {
    "adSpend": 12000,
    "adWastePct": 0.45,
    "visitors": 2500,
    "visibilityLossPct": 0.25,
    "leadConvRatePct": 0.05,
    "avgLeadValue": 450,
    "recovered": 3800
  },
  "wastedSpend": 5400,
  "lostLeadsValue": 14063,
  "oel": 15663,
  "score": 65.2,
  "series": [
    { "period": "2024-07", "oel": 16200 },
    { "period": "2024-08", "oel": 15800 },
    ...
  ]
}
```

### 2. React Hook

**File:** `app/(dashboard)/hooks/useOEL.ts`

**Usage:**
```tsx
import { useOEL } from '@/app/(dashboard)/hooks/useOEL';

function MyComponent() {
  const { data, loading, err } = useOEL('terryreidhyundai.com');
  
  if (loading) return <div>Loading...</div>;
  if (err) return <div>Error: {err}</div>;
  
  return <div>OEL: ${data?.oel.toLocaleString()}</div>;
}
```

### 3. UI Components

#### OelCard

**File:** `app/(dashboard)/components/metrics/OelCard.tsx`

**Features:**
- Displays OEL amount and efficiency score
- Color-coded by severity (good/warning/alert)
- Trendline chart (6 months)
- Decision feed integration (alerts on high OEL)

**Props:**
- `domain: string` - Dealership domain
- `onOpen: () => void` - Callback to open modal

#### OelModal

**File:** `app/(dashboard)/components/metrics/OELModal.tsx`

**Features:**
- Detailed breakdown (wasted spend, lost leads, recovered, net OEL)
- Scenario controls (sliders for all inputs)
- Real-time recalculation
- Fix Pack integration

**Props:**
- `domain: string` - Dealership domain
- `open: boolean` - Modal visibility
- `onClose: () => void` - Close callback

### 4. Voice Commands

**File:** `lib/voice/commandRouter.ts`

**Commands:**
- "opportunity efficiency loss" → Reports OEL amount and score
- "o e l" → Same as above
- "lost opportunity" → Same as above
- "open o e l" → Opens OEL modal
- "open opportunity loss" → Opens OEL modal

### 5. Decision Feed Integration

**File:** `app/(dashboard)/components/metrics/OelCard.tsx`

**Triggers:**
- OEL > $15,000 → Alert severity
- OEL > $10,000 → Warning severity

**Event Format:**
```typescript
{
  title: "High Opportunity Efficiency Loss",
  description: "OEL at $15,663/month. Consider reviewing Fix Pack...",
  impact: "$15,663",
  severity: "alert"
}
```

## Integration Example

```tsx
import { OelCard } from '@/app/(dashboard)/components/metrics/OelCard';
import OelModal from '@/app/(dashboard)/components/metrics/OELModal';

function Dashboard() {
  const [showOel, setShowOel] = useState(false);
  const domain = 'terryreidhyundai.com';

  return (
    <>
      <OelCard domain={domain} onOpen={() => setShowOel(true)} />
      
      {showOel && (
        <OelModal
          domain={domain}
          open={showOel}
          onClose={() => setShowOel(false)}
        />
      )}
    </>
  );
}
```

## Future Enhancements

1. **Channel Breakdown:** OEL by Google Ads, Meta, Display, Organic
2. **Orchestrator Integration:** Pull real ad spend data from connected accounts
3. **Fix Pack ROI:** Map OEL reduction to actual recovered dollars
4. **Predictive Modeling:** Forecast OEL based on planned fixes
5. **Channel-Level API:** `/api/metrics/oel/channels?domain=...`

## Testing

```bash
# Test API
curl "http://localhost:3000/api/metrics/oel?domain=terryreidhyundai.com"

# Test with custom inputs
curl "http://localhost:3000/api/metrics/oel?domain=test.com&adSpend=20000&adWastePct=0.5"
```

## Status

✅ API endpoint implemented
✅ React hook created
✅ UI components built
✅ Dashboard integration complete
✅ Voice commands added
✅ Decision feed integration added
✅ KPI mappings updated

---

*Last Updated: 2025-01-05*

