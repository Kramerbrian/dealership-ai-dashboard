# ✅ CoachAgent_v1 - Implementation Complete

**Date:** 2025-01-16  
**Status:** Core System Implemented ✅ | Ready for Integration

---

## 🎯 What Was Built

### 1. **Core Types & Models** ✅
- `packages/core-models/src/coach.ts` - All shared types
- CoachPersona, CoachEventKind, CoachEvent, CoachSuggestion, CoachDecision
- HandoffState protocol types

### 2. **Coach Engine** ✅
- `packages/coach-engine/src/index.ts` - Main event handler
- `packages/coach-engine/src/triggers.ts` - Script matching system
- `packages/coach-engine/src/policies.ts` - Cooldown & rate limiting
- `packages/coach-engine/src/telemetry.ts` - Learning loop

### 3. **Persona Scripts** ✅
- `packages/coach-engine/src/scripts/sales.ts` - 3 scripts
- `packages/coach-engine/src/scripts/service.ts` - 2 scripts
- `packages/coach-engine/src/scripts/managers.ts` - 3 scripts
- `packages/coach-engine/src/scripts/marketing.ts` - 2 scripts
- `packages/coach-engine/src/scripts/bdc.ts` - 2 scripts

**Total: 12 micro-coaching scripts ready**

### 4. **UI Components** ✅
- `app/components/coach/CoachPopover.tsx` - Minimal glassy popover
- `app/components/coach/CoachSidebar.tsx` - Side drawer for longer flows
- `app/components/coach/CoachPromptChip.tsx` - Subtle hint chip

### 5. **React Hooks & Context** ✅
- `app/hooks/useCoachContext.ts` - CoachProvider & useCoach hook
- `app/hooks/useCoachContext.ts` - useCoachEvent hook for emitting events

### 6. **API Routes** ✅
- `app/api/coach/telemetry/route.ts` - Record outcomes
- `app/api/coach/metrics/[scriptId]/route.ts` - Get script effectiveness

### 7. **Orchestrator Integration** ✅
- `app/orchestrator/src/agents/coach/coachAgent.ts` - Agent integration
- `app/orchestrator/src/agents/coach/coachPolicies.ts` - Orchestrator-specific rules

### 8. **Database** ✅
- `coach_telemetry` table - Stores outcomes
- `coach_events` table - Stores events (optional)
- RLS policies configured

---

## 📦 Package Structure

```
packages/
  core-models/
    src/
      coach.ts              # Shared types
  coach-engine/
    src/
      index.ts              # Main handler
      triggers.ts           # Script registry
      policies.ts          # Cooldown logic
      telemetry.ts         # Learning loop
      scripts/
        index.ts           # Registry
        sales.ts           # Sales scripts
        service.ts         # Service scripts
        managers.ts        # Manager scripts
        marketing.ts       # Marketing scripts
        bdc.ts             # BDC scripts

app/
  components/
    coach/
      CoachPopover.tsx     # Main UI
      CoachSidebar.tsx     # Side drawer
      CoachPromptChip.tsx  # Hint chip
      CoachIntegrationExample.tsx  # Examples
  hooks/
    useCoachContext.ts     # React context & hooks
  api/
    coach/
      telemetry/route.ts   # Telemetry endpoint
      metrics/[scriptId]/route.ts  # Metrics endpoint
  orchestrator/
    src/
      agents/
        coach/
          coachAgent.ts    # Agent integration
          coachPolicies.ts # Policies
```

---

## 🚀 How to Use

### 1. **Emit Coach Events from Components**

```tsx
import { useCoachEvent } from '@/hooks/useCoachContext';

function MyComponent() {
  const { emitEvent } = useCoachEvent();

  const handleRecommendationIgnored = () => {
    emitEvent({
      dealerId: 'dealer-123',
      userId: 'user-456',
      persona: 'sales',
      app: 'dash',
      sourceAgent: 'Pulse',
      kind: 'agent_recommendation_ignored',
      context: {
        cardId: 'card-789',
        topic: 'trade_followup',
      },
    });
  };

  return <button onClick={handleRecommendationIgnored}>Action</button>;
}
```

### 2. **Display Coach Suggestions**

