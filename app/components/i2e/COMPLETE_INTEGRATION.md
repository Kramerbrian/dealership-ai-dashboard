# Complete I2E + Pulse Integration

## ✅ Status: Fully Integrated

The I2E components are now fully integrated with the DealershipAI Pulse API system.

## What's Included

### 1. API Client (`api-client.ts`)
- ✅ `getSnapshot()` - Fetches Pulse snapshot
- ✅ `postRecommendation()` - Submits GPT recommendations
- ✅ `applyFix()` - Executes Tier-2 fixes
- ✅ `postReceipt()` - Logs results for learning loop

### 2. Data Converters (`pulse-integration.ts`)
- ✅ `pulsesToUpdateCards()` - Converts pulses to update cards
- ✅ `pulsesToCorrections()` - Converts pulses to corrections
- ✅ `pulsesToACNs()` - Converts pulses to ACNs
- ✅ `pulseToPlaybook()` - Converts pulse to execution playbook
- ✅ `scoresToUpdateCards()` - Converts score improvements to cards

### 3. React Hook (`usePulseIntegration.ts`)
- ✅ Automatic data fetching with React Query
- ✅ Auto-refresh every 60 seconds
- ✅ Error handling
- ✅ Mutation support for fixes/recommendations/receipts
- ✅ Automatic data conversion to I2E formats

## Quick Start

### Step 1: Import the Hook

```tsx
import { usePulseIntegration } from '@/components/i2e';
```

### Step 2: Use in Your Component

```tsx
function Dashboard() {
  const {
    updates,           // Update cards from pulses
    corrections,       // Quick fixes from pulses
    acns,             // ACNs from high-impact pulses
    selectedPlaybook,  // Currently open playbook
    playbookOpen,      // Playbook open state
    handleACNAction,  // Handler for ACN clicks
    handleCorrectionExecute, // Handler for corrections
    handlePlaybookComplete,  // Handler for playbook completion
    closePlaybook,     // Close playbook
    isLoading         // Loading state
  } = usePulseIntegration();

  // ... rest of component
}
```

### Step 3: Add Components

```tsx
{/* Update Cards */}
<PulseUpdateCardGrid updates={updates} />

{/* Quick Fixes */}
<OneClickCorrectionList
  corrections={corrections}
  onExecute={(id) => {
    const pulseId = id.replace('correction-', '');
    handleCorrectionExecute(pulseId);
  }}
/>

{/* Chart with ACNs */}
<ACNContainer
  nuggets={acns}
  onAction={(id) => {
    const pulseId = id.replace('acn-', '');
    handleACNAction(pulseId);
  }}
>
  <YourChartComponent />
</ACNContainer>

{/* Execution Playbook */}
{selectedPlaybook && (
  <ExecutionPlaybook
    playbook={selectedPlaybook}
    isOpen={playbookOpen}
    onClose={closePlaybook}
    onPlaybookComplete={handlePlaybookComplete}
  />
)}
```

## Data Flow Example

Given this snapshot:
```json
{
  "date": "2025-11-06",
  "dealership": "Terry Reid Hyundai",
  "pulses_closed": [
    {
      "id": "missing_autodealer_schema",
      "deltaUSD": 8200,
      "timeToResolveMin": 17
    }
  ],
  "scores": {
    "AIV": +6,
    "ATI": +3,
    "CVI": +2
  }
}
```

### Automatically Creates:

1. **Update Cards** (5 total):
   - 1 from pulse closure
   - 3 from score improvements (AIV, ATI, CVI)
   - 1 summary card

2. **Corrections** (1 total):
   - "Missing Autodealer Schema" (17 min fix, $8,200 impact)

3. **ACNs** (1 total):
   - "Missing Autodealer Schema Detected" (high impact > $5K)
   - Positioned on chart
   - Opens playbook on click

4. **Playbook** (when ACN clicked):
   - Step 1: Analyze Pulse (auto-execute)
   - Step 2: Apply Fix (auto-execute)
   - Step 3: Verify Results (manual)

## Complete Example

```tsx
"use client";

import {
  PulseUpdateCardGrid,
  ACNContainer,
  ExecutionPlaybook,
  OneClickCorrectionList,
  usePulseIntegration
} from '@/components/i2e';

export default function PulseDashboard() {
  const {
    updates,
    corrections,
    acns,
    selectedPlaybook,
    playbookOpen,
    handleACNAction,
    handleCorrectionExecute,
    handlePlaybookComplete,
    closePlaybook,
    isLoading,
    error
  } = usePulseIntegration();

  if (isLoading) {
    return <div>Loading pulse data...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Updates Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <PulseUpdateCardGrid updates={updates} maxItems={6} />
      </section>

      {/* Quick Fixes Section */}
      {corrections.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Fixes Available</h2>
          <OneClickCorrectionList
            corrections={corrections}
            onExecute={(id) => {
              const pulseId = id.replace('correction-', '');
              handleCorrectionExecute(pulseId);
            }}
            maxItems={5}
          />
        </section>
      )}

      {/* Analytics with ACNs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Analytics Dashboard</h2>
        <ACNContainer
          nuggets={acns}
          onAction={(id) => {
            const pulseId = id.replace('acn-', '');
            handleACNAction(pulseId);
          }}
          className="relative bg-white rounded-2xl border border-gray-200 p-6 min-h-[400px]"
        >
          {/* Your chart component */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p>Chart visualization area - ACNs appear as overlays</p>
          </div>
        </ACNContainer>
      </section>

      {/* Execution Playbook */}
      {selectedPlaybook && (
        <ExecutionPlaybook
          playbook={selectedPlaybook}
          isOpen={playbookOpen}
          onClose={closePlaybook}
          onStepComplete={(stepId) => {
            console.log('Step completed:', stepId);
          }}
          onPlaybookComplete={handlePlaybookComplete}
        />
      )}
    </div>
  );
}
```

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orchestrator/snapshot` | GET | Fetch current pulse state |
| `/api/pulse/recommend` | POST | Submit GPT recommendations |
| `/api/fix/apply` | POST | Execute fixes (preview/apply/autopilot) |
| `/api/ledger/receipt` | POST | Log results for learning loop |

## Features

✅ **Automatic Data Fetching** - React Query handles caching and refetching  
✅ **Real-time Updates** - Auto-refreshes every 60 seconds  
✅ **Error Handling** - Built-in error states and retries  
✅ **Learning Loop** - Receipts logged for AI improvement  
✅ **Type Safety** - Full TypeScript support  
✅ **Performance** - Request deduplication and caching  

## Environment Setup

Set API URL (optional, defaults to production):
```env
NEXT_PUBLIC_API_URL=https://dash.dealershipai.com
```

## Next Steps

1. ✅ Integration complete
2. Add to your dashboard component
3. Customize styling if needed
4. Add analytics tracking
5. Test with real Pulse data

## Files Created

- `api-client.ts` - API client functions
- `pulse-integration.ts` - Data conversion utilities
- `usePulseIntegration.ts` - React hook
- `PULSE_INTEGRATION_GUIDE.md` - Detailed guide
- `COMPLETE_INTEGRATION.md` - This file

All components are ready for production use! 🚀

