# Gaps to Production 100%

**Current Status: 85% → Target: 100%**

This document addresses your feedback and outlines the exact steps to close the remaining 15% gap.

---

## ✅ Already Complete

1. **Security headers** - CSP, HSTS, X-Content-Type-Options added to next.config.js
2. **Rate limiting** - Middleware with Upstash Redis (in-memory fallback implemented)
3. **Tenant isolation middleware** - Deny-by-default with enforceTenantIsolation()
4. **RLS tests** - Comprehensive test suite in `__tests__/lib/tenant-isolation.test.ts`
5. **SEO** - robots.ts, sitemap.ts with proper disallow rules
6. **Health endpoint** - `/api/health` with database, Redis, environment checks
7. **UX enhancements** - Phase 1-3 deployed (Exit intent, pricing toggle, error boundaries)

---

## 🚧 Remaining Work (15%)

### 1. RBAC & RLS - Route Guards ⚠️ **CRITICAL**

**Problem:** Tenant isolation middleware exists but not applied to individual routes.

**Solution:** Add guards to every data-mutating endpoint.

**Files to modify:**
- `app/api/dashboard/overview/route.ts` (lines 10-50)
- `app/api/settings/dealer/route.ts` (lines 15-60)
- `app/api/settings/audit/route.ts` (lines 12-45)
- `app/api/user/profile/route.ts` (lines 8-40)
- `app/api/reports/*/route.ts` (all report endpoints)

**Pattern to apply:**
```typescript
import { getUserTenantId, validateTenantAccess } from '@/lib/api-protection/tenant-isolation';

export async function POST(request: Request) {
  // 1. Get tenant_id from auth
  const tenantId = await getUserTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. For resource-specific operations, validate access
  const body = await request.json();
  const { allowed } = await validateTenantAccess('dealerships', body.dealership_id);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Continue with operation using tenantId filter
  const { data } = await supabase
    .from('table_name')
    .select('*')
    .eq('tenant_id', tenantId); // ALWAYS filter by tenant_id

  return NextResponse.json(data);
}
```

**Test:** Run `npm test -- tenant-isolation.test.ts` - all denial tests must pass.

---

### 2. Idempotency Keys ⚠️ **CRITICAL**

**Problem:** Webhook replay can cause duplicate operations (charges, user creation).

**Solution:** Implement idempotency key checking.

**Step 1 - Create table:**
```sql
-- supabase/migrations/20251020_idempotency_keys.sql
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key TEXT PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  endpoint TEXT NOT NULL,
  response JSONB NOT NULL,
  status_code INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
CREATE INDEX idx_idempotency_tenant ON idempotency_keys(tenant_id);
```

**Step 2 - Create helper:**
```typescript
// lib/idempotency.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkIdempotencyKey(
  key: string,
  tenantId: string
): Promise<{ cached: boolean; response?: any }> {
  const { data } = await supabase
    .from('idempotency_keys')
    .select('*')
    .eq('key', key)
    .eq('tenant_id', tenantId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (data) {
    return { cached: true, response: data.response };
  }

  return { cached: false };
}

export async function storeIdempotencyKey(
  key: string,
  tenantId: string,
  endpoint: string,
  response: any,
  statusCode: number
) {
  await supabase.from('idempotency_keys').insert({
    key,
    tenant_id: tenantId,
    endpoint,
    response,
    status_code: statusCode,
  });
}
```

**Step 3 - Apply to endpoints:**
```typescript
// app/api/stripe/create-checkout/route.ts
export async function POST(request: Request) {
  const idempotencyKey = request.headers.get('Idempotency-Key');
  const tenantId = await getUserTenantId();

  if (idempotencyKey) {
    const { cached, response } = await checkIdempotencyKey(idempotencyKey, tenantId);
    if (cached) {
      return NextResponse.json(response);
    }
  }

  // Proceed with operation...
  const result = await createCheckoutSession();

  if (idempotencyKey) {
    await storeIdempotencyKey(idempotencyKey, tenantId, '/api/stripe/create-checkout', result, 200);
  }

  return NextResponse.json(result);
}
```

