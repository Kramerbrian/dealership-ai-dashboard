# What's Next - Action Plan

## 🎯 You Are Here

✅ Database migrations created
✅ Tier-based feature system implemented
✅ Service layers built (subscription-service, analytics-service)
✅ Documentation complete
⏳ **Next: Run migrations and integrate into your API routes**

---

## 🚀 Immediate Actions (Start Here!)

### Step 1: Run Database Migrations (5 minutes)

```bash
# 1. Make sure your DATABASE_URL is set in .env
echo "DATABASE_URL=postgresql://user:pass@localhost:5432/dealershipai" >> .env

# Or for Supabase:
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# 2. Run migrations
npm run db:migrate

# 3. Seed test data
npm run db:seed

# 4. Verify everything worked
npm run db:migrate:status
```

**Expected Output:**
```
✅ Database connected successfully
Batch 1 run: 2 migrations
✅ Seed data inserted successfully!
```

### Step 2: Test Database Connection (2 minutes)

Create a quick test:
```bash
# Test the connection
node -e "const db = require('./lib/db.ts').default; db.raw('SELECT 1').then(() => console.log('✅ DB Connected')).catch(e => console.error('❌', e))"
```

### Step 3: Update Your First API Route (15 minutes)

Pick your most-used API route and add feature gating. Here's an example with `/api/scores/route.ts`:

```typescript
// app/api/scores/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { subscriptionService } from '@/lib/services/subscription-service';
import { analyticsService } from '@/lib/services/analytics-service';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check feature access
    const hasAccess = await subscriptionService.canUserAccessFeature(
      userId,
      'advanced_analytics'
    );

    if (!hasAccess) {
      const message = await subscriptionService.getUpgradeMessageForUser(
        userId,
        'advanced_analytics'
      );
      return NextResponse.json(
        { error: 'Upgrade required', message },
        { status: 403 }
      );
    }

    // Get request body
    const { dealershipUrl } = await req.json();

    // Run analysis with database tracking
    const result = await analyticsService.analyzeDealership(dealershipUrl, userId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
```

---

## 📊 Quick Wins (Pick One to Start)

### Option A: Add Usage Stats Endpoint (30 minutes)

Create `/api/usage/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { subscriptionService } from '@/lib/services/subscription-service';

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limits = await subscriptionService.getUserLimits(userId);
  return NextResponse.json(limits);
}
```

### Option B: Add Tier Check to Chat Sessions (30 minutes)

Update your chat session creation:
```typescript
// Before creating chat session
await subscriptionService.enforceFeatureAccess(userId, 'chat_sessions');

// Create session
await tables.chatSessions().insert({
  user_id: userId,
  tenant_id: tenantId,
  session_token: 'unique_token',
  messages: JSON.stringify([]),
});
```

### Option C: Display Usage in Dashboard (1 hour)

Create a usage widget:
```typescript
// components/UsageWidget.tsx
import { useEffect, useState } from 'react';

export function UsageWidget() {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(setUsage);
  }, []);

  if (!usage) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded">
      <h3>Your Plan: {usage.tier.toUpperCase()}</h3>
      <div>
        <p>Chat Sessions: {usage.usage.chatSessions} / {usage.limits.chatSessions === -1 ? '∞' : usage.limits.chatSessions}</p>
        <p>Market Scans: {usage.usage.marketScans} / {usage.limits.marketScans === -1 ? '∞' : usage.limits.marketScans}</p>
      </div>
      {usage.remaining.chatSessions === 0 && (
        <button onClick={() => window.location.href = '/upgrade'}>
          Upgrade Now
        </button>
      )}
    </div>
  );
}
```

---

## 🔄 Integration Priority List

### High Priority (Do First)

1. **`/api/scores/route.ts`** - Score generation
   - Feature: `advanced_analytics`
   - Most critical for your business

2. **`/api/cron/monthly-scan/route.ts`** - Monthly scans
   - Feature: `market_scans`
   - Recurring feature with limits

