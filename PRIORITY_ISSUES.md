# DealershipAI - Prioritized Issues List

Generated from code review on October 9, 2025

---

## 🔴 CRITICAL - Blocking Production (Fix Immediately)

### Issue 1: Zero Test Coverage
**Priority:** P0 - BLOCKER  
**Category:** Testing  
**Estimated Effort:** 2 weeks

**Problem:**
- No test files found in codebase
- Jest configured but unused
- No CI/CD validation

**Impact:**
- Cannot validate functionality
- High risk of regressions
- Unsafe to deploy

**Solution:**
```bash
# Create test structure
mkdir -p src/__tests__/{unit,integration,security}

# Add tests for critical paths:
1. src/__tests__/security/rbac.test.ts
2. src/__tests__/security/tenant-isolation.test.ts
3. src/__tests__/unit/cache-manager.test.ts
4. src/__tests__/integration/api-routes.test.ts
5. src/__tests__/unit/scoring-engine.test.ts
```

**Acceptance Criteria:**
- [ ] ≥70% code coverage
- [ ] All RBAC functions tested
- [ ] Tenant isolation verified
- [ ] API endpoints tested
- [ ] Tests pass in CI/CD

---

### Issue 2: TypeScript Build Errors Ignored
**Priority:** P0 - BLOCKER  
**Category:** Code Quality  
**Estimated Effort:** 3-5 days

**Problem:**
```typescript
// next.config.js
typescript: {
  ignoreBuildErrors: true, // ❌ Masks errors
}
```

**Impact:**
- Type safety compromised
- Runtime errors likely
- Technical debt accumulating

**Solution:**
1. Run `npm run typecheck` to see all errors
2. Fix each error systematically
3. Remove `ignoreBuildErrors` flag
4. Add typecheck to CI/CD

