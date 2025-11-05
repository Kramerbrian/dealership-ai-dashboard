# Adaptive Forecast System

## Overview

The Adaptive Forecast System is a self-learning forecasting engine that automatically improves forecast accuracy by learning from historical KPI trends and adjusting growth multipliers month-over-month using exponential smoothing.

## Key Features

### 1. **Adaptive Learning**
- Learns from month-over-month KPI changes
- Automatically adjusts growth multipliers using exponential smoothing (α = 0.3)
- Self-calibrates without manual tuning
- Memory-based (no external AI required)

### 2. **Historical Logging**
- Automatically logs forecasts to `/api/forecast/log`
- Tracks forecast model state over time
- Enables historical analysis and reporting

### 3. **Confidence Intervals**
- Calculates confidence intervals based on historical error distribution
- Provides uncertainty estimates for each KPI forecast
- Helps executives understand forecast reliability

### 4. **Drift Detection**
- Detects downward drift in forecast trends
- Alerts when KPIs decline below historical averages
- Provides actionable recommendations

## How It Works

### Step 1: Load Previous Model
- Retrieves last month's KPI means and growth multipliers from localStorage
- Falls back to baseline multipliers if no history exists

### Step 2: Calculate Deltas
- Compares current KPI means with last month's means
- Calculates actual change (delta) for each KPI

### Step 3: Adjust Multipliers
- Applies exponential smoothing: `new = old + α × (delta / 100)`
- Normalizes deltas to percentage changes
- Clamps multipliers to reasonable bounds (0.98 to 1.05)

### Step 4: Generate Forecast
- Applies adjusted multipliers to current KPI means
- Projects next-month values for AIV, ATI, CVI, ORI, GRI
- Calculates composite DPI score

### Step 5: Financial Projection
- Converts KPI changes to lead volume using elasticity (0.8% per point)
- Estimates revenue impact ($1,200 avg gross per lead)
- Projects lead volume and gross profit

### Step 6: Persist Model
- Saves updated multipliers and current means to localStorage
- Logs forecast to API for historical tracking
- Stores predictions for accuracy comparison

## Example Output

```
Adaptive Forecast Mode (Next 30 Days)

• Updated growth multipliers (learned): AIV:+1.6%  |  ATI:+0.3%  |  CVI:+2.0%  |  ORI:-0.5%  |  GRI:+1.2%

• Projected KPI means — AIV 82.1, CVI 90.5, DPI 83.2

• Forecasted lead volume: ~492 (+9.3%)

• Expected gross impact: ≈ $590,400

Model auto-learns from prior forecast vs. actual results using exponential smoothing (α=0.3).
```

## Integration

### Basic Usage

```tsx
import GroupExecutiveSummary from '@/app/components/GroupExecutiveSummary';

<GroupExecutiveSummary 
  dealers={dealers} 
  loading={false} 
/>
```

### With Drift Detection

```tsx
import ForecastDriftAlert from '@/app/components/ForecastDriftAlert';

<ForecastDriftAlert
  currentPredictions={{ AIV: 82.1, CVI: 90.5, DPI: 83.2 }}
  historicalAverages={{ AIV: 85.0, CVI: 92.0, DPI: 86.0 }}
  threshold={0.05} // 5% decline threshold
/>
```

## API Endpoints

### POST /api/forecast/log
Logs forecast predictions and model state

```json
{
  "forecastModel": {
    "baseGrowth": { "AIV": 1.016, "CVI": 1.020, ... },
    "lastMeans": { "AIV": 80.5, "CVI": 88.7, ... },
    "timestamp": "2025-01-15T10:30:00Z"
  },
  "predictions": {
    "AIV": 82.1,
    "CVI": 90.5,
    ...
  }
}
```

### GET /api/forecast/log
Retrieves forecast history

```bash
GET /api/forecast/log?tenantId=xxx&limit=30
```

## Confidence Intervals

```typescript
import { calculateConfidenceInterval } from '@/lib/forecast-confidence';

const interval = calculateConfidenceInterval(
  82.1,                    // predicted value
  [1.2, -0.8, 0.5, ...],  // historical errors
  0.95                     // 95% confidence level
);

// Returns:
// {
//   lower: 80.5,
//   upper: 83.7,
//   mean: 82.1,
//   confidence: 0.92
// }
```

## Drift Detection

```typescript
import { detectDrift } from '@/lib/forecast-confidence';

const alert = detectDrift(
  { AIV: 82.1, CVI: 90.5 },  // current predictions
  { AIV: 85.0, CVI: 92.0 },  // historical averages
  0.05                        // 5% threshold
);

// Returns:
// {
//   detected: true,
//   severity: "medium",
//   message: "Downward drift detected in 2 KPI(s): AIV, CVI. Max decline: 3.4%",
//   affectedKPIs: ["AIV", "CVI"],
//   recommendation: "Investigate root causes..."
// }
```

## Benefits

1. **Self-Improving**: Forecasts get more accurate automatically
2. **Data-Driven**: No manual tuning required
3. **Finance-Linked**: Converts visibility/conversion gains to revenue impact
4. **Plug-and-Play**: Works automatically with daily refresh
5. **Transparent**: Shows learned multipliers and confidence levels

## Monitoring

Monitor forecast accuracy over time:

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
});
```

## Best Practices

1. **Record Accuracy Monthly**: Use `recordKPIForecastAccuracy()` at month-end
2. **Monitor Drift**: Check for downward trends weekly
3. **Review Confidence**: Consider confidence intervals in decision-making
4. **Historical Analysis**: Review forecast logs quarterly to identify patterns

