# Pulse System Integration Guide

## Overview

The I2E components are now fully integrated with the DealershipAI Pulse API. This allows real-time data from the Pulse system to automatically populate Update Cards, Corrections, ACNs, and Execution Playbooks.

## API Endpoints

The integration uses these endpoints:

- `GET /api/orchestrator/snapshot` - Get Pulse snapshot
- `POST /api/pulse/recommend` - Submit recommendations
- `POST /api/fix/apply` - Execute fixes
- `POST /api/ledger/receipt` - Log results

## Data Structure

The snapshot API returns:

```typescript
{
  date: "2025-11-06",
  dealership: "Terry Reid Hyundai",
  pulses_closed: [
    {
      id: "missing_autodealer_schema",
      deltaUSD: 8200,
      timeToResolveMin: 17
    }
  ],
  scores: {
    AIV: +6,
    ATI: +3,
    CVI: +2
  }
}
```

## Quick Integration

### Step 1: Use the Hook

```tsx
import { usePulseIntegration } from '@/components/i2e';

function Dashboard() {
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
    isLoading
  } = usePulseIntegration();

  // ... rest of component
}
```

### Step 2: Add Components

```tsx
{/* Update Cards */}
<PulseUpdateCardGrid 
  updates={updates}
  maxItems={6}
/>

{/* Corrections */}
<OneClickCorrectionList
  corrections={corrections}
  onExecute={(id) => {
    const pulseId = id.replace('correction-', '');
    handleCorrectionExecute(pulseId);
  }}
/>

{/* ACNs on Charts */}
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

## Data Flow

1. **Snapshot Fetch** → `getSnapshot()` fetches current state
2. **Data Conversion** → Pulse data converted to I2E formats:
   - `pulses_closed` → Update Cards + Corrections + ACNs
   - `scores` → Update Cards
3. **User Action** → User clicks ACN or Correction
4. **Fix Execution** → `applyFix()` called with pulse ID
5. **Receipt Logging** → `postReceipt()` logs result for learning loop

## Automatic Conversions

### Pulses → Update Cards
- Each closed pulse becomes an update card
- Shows revenue impact and resolution time
- Includes score improvements

### Pulses → Corrections
- Quick fixes (< 30 min) become corrections
- Shows estimated time and revenue impact
- One-click execution

### Pulses → ACNs
- High-impact pulses (> $5K) become ACNs
- Positioned on charts
- Opens playbook on click

### Pulses → Playbooks
- Multi-step execution sequence
- Auto-executes first 2 steps
- Logs receipt on completion

## Example: Complete Integration

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
    isLoading
  } = usePulseIntegration();

  if (isLoading) {
    return <div>Loading pulse data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Updates */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <PulseUpdateCardGrid updates={updates} />
      </section>

      {/* Quick Fixes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Fixes</h2>
        <OneClickCorrectionList
          corrections={corrections}
          onExecute={(id) => {
            const pulseId = id.replace('correction-', '');
            handleCorrectionExecute(pulseId);
          }}
        />
      </section>

      {/* Chart with ACNs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
        <ACNContainer
          nuggets={acns}
          onAction={(id) => {
            const pulseId = id.replace('acn-', '');
            handleACNAction(pulseId);
          }}
          className="relative bg-white rounded-2xl p-6 min-h-[400px]"
        >
          <YourChartComponent />
        </ACNContainer>
      </section>

      {/* Playbook */}
      {selectedPlaybook && (
        <ExecutionPlaybook
          playbook={selectedPlaybook}
          isOpen={playbookOpen}
          onClose={closePlaybook}
          onPlaybookComplete={handlePlaybookComplete}
        />
      )}
    </div>
  );
}
```

## Environment Variables

Set the API base URL:

```env
NEXT_PUBLIC_API_URL=https://dash.dealershipai.com
```

Or it defaults to `https://dash.dealershipai.com`

## Error Handling

The hook includes error handling:

```tsx
const { error } = usePulseIntegration();

if (error) {
  return <div>Error loading pulse data: {error.message}</div>;
}
```

## Auto-Refresh

The snapshot automatically refetches:
- Every 60 seconds
- When mutations complete
- On manual `refetch()` call

## Learning Loop

The system logs receipts for the learning loop:

1. User executes fix
2. Playbook completes
3. Receipt posted with:
   - `pulseId`
   - `deltaUSD` (actual impact)
   - `success` (boolean)
   - `notes` (optional)

This feeds back into the AI to improve recommendations.

