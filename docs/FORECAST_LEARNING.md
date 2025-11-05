# Forecast Learning System

## Overview

The Forecast Mode in `GroupExecutiveSummary` uses **adaptive learning** with exponential smoothing (α ≈ 0.3) to automatically improve forecast accuracy over time by comparing predicted vs actual KPI results.

## How It Works

### 1. Forecast Generation
- Forecast Mode generates predictions for next 30 days using baseline multipliers
- Multipliers are adjusted based on historical accuracy
- Predictions are stored for later comparison

### 2. Accuracy Recording
When actual KPI data becomes available (typically at end of month):

```typescript
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

// Record accuracy for a single KPI
await recordKPIForecastAccuracy('AIV', 82.5, 84.2, { useAPI: true });

// Or batch record for multiple KPIs
await recordBatchForecastAccuracy([
  { kpi: 'AIV', predicted: 82.5, actual: 84.2 },
  { kpi: 'CVI', predicted: 89.3, actual: 87.8 },
  { kpi: 'DPI', predicted: 82.4, actual: 83.1 },
], { useAPI: true });
```

### 3. Adaptive Learning
The system:
- Loads historical forecast accuracy data
- Calculates prediction errors (actual - predicted)
- Adjusts growth multipliers using exponential smoothing
- Applies adjustments to future forecasts

### 4. Exponential Smoothing Formula

```
new_multiplier = old_multiplier × (1 - α) + adjusted_multiplier × α
```

Where:
- `α = 0.3` (smoothing factor)
- Adjustment is based on error ratio: `1 + (error_ratio × α)`

## Integration Examples

### Monthly Accuracy Recording (Cron Job)

```typescript
// app/api/cron/record-forecast-accuracy/route.ts
import { recordBatchForecastAccuracy } from '@/lib/forecast-learning';

export async function GET() {
  // Get actual KPIs from last month
  const actualKPIs = await getActualKPIsFromLastMonth();
  
  // Get stored predictions from last month
  const predictions = await getStoredPredictions();
  
  // Record accuracy
  await recordBatchForecastAccuracy(
    Object.keys(actualKPIs).map(kpi => ({
      kpi,
      predicted: predictions[kpi],
      actual: actualKPIs[kpi],
    })),
    { useAPI: true }
  );
}
```

### Manual Accuracy Recording

```typescript
// In your dashboard component after month-end
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

useEffect(() => {
  // When actual KPI data loads
  if (actualKPIs && storedPredictions) {
    recordKPIForecastAccuracy('AIV', storedPredictions.AIV, actualKPIs.AIV);
  }
}, [actualKPIs]);
```

## Storage

### Client-Side (localStorage)
- Used for immediate learning without API calls
- Persists across sessions
- Limited to browser storage (~5-10MB)

### Server-Side (Database)
- Recommended for production
- Enables cross-device learning
- Supports multi-tenant isolation

### Database Schema (Recommended)

```sql
CREATE TABLE forecast_accuracy_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  kpi text NOT NULL CHECK (kpi IN ('AIV', 'ATI', 'CVI', 'ORI', 'GRI', 'DPI')),
  predicted numeric(5,2) NOT NULL,
  actual numeric(5,2) NOT NULL,
  error numeric(5,2) GENERATED ALWAYS AS (actual - predicted) STORED,
  error_pct numeric(5,2) GENERATED ALWAYS AS (((actual - predicted) / predicted) * 100) STORED,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_forecast_accuracy_tenant_kpi ON forecast_accuracy_history(tenant_id, kpi, recorded_at DESC);
```

## Benefits

1. **Self-Improving**: Forecasts get more accurate over time
2. **Tenant-Specific**: Learns from each tenant's unique patterns
3. **Resilient**: Falls back to baseline if no history available
4. **Transparent**: Shows learning status in forecast output

## Example Output

```
Forecast Mode (Next 30 Days):

• Projected mean AIV: 81.7  |  CVI: 89.3  |  DPI: 82.4
• Expected lead volume: ~486 (+8.0%)
• Estimated gross profit impact: ≈ $583,200

Adaptive learning active (24 historical comparisons)
Assumptions: ±2–3pt KPI volatility, constant ad spend. Multipliers adjusted via exponential smoothing (α=0.3).
```

## Monitoring

Monitor forecast accuracy metrics:

```typescript
import { calculateForecastAccuracy } from '@/lib/forecast-learning';

const metrics = calculateForecastAccuracy(
  [82.5, 89.3, 78.1], // predictions
  [84.2, 87.8, 79.5]  // actuals
);

console.log({
  mae: metrics.mae,        // Mean Absolute Error
  mape: metrics.mape,      // Mean Absolute Percentage Error
  rmse: metrics.rmse,      // Root Mean Square Error
  avgError: metrics.avgError // Average error
});
```