3. **Chat endpoint** (wherever you handle chat)
   - Feature: `chat_sessions`
   - High-volume feature

### Medium Priority

4. **`/api/optimizer/route.ts`** - AI optimizer
5. **`/api/analytics/route.ts`** - Analytics
6. **Data export endpoints**
   - Feature: `data_export`

### Low Priority

7. Competitor tracking endpoints
8. Mystery shopping endpoints
9. Review management endpoints

---

## 📁 File Structure Reference

```
Your Project
├── knexfile.js                              ← Knex config
├── .env                                     ← DATABASE_URL here!
├── db/
│   ├── migrations/
│   │   ├── 20250106000001_create_core_tables.js
│   │   └── 20250106000002_create_feature_tables.js
│   └── seeds/
│       └── 001_initial_data.js
├── lib/
│   ├── db.ts                               ← Database connection
│   ├── tier-features.ts                    ← Feature gating logic
│   └── services/
│       ├── subscription-service.ts         ← NEW! Use this for tier checks
│       └── analytics-service.ts            ← NEW! Use this for analytics
├── app/api/
│   ├── scores/route.ts                     ← UPDATE THIS FIRST
│   ├── cron/monthly-scan/route.ts          ← THEN THIS
│   └── usage/route.ts                      ← CREATE THIS (optional)
└── backend/src/services/
    └── analytics.ts                        ← OLD VERSION (keep for now)
```

---

## 🧪 Testing Checklist

After running migrations and updating your first route:

```bash
# 1. Verify migrations
npm run db:migrate:status

# 2. Check tables exist
psql $DATABASE_URL -c "\dt"

# 3. Query a table
psql $DATABASE_URL -c "SELECT * FROM tenants;"

# 4. Test your updated API route
curl -X POST http://localhost:3001/api/scores \
  -H "Content-Type: application/json" \
  -d '{"dealershipUrl": "https://example.com"}'

# 5. Check usage tracking
psql $DATABASE_URL -c "SELECT * FROM dealership_data;"
```

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module '@/lib/db'"

**Solution:** Make sure TypeScript paths are configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: "connection refused"

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify DATABASE_URL in `.env`
3. For Supabase, use connection pooler port (6543) instead of direct (5432)

### Issue: Migration fails

**Solution:**
```bash
# Check status
npm run db:migrate:status

# Rollback
npm run db:migrate:rollback

# Fix the issue in migration file

# Re-run
npm run db:migrate
```

---

## 📚 Reference Documents

- **[DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)** - Complete setup instructions
- **[INTEGRATION_ROADMAP.md](INTEGRATION_ROADMAP.md)** - Detailed integration plan
- **[DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md)** - What was built
- **[db/README.md](db/README.md)** - Migration commands reference
- **[lib/examples/tier-features-example.ts](lib/examples/tier-features-example.ts)** - Code examples

---

## 💬 Example API Response After Integration

### Before (No Tier Checking):
```json
{
  "success": true,
  "score": 85
}
```

### After (With Tier Checking):
```json
// Free user trying to access Pro feature
{
  "error": "Upgrade required",
  "message": "Advanced Analytics requires a PRO plan. Upgrade to unlock this feature."
}

// Pro user with access
{
  "success": true,
  "score": 85,
  "remaining": {
    "analyses": 20
  }
}
```

---

## 🎯 Success Metrics

You'll know it's working when:

✅ Users can see their current tier and usage
✅ Free users get upgrade prompts
✅ Usage counts increment in database
✅ Paid users have higher limits
✅ All data is tenant-isolated (RLS working)

---

## 🚀 Ready to Start?

Run these three commands and you're good to go:

```bash
npm run db:migrate
npm run db:seed
npm run db:migrate:status
```

Then pick ONE API route from the "High Priority" list and add feature gating using the examples above.

**Estimated time to get first integration working: 30-45 minutes**

Good luck! 🎉
