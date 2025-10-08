# 🔧 Admin Features Activation Guide

## Overview

You have **7 powerful tRPC routers** already built and ready to use:

1. **Audit Router** - Full scoring engine integration
2. **Competitor Router** - Track and compare competitors
3. **Recommendation Router** - Smart AI recommendations
4. **Market Router** - Market analysis and insights
5. **Appraisal Router** - Appraisal form penetration analysis
6. **Dealership Router** - Full CRUD for dealerships
7. **Analytics Router** - Dashboard analytics

These are backend admin tools accessible via tRPC - **not part of the primary dealer dashboard**.

---

## ✅ Already Available (No Activation Needed)

### Via tRPC API Endpoints

All routers are accessible at `/api/trpc` once you:
1. Set up tRPC client in your app
2. Have proper authentication

**Example tRPC endpoint structure:**
```
POST /api/trpc/audit.generate
POST /api/trpc/competitor.add
GET  /api/trpc/recommendation.list
GET  /api/trpc/market.getAnalysis
POST /api/trpc/appraisal.analyze
```

---

## 🚀 Quick Activation: 3 Options

### Option 1: Admin Dashboard Page (Recommended)

Create an admin-only page to access all features:

**File:** `src/app/admin/dashboard/page.tsx`

```tsx
'use client';

import { trpc } from '@/lib/trpc-client';
import { useState } from 'react';

export default function AdminDashboard() {
  const [dealershipId, setDealershipId] = useState('');
  const [website, setWebsite] = useState('');

  // Mutations
  const runAudit = trpc.audit.generate.useMutation();
  const analyzeAppraisal = trpc.appraisal.analyze.useMutation();
  const addCompetitor = trpc.competitor.add.useMutation();

  // Queries
  const { data: recommendations } = trpc.recommendation.list.useQuery(
    { dealershipId },
    { enabled: !!dealershipId }
  );

  const { data: market } = trpc.market.getAnalysis.useQuery(
    { location: 'Naples, FL' },
    { staleTime: 7 * 24 * 60 * 60 * 1000 } // 7 days
  );

  const handleRunAudit = async () => {
    const result = await runAudit.mutateAsync({
      dealershipId,
      website,
      detailed: true
    });
    console.log('Audit complete:', result);
  };

  const handleAnalyzeAppraisal = async () => {
    const result = await analyzeAppraisal.mutateAsync({
      dealershipId,
      dealershipUrl: website,
      dealershipName: 'Naples Auto',
      location: 'Naples, FL'
    });
    console.log('Appraisal analysis complete:', result);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Input Form */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Run Analysis</h2>
        <input
          type="text"
          placeholder="Dealership ID"
          value={dealershipId}
          onChange={(e) => setDealershipId(e.target.value)}
          className="border p-2 rounded mr-4"
        />
        <input
          type="text"
          placeholder="Website URL"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="border p-2 rounded mr-4"
        />
        <button
          onClick={handleRunAudit}
          disabled={runAudit.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {runAudit.isPending ? 'Running...' : 'Run Full Audit'}
        </button>
        <button
          onClick={handleAnalyzeAppraisal}
          disabled={analyzeAppraisal.isPending}
          className="bg-green-600 text-white px-4 py-2 rounded ml-2"
        >
          {analyzeAppraisal.isPending ? 'Analyzing...' : 'Analyze Appraisal Forms'}
        </button>
      </div>

      {/* Results */}
      {runAudit.data && (
        <div className="mb-8 p-6 border rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold mb-4">Audit Results</h2>
          <pre>{JSON.stringify(runAudit.data, null, 2)}</pre>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.recommendations.length > 0 && (
        <div className="mb-8 p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          {recommendations.recommendations.map((rec: any) => (
            <div key={rec.id} className="mb-4 p-4 border-l-4 border-blue-500">
              <h3 className="font-bold">{rec.title}</h3>
              <p className="text-sm text-gray-600">{rec.description}</p>
              <div className="mt-2">
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                  Priority {rec.priority}
                </span>
                <span className="text-xs bg-green-100 px-2 py-1 rounded ml-2">
                  Impact: {rec.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Market Analysis */}
      {market && (
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Avg Score</div>
              <div className="text-2xl font-bold">{market.averageScore}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Top Performer</div>
              <div className="text-2xl font-bold">{market.topPerformer}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Total Dealers</div>
              <div className="text-2xl font-bold">{market.totalDealerships}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Option 2: Direct API Calls (For Scripts/Testing)

Use the tRPC API directly via HTTP:

```bash
# Run Audit
curl -X POST http://localhost:3001/api/trpc/audit.generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "dealershipId": "uuid-here",
    "website": "https://naplesauto.com",
    "detailed": true
  }'