**Files Likely Affected:**
- app/api/*/route.ts (46 files)
- src/components/*.tsx (57 files)
- src/lib/*.ts (multiple)

**Acceptance Criteria:**
- [ ] `npm run typecheck` passes
- [ ] `ignoreBuildErrors` removed
- [ ] `ignoreDuringBuilds` removed
- [ ] All imports resolve correctly
- [ ] No `any` types without justification

---

### Issue 3: Mock Data in Production Endpoints
**Priority:** P0 - BLOCKER  
**Category:** Functionality  
**Estimated Effort:** 2-3 days

**Problem:**
```typescript
// app/api/cron/monthly-scan/route.ts:5
const mockDealers = [
  { id: 'dealer_1', name: 'Terry Reid Hyundai', ... }
];
```

**Impact:**
- System is non-functional
- Cannot process real data
- Misleading for stakeholders

**Solution:**
```typescript
// Replace with:
const { data: dealers, error } = await supabaseAdmin
  .from('dealers')
  .select('*')
  .in('tier', ['pro', 'enterprise'])
  .eq('subscription_status', 'active');

if (error) throw error;
```

**Files to Fix:**
- app/api/cron/monthly-scan/route.ts
- Search for other mock data: `grep -r "mock" app/`

**Acceptance Criteria:**
- [ ] All mock data removed
- [ ] Real database queries implemented
- [ ] Error handling for empty results
- [ ] Tested with real data
- [ ] No hardcoded IDs/names

---

### Issue 4: Incomplete Tenant Isolation
**Priority:** P0 - BLOCKER  
**Category:** Security  
**Estimated Effort:** 1 week

**Problem:**
```typescript
// src/lib/rbac.ts:160
if (user.role === 'enterprise_admin') {
  // TODO: Implement parent-child tenant relationship check
  return true; // ❌ Always returns true!
}
```

**Impact:**
- Cross-tenant data access possible
- Compliance violation (GDPR, CCPA)
- Data leakage risk

**Solution:**

1. **Implement Parent-Child Relationship:**
```typescript
// src/lib/rbac.ts
export async function canAccessTenant(user: User, tenantId: string): Promise<boolean> {
  if (user.role === 'superadmin') return true;
  if (user.tenant_id === tenantId) return true;
  
  if (user.role === 'enterprise_admin') {
    // Check if tenantId is child of user's tenant
    const { data } = await supabaseAdmin
      .from('tenants')
      .select('parent_id')
      .eq('id', tenantId)
      .single();
    
    return data?.parent_id === user.tenant_id;
  }
  
  return false;
}
```

2. **Add Middleware:**
```typescript
// src/middleware/tenant-isolation.ts
export async function withTenantIsolation(handler) {
  return async (req, res) => {
    const user = await getCurrentUser(req);
    const tenantId = extractTenantId(req);
    
    if (!(await canAccessTenant(user, tenantId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    return handler(req, res);
  };
}
```

**Acceptance Criteria:**
- [ ] Parent-child relationship implemented
- [ ] All API routes use middleware
- [ ] Security tests pass
- [ ] Cross-tenant access blocked
- [ ] Audit logging added

---

### Issue 5: Weak Secret Management
**Priority:** P0 - BLOCKER  
**Category:** Security  
**Estimated Effort:** 1 day

**Problem:**
```typescript
// app/api/cron/monthly-scan/route.ts:39
const cronSecret = process.env.CRON_SECRET || 'default-secret';
```

**Impact:**
- Predictable authentication
- Easy to exploit
- Unauthorized cron execution

**Solution:**

1. **Remove Default Fallbacks:**
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required secrets (no defaults!)
  CRON_SECRET: z.string().min(32),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  // ... all other required vars
});

export const env = envSchema.parse(process.env);
```

2. **Update All Routes:**
```typescript
// Use validated env everywhere
import { env } from '@/lib/env';

if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**Acceptance Criteria:**
- [ ] All secrets validated on startup
- [ ] No default fallbacks
- [ ] Descriptive errors for missing vars
- [ ] .env.example updated
- [ ] Documentation updated

---

## 🟠 HIGH PRIORITY - Fix Before Launch (1-2 Weeks)

### Issue 6: Missing Row-Level Security (RLS)
**Priority:** P1 - HIGH  
**Category:** Security  
**Estimated Effort:** 3 days

**Problem:**
- RLS policies defined but not enforced
- Direct database access bypasses checks

**Solution:**
```sql
-- Add to migration
ALTER TABLE dealership_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON dealership_data
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
    OR
    current_setting('app.user_role') = 'superadmin'
  );
```

**Acceptance Criteria:**
- [ ] RLS enabled on all tenant tables
- [ ] Policies tested
- [ ] Service role can bypass (for admin)
- [ ] Regular users restricted

---

### Issue 7: Wide-Open CORS Policy
**Priority:** P1 - HIGH  
**Category:** Security  
**Estimated Effort:** 1 day

**Problem:**
```javascript
// next.config.js:23
{ key: 'Access-Control-Allow-Origin', value: '*' }
```

**Solution:**
```javascript
headers: [
  { 
    key: 'Access-Control-Allow-Origin', 
    value: process.env.ALLOWED_ORIGINS || 'https://dealershipai.com' 
  },
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'true'
  }
]
```

**Acceptance Criteria:**
- [ ] Whitelist specific origins
- [ ] Test from allowed domain
- [ ] Test from blocked domain
- [ ] Update environment config

---

### Issue 8: No Rate Limiting
**Priority:** P1 - HIGH  
**Category:** Security/Performance  
**Estimated Effort:** 2 days

**Problem:**
- API endpoints unprotected
- DDoS vulnerability
- Cost explosion risk

**Solution:**
```typescript
// src/middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "15 m"),
});

export async function rateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error("Rate limit exceeded");
  }
  
  return { limit, reset, remaining };
}
```

**Acceptance Criteria:**
- [ ] Rate limiting on all public APIs
- [ ] Different limits per tier
- [ ] Proper headers returned
- [ ] Tested under load

---

### Issue 9: No Error Monitoring
**Priority:** P1 - HIGH  
**Category:** Operations  
**Estimated Effort:** 1 day

**Problem:**
- Errors only logged to console
- No alerting
- Hard to debug production issues

**Solution:**
```typescript
// src/lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.Authorization;
    }
    return event;
  }
});
```

**Acceptance Criteria:**
- [ ] Sentry integrated
- [ ] PII filtered
- [ ] Alerts configured
- [ ] Tested in staging

---

### Issue 10: Missing CI/CD Pipeline
**Priority:** P1 - HIGH  
**Category:** DevOps  
**Estimated Effort:** 2 days

**Problem:**
- No automated testing
- No build validation
- Manual deployment

**Solution:**
```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm audit
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: vercel deploy --prod
```

**Acceptance Criteria:**
- [ ] CI runs on all PRs
- [ ] All checks must pass
- [ ] Auto-deploy on merge
- [ ] Notifications configured

---

## 🟡 MEDIUM PRIORITY - Post-Launch (2-4 Weeks)

### Issue 11: Missing API Documentation
**Estimated Effort:** 3 days

**Solution:**
- Add OpenAPI/Swagger spec
- Auto-generate from tRPC routes
- Add Postman collection

---

### Issue 12: No Structured Logging
**Estimated Effort:** 2 days

**Solution:**
- Replace console.log with Winston/Pino
- Add correlation IDs
- Structured JSON format

---

### Issue 13: Missing Health Checks
**Estimated Effort:** 1 day

**Solution:**
- Database connectivity
- External API status
- Cache connectivity
- Disk space checks

---

### Issue 14: No Database Migrations System
**Estimated Effort:** 2 days

**Solution:**
- Set up Prisma Migrate or similar
- Version control migrations
- Rollback capability

---

### Issue 15: Missing Dependency Scanning
**Estimated Effort:** 1 day

**Solution:**
- Add Dependabot
- Snyk or similar
- Automated PR updates

---

## 🟢 LOW PRIORITY - Future Improvements (1-3 Months)

### Issue 16: No API Versioning
### Issue 17: Missing Performance Monitoring
### Issue 18: No Feature Flags
### Issue 19: Missing Backup Strategy
### Issue 20: No Disaster Recovery Plan

---

## 📊 Effort Summary

| Priority | Issues | Total Effort |
|----------|--------|--------------|
| P0 Critical | 5 | 4 weeks |
| P1 High | 5 | 1.5 weeks |
| P2 Medium | 5 | 1.5 weeks |
| P3 Low | 5 | TBD |

**Total Critical Path:** ~6 weeks with 2 developers

---

## 🎯 Suggested Sprint Plan

### Sprint 1 (Week 1-2): Critical Security & Quality
- Issue 2: TypeScript errors
- Issue 3: Mock data removal
- Issue 5: Secret management
- Issue 4: Tenant isolation (start)

### Sprint 2 (Week 3-4): Testing & Infrastructure
- Issue 1: Test coverage
- Issue 4: Tenant isolation (complete)
- Issue 10: CI/CD pipeline
- Issue 6: RLS policies

### Sprint 3 (Week 5-6): Production Hardening
- Issue 7: CORS policy
- Issue 8: Rate limiting
- Issue 9: Error monitoring
- Security audit
- Performance testing

---

## 📝 Notes

- All P0 issues must be resolved before production
- P1 issues should be addressed before public launch
- P2/P3 can be tackled post-launch
- Re-assess priorities after Sprint 1

---

**Last Updated:** October 9, 2025  
**Next Review:** After Sprint 1 completion
