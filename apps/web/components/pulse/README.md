# Pulse System Components

React components for the DealershipAI Pulse System v2.0 - Advanced AI visibility monitoring and scenario modeling.

## Components Overview

### 1. PulseScoreCard
**Main pulse score display card**

Displays the current Pulse score with signal breakdowns and recommendations.

```tsx
import { PulseScoreCard } from '@/components/pulse';

<PulseScoreCard dealerId="dealer-123" />
```

**Features:**
- Large, color-coded score display (0-100)
- Real-time trend indicators (↗↘→)
- Five signal breakdowns (AIV, ATI, Zero-Click, UGC, Geo)
- Confidence percentage
- Actionable recommendations
- Responsive design with loading states

**Props:**
- `dealerId` (string, required) - Unique dealership identifier

**API Endpoint:** `GET /api/pulse/score?dealerId={id}`

---

### 2. PulseRadar
**Radar chart visualization component**

5-dimensional radar/spider chart showing all Pulse signals.

```tsx
import { PulseRadar } from '@/components/pulse';

<PulseRadar
  dealerId="dealer-123"
  timeRange={{
    start: new Date('2025-01-01'),
    end: new Date()
  }}
/>
```

**Features:**
- SVG-based radar chart with 5 dimensions
- Interactive grid circles and axis lines
- Signal labels and percentage displays
- Custom time range support
- Accessible with proper ARIA labels

**Props:**
- `dealerId` (string, required) - Unique dealership identifier
- `timeRange` (optional) - Start and end dates for data range

**API Endpoint:** `GET /api/pulse/radar?dealerId={id}`

---

### 3. ScenarioBuilder
**What-if scenario modeling UI**

Interactive component for building and simulating improvement scenarios with Monte Carlo analysis.

```tsx
import { ScenarioBuilder } from '@/components/pulse';

<ScenarioBuilder
  dealerId="dealer-123"
  onScenarioRun={(result) => console.log('Scenario result:', result)}
/>
```

**Features:**
- 5 pre-configured action templates
- Add/remove/modify actions dynamically
- Configurable magnitude and confidence levels
- Monte Carlo simulation (1000+ runs)
- Distribution statistics (min, P25, median, P75, max)
- ROI analysis with cost/value calculations
- Real-time result display
- Loading and error states

**Props:**
- `dealerId` (string, required) - Unique dealership identifier
- `onScenarioRun` (optional callback) - Called when scenario completes

**API Endpoint:** `POST /api/pulse/scenario`

**Available Actions:**
- Improve AI Visibility (AIV)
- Boost Trust Index (ATI)
- Zero-Click Defense
- UGC Health
- Geo Trust

---

### 4. TrendChart
**Trend visualization component**

Line chart showing historical data with velocity and acceleration indicators.

```tsx
import { TrendChart } from '@/components/pulse';

<TrendChart
  dealerId="dealer-123"
  metric="pulse_score"
  timeRange={{
    start: new Date('2025-01-01'),
    end: new Date()
  }}
/>
```

**Features:**
- Recharts-based line chart
- Multiple metric support (pulse_score, aiv, ati, etc.)
- Velocity and acceleration displays
- 7-day and 30-day forecasts
- Confidence indicators
- AI-generated insights
- Responsive design

**Props:**
- `dealerId` (string, required) - Unique dealership identifier
- `metric` (string, optional) - Metric to display (default: 'pulse_score')
- `timeRange` (optional) - Start and end dates for data range

**Supported Metrics:**
- `pulse_score` - Overall Pulse score
- `aiv` - AI Visibility
- `ati` - Algorithmic Trust Index
- `zero_click` - Zero-Click Defense
- `ugc_health` - UGC Health
- `geo_trust` - Geo Trust

**API Endpoint:** `GET /api/pulse/trends?dealerId={id}&metric={metric}`

---

## Usage Examples

### Complete Dashboard

