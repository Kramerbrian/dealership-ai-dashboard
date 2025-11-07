# Real Data Integration Guide

This guide shows how to swap mock/stub implementations with real data sources and services.

## 🎯 Integration Points

### 1. BullMQ Queue Integration

**Current Status**: Stub in `backend/engine/queue.ts`  
**Target**: Wire to `lib/job-queue.ts` (BullMQ with Redis)

#### Step 1: Update `backend/engine/queue.ts`

```typescript
import { addJob, JobType } from '@/lib/job-queue';

export type JobPayload = { 
  type: "schema-fix" | "reprobe" | "crawl"; 
  data: Record<string, any> 
};

export async function enqueue(job: JobPayload): Promise<{ id: string }> {
  // Map job types to BullMQ JobType
  const jobTypeMap: Record<string, JobType> = {
    'schema-fix': JobType.PROCESS_DATA,
    'reprobe': JobType.PROCESS_DATA,
    'crawl': JobType.PROCESS_DATA,
  };

  const jobId = await addJob({
    type: jobTypeMap[job.type] || JobType.PROCESS_DATA,
    payload: {
      jobType: job.type,
      ...job.data,
    },
    priority: job.type === 'schema-fix' ? 1 : 0, // Higher priority for fixes
    attempts: 3,
  });

  return { id: jobId || `fallback-${Date.now()}` };
}
```

#### Step 2: Wire Worker Processors

Create `lib/jobs/processors.ts`:

```typescript
import { Job } from 'bullmq';
import { createTenantSupabaseClient } from '@/lib/api-protection/tenant-isolation';

export async function processSchemaFix(job: Job) {
  const { tenantId, url, field, value } = job.data;
  
  // Get tenant-specific Supabase client
  const { client } = await createTenantSupabaseClient();
  
  // Apply schema fix
  // TODO: Implement actual schema fix logic
  console.log(`Fixing schema for ${url}: ${field} = ${value}`);
  
  // Update database
  // await client.from('schema_fixes').insert({ ... });
}

export async function processReprobe(job: Job) {
  const { tenantId, scope } = job.data;
  
  // Trigger reprobe for tenant
  // TODO: Call Pulse/ATI/CIS/Probe APIs
  console.log(`Reprobing ${scope} for tenant ${tenantId}`);
}

export async function processCrawl(job: Job) {
  const { tenantId, urls } = job.data;
  
  // Trigger crawl for tenant URLs
  // TODO: Call crawl service
  console.log(`Crawling ${urls.length} URLs for tenant ${tenantId}`);
}
```

#### Step 3: Initialize Workers

Update `lib/jobs/worker.ts`:

```typescript
import { createWorker } from '@/lib/job-queue';
import { processSchemaFix, processReprobe, processCrawl } from './processors';

export function initializeJobWorker() {
  const worker = createWorker(async (job) => {
    const { jobType } = job.data;
    
    switch (jobType) {
      case 'schema-fix':
        await processSchemaFix(job);
        break;
      case 'reprobe':
        await processReprobe(job);
        break;
      case 'crawl':
        await processCrawl(job);
        break;
      default:
        console.warn(`Unknown job type: ${jobType}`);
    }
  });

  return worker;
}
```

### 2. Wire "Fix It" Buttons to `/api/schema/fix`

**Current Status**: Mock endpoint  
**Target**: Real BullMQ integration

#### Update `app/api/schema/fix/route.ts`

```typescript
import { NextResponse } from "next/server";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { enqueue } from "@/backend/engine/queue";

export async function POST(req: Request) {
  // Enforce tenant isolation
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json(); // { tenantId, url, field, value }
  const { url, field, value } = body;
  const tenantId = isolation.tenantId;

  // Validate input
  if (!url || !field || value === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: url, field, value" },
      { status: 400 }
    );
  }

  // Enqueue schema fix job
  const { id: jobId } = await enqueue({
    type: "schema-fix",
    data: {
      tenantId,
      url,
      field,
      value,
      timestamp: new Date().toISOString(),
    },
  });

  return NextResponse.json(
    { 
      accepted: true, 
      jobId,
      message: "Schema fix queued successfully",
      estimatedCompletion: "2-5 minutes"
    },
    { status: 202 }
  );
}
```

#### Add "Fix It" Button to Components

Example in `HealthDiagnosticsModal.tsx`:

