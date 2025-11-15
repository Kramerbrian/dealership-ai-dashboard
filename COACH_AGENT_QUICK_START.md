# CoachAgent_v1 - Quick Start Guide

## 🎯 What is Coach?

Coach is an **embedded Operator Trainer** that watches where humans struggle with agentic workflows and injects 30-second guidance at the exact moment of need.

**One sentence:** "When the OS hands the ball to a human, Coach makes sure it doesn't get dropped."

---

## 🚀 5-Minute Integration

### Step 1: Emit Events from Your Components

```tsx
import { useCoachEvent } from '@/hooks/useCoachContext';

function PulseCard({ card }) {
  const { emitEvent } = useCoachEvent();
  const [openedAt, setOpenedAt] = useState(null);

  useEffect(() => {
    setOpenedAt(Date.now());
    
    // If no action after 2 minutes, trigger coach
    const timer = setTimeout(() => {
      emitEvent({
        dealerId: card.dealerId,
        userId: card.userId,
        persona: 'sales', // Detect from user context
        app: 'dash',
        sourceAgent: 'Pulse',
        kind: 'agent_recommendation_ignored',
        context: {
          cardId: card.id,
          topic: 'trade_followup',
          revenueAtRisk: card.revenueAtRisk,
        },
      });
    }, 2 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [card.id]);

  return <div>Card content</div>;
}
```

### Step 2: Display Coach Suggestions

```tsx
import { useCoach } from '@/hooks/useCoachContext';
import { CoachPopover } from '@/components/coach/CoachPopover';

function MyPage() {
  const { activeSuggestion, acceptSuggestion, dismissSuggestion } = useCoach();

  return (
    <div>
      {/* Your page content */}
      
      {activeSuggestion && (
        <CoachPopover
          suggestion={activeSuggestion}
          onAccept={acceptSuggestion}
          onDismiss={dismissSuggestion}
        />
      )}
    </div>
  );
}
```

### Step 3: That's It!

