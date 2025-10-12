# AVI Dashboard Examples & Code Snippets

## Quick Reference Guide

---

## 1. Basic Usage Examples

### Fetching AVI Report (Client-Side)

```typescript
// components/MyComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { AviReport } from '@/types/avi-report';

export default function MyComponent({ tenantId }: { tenantId: string }) {
  const [report, setReport] = useState<AviReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/avi-report?tenantId=${tenantId}`);
        const data = await res.json();
        setReport(data);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [tenantId]);

  if (loading) return <div>Loading...</div>;
  if (!report) return <div>No data</div>;

  return (
    <div>
      <h1>AIV Score: {report.aivPct}%</h1>
      <h2>ATI Score: {report.atiPct}%</h2>
    </div>
  );
}
```

### Fetching AVI Report (Server-Side)

```typescript
// app/my-page/page.tsx
import { supabaseAdmin } from '@/lib/supabase';
import { AviReport } from '@/types/avi-report';

export default async function MyPage({ params }: { params: { tenantId: string } }) {
  // Fetch directly from database
  const { data, error } = await supabaseAdmin
    .from('avi_reports')
    .select('*')
    .eq('tenant_id', params.tenantId)
    .order('as_of', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return <div>No report found</div>;
  }

  const report = data as unknown as AviReport;

  return (
    <div>
      <h1>Latest Report for {params.tenantId}</h1>
      <p>AIV: {report.aivPct}%</p>
      <p>As of: {report.asOf}</p>
    </div>
  );
}
```

---

## 2. Visualization Examples

### Custom Pillar Display

```typescript
import { AviReport } from '@/types/avi-report';

export function PillarScores({ pillars }: { pillars: AviReport['pillars'] }) {
  const pillarList = [
    { key: 'seo', name: 'SEO', icon: '🔍' },
    { key: 'aeo', name: 'AEO', icon: '🤖' },
    { key: 'geo', name: 'GEO', icon: '🌐' },
    { key: 'ugc', name: 'UGC', icon: '💬' },
    { key: 'geoLocal', name: 'Local', icon: '📍' },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {pillarList.map(({ key, name, icon }) => (
        <div key={key} className="text-center">
          <div className="text-4xl">{icon}</div>
          <div className="font-bold">{pillars[key]}%</div>
          <div className="text-sm text-gray-500">{name}</div>
        </div>
      ))}
    </div>
  );
}
```

### Simple Progress Bars

```typescript
export function SimpleProgress({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className="font-bold">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getColor(value)} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
```

---

## 3. Cache Management Examples

### Invalidate Cache After Update

```typescript
// app/api/avi-report/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { invalidateAviReportCache } from '@/lib/utils/avi-cache';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, ...reportData } = body;

  // Update database
  const { error } = await supabaseAdmin
    .from('avi_reports')
    .insert(reportData);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Invalidate cache for this tenant
  await invalidateAviReportCache(tenantId);

  return NextResponse.json({ success: true });
}
```

### Manual Cache Clear

```typescript
// app/api/cache/clear/route.ts
import { NextResponse } from 'next/server';
import { invalidateAllAviReportCaches } from '@/lib/utils/avi-cache';

export async function POST() {
  await invalidateAllAviReportCaches();
  return NextResponse.json({ success: true, message: 'Cache cleared' });
}
```

---

## 4. Custom Hooks

### useAviReport Hook

```typescript
// hooks/useAviReport.ts
import { useEffect, useState } from 'react';
import { AviReport } from '@/types/avi-report';

export function useAviReport(tenantId: string) {
  const [report, setReport] = useState<AviReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchReport() {
      try {
        setLoading(true);
        const res = await fetch(`/api/avi-report?tenantId=${tenantId}`);

        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();

        if (mounted) {
          setReport(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      mounted = false;
    };
  }, [tenantId]);

  const refetch = () => {
    setLoading(true);
    // Trigger re-fetch by updating a dependency
  };

  return { report, loading, error, refetch };
}
```

### Usage

```typescript
export function MyDashboard({ tenantId }: { tenantId: string }) {
  const { report, loading, error, refetch } = useAviReport(tenantId);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  if (!report) return <Empty />;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <h1>AIV: {report.aivPct}%</h1>
    </div>
  );
}
```

---

## 5. Database Query Examples

### Get Latest Report

```typescript
import { supabaseAdmin } from '@/lib/supabase';