```typescript
import { useState } from "react";

export default function HealthDiagnosticsModal({ ... }) {
  const [fixing, setFixing] = useState<string | null>(null);

  async function handleFix(field: string, url: string) {
    setFixing(field);
    try {
      const res = await fetch("/api/schema/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url || window.location.href,
          field,
          value: getDefaultValue(field), // Your logic here
        }),
      });
      
      const data = await res.json();
      if (data.accepted) {
        alert(`Fix queued! Job ID: ${data.jobId}`);
      }
    } catch (error) {
      console.error("Fix failed:", error);
      alert("Failed to queue fix. Please try again.");
    } finally {
      setFixing(null);
    }
  }

  return (
    <div>
      {/* ... existing code ... */}
      {malformedFields.map(field => (
        <div key={field}>
          {field}
          <button
            onClick={() => handleFix(field, "/")}
            disabled={fixing === field}
            className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-sm"
          >
            {fixing === field ? "Fixing..." : "Fix It"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Real Pulse/ATI/CIS/Probe Data Sources

**Current Status**: Mock data in API routes  
**Target**: Real API integrations

#### Create Data Source Clients

Create `lib/data-sources/pulse.ts`:

```typescript
const PULSE_API_URL = process.env.PULSE_API_URL!;
const PULSE_API_KEY = process.env.PULSE_API_KEY!;

export async function getPulseData(tenantId: string, domain: string) {
  const response = await fetch(`${PULSE_API_URL}/v1/visibility`, {
    headers: {
      'Authorization': `Bearer ${PULSE_API_KEY}`,
      'X-Tenant-ID': tenantId,
    },
    body: JSON.stringify({ domain }),
  });

  if (!response.ok) {
    throw new Error(`Pulse API error: ${response.statusText}`);
  }

  return response.json();
}
```

Create `lib/data-sources/ati.ts`:

```typescript
const ATI_API_URL = process.env.ATI_API_URL!;
const ATI_API_KEY = process.env.ATI_API_KEY!;

export async function getATIData(tenantId: string, source: string) {
  const response = await fetch(`${ATI_API_URL}/v1/authority`, {
    headers: {
      'Authorization': `Bearer ${ATI_API_KEY}`,
      'X-Tenant-ID': tenantId,
    },
    body: JSON.stringify({ source }),
  });

  return response.json();
}
```

#### Update API Routes

Update `app/api/visibility/relevance/route.ts`:

```typescript
import { getPulseData } from '@/lib/data-sources/pulse';
import { getATIData } from '@/lib/data-sources/ati';

// In GET handler, replace mock data section:
try {
  // Fetch from real sources
  const sources = ['Cars.com', 'CarMax', 'AutoTrader', 'CarGurus'];
  
  const nodes = await Promise.all(
    sources.map(async (source) => {
      const [pulseData, atiData] = await Promise.all([
        getPulseData(tenantId, source),
        getATIData(tenantId, source),
      ]);

      return {
        name: source,
        visibility: pulseData.visibility || 0,
        proximity: pulseData.proximity || 0,
        authority: atiData.authority || 0,
        scsPct: pulseData.scsPct || 0,
      };
    })
  );

  return NextResponse.json({ nodes });
} catch (error) {
  console.error("Error fetching real data:", error);
  // Fallback to mock data
  return NextResponse.json({ nodes: [...mockNodes] });
}
```

### 4. Slack Webhook Delivery for Alerts

**Current Status**: Exists in `/api/send-digest/route.ts`  
**Target**: Wire to alert system

#### Create Alert Service

Create `lib/alerts/slack.ts`:

```typescript
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;
const SLACK_ALERT_WEBHOOK_URL = process.env.SLACK_ALERT_WEBHOOK_URL || SLACK_WEBHOOK_URL;

export interface AlertPayload {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  tenantId: string;
  metadata?: Record<string, any>;
}