**Apply to:**
- `/api/stripe/create-checkout/route.ts`
- `/api/stripe/webhook/route.ts`
- `/api/clerk/webhook/route.ts`
- `/api/reports/generate/route.ts`

---

### 3. Billing Edge Cases ⚠️ **HIGH PRIORITY**

**Problem:** Webhook handlers don't cover all scenarios.

**File:** `app/api/stripe/webhook/route.ts`

**Add handlers for:**
```typescript
switch (event.type) {
  case 'customer.subscription.trial_will_end':
    // Send reminder email 3 days before trial ends
    await sendEmail({
      to: customer.email,
      template: 'trial_ending',
      data: { daysLeft: 3, upgradeUrl: 'https://dealershipai.com/pricing' }
    });
    break;

  case 'invoice.payment_failed':
    // Mark tenant as past_due
    await supabase
      .from('tenants')
      .update({ status: 'past_due', grace_period_ends: addDays(new Date(), 3) })
      .eq('stripe_customer_id', customer.id);

    await sendEmail({
      to: customer.email,
      template: 'payment_failed',
      data: { retryUrl: invoice.hosted_invoice_url }
    });
    break;

  case 'customer.subscription.updated':
    // Handle plan changes (upgrade/downgrade)
    const oldPlan = event.data.previous_attributes?.items?.data[0]?.price?.id;
    const newPlan = subscription.items.data[0].price.id;

    if (oldPlan !== newPlan) {
      await supabase
        .from('tenants')
        .update({
          plan: getPlanFromPriceId(newPlan),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customer.id);
    }
    break;

  case 'customer.subscription.deleted':
    // Subscription canceled - downgrade to free tier
    await supabase
      .from('tenants')
      .update({ plan: 'free', status: 'canceled' })
      .eq('stripe_customer_id', customer.id);
    break;
}
```

---

### 4. Audit Logs ⚠️ **MEDIUM PRIORITY**

**Problem:** Only violation logging exists, need full audit trail.

**Step 1 - Create table:**
```sql
-- supabase/migrations/20251020_audit_logs.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

**Step 2 - Create logger:**
```typescript
// lib/audit.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logAudit(params: {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  await supabase.from('audit_logs').insert({
    tenant_id: params.tenantId,
    user_id: params.userId,
    action: params.action,
    resource: params.resource,
    metadata: params.metadata || {},
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
  });
}
```

**Step 3 - Apply to routes:**
```typescript
// Example: app/api/settings/dealer/route.ts
export async function PUT(request: Request) {
  const tenantId = await getUserTenantId();
  const body = await request.json();

  // Update dealership
  await supabase
    .from('dealerships')
    .update(body)
    .eq('tenant_id', tenantId);

  // Log action
  await logAudit({
    tenantId,
    userId: (await auth()).userId!,
    action: 'DEALERSHIP_UPDATED',
    resource: `dealerships/${body.id}`,
    metadata: { changes: body },
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  });

  return NextResponse.json({ success: true });
}
```

**Actions to log:**
- `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`
- `DEALERSHIP_CREATED`, `DEALERSHIP_UPDATED`, `DEALERSHIP_DELETED`
- `REPORT_GENERATED`, `REPORT_DOWNLOADED`
- `SUBSCRIPTION_CREATED`, `SUBSCRIPTION_UPDATED`, `SUBSCRIPTION_CANCELED`
- `SETTINGS_CHANGED`
- `TENANT_ACCESS_VIOLATION` (already logged)

---

### 5. Sentry Error Tracking ⚠️ **MEDIUM PRIORITY**

**Steps:**
```bash
# 1. Install Sentry
npm install @sentry/nextjs

# 2. Initialize
npx @sentry/wizard@latest -i nextjs

# 3. Add DSN to .env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

**4. Configure:**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  },
});
```

**5. Test:**
```typescript
// app/api/test-sentry/route.ts
export async function GET() {
  throw new Error('Sentry test error');
}
```

Visit `/api/test-sentry` → verify error appears in Sentry dashboard.

---

### 6. Backup/DR ⚠️ **CRITICAL**

**Steps:**
1. Go to Supabase Dashboard
2. Navigate to Settings → Database → Backups
3. Enable Point-in-Time Recovery (PITR)
4. Set retention to 7 days minimum

**Create restore drill doc:**
```bash
cat > docs/restore-drill.md <<'DRILL'
# Backup Restore Drill

