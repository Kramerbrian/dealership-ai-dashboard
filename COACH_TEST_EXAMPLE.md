# Coach Test Example - Complete Code

## Quick Test

```tsx
'use client';

import { useCoachEvent } from '@/hooks/useCoachContext';
import { useUser } from '@clerk/nextjs';

function TestComponent() {
  const { emitEvent } = useCoachEvent();
  const { user } = useUser();

  const testCoach = () => {
    emitEvent({
      dealerId: user?.publicMetadata?.dealer as string || 'test-dealer',
      userId: user?.id || 'test-user',
      persona: 'sales', // Required: 'sales' | 'service' | 'parts' | 'marketing' | 'manager' | 'bdc'
      app: 'dash', // Required: 'dash' | 'orchestrator' | 'store'
      sourceAgent: 'Pulse', // Optional: 'Pulse', 'AIM', 'SchemaKing', etc.
      kind: 'agent_recommendation_ignored', // Required: see CoachEventKind
      context: { // Required: Record<string, any>
        cardId: 'test-card',
        topic: 'trade_followup',
      },
    });
  };

  return <button onClick={testCoach}>Test Coach</button>;
}
```

## Complete Field Reference

### Required Fields

```tsx
emitEvent({
  dealerId: string,        // Dealer/tenant ID
  userId: string,          // User ID (from Clerk)
  persona: CoachPersona,  // 'sales' | 'service' | 'parts' | 'marketing' | 'manager' | 'bdc'
  app: CoachApp,          // 'dash' | 'orchestrator' | 'store'
  kind: CoachEventKind,   // Event type (see below)
  context: Record<string, any>, // Flexible payload
});
```

### Optional Fields

```tsx
emitEvent({
  // ... required fields ...
  sourceAgent: string,    // 'Pulse', 'AIM', 'SchemaKing', 'Compliance', 'UXNUI'
});
```

## Event Kinds (CoachEventKind)

```tsx
'agent_handoff_pending'
'agent_recommendation_ignored'  // Most common
'flow_abandoned'
'error_loop'
'override_without_reason'
'compliance_block_waiting'
'metric_confusion'
'repeated_missed_step'
'ui_deadend'
```

## Real-World Examples

### Example 1: Pulse Card Ignored
```tsx
emitEvent({
  dealerId: 'dealer-123',
  userId: 'user-456',
  persona: 'sales',
  app: 'dash',
  sourceAgent: 'Pulse',
  kind: 'agent_recommendation_ignored',
  context: {
    cardId: 'pulse-card-789',
    cardType: 'high_intent_lead',
    topic: 'trade_followup',
    revenueAtRisk: 1200,
  },
});
```

### Example 2: AIM Override
```tsx
emitEvent({
  dealerId: 'dealer-123',
  userId: 'user-456',
  persona: 'manager',
  app: 'dash',
  sourceAgent: 'AIM',
  kind: 'override_without_reason',
  context: {
    overrideCount: 3,
    vin: '1HGBH41JXMN109186',
    originalValue: 25000,
    overrideValue: 28000,
  },
});
```

### Example 3: Flow Abandoned
```tsx
emitEvent({
  dealerId: 'dealer-123',
  userId: 'user-456',
  persona: 'manager',
  app: 'dash',
  kind: 'flow_abandoned',
  context: {
    flowType: 'pricing',
    flowId: 'flow-abc123',
    step: 2,
    totalSteps: 4,
    timeSpent: 120000, // milliseconds
  },
});
```

### Example 4: Compliance Block
```tsx
emitEvent({
  dealerId: 'dealer-123',
  userId: 'user-456',
  persona: 'manager',
  app: 'dash',
  sourceAgent: 'Compliance',
  kind: 'compliance_block_waiting',
  context: {
    blockId: 'block-xyz789',
    minutesWaiting: 6,
    blockReason: 'price_guardrail',
  },
});
```

## Testing Checklist

1. ✅ Import `useCoachEvent` hook
2. ✅ Get `dealerId` and `userId` (from Clerk user context)
3. ✅ Set `persona` (match user role)
4. ✅ Set `app` ('dash' for dashboard)
5. ✅ Choose `kind` (event type)
6. ✅ Add `context` (any relevant data)
7. ✅ Optionally set `sourceAgent` (which agent triggered this)

## Common Issues

### Issue: "persona" is incomplete
**Fix:** Use one of: `'sales' | 'service' | 'parts' | 'marketing' | 'manager' | 'bdc'`

### Issue: Coach doesn't show
**Possible causes:**
- Cooldown active (wait 5 minutes)
- No matching script for event
- Check browser console for errors
- Verify CoachProvider is in layout

### Issue: Type errors
**Fix:** Import types:
```tsx
import type { CoachEvent } from '@/packages/core-models/src/coach';
```

