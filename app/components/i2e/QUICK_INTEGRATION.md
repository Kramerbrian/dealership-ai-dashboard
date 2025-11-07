# Quick Integration Guide

## ✅ Import Statement (Verified)

```tsx
import { 
  PulseUpdateCardGrid, 
  ACNContainer, 
  ExecutionPlaybook, 
  OneClickCorrectionList 
} from '@/components/i2e';
```

All exports are working correctly! ✅

---

## 🚀 Quick Start: Add to DealershipAIDashboardLA

### Step 1: Add Imports

At the top of `DealershipAIDashboardLA.tsx`, add:

```tsx
import { 
  PulseUpdateCardGrid, 
  ACNContainer, 
  ExecutionPlaybook, 
  OneClickCorrectionList 
} from '@/components/i2e';
import type { 
  UpdateCard, 
  ExecutionPlaybook as PlaybookType 
} from '@/components/i2e';
```

### Step 2: Add State

Inside the component, add playbook state:

```tsx
const [playbookOpen, setPlaybookOpen] = useState(false);
const [selectedPlaybook, setSelectedPlaybook] = useState<PlaybookType | null>(null);
```

### Step 3: Add Update Cards to Overview Tab

Around **line 593** (in the Overview tab section), add before the Executive Dashboard:

```tsx
{/* System Updates */}
<div className="mb-20">
  <h2 className="section-header" style={{ marginBottom: 15 }}>
    System Updates
  </h2>
  <PulseUpdateCardGrid 
    updates={[
      {
        id: '1',
        title: 'New AI Model: GPT-4 Turbo',
        summary: 'Enhanced accuracy for dealership visibility tracking.',
        date: new Date(),
        type: 'model',
        ctaText: 'View Details',
        metadata: { impact: '+15% accuracy' }
      }
    ]}
    maxItems={3}
  />
</div>
```

### Step 4: Add Correction Widgets

Add to sidebar or after the summary metrics (around **line 750**):

```tsx
{/* Quick Fixes */}
<div className="card" style={{ marginTop: 20 }}>
  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 15 }}>
    Quick Fixes Available
  </h3>
  <OneClickCorrectionList
    corrections={[
      {
        id: 'fix-1',
        issue: 'Data Drift Detected',
        fix: 'Your schema has drifted. Click to auto-fix alignment.',
        severity: 'medium',
        estimatedTime: '30s',
        action: async () => {
          console.log('Fixing data drift...');
          // Your fix logic here
        }
      }
    ]}
    maxItems={3}
  />
</div>
```

### Step 5: Add Execution Playbook

At the end of the component (before closing `</ErrorBoundary>`), add:

```tsx
{/* Execution Playbook */}
{selectedPlaybook && (
  <ExecutionPlaybook
    playbook={selectedPlaybook}
    isOpen={playbookOpen}
    onClose={() => {
      setPlaybookOpen(false);
      setSelectedPlaybook(null);
    }}
    onStepComplete={(stepId) => {
      console.log('Step completed:', stepId);
    }}
    onPlaybookComplete={(playbookId) => {
      console.log('Playbook completed:', playbookId);
      setTimeout(() => {
        setPlaybookOpen(false);
        setSelectedPlaybook(null);
      }, 2000);
    }}
  />
)}
```

---

## 📊 Example: Wrap Chart with ACNs

If you have charts in your dashboard, wrap them with `ACNContainer`:

```tsx
<ACNContainer
  nuggets={[
    {
      id: 'acn-1',
      insight: 'Churn Risk High',
      ctaText: 'Launch Retention Protocol',
      ctaAction: async () => {
        // Open playbook or execute action
        const playbook = generatePlaybookFromInsight(/* ... */);
        setSelectedPlaybook(playbook);
        setPlaybookOpen(true);
      },
      severity: 'high',
      position: { x: 75, y: 30, anchor: 'top-right' }
    }
  ]}
  className="relative"
>
  {/* Your existing chart component */}
  <YourChartComponent data={chartData} />
</ACNContainer>
```

---

## 🎯 Complete Example

See `INTEGRATION_EXAMPLE.tsx` for a complete working example with all components integrated.

---

## ✅ Verification

After adding the imports, verify they work:

```tsx
// Test in your component
console.log('I2E Components loaded:', {
  PulseUpdateCardGrid: typeof PulseUpdateCardGrid,
  ACNContainer: typeof ACNContainer,
  ExecutionPlaybook: typeof ExecutionPlaybook,
  OneClickCorrectionList: typeof OneClickCorrectionList
});
```

All should show `'function'` or `'object'` ✅

---

## 📝 Next Steps

1. ✅ Imports verified - working correctly
2. Add components to dashboard (see steps above)
3. Connect to your data sources (API calls)
4. Customize styling to match your theme
5. Add analytics tracking

---

## 🐛 Troubleshooting

**Import error?**
- Check that `@/components/i2e` resolves correctly
- Verify `app/components/i2e/index.ts` exists
- Check TypeScript path aliases in `tsconfig.json`

**Components not rendering?**
- Check browser console for errors
- Verify Framer Motion is installed: `npm install framer-motion`
- Verify lucide-react is installed: `npm install lucide-react`

**Type errors?**
- Make sure TypeScript can resolve the types
- Check that `types.ts` exports are correct