Coach will automatically:
- ✅ Check cooldown (won't spam)
- ✅ Match event to scripts
- ✅ Generate appropriate suggestion
- ✅ Track outcomes for learning

---

## 📋 Common Integration Patterns

### Pattern 1: Pulse Card Ignored

```tsx
// After 2 minutes of card being open with no action
emitEvent({
  dealerId,
  userId,
  persona: 'sales',
  app: 'dash',
  sourceAgent: 'Pulse',
  kind: 'agent_recommendation_ignored',
  context: { cardId, topic: 'trade_followup' },
});
```

### Pattern 2: Flow Abandoned

```tsx
// When user starts flow but doesn't complete
useEffect(() => {
  const handleBeforeUnload = () => {
    if (!isComplete) {
      emitEvent({
        dealerId,
        userId,
        persona: 'manager',
        app: 'dash',
        kind: 'flow_abandoned',
        context: { flowType: 'pricing', step },
      });
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [step]);
```

### Pattern 3: AIM Override Without Reason

```tsx
// When manager overrides AIM valuation 3+ times without notes
if (overrideCount >= 3 && !hasNotes) {
  emitEvent({
    dealerId,
    userId,
    persona: 'manager',
    app: 'dash',
    sourceAgent: 'AIM',
    kind: 'override_without_reason',
    context: { overrideCount, vin },
  });
}
```

### Pattern 4: Compliance Block Waiting

```tsx
// When compliance block is pending > 5 minutes
if (minutesWaiting > 5) {
  emitEvent({
    dealerId,
    userId,
    persona: 'manager',
    app: 'dash',
    sourceAgent: 'Compliance',
    kind: 'compliance_block_waiting',
    context: { blockId, minutesWaiting },
  });
}
```

### Pattern 5: Error Loop

```tsx
// When same error occurs > 2 times in 24 hours
const errorCount = getErrorCount(errorMessage, 24 * 60 * 60 * 1000);
if (errorCount > 2) {
  emitEvent({
    dealerId,
    userId,
    persona: 'manager',
    app: 'dash',
    kind: 'error_loop',
    context: { errorMessage, errorCount },
  });
}
```

---

## 🎨 UI Placement

### CoachPopover
- Anchor to: Pulse cards, metric tiles, buttons, error states
- Position: Below or to the side of trigger element
- Auto-dismiss: After 30 seconds if no interaction

### CoachSidebar
- Use for: Multi-step guidance flows
- Trigger: When user accepts "Show me" from popover
- Content: Step-by-step checklist or guided walkthrough

### CoachPromptChip
- Use for: Subtle hint that Coach is available
- Placement: Near confusing metrics or complex UI
- Action: Click to manually trigger Coach

---

## 📊 Event Kinds

| Kind | When to Use | Example |
|------|-------------|---------|
| `agent_recommendation_ignored` | User sees recommendation but doesn't act | Pulse card opened, no action after 2 min |
| `flow_abandoned` | User starts flow but doesn't complete | Pricing change started, user navigates away |
| `error_loop` | Same error > 2 times in 24h | User hits same UI dead-end repeatedly |
| `override_without_reason` | User overrides agent decision without notes | AIM valuation overridden 3+ times |
| `compliance_block_waiting` | Compliance approval pending > 5 min | Manager hasn't responded to compliance block |
| `metric_confusion` | User hovers metric + opens help + still doesn't act | DSS metric viewed but no action taken |
| `repeated_missed_step` | User skips same critical step > N times | "Assign follow-up owner" skipped repeatedly |
| `ui_deadend` | UXNUI flags broken path user hits multiple times | Non-functioning CTA clicked repeatedly |

---

## 🧪 Testing

### Test Event Emission
```tsx
const { emitEvent } = useCoachEvent();

// Test with different personas
emitEvent({
  dealerId: 'test',
  userId: 'test',
  persona: 'sales',
  app: 'dash',
  sourceAgent: 'Pulse',
  kind: 'agent_recommendation_ignored',
  context: { topic: 'trade_followup' },
});
```

### Test Cooldown
1. Emit event → Coach shows
2. Emit another within 5 min → Coach doesn't show
3. Wait 5+ min → Coach shows again

### Test Scripts
Each script has a `match` function. Test with different event contexts to see which scripts trigger.

---

## 📝 Adding New Scripts

```tsx
// In packages/coach-engine/src/scripts/sales.ts
import { scriptRegistry } from '../triggers';

scriptRegistry.register({
  id: 'sales.my_new_script.v1',
  persona: 'sales',
  priority: 10,
  match: (e) => 
    e.persona === 'sales' &&
    e.kind === 'agent_recommendation_ignored' &&
    e.context?.myCustomField === 'value',
  generate: (e) => ({
    id: 'sales.my_new_script.v1',
    eventId: e.id,
    persona: 'sales',
    title: 'Your custom title',
    body: 'Your coaching content here...',
    ctaLabel: 'Show me',
    severity: 'nudge',
    estTimeSeconds: 20,
  }),
});
```

---

## 🎯 Success Metrics

Track these to measure Coach effectiveness:
- **Acceptance Rate**: % of suggestions accepted
- **Completion Rate**: % of accepted suggestions that complete flow
- **Time to Complete**: Average seconds to complete guided flow
- **Revenue Impact**: Correlation between Coach usage and reduced Profit Leakage

---

## 🚨 Important Notes

1. **CoachProvider must wrap your app** - Already added to `app/layout.tsx`
2. **Cooldown is enforced** - Won't spam users
3. **Scripts are persona-specific** - Make sure persona matches user role
4. **Telemetry is automatic** - Outcomes are tracked for learning
5. **Money anchor is optional** - But highly recommended for impact

---

**Ready to ship! Start emitting events and Coach will handle the rest.** 🚀

