# Integration Roadmap - Database & Feature Gating

## 🎯 Current Status
✅ Database migrations created
✅ Tier-based feature access control implemented
✅ Seed data ready
⬜ Database not yet migrated
⬜ API routes need integration

## 📋 Phase 1: Database Setup (Do This First!)

### Step 1: Configure Database Connection
```bash
# Add to .env
DATABASE_URL=postgresql://user:pass@localhost:5432/dealershipai

# Or for Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

### Step 2: Run Migrations
```bash
npm run db:migrate
npm run db:seed
npm run db:migrate:status  # Verify
```

### Step 3: Test Database Connection
```bash
# Create a test script
node -e "const db = require('./lib/db').default; db.raw('SELECT 1').then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
```

## 📋 Phase 2: Service Layer Integration

### Priority 1: Analytics Service (Current File)
**File**: `backend/src/services/analytics.ts`

**What to do**:
1. Replace mock implementations with real database queries
2. Add tier-based access control
3. Track usage counts

**Implementation**:
```typescript
import db, { tables } from '@/lib/db';
import { canAccessFeature, enforceFeatureAccess } from '@/lib/tier-features';
import type { SubscriptionTier } from '@/lib/tier-features';

export class AnalyticsService {
  // Get user's subscription tier
  private async getUserTier(userId: string): Promise<SubscriptionTier> {
    const subscription = await tables.subscriptions()
      .where('user_id', userId)
      .first();

    return (subscription?.plan as SubscriptionTier) || 'free';
  }

  // Get current usage count
  private async getAnalysisCount(userId: string): Promise<number> {
    const result = await tables.analyses()
      .where('user_id', userId)
      .count('* as count')
      .first();

    return parseInt(result?.count as string) || 0;
  }

  async analyzeDealership(url: string, userId: string): Promise<any> {
    // Get user's tier and check access
    const tier = await this.getUserTier(userId);
    const currentUsage = await this.getAnalysisCount(userId);

    // Check if user can perform analysis (you may want a custom feature for this)
    // For now, we'll check data_export as a proxy
    if (!canAccessFeature(tier, 'advanced_analytics')) {
      throw new Error('Advanced analytics requires Pro or higher tier');
    }

    // Get tenant_id for the user
    const user = await tables.users()
      .where('clerk_id', userId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Create analysis record
    const [analysis] = await tables.analyses()
      .insert({
        tenant_id: user.tenant_id,
        user_id: user.id,
        dealership_url: url,
        ai_visibility_score: 75, // TODO: Calculate actual score
        results: JSON.stringify({ /* your analysis results */ }),
        is_premium: tier !== 'free',
        unlocked_at: new Date(),
      })
      .returning('*');

    return analysis;
  }

  async getAnalysis(userId: string, tenantId?: string): Promise<any[]> {
    const query = tables.analyses()
      .where('user_id', userId);

    if (tenantId) {
      query.where('tenant_id', tenantId);
    }

    return query.select('*').orderBy('created_at', 'desc');
  }

  async getAnalysisById(analysisId: string, tenantId?: string): Promise<any> {
    const query = tables.analyses()
      .where('id', analysisId);

    if (tenantId) {
      query.where('tenant_id', tenantId);
    }

    return query.first();
  }

  async getMonthlyScan(scanId: string, userId: string): Promise<any> {
    return tables.marketScans()
      .where('id', scanId)
      .first();
  }

  async triggerMonthlyScan(dealershipUrl: string, userId: string): Promise<any> {
    // Check tier access
    const tier = await this.getUserTier(userId);
    const currentScans = await tables.marketScans()
      .where('user_id', userId)
      .count('* as count')
      .first();

    enforceFeatureAccess(tier, 'market_scans', parseInt(currentScans?.count as string));

    // Get user and dealership info
    const user = await tables.users()
      .where('clerk_id', userId)
      .first();

    const dealership = await tables.dealerships()
      .where('website_url', dealershipUrl)
      .first();

    // Create market scan
    const [scan] = await tables.marketScans()
      .insert({
        tenant_id: user.tenant_id,
        dealership_id: dealership?.id,
        market_area: 'local', // TODO: Determine from dealership
        scan_results: JSON.stringify({ /* scan results */ }),
        competitors_found: 0, // TODO: Calculate
      })
      .returning('*');

    return scan;
  }
}

export const analyticsService = new AnalyticsService();
```

### Priority 2: API Routes to Update

**Critical Routes** (implement tier gating ASAP):

1. **`/api/scores/route.ts`** - Score generation
   - Feature: `advanced_analytics`
   - Track usage in `dealership_data` table

2. **`/api/optimizer/route.ts`** - AI optimizer
   - Feature: `advanced_analytics`
   - Track in `optimization_recommendations`

3. **`/api/cron/monthly-scan/route.ts`** - Monthly scans
   - Feature: `market_scans`
   - Track in `market_scans` table

4. **`/api/analytics/route.ts`** - Analytics
   - Feature: `advanced_analytics`
   - Track in `analyses` table

### Priority 3: Create Helper Service

**File**: `lib/services/subscription-service.ts`

```typescript
import db, { tables } from '@/lib/db';
import type { SubscriptionTier } from '@/lib/tier-features';

export class SubscriptionService {
  async getUserSubscription(clerkId: string) {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) return null;

    const subscription = await tables.subscriptions()
      .where('tenant_id', user.tenant_id)
      .first();

    return subscription;
  }