```tsx
'use client';

import {
  PulseScoreCard,
  PulseRadar,
  TrendChart,
  ScenarioBuilder
} from '@/components/pulse';

export default function PulseDashboard() {
  const dealerId = 'dealer-123';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Main Score */}
      <PulseScoreCard dealerId={dealerId} />

      {/* Radar Visualization */}
      <PulseRadar dealerId={dealerId} />

      {/* Trend Analysis */}
      <div className="md:col-span-2">
        <TrendChart dealerId={dealerId} metric="pulse_score" />
      </div>

      {/* Scenario Modeling */}
      <div className="md:col-span-2">
        <ScenarioBuilder
          dealerId={dealerId}
          onScenarioRun={(result) => {
            console.log('Expected improvement:', result.improvement);
          }}
        />
      </div>
    </div>
  );
}
```

### Individual Metric Trends

```tsx
export function SignalTrends({ dealerId }: { dealerId: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TrendChart dealerId={dealerId} metric="aiv" />
      <TrendChart dealerId={dealerId} metric="ati" />
      <TrendChart dealerId={dealerId} metric="zero_click" />
      <TrendChart dealerId={dealerId} metric="ugc_health" />
    </div>
  );
}
```

---

## Styling

All components use **Tailwind CSS** with a consistent design system:

- **Colors:**
  - Blue: Primary/Score indicators
  - Green: Positive trends
  - Red: Negative trends/Critical
  - Yellow/Amber: Warnings/Insights
  - Purple: Velocity/Advanced metrics
  - Gray: Neutral/Background

- **Typography:**
  - Sans-serif font stack
  - Tabular numbers for scores
  - Consistent sizing (xs-4xl)

- **Layout:**
  - Rounded corners (rounded-lg, rounded-2xl)
  - Consistent padding (p-3 to p-6)
  - Backdrop blur effects
  - Ring shadows

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus states on interactive elements
- Error announcements with `role="alert"`
- Sufficient color contrast ratios

---

## Data Flow

```
Component → API Route → Pulse Engine → Database
    ↓           ↓            ↓              ↓
  State    Validation   Calculation    Persistence
    ↓           ↓            ↓              ↓
  Render   Response     Formula        Historical
```

---

## Dependencies

- **React 18+** - Hooks and modern patterns
- **Recharts 2.15+** - Chart visualization (TrendChart)
- **Tailwind CSS 3+** - Styling
- **TypeScript 5+** - Type safety

---

## Error Handling

All components include:
- Loading states with skeleton screens
- Error boundaries with user-friendly messages
- Graceful degradation
- Console logging for debugging

---

## Performance

- **Lazy Loading:** Components use dynamic imports where appropriate
- **Memoization:** Expensive calculations are cached
- **Debouncing:** User inputs are debounced in ScenarioBuilder
- **Optimistic Updates:** UI updates before API confirmation

---

## TypeScript Types

Import types from the lib/pulse directory:

```typescript
import type {
  ScenarioResult,
  ScenarioAction
} from '@/lib/pulse/scenario';

import type {
  TrendAnalysis,
  TrendDataPoint
} from '@/lib/pulse/trends';

import type {
  PulseScoreOutput
} from '@/lib/ai/formulas';
```

---

## Testing

```bash
# Type checking
npx tsc --noEmit

# Component testing (if configured)
npm run test components/pulse

# Integration testing
npm run test:integration
```

---

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Export charts as images
- [ ] Comparative analysis (multi-dealer)
- [ ] Custom scenario templates
- [ ] Alert configuration UI
- [ ] Mobile-optimized layouts
- [ ] Dark mode support

---

## Support

For issues or questions:
- Review the [Algorithm Engine Documentation](../../docs/dai_algorithm_engine_v2.json)
- Check API route implementations in `app/api/pulse/`
- Review calculation logic in `lib/pulse/`

---

**Version:** 1.0.0
**Last Updated:** November 1, 2025
**License:** MIT