```tsx
import { useCoach } from '@/hooks/useCoachContext';
import { CoachPopover } from '@/components/coach/CoachPopover';

function MyComponent() {
  const { activeSuggestion, acceptSuggestion, dismissSuggestion } = useCoach();

  return (
    <div>
      {/* Your content */}
      
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

### 3. **Integrate with Pulse Cards**

See `app/components/pulse/PulseCard.tsx.example` for full example.

Key pattern:
- Track when card is opened
- Set timeout (2 minutes)
- If no action, emit `agent_recommendation_ignored` event
- Coach will show suggestion if cooldown allows

---

## 🎨 UI Design

### CoachPopover
- Glassy, minimal design
- Severity-based colors (info/nudge/warning/critical)
- Money anchor display
- Time estimate
- "Show me" / "Not now" actions

### Design Principles
- ✅ Small (max-w-sm)
- ✅ Friendly (helpful tone)
- ✅ Fast (10-45 seconds)
- ✅ Helpful (actionable)
- ✅ Never needy (cooldown enforced)

---

## 📊 Telemetry & Learning

### Tracked Outcomes
- `accepted` - User clicked "Show me"
- `dismissed` - User clicked "Not now"
- `ignored` - User didn't interact
- `completed_flow` - User completed the guided flow
- `abandoned_flow` - User started but didn't finish

### Metrics Available
- Acceptance rate per script
- Completion rate per script
- Average time to complete
- Revenue impact correlation

---

## 🔧 Cooldown Logic

**Prevents Coach from becoming Clippy:**

- Max 1 popup per user every **5 minutes**
- Max **3 popups per day** per persona
- Critical severity can bypass slightly (5 per day)

**Implementation:**
- In-memory cache (use Redis in production)
- Automatic daily reset
- Per-user, per-persona tracking

---

## 📝 Next Steps

### Phase 1: Silent Listener (Current)
✅ Core system built
✅ Event emission ready
⏳ Wire up event emission from:
  - Pulse cards
  - AIM appraisals
  - Schema King recommendations
  - Compliance blocks
  - UXNUI deadends

### Phase 2: Narrow Pilot
- Enable Coach for Sales + Managers only
- 5-10 scripts active
- Feature flag per rooftop

### Phase 3: Expand
- Add Service, Parts, Marketing, BDC
- Add more triggers
- Add more scripts

### Phase 4: OEM Certification
- Aggregate telemetry
- Build "AI Operator Readiness" score
- Dashboard for adoption metrics

---

## 🧪 Testing

### Test Event Emission
```tsx
const { emitEvent } = useCoachEvent();

// Test sales script
emitEvent({
  dealerId: 'test-dealer',
  userId: 'test-user',
  persona: 'sales',
  app: 'dash',
  sourceAgent: 'Pulse',
  kind: 'agent_recommendation_ignored',
  context: { topic: 'trade_followup' },
});
```

### Test Cooldown
- Emit event → Coach shows
- Emit another event within 5 minutes → Coach doesn't show (cooldown)
- Wait 5+ minutes → Coach shows again

---

## 📚 Script Examples

### Sales - Trade Recommendation Ignored
```
Title: "Want the 10-second version of what you're skipping?"
Body: "The system flagged this customer because they're 3× more likely to trade out in the next 30 days. If this step gets skipped, your store gives away an average of $450–$900 in front-end and F&I."
Time: 20 seconds
Money: $450-$900
```

### Manager - Profit Leakage Ignored
```
Title: "This tile isn't abstract"
Body: "It's estimating how much gross walks out the door when decisions stall. Want the one move that closes the biggest gap this week?"
Time: 25 seconds
Money: $5,000-$15,000
```

---

## 🎯 Key Features

✅ **Event-Driven** - Coach wakes up only when needed  
✅ **Persona-Aware** - Different scripts for Sales/Service/Managers/etc.  
✅ **Money-Anchored** - Shows revenue impact  
✅ **Time-Bounded** - Always under 45 seconds  
✅ **Cooldown-Protected** - Never annoying  
✅ **Telemetry-Enabled** - Learns what works  
✅ **Extensible** - Easy to add new scripts  

---

## 🔗 Integration Points

### Pulse Cards
- Emit `agent_recommendation_ignored` when card opened but no action after 2 minutes

### AIM Appraisals
- Emit `override_without_reason` when manager overrides 3+ times without notes

### Compliance
- Emit `compliance_block_waiting` when approval pending > 5 minutes

### Flows
- Emit `flow_abandoned` when user starts but doesn't complete

### Errors
- Emit `error_loop` when same error > 2 times in 24 hours

---

**CoachAgent_v1 is ready to protect your agentic OS from human drag! 🚀**