async function getLatestReport(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from('avi_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('as_of', { ascending: false })
    .limit(1)
    .single();

  return { data, error };
}
```

### Get Historical Reports

```typescript
async function getHistoricalReports(tenantId: string, weeks: number = 12) {
  const { data, error } = await supabaseAdmin
    .from('avi_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('as_of', { ascending: false })
    .limit(weeks);

  return { data, error };
}
```

### Get Reports by Regime State

```typescript
async function getAnomalousReports(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from('avi_reports')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('regime_state', ['ShiftDetected', 'Quarantine'])
    .order('as_of', { ascending: false });

  return { data, error };
}
```

---

## 6. Validation Examples

### Validate AVI Report Data

```typescript
import { AviReportZ } from '@/types/avi-report';

function validateReport(data: unknown) {
  const result = AviReportZ.safeParse(data);

  if (!result.success) {
    console.error('Validation failed:', result.error.issues);
    return null;
  }

  return result.data;
}

// Usage
const rawData = await fetch('/api/avi-report').then(r => r.json());
const validatedReport = validateReport(rawData);

if (validatedReport) {
  // TypeScript now knows this is a valid AviReport
  console.log(validatedReport.aivPct);
}
```

### Partial Validation

```typescript
import { AviReportZ } from '@/types/avi-report';

// Validate only certain fields
const PartialReportZ = AviReportZ.pick({
  id: true,
  tenantId: true,
  aivPct: true,
  atiPct: true,
});

type PartialReport = z.infer<typeof PartialReportZ>;
```

---

## 7. Error Handling Examples

### Graceful Error Display

```typescript
export function ReportDisplay({ tenantId }: { tenantId: string }) {
  const { report, loading, error } = useAviReport(tenantId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h3 className="text-red-800 font-semibold">Error Loading Report</h3>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No report data available</p>
      </div>
    );
  }

  return <div>{/* Display report */}</div>;
}
```

---

## 8. Testing Examples

### Mock AVI Report Data

```typescript
// tests/mocks/avi-report.ts
import { AviReport } from '@/types/avi-report';

export const mockAviReport: AviReport = {
  id: 'test-report-id',
  tenantId: 'test-tenant-id',
  version: '1.3.0',
  asOf: '2025-01-10',
  windowWeeks: 8,
  aivPct: 85.5,
  atiPct: 78.3,
  crsPct: 82.1,
  elasticity: { usdPerPoint: 185.50, r2: 0.85 },
  pillars: { seo: 82, aeo: 75, geo: 88, ugc: 79, geoLocal: 91 },
  modifiers: { temporalWeight: 1.2, entityConfidence: 0.87, crawlBudgetMult: 1.3, inventoryTruthMult: 1.4 },
  clarity: { scs: 0.88, sis: 0.82, adi: 0.91, scr: 0.85, selComposite: 0.87 },
  ci95: {
    aiv: { low: 82.0, high: 89.0 },
    ati: { low: 75.0, high: 81.6 },
    crs: { low: 79.0, high: 85.2 },
    elasticity: { low: 150, high: 220 },
  },
  regimeState: 'Normal',
};
```

### Component Test with Mock

```typescript
// tests/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { mockAviReport } from './mocks/avi-report';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => mockAviReport,
  })
) as jest.Mock;

test('Dashboard displays AIV score', async () => {
  render(<Dashboard tenantId="test" />);

  const aivScore = await screen.findByText(/85.5%/);
  expect(aivScore).toBeInTheDocument();
});
```

---

## 9. Role-Based Access Examples

### Check User Role

```typescript
import { useUser } from '@clerk/nextjs';

export function AdminOnlyFeature() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'superadmin';

  if (!isAdmin) {
    return null; // Or show "Access Denied"
  }

  return <div>Admin-only content</div>;
}
```

### Conditional Dashboard

```typescript
export function AdaptiveDashboard() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;

  if (role === 'superadmin') {
    return <ComprehensiveAVIDashboard />;
  }

  return <EnhancedAVIDashboard />;
}
```

---

## 10. Performance Examples

### Lazy Load Visualizations

```typescript
import dynamic from 'next/dynamic';

const PillarRadarChart = dynamic(() => import('@/components/visualizations/PillarRadarChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});

export function LazyDashboard({ report }: { report: AviReport }) {
  return (
    <div>
      <h1>Dashboard</h1>
      <PillarRadarChart pillars={report.pillars} />
    </div>
  );
}
```

### Memoized Components

```typescript
import { memo } from 'react';

export const MemoizedPillarChart = memo(PillarRadarChart, (prev, next) => {
  // Only re-render if pillars data changes
  return JSON.stringify(prev.pillars) === JSON.stringify(next.pillars);
});
```

---

## 11. Export Examples

### Export to JSON

```typescript
export function ExportButton({ report }: { report: AviReport }) {
  const handleExport = () => {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avi-report-${report.asOf}.json`;
    a.click();
  };

  return <button onClick={handleExport}>Export JSON</button>;
}
```

### Export to CSV

```typescript
export function exportToCSV(report: AviReport) {
  const rows = [
    ['Metric', 'Value'],
    ['AIV Score', report.aivPct],
    ['ATI Score', report.atiPct],
    ['CRS Score', report.crsPct],
    ['SEO', report.pillars.seo],
    ['AEO', report.pillars.aeo],
    // ... more rows
  ];

  const csv = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `avi-report-${report.asOf}.csv`;
  a.click();
}
```

---

## 12. Webhook Integration Example

```typescript
// app/api/webhooks/avi-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { invalidateAviReportCache } from '@/lib/utils/avi-cache';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenantId, event } = body;

  if (event === 'report.updated') {
    // Invalidate cache when report is updated
    await invalidateAviReportCache(tenantId);

    // Optionally trigger notifications
    // await sendNotification(tenantId, 'New AVI report available');
  }

  return NextResponse.json({ received: true });
}
```

---

**More examples available in:**
- [AVI_DASHBOARD_IMPLEMENTATION.md](./AVI_DASHBOARD_IMPLEMENTATION.md)
- [AVI_SUPABASE_INTEGRATION.md](./AVI_SUPABASE_INTEGRATION.md)
