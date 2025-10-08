# 🚀 Complete Audit Workflow - Setup Guide

This guide shows you exactly how to use the 4-step audit workflow in your DealershipAI application.

## 📋 The 4-Step Workflow

```typescript
// 1. Run Audit (uses real scoring engine)
const audit = await trpc.audit.generate.mutate({
  dealershipId,
  website: 'https://dealer.com',
  detailed: true
});
// ↓ Stores in `audits` + `score_history` tables

// 2. Generate Recommendations
const recs = await trpc.recommendation.generate.mutate({
  dealershipId,
  auditId: audit.id
});
// ↓ Stores in `recommendations` table

// 3. Add Competitors
await trpc.competitor.add.mutate({
  dealershipId,
  competitorName: 'Rival Auto',
  competitorWebsite: 'https://rival.com'
});
// ↓ Runs scoring + stores in `competitors` table

// 4. Get Competitive Matrix
const matrix = await trpc.competitor.getMatrix.query({
  dealershipId
});
// ↓ Returns you vs competitors comparison
```

---

## 🔧 Setup Steps

### Step 1: Install Dependencies

Already installed ✅
- `@trpc/server`
- `@trpc/react-query`
- `@trpc/client`
- `@tanstack/react-query`
- `superjson`

### Step 2: Add TRPCProvider to your app

Edit `src/app/layout.tsx`:

```tsx
import { TRPCProvider } from '@/lib/trpc-client';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
```

### Step 3: Create Test Data

Add a test dealership to your database:

```sql
-- 1. Create a test tenant (if you don't have one)
INSERT INTO tenants (id, name, subscription_tier, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Dealership Group',
  'growth',
  NOW()
);

-- 2. Create a test user linked to Clerk
INSERT INTO users (clerk_id, tenant_id, email, full_name, role)
VALUES (
  'your_clerk_user_id_here',  -- Get this from Clerk dashboard
  '11111111-1111-1111-1111-111111111111',
  'test@dealer.com',
  'Test User',
  'dealership_admin'
);

-- 3. Create a test dealership
INSERT INTO dealership_data (
  id,
  tenant_id,
  name,
  website,
  domain,
  location,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Naples Auto Mall',
  'https://naplesautomall.com',
  'naplesautomall.com',
  'Naples, FL',
  NOW()
);
```

### Step 4: Use the Workflow

**Option A: Use the Complete Page Component**

Navigate to: `/dealership/22222222-2222-2222-2222-222222222222/audit`

The page has a "Run Complete Audit Workflow" button that executes all 4 steps.

**Option B: Use in Your Own Component**

```tsx
'use client';

import { trpc } from '@/lib/trpc-client';

export function MyAuditButton() {
  const runWorkflow = async () => {
    // Step 1: Audit
    const audit = await trpc.audit.generate.mutate({
      dealershipId: '22222222-2222-2222-2222-222222222222',
      website: 'https://naplesautomall.com',
      detailed: true
    });

    console.log('Audit complete:', audit);

    // Step 2: Recommendations
    const recs = await trpc.recommendation.generate.mutate({
      dealershipId: '22222222-2222-2222-2222-222222222222',
      auditId: audit.audit.id
    });

    console.log('Recommendations:', recs);

    // Step 3: Get competitors
    const competitors = await trpc.competitor.list.query({
      dealershipId: '22222222-2222-2222-2222-222222222222'
    });

    console.log('Competitors:', competitors);

    // Step 4: Matrix
    const matrix = await trpc.competitor.getMatrix.query({
      dealershipId: '22222222-2222-2222-2222-222222222222'
    });

    console.log('Matrix:', matrix);
  };

  return (
    <button onClick={runWorkflow}>
      Run Audit Workflow
    </button>
  );
}
```

**Option C: Use React Hooks (Recommended)**

```tsx
'use client';

import { trpc } from '@/lib/trpc-client';

export function SmartAuditButton({ dealershipId, website }) {
  // Mutations
  const generateAudit = trpc.audit.generate.useMutation({
    onSuccess: (data) => {
      console.log('Audit complete!', data);
      // Auto-generate recommendations
      generateRecs.mutate({
        dealershipId,
        auditId: data.audit.id
      });
    }
  });

  const generateRecs = trpc.recommendation.generate.useMutation();

  // Queries (auto-refreshes)
  const { data: audits } = trpc.audit.list.useQuery({ dealershipId });
  const { data: recommendations } = trpc.recommendation.list.useQuery({
    dealershipId,
    status: 'pending'
  });
  const { data: matrix } = trpc.competitor.getMatrix.useQuery({ dealershipId });

  return (
    <div>
      <button
        onClick={() => generateAudit.mutate({ dealershipId, website, detailed: true })}
        disabled={generateAudit.isLoading}
      >
        {generateAudit.isLoading ? 'Running...' : 'Run Audit'}
      </button>

      {audits && (
        <div>Latest Score: {audits.audits[0]?.overall_score}</div>
      )}

      {recommendations && (
        <div>{recommendations.length} recommendations</div>
      )}

      {matrix && (
        <div>Your Rank: #{matrix.yourRank}</div>
      )}
    </div>
  );
}
```

---

## 📂 Files Created

### tRPC Routers (Backend)
- ✅ `src/server/routers/audit.ts` - Audit generation with real scoring
- ✅ `src/server/routers/competitor.ts` - Competitor tracking
- ✅ `src/server/routers/recommendation.ts` - Smart recommendations
- ✅ `src/server/routers/market.ts` - Market analysis
- ✅ `src/server/routers/dealership.ts` - CRUD operations
- ✅ `src/server/routers/_app.ts` - Main router

### Client Setup
- ✅ `src/lib/trpc-client.tsx` - React client & provider