# Analyze Appraisal Forms
curl -X POST http://localhost:3001/api/trpc/appraisal.analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "dealershipId": "uuid-here",
    "dealershipUrl": "https://naplesauto.com",
    "dealershipName": "Naples Auto",
    "location": "Naples, FL"
  }'

# Get Recommendations
curl http://localhost:3001/api/trpc/recommendation.list?dealershipId=uuid-here \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

---

### Option 3: Test Page (Already Created)

You already have a test page at:

**URL:** `http://localhost:3001/test-audit`

**File:** `src/app/test-audit/page.tsx`

This page has:
- Full 4-step workflow button
- Real-time status updates
- Results display
- Example SQL setup

---

## 📊 Feature Breakdown

### 1. Audit Router

**What it does:**
- Runs complete 5-module scoring analysis
- Stores results in `audits` and `score_history` tables
- Logs API usage for cost tracking

**How to use:**
```tsx
const audit = trpc.audit.generate.useMutation();

await audit.mutateAsync({
  dealershipId: 'uuid',
  website: 'https://dealer.com',
  detailed: true // false for quick scan
});
```

**Returns:**
```json
{
  "audit": {
    "id": "audit-uuid",
    "ai_visibility_score": 78,
    "sgp_integrity_score": 82,
    "zero_click_score": 71,
    "ugc_health_score": 85,
    "geo_trust_score": 79,
    "overall_score": 79
  },
  "scores": { ... },
  "recommendations": [ ... ]
}
```

---

### 2. Appraisal Router

**What it does:**
- Discovers appraisal forms on website
- Scores form quality (6 factors)
- Tests AI platform visibility (ChatGPT, Claude, Perplexity, Gemini)
- Benchmarks against competitors
- Generates smart recommendations

**How to use:**
```tsx
const appraisal = trpc.appraisal.analyze.useMutation();

await appraisal.mutateAsync({
  dealershipId: 'uuid',
  dealershipUrl: 'https://dealer.com',
  dealershipName: 'Naples Auto',
  location: 'Naples, FL'
});
```

**Returns:**
```json
{
  "penetrationScore": 72,
  "formQualityScore": 68,
  "aiVisibilityScore": 45,
  "formsDiscovered": [
    {
      "url": "/appraisal",
      "type": "online_appraisal",
      "fieldCount": 10,
      "hasInstantValue": true,
      "isMobileOptimized": true,
      "trustSignals": ["BBB Accredited"],
      "requiredFields": 4
    }
  ],
  "recommendations": [
    {
      "title": "Add Instant Valuation Feature",
      "priority": 1,
      "impact": "high",
      "estimatedLeadIncrease": "35-45%"
    }
  ]
}
```

---

### 3. Competitor Router

**What it does:**
- Add competitors by URL
- Run scoring on competitors
- Build competitive comparison matrix
- Track competitor performance over time

**How to use:**
```tsx
// Add competitor
await trpc.competitor.add.mutate({
  dealershipId: 'your-uuid',
  competitorName: 'Honda of Naples',
  competitorUrl: 'https://hondaofnaples.com'
});

// Get comparison matrix
const matrix = await trpc.competitor.getMatrix.query({
  dealershipId: 'your-uuid'
});
```

**Matrix returns:**
```json
{
  "yourDealership": {
    "name": "Naples Auto",
    "ai_visibility": 78,
    "sgp_integrity": 82,
    "zero_click": 71,
    "ugc_health": 85,
    "geo_trust": 79
  },
  "competitors": [ ... ],
  "yourRank": 2,
  "totalCompetitors": 5
}
```

---

### 4. Recommendation Router

**What it does:**
- Auto-generates recommendations from audit scores
- Prioritizes by impact and effort
- Tracks recommendation status (pending/in_progress/completed)
- Creates 2x2 priority matrix

**How to use:**
```tsx
// Generate recommendations
await trpc.recommendation.generate.mutate({
  dealershipId: 'uuid',
  auditId: 'audit-uuid'
});

// List by status
const pending = await trpc.recommendation.list.query({
  dealershipId: 'uuid',
  status: 'pending'
});

// Update status
await trpc.recommendation.updateStatus.mutate({
  id: 'rec-uuid',
  status: 'in_progress'
});

// Get priority matrix
const matrix = await trpc.recommendation.getPriorityMatrix.query({
  dealershipId: 'uuid'
});
```

---

### 5. Market Router

**What it does:**
- Market analysis for location (7-day cache)
- Historical market trends
- Benchmark vs market average
- Identify market-wide opportunities

