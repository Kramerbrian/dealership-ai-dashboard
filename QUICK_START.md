# 🚀 Quick Start - Test the Audit Workflow in 5 Minutes

## Step 1: Setup Database (2 minutes)

1. Open Supabase SQL Editor
2. Copy and paste the contents of [`test-data-setup.sql`](test-data-setup.sql)
3. **IMPORTANT:** Replace `user_2example123` with your actual Clerk user ID
   - Get it from: Clerk Dashboard → Users → Click your user → Copy User ID
4. Run the SQL
5. Copy the dealership ID from the results (e.g., `22222222-2222-2222-2222-222222222222`)

## Step 2: Test the Workflow (3 minutes)

1. Open your browser: **http://localhost:3001/test-audit**
2. Paste the dealership ID into the form
3. Enter website: `https://naplesautomall.com`
4. Click **"🚀 Run Complete Workflow (All 4 Steps)"**
5. Watch the results appear!

## What You'll See

### Step 1: Audit Results ✅
```
Overall Score: 85
AI Visibility: 80
SGP Integrity: 75
Zero-Click: 88
UGC Health: 82
Geo Trust: 85
```

### Step 2: Recommendations 💡
```
Generated 5 recommendations:
1. Improve AI Visibility (Impact: 9/10, Effort: 6/10)
2. Implement Structured Data Markup (Impact: 8/10, Effort: 3/10)
3. Optimize for Zero-Click Results (Impact: 7/10, Effort: 4/10)
...
```

### Step 3: Competitors 🏆
```
Tracking 2 competitors:
1. Honda of Naples - Score: 78
2. Toyota of Naples - Score: 82
```

### Step 4: Competitive Matrix 📊
```
Your Rank: #2 of 3 dealerships

| Dealership         | Overall | AI | Zero-Click | UGC |
|--------------------|---------|-----|-----------|-----|
| Toyota of Naples   | 82      | 80  | 85        | 84  |
| Naples Auto Mall ⭐ | 85      | 80  | 88        | 82  |
| Honda of Naples    | 78      | 75  | 80        | 82  |
```

---

## 🎯 Use in Your Code

### React Component
```tsx
import { trpc } from '@/lib/trpc-client';

function MyComponent() {
  const runAudit = async () => {
    // Step 1
    const audit = await trpc.audit.generate.mutate({
      dealershipId: '22222222-2222-2222-2222-222222222222',
      website: 'https://naplesautomall.com',
      detailed: true
    });

    console.log('Audit:', audit);

    // Step 2
    const recs = await trpc.recommendation.generate.mutate({
      dealershipId: '22222222-2222-2222-2222-222222222222',
      auditId: audit.audit.id
    });

    console.log('Recommendations:', recs);

    // Step 3
    const competitors = await trpc.competitor.list.query({
      dealershipId: '22222222-2222-2222-2222-222222222222'
    });

    console.log('Competitors:', competitors);

    // Step 4
    const matrix = await trpc.competitor.getMatrix.query({
      dealershipId: '22222222-2222-2222-2222-222222222222'
    });

    console.log('Matrix:', matrix);
  };

  return <button onClick={runAudit}>Run Audit</button>;
}
```

### React Hooks (Better)
```tsx
import { trpc } from '@/lib/trpc-client';

function MyComponent() {
  const generateAudit = trpc.audit.generate.useMutation();
  const { data: audits } = trpc.audit.list.useQuery({ dealershipId: 'uuid' });
  const { data: matrix } = trpc.competitor.getMatrix.useQuery({ dealershipId: 'uuid' });

  return (
    <button
      onClick={() => generateAudit.mutate({
        dealershipId: 'uuid',
        website: 'https://dealer.com',
        detailed: true
      })}
      disabled={generateAudit.isLoading}
    >
      {generateAudit.isLoading ? 'Running...' : 'Run Audit'}
    </button>
  );
}
```

---

## 📂 Where Everything Is

### Backend (tRPC Routers)
- `src/server/routers/audit.ts` - Audit generation
- `src/server/routers/competitor.ts` - Competitor tracking
- `src/server/routers/recommendation.ts` - Recommendations
- `src/server/routers/market.ts` - Market analysis
- `src/server/routers/dealership.ts` - Dealership CRUD
- `src/server/routers/_app.ts` - Main router

### Frontend
- `src/lib/trpc-client.tsx` - React client & provider
- `src/components/audit/AuditDashboard.tsx` - Full dashboard
- `src/app/test-audit/page.tsx` - Test page
- `src/app/dealership/[id]/audit/page.tsx` - Production page

### Database
- `dealershipai-enterprise/scripts/complete-schema.sql` - Full schema (already deployed ✅)

### Examples & Docs
- `examples/audit-workflow-example.ts` - Code examples
- `AUDIT_WORKFLOW_SETUP.md` - Complete guide
- `test-data-setup.sql` - Test data
- `QUICK_START.md` - This file!

---

## 🔍 Debug Checklist

### Audit not running?
- [ ] Clerk user ID in database matches your actual Clerk ID
- [ ] Dealership exists in `dealership_data` table
- [ ] User's `tenant_id` matches dealership's `tenant_id`
- [ ] User is authenticated in browser (check Clerk)

### Scores are 0?
- [ ] `OPENAI_API_KEY` set in `.env` (for AI Visibility)
- [ ] `ANTHROPIC_API_KEY` set in `.env` (for AI Visibility)
- [ ] Website is accessible (not behind auth)

### TypeScript errors?
- [ ] Run `npm install` to ensure all dependencies
- [ ] Check `src/server/routers/_app.ts` exports `AppRouter` type

---

## 🎉 What Next?

✅ Test the workflow at `/test-audit`
✅ View results in Supabase database
✅ Check browser console for detailed logs
✅ Use the React hooks in your components
✅ Add real competitors with `trpc.competitor.add.mutate()`
✅ Build charts with score history data

---

## 💬 Need Help?

Check these files:
1. `AUDIT_WORKFLOW_SETUP.md` - Full documentation
2. `examples/audit-workflow-example.ts` - Code examples
3. Browser console - Detailed logs for each step

The workflow logs everything to console so you can see exactly what's happening!

---

**Ready to test?** → http://localhost:3001/test-audit 🚀