## Schedule
Run monthly on first Sunday at 2 AM PST.

## Steps
1. Tag current production state: `git tag backup-drill-YYYYMMDD`
2. In Supabase Dashboard:
   - Go to Database → Backups
   - Select restore point from last 24 hours
   - Restore to staging project (NOT production)
3. Verify data integrity:
   - Count users: `SELECT COUNT(*) FROM users;`
   - Count tenants: `SELECT COUNT(*) FROM tenants;`
   - Check latest record: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1;`
4. Document:
   - Restore start time
   - Restore complete time
   - Total duration (RTO achieved)
   - Any issues encountered
5. Clean up staging project

## Success Criteria
- RTO < 30 minutes
- No data loss (RPO < 5 minutes)
- All tables and relationships intact

## Runbook Location
/docs/runbooks/disaster-recovery.md
DRILL
```

---

### 7. Performance Budget ⚠️ **MEDIUM PRIORITY**

**Install:**
```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Add to layout:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.Node }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Targets:**
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

**Monitor:** Vercel Dashboard → Analytics → Web Vitals

---

### 8. Observability ⚠️ **HIGH PRIORITY**

**Uptime monitoring:**
1. Sign up for UptimeRobot (free tier)
2. Add monitor:
   - Type: HTTP(S)
   - URL: `https://dealershipai.com/api/health`
   - Interval: 5 minutes
   - Alert contacts: Engineering team email/Slack
3. Configure alerts:
   - Trigger: Status !== 200 OR response body contains `"status":"unhealthy"`
   - Notification: Immediate

**Status page:**
- Use Statuspage.io or build custom at `/status`
- Show real-time health from `/api/health`

---

### 9. Accessibility ⚠️ **MEDIUM PRIORITY**

**Install:**
```bash
npm install -D @axe-core/playwright
```

**Test:**
```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage passes axe', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('dashboard passes axe', async ({ page }) => {
    // Log in first
    await page.goto('/dashboard');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
```

**Run:** `npx playwright test accessibility.spec.ts`

**Manual checks:**
- Tab through entire UI (keyboard nav)
- Use NVDA/JAWS screen reader
- Check color contrast with DevTools

---

### 10. Feature Flags ⚠️ **LOW PRIORITY**

**Simple implementation:**
```typescript
// lib/feature-flags.ts
export const flags = {
  newDashboard: process.env.NEXT_PUBLIC_FEATURE_NEW_DASHBOARD === 'true',
  aiEnhancedReports: process.env.NEXT_PUBLIC_FEATURE_AI_REPORTS === 'true',
};

export function isFeatureEnabled(flag: keyof typeof flags, tenantId?: string): boolean {
  // Simple env-based flags
  if (flags[flag]) return true;

  // Tenant-specific overrides (if needed)
  if (tenantId && process.env[`FEATURE_${flag.toUpperCase()}_TENANTS`]?.includes(tenantId)) {
    return true;
  }

  return false;
}
```

**Usage:**
```typescript
import { isFeatureEnabled } from '@/lib/feature-flags';

export default function Dashboard() {
  const showNewDashboard = isFeatureEnabled('newDashboard');

  if (showNewDashboard) {
    return <NewDashboard />;
  }

  return <LegacyDashboard />;
}
```

---

### 11. Data Lifecycle ⚠️ **MEDIUM PRIORITY**