export async function sendSlackAlert(payload: AlertPayload): Promise<boolean> {
  if (!SLACK_ALERT_WEBHOOK_URL) {
    console.warn("SLACK_ALERT_WEBHOOK_URL not configured");
    return false;
  }

  const colorMap = {
    info: '#36a64f',
    warning: '#ffa500',
    error: '#ff0000',
    critical: '#8b0000',
  };

  const slackMessage = {
    text: payload.title,
    attachments: [
      {
        color: colorMap[payload.severity],
        fields: [
          {
            title: 'Message',
            value: payload.message,
            short: false,
          },
          {
            title: 'Tenant ID',
            value: payload.tenantId,
            short: true,
          },
          {
            title: 'Severity',
            value: payload.severity.toUpperCase(),
            short: true,
          },
        ],
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  if (payload.metadata) {
    slackMessage.attachments[0].fields.push({
      title: 'Metadata',
      value: JSON.stringify(payload.metadata, null, 2),
      short: false,
    });
  }

  try {
    const response = await fetch(SLACK_ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    return response.ok;
  } catch (error) {
    console.error('Slack alert failed:', error);
    return false;
  }
}
```

#### Wire to Health Diagnostics

Update `app/(dashboard)/health/diagnostics/page.tsx`:

```typescript
import { sendSlackAlert } from '@/lib/alerts/slack';

// After fetching diagnostics, check for critical issues:
if (crawl.errors.some(e => e.impact === 'High')) {
  await sendSlackAlert({
    title: 'High-Impact Crawl Errors Detected',
    message: `${crawl.errors.filter(e => e.impact === 'High').length} high-impact errors found`,
    severity: 'error',
    tenantId: isolation.tenantId,
    metadata: { errors: crawl.errors.filter(e => e.impact === 'High') },
  });
}
```

### 5. Supabase/DB for Telemetry Storage

**Current Status**: Mock data  
**Target**: Real telemetry storage

#### Create Telemetry Service

Create `lib/telemetry/storage.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import { getUserTenantId } from '@/lib/api-protection/tenant-isolation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface TelemetryEvent {
  event_type: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export async function storeTelemetry(event: TelemetryEvent): Promise<void> {
  await supabase.from('telemetry_events').insert({
    event_type: event.event_type,
    tenant_id: event.tenant_id,
    user_id: event.user_id,
    metadata: event.metadata || {},
    timestamp: event.timestamp || new Date(),
  });
}

export async function getTelemetryStats(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  const { data, error } = await supabase
    .from('telemetry_events')
    .select('*')
    .eq('tenant_id', tenantId)
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString());

  if (error) throw error;
  return data;
}
```

#### Add Telemetry to API Routes

Update API routes to log telemetry:

```typescript
import { storeTelemetry } from '@/lib/telemetry/storage';

// In API route handler:
await storeTelemetry({
  event_type: 'api_request',
  tenant_id: tenantId,
  metadata: {
    endpoint: '/api/visibility/relevance',
    method: 'GET',
    response_time_ms: Date.now() - startTime,
  },
});
```

### 6. RI Simulator with Real Data

**Current Status**: Component exists  
**Target**: Wire to real data sources

#### Update `app/components/RISimulator.tsx`

```typescript
'use client';

import { useState } from 'react';
import { computeRI } from '@/app/lib/scoring/relevance';
import { getPulseData } from '@/lib/data-sources/pulse';
import { getATIData } from '@/lib/data-sources/ati';

export default function RISimulator() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  async function simulate(source: string) {
    setLoading(true);
    try {
      // Fetch real data
      const [pulse, ati] = await Promise.all([
        getPulseData('current-tenant', source),
        getATIData('current-tenant', source),
      ]);

      const ri = computeRI({
        visibility: pulse.visibility,
        proximity: pulse.proximity,
        authority: ati.authority,
        scsPct: pulse.scsPct,
      });

      setResults([...results, { source, ...ri }]);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Failed to fetch real data. Using mock data.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* UI for simulator */}
      <button onClick={() => simulate('Cars.com')} disabled={loading}>
        {loading ? 'Loading...' : 'Simulate Cars.com'}
      </button>
      {/* Display results */}
    </div>
  );
}
```

### 7. Export Evidence Packets

**Current Status**: Component exists, calls `/api/evidence/packet`  
**Target**: Real evidence packet generation

#### Update `app/api/evidence/packet/route.ts`

```typescript
import { NextResponse } from "next/server";
import { enforceTenantIsolation } from "@/lib/api-protection/tenant-isolation";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const isolation = await enforceTenantIsolation(req as any);
  if (!isolation.allowed || !isolation.tenantId) {
    return isolation.response || NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { tenantId, sources, scores, issues, cwv, notes } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch real data for evidence packet
  const [relevanceData, crawlData, cwvData] = await Promise.all([
    supabase
      .from('DealerSourceScore')
      .select('*')
      .eq('tenant_id', tenantId)
      .in('source', sources || []),
    supabase
      .from('CrawlIssue')
      .select('*')
      .eq('tenant_id', tenantId),
    supabase
      .from('CoreWebVitals')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('capturedAt', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const packet = {
    generated_at: new Date().toISOString(),
    tenant_id: tenantId,
    sources: relevanceData.data || [],
    scores: scores || {},
    issues: crawlData.data || [],
    cwv: cwvData.data || cwv,
    notes: notes || {},
    compliance: {
      gdpr_compliant: true,
      data_retention_days: 90,
    },
  };

  return NextResponse.json({ packet });
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Redis/BullMQ
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Data Sources
PULSE_API_URL=https://api.pulse.example.com
PULSE_API_KEY=your-pulse-key
ATI_API_URL=https://api.ati.example.com
ATI_API_KEY=your-ati-key
CIS_API_URL=https://api.cis.example.com
CIS_API_KEY=your-cis-key
PROBE_API_URL=https://api.probe.example.com
PROBE_API_KEY=your-probe-key

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_ALERT_WEBHOOK_URL=https://hooks.slack.com/services/...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing Checklist

- [ ] BullMQ queue processes jobs correctly
- [ ] "Fix It" buttons queue schema fixes
- [ ] Real data sources return data (Pulse/ATI/CIS/Probe)
- [ ] Slack alerts send successfully
- [ ] Telemetry events stored in database
- [ ] RI Simulator uses real data
- [ ] Evidence packets export correctly

## Next Steps

1. Set up Redis (Upstash or self-hosted)
2. Configure data source API keys
3. Set up Slack webhook
4. Create telemetry_events table in Supabase
5. Test each integration point
6. Monitor job queue and alerts

