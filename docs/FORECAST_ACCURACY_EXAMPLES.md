# Forecast Accuracy Recording Examples

## Quick Start

### Basic Usage (Automatic Recording)

```tsx
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';

function MyDashboard() {
  const actualKPIs = {
    AIV: 84.2,
    CVI: 87.8,
    DPI: 83.1,
  };

  // Automatically records accuracy when actualKPIs change
  useForecastAccuracy({
    actualKPIs,
    useAPI: true,
    tenantId: 'your-tenant-id',
  });

  return <div>Dashboard content...</div>;
}
```

### Manual Recording

```tsx
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

// Record accuracy for a single KPI
await recordKPIForecastAccuracy('AIV', 82.5, 84.2, { useAPI: true });

// Record batch accuracy
import { recordBatchForecastAccuracy } from '@/lib/forecast-learning';

await recordBatchForecastAccuracy([
  { kpi: 'AIV', predicted: 82.5, actual: 84.2 },
  { kpi: 'CVI', predicted: 89.3, actual: 87.8 },
  { kpi: 'DPI', predicted: 82.4, actual: 83.1 },
], { useAPI: true });
```

## Integration Examples

### 1. Monthly Cron Job (Server-Side)

```typescript
// app/api/cron/record-monthly-accuracy/route.ts
import { NextResponse } from 'next/server';
import { recordBatchForecastAccuracy } from '@/lib/forecast-learning';

export async function GET(req: Request) {
  const authHeader = req.headers.get('x-cron-secret');
  if (authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get actual KPIs from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const actualKPIs = await getActualKPIsForMonth(lastMonth);
    const storedPredictions = await getStoredPredictionsForMonth(lastMonth);

    // Record accuracy
    await recordBatchForecastAccuracy(
      Object.keys(actualKPIs).map((kpi) => ({
        kpi: kpi as any,
        predicted: storedPredictions[kpi],
        actual: actualKPIs[kpi],
      })),
      { useAPI: false } // Already on server
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2. Dashboard Component with Auto-Recording

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useForecastAccuracy } from '@/hooks/useForecastAccuracy';
import { useQuery } from '@tanstack/react-query';

function ExecutiveDashboard() {
  // Fetch actual KPIs from API
  const { data: actualKPIs } = useQuery({
    queryKey: ['actual-kpis', 'current-month'],
    queryFn: async () => {
      const res = await fetch('/api/kpi/current-month');
      return res.json();
    },
  });

  // Automatically record accuracy when actual KPIs are loaded
  useForecastAccuracy({
    actualKPIs,
    useAPI: true,
    autoRecord: true,
  });

  return <div>Dashboard content...</div>;
}
```

### 3. Manual Recording UI Component

```tsx
'use client';

import { useState } from 'react';
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';
import ForecastAccuracyRecorder from '@/app/components/ForecastAccuracyRecorder';

function ForecastManagement() {
  const [actualKPIs, setActualKPIs] = useState({
    AIV: 84.2,
    CVI: 87.8,
    DPI: 83.1,
  });

  return (
    <div>
      <h2>Record Forecast Accuracy</h2>
      <ForecastAccuracyRecorder
        actualKPIs={actualKPIs}
        showManualControls={true}
        tenantId="your-tenant-id"
      />
    </div>
  );
}
```

### 4. API Endpoint Integration

```typescript
// When actual KPIs are saved to database
import { recordKPIForecastAccuracy } from '@/lib/forecast-learning';

export async function saveKPIsToDatabase(kpis: KPIScores, tenantId: string) {
  // Save to database
  await db.insert('kpi_history', {
    tenant_id: tenantId,
    ...kpis,
    recorded_at: new Date(),
  });

  // Get stored predictions
  const predictions = await getStoredPredictions(tenantId);

  // Record forecast accuracy
  if (predictions) {
    await Promise.all(
      Object.keys(kpis).map((kpi) =>
        recordKPIForecastAccuracy(
          kpi as any,
          predictions[kpi],
          kpis[kpi],
          { useAPI: true, tenantId }
        )
      )
    );
  }
}
```

## Best Practices

1. **Record at Month-End**: Automatically record accuracy when actual KPIs are finalized
2. **Use Batch Recording**: Record all KPIs together for consistency
3. **Handle Errors Gracefully**: Always catch errors and log them
4. **Debounce**: Prevent duplicate recordings within short time windows
5. **Validate Data**: Ensure predictions and actuals are valid numbers before recording

## Monitoring

Track forecast accuracy over time:

```typescript
import { calculateForecastAccuracy } from '@/lib/forecast-learning';

const metrics = calculateForecastAccuracy(
  [82.5, 89.3, 78.1], // predictions
  [84.2, 87.8, 79.5]  // actuals
);

console.log('Forecast Accuracy Metrics:', {
  mae: metrics.mae,        // Mean Absolute Error
  mape: metrics.mape,      // Mean Absolute Percentage Error
  rmse: metrics.rmse,      // Root Mean Square Error
  avgError: metrics.avgError // Average error
});
```

