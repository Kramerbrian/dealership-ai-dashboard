# CoachEngine

**Agentic Operator Coach** - Monitors agent→human handoffs and injects micro-coaching at the exact moment of need.

## Quick Start

```tsx
import { useCoachEvent } from '@/hooks/useCoachContext';

function MyComponent() {
  const { emitEvent } = useCoachEvent();

  // Emit event when recommendation is ignored
  const handleIgnored = () => {
    emitEvent({
      dealerId: 'dealer-123',
      userId: 'user-456',
      persona: 'sales',
      app: 'dash',
      sourceAgent: 'Pulse',
      kind: 'agent_recommendation_ignored',
      context: { topic: 'trade_followup' },
    });
  };

  return <button onClick={handleIgnored}>Action</button>;
}
```

## API

### `handleCoachEvent(event: CoachEvent): CoachDecision`

Main entry point. Processes event and returns decision (suggestion or null).

### `registerCoachScript(persona, matcher, generator)`

Register custom coaching scripts.

## Scripts

Scripts are organized by persona:
- `sales.ts` - Sales-specific coaching
- `service.ts` - Service advisor coaching
- `managers.ts` - Manager coaching
- `marketing.ts` - Marketing coaching
- `bdc.ts` - BDC coaching

Each script has:
- `id` - Unique identifier
- `persona` - Target persona
- `match` - Function to match events
- `generate` - Function to create suggestion
- `priority` - Higher = more important

## Policies

- **Cooldown**: 5 minutes between popups
- **Daily Limit**: 3 popups per day per persona
- **Severity Filtering**: Low-severity suppressed if too many recent activities

