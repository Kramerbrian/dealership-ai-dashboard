# Forecast Accuracy Recording - Quick Start

## Two Ways to Record Accuracy

### Option 1: Automatic (Recommended) ✅

Use the `useForecastAccuracy` hook for automatic recording:

```tsx
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';

function Dashboard() {
  const actualKPIs = { AIV: 84.2, CVI: 87.8, DPI: 83.1 };
  
  // Automatically records when actualKPIs change
  useForecastAccuracy({ 
    actualKPIs, 
    useAPI: true 
  });
  
  return <div>...</div>;
}
```

**Benefits:**
- ✅ Zero configuration
- ✅ Automatic debouncing
- ✅ Works with any data source
- ✅ Handles errors gracefully

### Option 2: Manual

Use the recording functions directly:

```tsx
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

// Record single KPI
await recordKPIForecastAccuracy('AIV', 82.5, 84.2, { useAPI: true });

// Or record batch
import { recordBatchForecastAccuracy } from '@/lib/forecast-learning';

await recordBatchForecastAccuracy([
  { kpi: 'AIV', predicted: 82.5, actual: 84.2 },
  { kpi: 'CVI', predicted: 89.3, actual: 87.8 },
  { kpi: 'DPI', predicted: 82.4, actual: 83.1 },
], { useAPI: true });
```

**Use when:**
- Custom workflows
- One-off recordings
- Server-side cron jobs
- Batch processing

## When to Record

### Best Practice: End of Month

Record accuracy when actual KPI data becomes available (typically at month-end):

```tsx
// In your monthly KPI update component
useEffect(() => {
  if (monthEndData && storedPredictions) {
    // Automatic hook handles this
    // Or manually:
    recordBatchForecastAccuracy(
      Object.keys(monthEndData).map(kpi => ({
        kpi: kpi as any,
        predicted: storedPredictions[kpi],
        actual: monthEndData[kpi],
      })),
      { useAPI: true }
    );
  }
}, [monthEndData, storedPredictions]);
```

## Complete Example

See `app/components/ForecastAccuracyExample.tsx` for a full working example.

## API Endpoint

The recording functions call `/api/forecast/record-accuracy` which:
- ✅ Validates inputs
- ✅ Stores in database (when implemented)
- ✅ Returns success/error status

## What Happens Next

1. **Recording**: Accuracy is stored (localStorage + API)
2. **Learning**: Adaptive forecast engine uses this data
3. **Improvement**: Forecasts get more accurate over time
4. **Feedback**: Forecast output shows learning status

## Troubleshooting

### Not Recording?
- Check browser console for errors
- Verify `actualKPIs` has valid numbers
- Ensure API endpoint is accessible
- Check network tab for API calls

### Duplicate Records?
- Hook includes automatic debouncing (5s default)
- Manual calls should check for existing records
- Use `useForecastAccuracy` hook to avoid duplicates

### API Errors?
- Check authentication (requires auth)
- Verify tenant ID if using multi-tenant
- Check API endpoint logs
- Falls back to localStorage if API fails

