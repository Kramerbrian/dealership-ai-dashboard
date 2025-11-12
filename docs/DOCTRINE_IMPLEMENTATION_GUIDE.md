# DealershipAI Design Doctrine - Implementation Guide

## Overview

This guide provides step-by-step instructions for transforming traditional dashboard components into Clay-inspired, action-oriented interfaces that follow the DealershipAI Design Doctrine.

**Core Principle:** Transform from "Display" to "Enable" - every pixel should be a verb.

---

## The Three Laws

### Law 1: Treat Every Pixel as a Verb
- Every element must enable action, not just display information
- Remove passive displays; replace with interactive, actionable components

### Law 2: Make Every Insight Self-Validating
- Show impact (revenue, time, risk) immediately
- Provide cause, effect, and path to fix in plain English
- No technical jargon without business context

### Law 3: Remove Friction Until Comprehension is Automatic
- Target: 7 elements per screen (max)
- Time to first insight: < 10 seconds
- Action latency: < 2 seconds

---

## Step-by-Step Transformation

### Step 1: Replace Metric Cards with PulseCards

**BEFORE:**
```typescript
<MetricCard title="AI Visibility Score" value="73%" />
```

**AFTER:**
```typescript
<PulseCard
  headline="Your visibility rose 8% after schema fix"
  diagnosis="Missing AutoDealer schema was blocking 3 platforms"
  prescription="Add Product schema next for another +$4.7K/mo"
  impact={4700}
  onFix={() => autoFixSchema()}
  onExplain={() => showEvidence()}
/>
```

**Implementation:**
1. Create `components/core/PulseCard.tsx`
2. Replace all `<MetricCard>` instances
3. Ensure every PulseCard has: headline, diagnosis, prescription, impact, actions

---

### Step 2: Transform Alert System

**BEFORE:**
```typescript
<Alert variant="error">
  Schema Validation Failed
  Error: Missing required property "offers"
</Alert>
```

**AFTER:**
```typescript
<OutcomeAlert
  impact="$8.2K/mo at risk"
  cause="Missing pricing data blocks ChatGPT"
  action="Add pricing to 43 vehicles"
  timeEstimate="2 hours"
  onAutoFix={() => deployFix('pricing')}
  onShowHow={() => openTutorial()}
/>
```

**Implementation:**
1. Create `components/core/OutcomeAlert.tsx`
2. Replace technical alerts with outcome-focused alerts
3. Always lead with revenue/business impact

---

### Step 3: Implement Mode-Based Navigation

**BEFORE:**
```typescript
<Tabs>
  <Tab>Dashboard</Tab>
  <Tab>Analytics</Tab>
  <Tab>Schema</Tab>
  {/* ... 7 more tabs */}
</Tabs>
```

**AFTER:**
```typescript
<ModeSelector
  modes={[
    { id: 'drive', label: 'Drive', icon: '◉' },
    { id: 'autopilot', label: 'Autopilot', icon: '◈' },
    { id: 'insights', label: 'Insights', icon: '◭' }
  ]}
  active={mode}
  onChange={setMode}
/>
```

**Implementation:**
1. Create `components/core/ModeSelector.tsx`
2. Replace tab navigation with 3-mode system
3. Each mode shows different view of same data

---

### Step 4: Replace Charts with Motion-Based Visualization

**BEFORE:**
```typescript
<LineChart data={monthlyData} />
```

**AFTER:**
```typescript
<OrbitView
  clarity={87}
  nodes={[
    { label: 'Visibility', value: 94, urgency: 0.2, impact: 8200 },
    { label: 'Trust', value: 82, urgency: 0.5, impact: 3100 },
    { label: 'Response', value: 91, urgency: 0.1, impact: 1200 }
  ]}
  onSelect={(id) => openDrawer(id)}
/>
```

**Implementation:**
1. Use existing `OrbitalView` component
2. Replace chart-heavy sections
3. Use color, size, position to convey meaning
4. Add pulsing animations for urgency

---

### Step 5: Create Action Bar

**BEFORE:**
```typescript
<Sidebar>
  <Menu>
    {/* 20+ menu items */}
  </Menu>
</Sidebar>
```

**AFTER:**
```typescript
<ActionBar
  issues={3}
  risk={12500}
  tasks={2}
  onAction={() => executeWorkflow({
    intent: 'identify_risk',
    action: 'auto_fix_schema',
    outcome: '+3 visibility, +$4.7K'
  })}
/>
```

**Implementation:**
1. Create `components/core/ActionBar.tsx`
2. Show aggregated counts (issues, risk, tasks)
3. Single primary action button
4. Sticky bottom or top placement

---

### Step 6: Implement TeslaCognitiveInterface

**BEFORE:**
```typescript
<DashboardLayout>
  <Header />
  <Sidebar />
  <MainContent>
    {/* 20+ components */}
  </MainContent>
</DashboardLayout>
```

**AFTER:**
```typescript
<TeslaCognitiveInterface>
  <TopBar dealer={dealer} />
  <ModeSelector mode={mode} />
  
  {mode === 'drive' && (
    <OrbitView
      clarity={87}
      nodes={nodes}
    />
  )}
  
  <ActionBar
    issues={3}
    risk={12500}
    onAction={handleAction}
  />
</TeslaCognitiveInterface>
```

**Implementation:**
1. Create `components/core/TeslaCognitiveInterface.tsx`
2. Consolidate all dashboard views
3. Maximum 7 visual elements per screen
4. Workflow-first architecture

---

## Component Specifications

### PulseCard Component

