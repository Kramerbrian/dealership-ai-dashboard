# Billing Tier Gate Usage Guide

## Overview

The billing tier gate system allows you to restrict features based on subscription plans (Free, Pro, Enterprise) stored in Supabase and managed via Stripe.

## Components

### 1. Client-Side: `TierGate` Component

Use this in client components to gate UI features:

```tsx
import { TierGate } from '@/components/billing/TierGate';

export default function Dashboard() {
  const { tenantId } = useAuth(); // Get from your auth system

  return (
    <div>
      {/* Free features - always visible */}
      <BasicDashboard />

      {/* Pro features - gated */}
      <TierGate 
        tenantId={tenantId} 
        requiredPlan="pro"
        featureName="Advanced Analytics"
        description="Get detailed insights and competitor analysis"
      >
        <AdvancedAnalytics />
      </TierGate>

      {/* Enterprise features - gated */}
      <TierGate 
        tenantId={tenantId} 
        requiredPlan="enterprise"
        featureName="AI Autopilot"
        description="Automated fixes and optimizations"
      >
        <AIAutopilot />
      </TierGate>
    </div>
  );
}
```

### 2. Server-Side: `getPlan` and `gate` Functions

Use these in API routes and server components:

```tsx
import { getPlan, gate } from '@/lib/billing/plan';
import { requireTenant } from '@/lib/auth/tenant';

// In API route
export async function POST(req: Request) {
  const { tenantId } = requireTenant();
  const plan = await getPlan(tenantId);

  // Gate feature access
  const canUseProFeature = gate(plan, 'pro', true, false);
  if (!canUseProFeature) {
    return NextResponse.json(
      { error: 'Pro plan required' }, 
      { status: 403 }
    );
  }

  // Proceed with feature logic
  return NextResponse.json({ success: true });
}
```

### 3. Conditional Rendering

Use `gate` for simple conditional values:

```tsx
// In server component
const plan = await getPlan(tenantId);

const buttonText = gate(plan, 'pro', 'Upgrade to Pro', 'Get Started');
const maxAnalyses = gate(plan, 'pro', 100, 10);
const showAdvancedFeatures = gate(plan, 'enterprise', true, false);
```

## Plan Hierarchy

```
Free (0) < Pro (1) < Enterprise (2)
```

- Free users can access free features only
- Pro users can access free + pro features
- Enterprise users can access all features

## API Endpoints

### GET `/api/billing/plan?tenantId=xxx`

Returns the current plan for a tenant:

```json
{
  "plan": "pro",
  "tenantId": "tenant-123"
}
```

### POST `/api/billing/checkout`

Creates a Stripe checkout session:

```json
{
  "plan": "pro" // or "enterprise"
}
```

Returns:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

## Integration Examples

### Example 1: Feature Card with Upgrade

```tsx
<TierGate 
  tenantId={tenantId}
  requiredPlan="pro"
  featureName="Competitor Analysis"
  description="Compare your dealership against top competitors"
>
  <CompetitorAnalysisCard />
</TierGate>
```

### Example 2: API Route with Plan Check

```tsx
// app/api/competitors/advanced/route.ts
import { getPlan, gate } from '@/lib/billing/plan';
import { withAuth } from '../../_utils/withAuth';

export const GET = withAuth(async ({ tenantId }) => {
  const plan = await getPlan(tenantId);
  
  if (!gate(plan, 'pro', true, false)) {
    return NextResponse.json(
      { error: 'Pro plan required for advanced competitor analysis' },
      { status: 403 }
    );
  }

  // Fetch advanced competitor data
  const data = await fetchAdvancedCompetitorData(tenantId);
  return NextResponse.json(data);
});
```

### Example 3: Usage Limits

```tsx
// Check usage limits based on plan
const plan = await getPlan(tenantId);
const maxAnalyses = gate(plan, 'pro', 100, gate(plan, 'free', 10, 0));
const maxCompetitors = gate(plan, 'enterprise', 50, gate(plan, 'pro', 10, 5));
```

## Testing

Test billing plan retrieval:

```bash
tsx scripts/test-billing-plan.ts
```

Test webhook integration:

```bash
tsx scripts/test-webhook-direct.ts
```

## Troubleshooting

### Plan not updating after checkout

1. Check Stripe webhook is configured: `stripe listen --forward-to localhost:3000/api/billing/webhook`
2. Verify webhook secret in `.env.local`: `STRIPE_WEBHOOK_SECRET`
3. Check Supabase `integrations` table:
   ```sql
   SELECT * FROM integrations WHERE tenant_id = 'your-tenant-id' AND kind = 'billing';
   ```

### TierGate shows "Free" when user has Pro

1. Verify tenant ID is correct
2. Check Supabase connection: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
3. Verify plan was stored: Check `integrations` table metadata

### Upgrade button not working

1. Check Stripe keys: `STRIPE_SECRET_KEY` and `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ENTERPRISE`
2. Verify checkout endpoint: `/api/billing/checkout`
3. Check browser console for errors

## Best Practices

1. **Always check plan server-side** for sensitive operations
2. **Use TierGate for UI** to provide good UX with upgrade prompts
3. **Cache plan lookups** when possible (already handled by `cacheJSON`)
4. **Default to free** when plan lookup fails
5. **Log plan changes** for debugging and analytics