  async getUserTier(clerkId: string): Promise<SubscriptionTier> {
    const subscription = await this.getUserSubscription(clerkId);
    return (subscription?.plan as SubscriptionTier) || 'free';
  }

  async getUsageStats(clerkId: string) {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) return null;

    const [chatSessions, marketScans, mysteryShops, competitors] = await Promise.all([
      tables.chatSessions().where('user_id', user.id).count('* as count').first(),
      tables.marketScans().where('tenant_id', user.tenant_id).count('* as count').first(),
      tables.mysteryShops().where('tenant_id', user.tenant_id).count('* as count').first(),
      tables.competitors().where('tenant_id', user.tenant_id).count('* as count').first(),
    ]);

    return {
      chatSessions: parseInt(chatSessions?.count as string) || 0,
      marketScans: parseInt(marketScans?.count as string) || 0,
      mysteryShops: parseInt(mysteryShops?.count as string) || 0,
      competitors: parseInt(competitors?.count as string) || 0,
    };
  }

  async canUserAccessFeature(
    clerkId: string,
    feature: Parameters<typeof import('@/lib/tier-features').canAccessFeature>[1]
  ): Promise<boolean> {
    const tier = await this.getUserTier(clerkId);
    const stats = await this.getUsageStats(clerkId);

    const { canAccessFeature } = await import('@/lib/tier-features');

    switch (feature) {
      case 'chat_sessions':
        return canAccessFeature(tier, feature, stats.chatSessions);
      case 'market_scans':
        return canAccessFeature(tier, feature, stats.marketScans);
      case 'mystery_shops':
        return canAccessFeature(tier, feature, stats.mysteryShops);
      case 'competitor_tracking':
        return canAccessFeature(tier, feature, stats.competitors);
      default:
        return canAccessFeature(tier, feature);
    }
  }
}

export const subscriptionService = new SubscriptionService();
```

## 📋 Phase 3: API Route Updates

### Example: Update `/api/scores/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { subscriptionService } from '@/lib/services/subscription-service';
import { getUpgradeMessage } from '@/lib/tier-features';
import db, { tables } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can access advanced analytics
    const hasAccess = await subscriptionService.canUserAccessFeature(
      userId,
      'advanced_analytics'
    );

    if (!hasAccess) {
      const tier = await subscriptionService.getUserTier(userId);
      return NextResponse.json(
        {
          error: 'Upgrade required',
          message: getUpgradeMessage(tier, 'advanced_analytics'),
        },
        { status: 403 }
      );
    }

    // Get request data
    const { dealershipUrl } = await req.json();

    // Get user's tenant
    const user = await tables.users()
      .where('clerk_id', userId)
      .first();

    // Calculate scores (your existing logic)
    const scores = {
      ai_visibility_score: 85,
      zero_click_score: 82,
      // ... other scores
    };

    // Save to database
    await tables.dealershipData()
      .insert({
        tenant_id: user.tenant_id,
        dealership_url: dealershipUrl,
        ...scores,
        last_analyzed: new Date(),
      })
      .onConflict('dealership_url')
      .merge();

    return NextResponse.json({ success: true, scores });
  } catch (error) {
    console.error('Error calculating scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 📋 Phase 4: Stripe Webhook Integration

**File**: `app/api/webhooks/stripe/route.ts` (create if doesn't exist)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import db, { tables } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscription(subscription);
      break;

    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription;
      await cancelSubscription(deletedSub);
      break;
  }

  return NextResponse.json({ received: true });
}

async function updateSubscription(subscription: Stripe.Subscription) {
  await tables.subscriptions()
    .where('stripe_subscription_id', subscription.id)
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  await tables.subscriptions()
    .where('stripe_subscription_id', subscription.id)
    .update({
      status: 'canceled',
      canceled_at: new Date(),
    });
}
```

## 📋 Phase 5: Testing Checklist

- [ ] Database migrations run successfully
- [ ] Seed data loaded
- [ ] Can query tables via code
- [ ] Feature gating works (try with different tiers)
- [ ] Usage tracking increments correctly
- [ ] Stripe webhooks update subscription table
- [ ] RLS policies prevent cross-tenant access
- [ ] API routes return proper error messages

## 🔄 Migration Order

```
1. Phase 1: Database Setup (30 mins)
   ├─ Configure .env
   ├─ Run migrations
   └─ Test connection

2. Phase 2: Service Layer (2-3 hours)
   ├─ Create SubscriptionService
   ├─ Update AnalyticsService
   └─ Add tier checks

3. Phase 3: API Routes (4-6 hours)
   ├─ /api/scores
   ├─ /api/optimizer
   ├─ /api/analytics
   └─ /api/cron/monthly-scan

4. Phase 4: Webhooks (1-2 hours)
   ├─ Stripe subscription events
   └─ Clerk user events

5. Phase 5: Testing (2-3 hours)
   └─ End-to-end testing
```

## 🚨 Breaking Changes

None! The new system is additive:
- Existing code continues to work
- New features are opt-in
- Gradual migration path

## 📝 Quick Wins

Start with these for immediate value:

1. **Add tier check to most-used API route** (15 mins)
2. **Create usage stats endpoint** (30 mins)
3. **Add upgrade prompts in UI** (1 hour)

## 🆘 Need Help?

- Check [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)
- Review [lib/examples/tier-features-example.ts](lib/examples/tier-features-example.ts)
- See [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md)