```typescript
interface PulseCardProps {
  headline: string;        // Plain English outcome
  diagnosis: string;       // Cause explanation
  prescription: string;   // Next action
  impact: number;         // Revenue/time impact
  onFix: () => void;      // Primary action
  onExplain?: () => void; // Secondary action
  evidence?: string;      // Optional evidence URL
}
```

**Design Rules:**
- Maximum 3 lines of text
- Impact always in currency or time
- One primary action (Fix)
- One secondary action (Explain/Compare)
- Pulsing animation for urgency

---

### OutcomeAlert Component

```typescript
interface OutcomeAlertProps {
  impact: string;          // "$8.2K/mo at risk"
  cause: string;           // Plain English cause
  action: string;          // Specific action
  timeEstimate: string;    // "2 hours"
  onAutoFix: () => void;   // One-click fix
  onShowHow?: () => void;  // Tutorial option
}
```

**Design Rules:**
- Impact first (largest text)
- Cause second (medium text)
- Action third (small text)
- Time estimate always included
- Auto-fix button prominent

---

### ModeSelector Component

```typescript
interface ModeSelectorProps {
  modes: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  active: string;
  onChange: (mode: string) => void;
}
```

**Design Rules:**
- Maximum 3 modes
- Icon + label
- Active state clearly visible
- Smooth transitions between modes

---

## Metrics to Track

### Success Metrics (from Doctrine)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to First Insight | < 10s | Track from page load to first user action |
| Action Latency | < 2s | Time from click to feedback |
| User Clarity | > 90% | Post-interaction survey |
| Screen Abandonment | < 5% | Track bounce rate |
| Visual Elements | < 7 | Count DOM elements per screen |

### Implementation Checklist

- [ ] Replace all MetricCard with PulseCard
- [ ] Replace all Alert with OutcomeAlert
- [ ] Replace tab navigation with ModeSelector
- [ ] Replace charts with OrbitView where appropriate
- [ ] Add ActionBar to all main views
- [ ] Wrap main dashboard in TeslaCognitiveInterface
- [ ] Reduce elements per screen to < 7
- [ ] Add plain English to all technical messages
- [ ] Ensure every element has an action
- [ ] Add impact/revenue to all metrics
- [ ] Test time to first insight < 10s
- [ ] Test action latency < 2s

---

## Migration Path

### Phase 1: Core Components (Week 1)
1. Create PulseCard component
2. Create OutcomeAlert component
3. Create ModeSelector component
4. Create ActionBar component

### Phase 2: Main Interface (Week 2)
1. Create TeslaCognitiveInterface wrapper
2. Migrate main dashboard page
3. Update Cognitive Control Center
4. Test with real users

### Phase 3: Full Migration (Week 3-4)
1. Migrate all dashboard views
2. Update all modals and drawers
3. Replace remaining charts
4. Performance optimization

### Phase 4: Validation (Week 5)
1. Run doctrine validation script
2. Measure success metrics
3. User testing and feedback
4. Iterate based on results

---

## Code Examples

### Complete TeslaCognitiveInterface Example

```typescript
"use client";

import { useState } from "react";
import { TeslaCognitiveInterface } from "@/components/core/TeslaCognitiveInterface";
import { PulseCard } from "@/components/core/PulseCard";
import { ActionBar } from "@/components/core/ActionBar";
import { OrbitView } from "@/components/core/OrbitalView";

export default function Dashboard() {
  const [mode, setMode] = useState<'drive' | 'autopilot' | 'insights'>('drive');
  const dealer = { name: "Terry Reid Hyundai", location: "Cape Coral" };

  const nodes = [
    { id: 'visibility', label: 'Visibility', value: 94, urgency: 0.2, impact: 8200 },
    { id: 'trust', label: 'Trust', value: 82, urgency: 0.5, impact: 3100 },
    { id: 'response', label: 'Response', value: 91, urgency: 0.1, impact: 1200 }
  ];

  return (
    <TeslaCognitiveInterface dealer={dealer}>
      <ModeSelector
        modes={[
          { id: 'drive', label: 'Drive', icon: '◉' },
          { id: 'autopilot', label: 'Autopilot', icon: '◈' },
          { id: 'insights', label: 'Insights', icon: '◭' }
        ]}
        active={mode}
        onChange={setMode}
      />

      {mode === 'drive' && (
        <OrbitView
          clarity={87}
          nodes={nodes}
          onSelect={(id) => {
            // Open drawer for selected node
            openDrawer(id);
          }}
        />
      )}

      <ActionBar
        issues={3}
        risk={12500}
        tasks={2}
        onAction={() => {
          executeWorkflow({
            intent: 'identify_risk',
            action: 'auto_fix_schema',
            outcome: '+3 visibility, +$4.7K'
          });
        }}
      />
    </TeslaCognitiveInterface>
  );
}
```

---

## Validation

Run the doctrine validation script weekly:

```bash
python scripts/dealershipai_doctrine_selfheal_autocommit.py \
  configs/ux/DealershipAI_Design_Doctrine_v1.0.json
```

The script will:
- Validate doctrine file structure
- Auto-fix missing keys
- Generate normalized version
- Optionally commit changes

---

## Resources

- **Doctrine File:** `configs/ux/DealershipAI_Design_Doctrine_v1.0.json`
- **Validation Script:** `scripts/dealershipai_doctrine_selfheal_autocommit.py`
- **Before/After Examples:** See user query document

---

## Questions?

If you're unsure whether a component follows the doctrine, ask:

1. **Does every pixel enable action?** (Law 1)
2. **Is the insight self-validating?** (Law 2)
3. **Is comprehension automatic?** (Law 3)

If the answer to any is "no", refactor until all three are "yes".