### Components
- ✅ `src/components/audit/AuditDashboard.tsx` - Full dashboard with charts
- ✅ `src/app/dealership/[id]/audit/page.tsx` - Complete workflow page

### Examples
- ✅ `examples/audit-workflow-example.ts` - All usage patterns

---

## 🎯 What Each Step Does

### Step 1: Audit Generation
**What it runs:**
- AI Visibility (ChatGPT, Claude queries)
- SGP Integrity (Schema markup validation)
- Zero-Click (Featured snippet analysis)
- UGC Health (Review sentiment, volume, response rate)
- Geo Trust (Local SEO signals, NAP consistency)

**What it stores:**
```sql
-- audits table
INSERT INTO audits (
  tenant_id,
  dealership_id,
  overall_score,
  ai_visibility_score,
  zero_click_score,
  ugc_health_score,
  geo_trust_score,
  sgp_integrity_score,
  detailed_results,
  created_at
) VALUES (...);

-- score_history table (for trends)
INSERT INTO score_history (
  dealership_id,
  overall_score,
  ai_visibility_score,
  -- ... all scores
  recorded_at
) VALUES (...);

-- api_usage table (cost tracking)
INSERT INTO api_usage (
  tenant_id,
  user_id,
  service_name,
  cost,
  metadata
) VALUES (...);
```

### Step 2: Recommendations
**Logic:**
- If AI Visibility < 70 → "Improve AI Citations"
- If SGP Integrity < 70 → "Add Schema Markup"
- If Zero-Click < 70 → "Optimize for Featured Snippets"
- If UGC Health < 70 → "Improve Review Management"
- If Geo Trust < 70 → "Fix NAP Consistency"
- Always → "Monitor Competitors"

**Stored in:**
```sql
INSERT INTO recommendations (
  dealership_id,
  category,
  title,
  description,
  priority,
  impact_score,
  effort_level,
  estimated_improvement,
  status
) VALUES (...);
```

### Step 3: Competitor Analysis
**Process:**
1. Extract domain from competitor website
2. Run full scoring on competitor (same 5 modules)
3. Store competitor with scores

**Stored in:**
```sql
INSERT INTO competitors (
  dealership_id,
  name,
  website,
  domain,
  location,
  last_score,
  ai_visibility_score,
  zero_click_score,
  ugc_health_score,
  geo_trust_score,
  sgp_integrity_score,
  last_analyzed
) VALUES (...);
```

### Step 4: Competitive Matrix
**Returns:**
```typescript
{
  matrix: [
    {
      name: "Your Dealership",
      type: "yours",
      overall: 85,
      ai_visibility: 80,
      zero_click: 90,
      ugc_health: 85,
      geo_trust: 88,
      sgp_integrity: 82
    },
    {
      name: "Competitor 1",
      type: "competitor",
      overall: 78,
      ai_visibility: 75,
      zero_click: 85,
      ugc_health: 80,
      geo_trust: 75,
      sgp_integrity: 70
    }
  ],
  yourRank: 1,
  totalCompetitors: 5
}
```

---

## 🔍 Testing Checklist

- [ ] Can generate audit for test dealership
- [ ] Audit scores appear in database
- [ ] Recommendations are generated
- [ ] Can add competitor
- [ ] Competitor matrix shows correct ranking
- [ ] Score history tracks over time
- [ ] API usage is logged
- [ ] All queries work with tenant isolation

---

## 🐛 Troubleshooting

### "Unauthorized" errors
**Fix:** Make sure user is authenticated via Clerk and has a record in the `users` table with correct `tenant_id`.

### "Dealership not found"
**Fix:** Check that dealership exists in `dealership_data` table with matching `tenant_id`.

### Scoring modules return 0
**Fix:** Check that API keys are configured:
- `OPENAI_API_KEY` for AI Visibility (ChatGPT)
- `ANTHROPIC_API_KEY` for AI Visibility (Claude)

### Database errors
**Fix:** Ensure all tables from `complete-schema.sql` are created in Supabase.

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   User      │
│  Interface  │
└──────┬──────┘
       │ trpc.audit.generate.mutate()
       ↓
┌──────────────┐
│ tRPC Router  │
│  (audit.ts)  │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│  Scoring Engine      │
│  getDealershipScores │
│  ┌─────────────────┐ │
│  │ AI Visibility   │ │ → ChatGPT/Claude APIs
│  │ SGP Integrity   │ │ → Cheerio web scraping
│  │ Zero-Click      │ │ → SEO analysis
│  │ UGC Health      │ │ → Review aggregation
│  │ Geo Trust       │ │ → Local SEO checks
│  └─────────────────┘ │
└──────┬───────────────┘
       │
       ↓
┌──────────────┐
│  Supabase    │
│  Database    │
│  ┌──────────┐│
│  │ audits   ││
│  │ score_h  ││
│  │ api_use  ││
│  └──────────┘│
└──────────────┘
```

---

## 🚀 Production Checklist

Before going live:

- [ ] API keys configured (OpenAI, Anthropic)
- [ ] Rate limiting implemented for expensive API calls
- [ ] Caching enabled (scores cached for 24 hours)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Cost monitoring for AI API usage
- [ ] Multi-tenant isolation tested
- [ ] RLS policies verified
- [ ] Performance tested with real data

---

## 📚 Additional Resources

- **Full Example:** `examples/audit-workflow-example.ts`
- **Dashboard Component:** `src/components/audit/AuditDashboard.tsx`
- **Complete Page:** `src/app/dealership/[id]/audit/page.tsx`
- **tRPC Docs:** https://trpc.io/docs
- **React Query Docs:** https://tanstack.com/query/latest

---

**🎉 You're all set! The complete audit workflow is ready to use.**