**How to use:**
```tsx
// Get market analysis
const market = await trpc.market.getAnalysis.query({
  location: 'Naples, FL'
});

// Get trends
const trends = await trpc.market.getTrends.query({
  location: 'Naples, FL',
  months: 6
});

// Get benchmark
const benchmark = await trpc.market.getBenchmark.query({
  dealershipId: 'uuid',
  metric: 'ai_visibility'
});
```

---

## 🔐 Authentication

All admin features require authentication via Clerk. You have two options:

### Option A: Fix Middleware (For Production)

The middleware has syntax errors. I can fix them if you want proper authentication.

### Option B: Bypass Auth (For Testing Only)

Add public routes to test without login:

```typescript
// middleware.ts
export default authMiddleware({
  publicRoutes: [
    '/',
    '/test-audit',
    '/api/trpc/(.*)', // Make tRPC public for testing
  ]
});
```

**⚠️ WARNING:** Do not deploy with tRPC routes public!

---

## 📁 Database Setup

Before using any features, run the database migrations:

```bash
# 1. Run main schema (if not already done)
psql "YOUR_SUPABASE_CONNECTION_STRING" < database/schema.sql

# 2. Run appraisal analysis migration
psql "YOUR_SUPABASE_CONNECTION_STRING" < database/migrations/add-appraisal-analysis.sql

# 3. Add test data (optional)
psql "YOUR_SUPABASE_CONNECTION_STRING" < test-data-setup.sql
```

**Or via Supabase SQL Editor:**
```bash
open "https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new"
# Copy/paste SQL files and run
```

---

## 🎯 Complete Workflow Example

```tsx
'use client';

export default function CompleteWorkflow() {
  const dealershipId = 'your-uuid';
  const website = 'https://naplesauto.com';

  const runCompleteWorkflow = async () => {
    // Step 1: Run audit
    console.log('Step 1: Running audit...');
    const audit = await trpc.audit.generate.mutate({
      dealershipId,
      website,
      detailed: true
    });
    console.log('✅ Audit complete:', audit.audit.overall_score);

    // Step 2: Generate recommendations
    console.log('Step 2: Generating recommendations...');
    const recs = await trpc.recommendation.generate.mutate({
      dealershipId,
      auditId: audit.audit.id
    });
    console.log('✅ Generated', recs.recommendations.length, 'recommendations');

    // Step 3: Analyze appraisal forms
    console.log('Step 3: Analyzing appraisal forms...');
    const appraisal = await trpc.appraisal.analyze.mutate({
      dealershipId,
      dealershipUrl: website,
      dealershipName: 'Naples Auto',
      location: 'Naples, FL'
    });
    console.log('✅ Appraisal score:', appraisal.analysis.penetrationScore);

    // Step 4: Get competitive matrix
    console.log('Step 4: Getting competitive matrix...');
    const matrix = await trpc.competitor.getMatrix.query({
      dealershipId
    });
    console.log('✅ Your rank:', matrix.yourRank, 'of', matrix.totalCompetitors);

    // Step 5: Get market insights
    console.log('Step 5: Getting market insights...');
    const market = await trpc.market.getAnalysis.query({
      location: 'Naples, FL'
    });
    console.log('✅ Market average:', market.averageScore);

    console.log('🎉 Complete workflow finished!');
  };

  return (
    <button onClick={runCompleteWorkflow}>
      Run Complete Workflow
    </button>
  );
}
```

---

## 🚀 Next Steps

1. **Choose activation method** (Admin Dashboard, API, or Test Page)
2. **Run database migrations** (if not done)
3. **Fix middleware** (optional, for production auth)
4. **Test a feature** (start with audit or appraisal)
5. **Review results** in database tables

---

## 📚 Documentation Files

- `AUDIT_WORKFLOW_SETUP.md` - Complete audit workflow guide
- `APPRAISAL_PENETRATION_GUIDE.md` - Appraisal analysis guide
- `APPRAISAL_AGENT_STATUS.md` - Integration status
- `QUICK_START.md` - 5-minute quick start
- `examples/audit-workflow-example.ts` - Code examples

---

## 💡 Questions?

- **Q: Where are the tRPC routers defined?**
  - A: `src/server/routers/*.ts` (7 router files)

- **Q: What tables are created?**
  - A: `audits`, `score_history`, `recommendations`, `competitors`, `market_data`, `appraisal_analysis`

- **Q: Do I need API keys?**
  - A: Only for real AI platform testing in appraisal agent (optional, uses mocks by default)

- **Q: How do I access the admin dashboard?**
  - A: Create `src/app/admin/dashboard/page.tsx` using Option 1 above, or use test page at `/test-audit`
