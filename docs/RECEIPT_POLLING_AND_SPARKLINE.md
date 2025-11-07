# Receipt Polling & AIV Sparkline Implementation

## Overview

Two enhancements that complete the Clay loop (*Identify → Solve → Actionable*):

1. **Live-polling fix receipts** until final delta lands in Impact Ledger
2. **Sparkline trend** in AIV Composite hovercard showing 7-day momentum

## 1. Receipt Polling System

### Components

#### `lib/hooks/useReceiptPolling.ts`
- Polls `/api/fix/status/:id` every 15 seconds
- Only polls receipts with `deltaUSD === undefined` (pending)
- Automatically updates ledger when final delta arrives

#### `components/pulse/ImpactLedgerPro.tsx`
- Enhanced ledger with pending UI
- Shows spinner for pending receipts
- Updates automatically via polling hook
- Displays "Undone" status for reversed fixes

#### `app/api/fix/status/[id]/route.ts`
- Status endpoint for polling
- Returns current receipt state (deltaUSD, undone, finalized)
- TODO: Replace synthetic data with database query

### Flow

```
User clicks "Fix" → Receipt created with deltaUSD: undefined
                  ↓
            Polling starts (15s interval)
                  ↓
    Background job computes final delta
                  ↓
    Status endpoint returns final deltaUSD
                  ↓
    Ledger automatically updates with final value
```

### Usage

```tsx
// In app/drive/page.tsx
const [ledger, setLedger] = useState<any[]>([]);

function patchReceipt(id: string, patch: Partial<any>) {
  setLedger(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
}

// Receipt starts with deltaUSD: undefined (pending)
setLedger(prev => [{
  id: json.receiptId,
  deltaUSD: undefined, // Will be updated by polling
  // ...
}, ...prev]);

// ImpactLedgerPro handles polling automatically
<ImpactLedgerPro
  receipts={ledger}
  onPatch={patchReceipt}
  onExport={(fmt) => console.log('export', fmt)}
/>
```

## 2. AIV Sparkline Trend

### Components

#### `app/api/visibility/history/route.ts`
- Returns last 7 days of AIV composite scores
- Synthetic data (TODO: Replace with database)
- Cached for 5 minutes

#### `components/visibility/Sparkline.tsx`
- Inline SVG sparkline (no dependencies, ~1kb)
- Color shifts to red if trend is negative
- Accessible with ARIA labels

#### `components/visibility/AIVCompositeChip.tsx`
- Fetches history on mount
- Displays sparkline in hovercard
- Shows "AIV 7-day trend" section

### Features

- **Zero dependencies**: Pure SVG, no charting libraries
- **Color coding**: Red tint for negative trends
- **Responsive**: Scales with container
- **Accessible**: ARIA labels for screen readers

### Usage

```tsx
// Already integrated in AIVCompositeChip
const [history, setHistory] = useState<number[] | null>(null);

useEffect(() => {
  fetch(`/api/visibility/history?domain=${domain}`)
    .then(r => r.json())
    .then(json => setHistory(json?.aiv || null));
}, [domain]);

// In hovercard:
{history && history.length >= 2 && (
  <div className="mt-3 border-t border-white/10 pt-3">
    <div className="text-xs text-white/60 mb-1">AIV 7-day trend</div>
    <Sparkline values={history} width={260} height={50} />
  </div>
)}
```

## 3. Why This Matters (Clay Lens)

### Identify
- **AIV hovercard** shows momentum, not just a point-in-time score
- **Pending fixes** are visibly pending until they land
- **Trend visualization** helps operators see direction

### Solve
- **Simulate → Apply → Background job → Final delta**
- No frozen spinners or manual refresh needed
- Receipts update automatically when ready

### Actionable
- **Impact Ledger** provides instant proof of fixes
- **Real-time updates** show operators their impact immediately
- **Trend data** helps prioritize which fixes matter most

## 4. Next Steps

### Database Integration
1. **Receipts table**: Store receipts with `deltaUSD`, `finalized`, `undone`
2. **Presence history**: Store daily AIV snapshots
3. **Status endpoint**: Query database instead of synthetic data

### Enhancements
1. **Color shift**: Already implemented (red for negative trends)
2. **Full history drawer**: Add "View full history" link
3. **Finalized checkmark**: Show checkmark when final delta lands
4. **Per-engine sparklines**: Show individual engine trends

### Optional Polish
- Add "View full history" link to open Visibility Drawer
- Show per-engine mini-sparklines in drawer
- Add presence deltas by day
- Implement gradual rollout for model updates

## 5. API Endpoints

### `GET /api/fix/status/:id`
Returns current receipt status for polling.

**Response:**
```json
{
  "id": "receipt-123",
  "deltaUSD": 8200,
  "undone": false,
  "finalized": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### `GET /api/visibility/history?domain=example.com`
Returns last 7 days of AIV composite scores.

**Response:**
```json
{
  "domain": "example.com",
  "days": ["2024-01-09", "2024-01-10", ...],
  "aiv": [86, 88, 85, 87, 90, 89, 92]
}
```

## 6. Testing

### Test Receipt Polling
1. Apply a fix from dashboard
2. Check Impact Ledger shows "pending…"
3. Wait 15-30 seconds
4. Verify receipt updates with final delta

### Test Sparkline
1. Hover over AIV Composite chip
2. Verify sparkline appears in hovercard
3. Check color (red if negative trend)
4. Verify 7-day data points

## 7. Deployment Status

✅ **Deployed successfully**
- Production URL: https://dealership-ai-dashboard-jwgivzqtc-brian-kramers-projects.vercel.app
- All components integrated
- Polling and sparkline working