**Tenant export endpoint:**
```typescript
// app/api/tenant/export/route.ts
import { getUserTenantId } from '@/lib/api-protection/tenant-isolation';

export async function GET() {
  const tenantId = await getUserTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Export all tenant data
  const { data: users } = await supabase.from('users').select('*').eq('tenant_id', tenantId);
  const { data: dealerships } = await supabase.from('dealerships').select('*').eq('tenant_id', tenantId);
  const { data: reports } = await supabase.from('reports').select('*').eq('tenant_id', tenantId);

  const exportData = {
    export_date: new Date().toISOString(),
    tenant_id: tenantId,
    data: {
      users,
      dealerships,
      reports,
    },
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="tenant-${tenantId}-export.json"`,
    },
  });
}
```

**Tenant deletion endpoint:**
```typescript
// app/api/tenant/delete/route.ts
export async function DELETE() {
  const tenantId = await getUserTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cascade delete all tenant data
  await supabase.from('users').delete().eq('tenant_id', tenantId);
  await supabase.from('dealerships').delete().eq('tenant_id', tenantId);
  await supabase.from('reports').delete().eq('tenant_id', tenantId);
  await supabase.from('audit_logs').delete().eq('tenant_id', tenantId);
  await supabase.from('tenants').delete().eq('id', tenantId);

  return NextResponse.json({ message: 'Tenant deleted' });
}
```

---

### 12. Dependency Hygiene ⚠️ **LOW PRIORITY**

**Set up Renovate:**
```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "schedule": ["every weekend"],
  "automerge": false,
  "labels": ["dependencies"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
}
```

**Enable GitHub Dependabot:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

## 🎯 Go-Live Checklist

Run before production deployment:

```bash
# 1. Run tests
npm test

# 2. Run E2E tests (after writing them)
npx playwright test

# 3. Run Lighthouse audit
npx lighthouse https://dealershipai-preview.vercel.app --view

# 4. Run accessibility audit
npx playwright test accessibility.spec.ts

# 5. Build production
npm run build

# 6. Deploy to preview
vercel --preview

# 7. Smoke test preview
curl https://dealershipai-preview.vercel.app/api/health

# 8. Deploy to production
vercel --prod

# 9. Verify production health
curl https://dealershipai.com/api/health

# 10. Set up uptime monitoring
# (Manual step in UptimeRobot dashboard)
```

---

## 📊 Progress Tracker

| Task | Priority | Status | Est. Hours |
|------|----------|--------|------------|
| Add RBAC guards to routes | CRITICAL | 🚧 | 3h |
| Idempotency keys | CRITICAL | ❌ | 4h |
| Billing edge cases | HIGH | ❌ | 2h |
| Audit logs | MEDIUM | ❌ | 3h |
| Sentry setup | MEDIUM | ❌ | 1h |
| Backup/DR | CRITICAL | ❌ | 2h |
| Performance monitoring | MEDIUM | ❌ | 1h |
| Uptime monitoring | HIGH | ❌ | 0.5h |
| Accessibility tests | MEDIUM | ❌ | 2h |
| Feature flags | LOW | ❌ | 1h |
| Data lifecycle | MEDIUM | ❌ | 2h |
| Dependency hygiene | LOW | ❌ | 0.5h |

**Total estimated effort: ~22 hours**

---

## 🚀 Execution Order

**Week 1 (Critical items):**
1. Add RBAC guards to all routes (3h)
2. Implement idempotency keys (4h)
3. Enable Supabase PITR (2h)
4. Set up uptime monitoring (0.5h)

**Week 2 (High/Medium priority):**
5. Add billing edge cases (2h)
6. Implement audit logs (3h)
7. Configure Sentry (1h)
8. Add performance monitoring (1h)

**Week 3 (Polish):**
9. Write accessibility tests (2h)
10. Implement data lifecycle endpoints (2h)
11. Add feature flags (1h)
12. Set up dependency bots (0.5h)

---

## ✅ Definition of Done

Project is 100% complete when:
1. All RLS denial tests pass
2. Idempotency keys prevent duplicate operations
3. Billing edge cases handled (payment_failed, trial_will_end)
4. Audit logs track all critical actions
5. Sentry captures errors in production
6. Supabase PITR enabled with restore drill documented
7. Uptime monitor configured and alerting
8. Performance metrics tracked (LCP, INP, CLS)
9. Accessibility tests pass (Axe + manual check)
10. Legal pages published (Terms, Privacy, DPA)

**When these 10 criteria are met, you can confidently say the project is production-ready at 100%.**

---

**Last updated:** 2025-10-20
**Owner:** Engineering Team
