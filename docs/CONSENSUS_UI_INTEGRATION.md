# Consensus Status UI Integration

## Overview

The Consensus Status UI displays visual indicators for issue reliability based on agreement across multiple AI engines (Perplexity, ChatGPT, Gemini).

## Implementation

### Components

1. **`ConsensusBadge`** (`components/pulse/ConsensusBadge.tsx`)
   - Visual badge showing consensus status
   - Three states: Unanimous, Majority, Weak
   - Displays engine count and names

2. **`PulseCard`** (`components/pulse/PulseCard.tsx`)
   - Integrated consensus badge into context chips
   - Automatically displays when consensus data is available

### Types

Updated `PulseCard` type in `lib/types/pulse.ts` to include:
```typescript
context?: {
  // ... existing fields
  issueHits?: Array<{ id: string; engine: 'perplexity' | 'chatgpt' | 'gemini' }>;
  consensus?: 'unanimous' | 'majority' | 'weak';
  issueId?: string;
}
```

## Visual Design

### Unanimous (3/3 engines)
- **Color:** Green (emerald)
- **Icon:** CheckCircle2 ✓
- **Meaning:** All engines agree - safe to auto-fix
- **Action:** Can be auto-fixed without approval

### Majority (2/3 engines)
- **Color:** Yellow (amber)
- **Icon:** AlertTriangle ⚠
- **Meaning:** Most engines agree - review recommended
- **Action:** Requires human approval before fixing

### Weak (1/3 engines)
- **Color:** Gray
- **Icon:** Info ℹ
- **Meaning:** Only one engine detected - log only
- **Action:** Logged for awareness, no auto-fix

## Usage

### In API Responses

When creating pulse cards with consensus data:

```typescript
const pulseCard: PulseCard = {
  id: 'pulse_123',
  title: 'Missing schema on VDP pages',
  level: 'high',
  kind: 'kpi_delta',
  context: {
    kpi: 'schema_coverage',
    issueHits: [
      { id: 'schema_missing_vdp', engine: 'perplexity' },
      { id: 'schema_missing_vdp', engine: 'chatgpt' },
      { id: 'schema_missing_vdp', engine: 'gemini' },
    ],
    consensus: 'unanimous', // Explicit consensus status
    issueId: 'schema_missing_vdp',
  },
};
```

### Automatic Detection

The badge will automatically appear if:
1. `context.consensus` is set (explicit status)
2. `context.issueHits` is provided (derived from hits)

### Helper Function

```typescript
import { getConsensusStatusFromHits } from '@/components/pulse/ConsensusBadge';

const status = getConsensusStatusFromHits(issueHits, issueId);
// Returns: 'unanimous' | 'majority' | 'weak' | null
```

## Integration Points

### Auto-Fix Endpoint

The `/api/pulse/[id]/fix` endpoint already checks consensus:
- Unanimous issues: Auto-fixed immediately
- Majority issues: Return `requiresApproval: true`
- Weak issues: Logged only

### Pulse Card Creation

When creating pulse cards from issues:
1. Include `issueHits` array with engine detections
2. Set `consensus` status explicitly (optional, will be derived)
3. Set `issueId` to link hits to the issue

## Example

```typescript
// Example: Creating a pulse card with consensus
const issueHits = [
  { id: 'missing_schema', engine: 'perplexity' },
  { id: 'missing_schema', engine: 'chatgpt' },
  { id: 'missing_schema', engine: 'gemini' },
];

const card: PulseCard = {
  id: 'pulse_schema_issue',
  title: 'Schema coverage below threshold',
  level: 'high',
  kind: 'kpi_delta',
  context: {
    kpi: 'schema_coverage',
    issueHits,
    consensus: 'unanimous', // All 3 engines agree
    issueId: 'missing_schema',
  },
  actions: ['fix', 'open'],
};
```

## Testing

To test the consensus badge:

1. Create a pulse card with `issueHits`:
```typescript
const testCard: PulseCard = {
  id: 'test_consensus',
  title: 'Test Consensus Badge',
  level: 'medium',
  kind: 'kpi_delta',
  context: {
    issueHits: [
      { id: 'test_issue', engine: 'perplexity' },
      { id: 'test_issue', engine: 'chatgpt' },
    ],
    issueId: 'test_issue',
  },
};
```

2. Render the card:
```tsx
<PulseCardComponent card={testCard} />
```

3. The badge should show "Majority (2/3)" in amber/yellow.

## Future Enhancements

- [ ] Add tooltip with detailed engine breakdown
- [ ] Show engine confidence scores
- [ ] Add filter by consensus status
- [ ] Show consensus history over time

