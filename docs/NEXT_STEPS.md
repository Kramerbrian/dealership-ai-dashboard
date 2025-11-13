# Next Steps - Prioritized Action Plan

**Last Updated:** 2025-11-13  
**Status:** Mapbox token configured ✅ | Build issues pending ⚠️

---

## 🎯 Immediate Priorities (This Week)

### 1. Fix Build Error ⚠️ **CRITICAL**
**Issue:** Next.js 15 `_not-found` page circular dependency  
**Impact:** Blocks production deployment  
**Status:** Known Next.js 15 bug

**Options:**
- **Option A:** Deploy anyway (Vercel build environment may handle it differently)
- **Option B:** Downgrade to Next.js 14 (if critical)
- **Option C:** Wait for Next.js 15 patch

**Action:** Try deploying to Vercel - their build environment may resolve the issue.

---

### 2. Complete Security Hardening 🔒 **HIGH PRIORITY**

#### 2.1 Protect Admin Endpoints
- **Status:** 0% protected (CRITICAL)
- **Endpoints:** `/api/admin/*` (all routes)
- **Action:** Wrap all admin routes with `createAdminRoute()`

**Quick Win:**
```typescript
// app/api/admin/*/route.ts
export const GET = createAdminRoute(async (req) => { ... });
export const POST = createAdminRoute(async (req) => { ... });
```

#### 2.2 Add Rate Limiting to Public Endpoints
- **Status:** ~10% have rate limiting
- **Priority Endpoints:**
  - `/api/analyze` ✅ (already done)
  - `/api/v1/analyze` ✅ (already done)
  - `/api/ai-scores` ✅ (has rate limiting)
  - `/api/scan/quick` ✅ (has rate limiting)
  - `/api/schema-validation` ❌ (needs rate limiting)
  - `/api/trust/calculate` ❌ (needs rate limiting)
  - `/api/pulse/scenario` ❌ (needs rate limiting)

**Action:** Migrate remaining public POST endpoints to `createPublicRoute()` with rate limiting.

#### 2.3 Add Zod Validation to POST Endpoints
- **Status:** ~15% have Zod validation
- **Priority Endpoints:**
  - `/api/pulse/scenario` ❌ (manual validation, needs Zod)
  - `/api/trust/calculate` ❌ (needs Zod)
  - `/api/schema-validation` ❌ (needs Zod)
  - `/api/orchestrator` ❌ (needs Zod)

**Action:** Create Zod schemas and migrate to `createPublicRoute()` or `createAuthRoute()`.

---

### 3. Complete Core Integrations 💼 **HIGH PRIORITY**

#### 3.1 Stripe Checkout Integration
- **Status:** Partially complete
- **Files:**
  - `app/api/checkout/route.ts` - Needs completion
  - `app/api/agentic/checkout/route.ts` - ✅ Updated
  - `app/api/stripe/checkout/route.ts` - Needs review

**Action:**
1. Complete `app/api/checkout/route.ts` with full Stripe integration
2. Add webhook handler for payment confirmation
3. Test checkout flow end-to-end

#### 3.2 Email Service Integration
- **Status:** Service created, needs production keys
- **Files:**
  - `lib/services/email.ts` - ✅ Created
  - Edge runtime compatibility - ✅ Fixed

**Action:**
1. Add `RESEND_API_KEY` or `SENDGRID_API_KEY` to Vercel
2. Test welcome email sending
3. Create email queue processor for edge runtime

#### 3.3 Google Analytics 4 API
- **Status:** Stub created
- **File:** `lib/services/ga4.ts` - Stub only

**Action:**
1. Get GA4 service account credentials
2. Implement `getSummary()` function
3. Connect to real GA4 API
4. Add to Vercel environment variables

---

## 🚀 Medium Priority (Next 2 Weeks)

### 4. Performance Optimization ⚡

#### 4.1 Database Connection Pooling
- **Status:** File created, needs implementation
- **File:** `lib/db/pool.ts` - Stub

**Action:**
1. Implement Supabase connection pooling
2. Add connection pool monitoring
3. Configure pool size based on environment

#### 4.2 Redis Caching Strategy
- **Status:** Basic caching exists, needs strategy
- **File:** `lib/cache/redis-cache.ts` - ✅ Created

**Action:**
1. Define cache TTLs for different data types
2. Implement cache invalidation strategy
3. Add cache warming for critical endpoints

#### 4.3 Error Handling Standardization
- **Status:** Enhanced routes have error handling
- **File:** `lib/api/error-handler.ts` - ✅ Created

**Action:**
1. Migrate all endpoints to use standardized error responses
2. Add error tracking (Sentry integration)
3. Create error response types

---

## 📋 Quick Wins (Can Do Today)

### 5. Endpoint Migration Scripts
- **Status:** Scripts created, ready to run
- **Files:**
  - `scripts/batch-apply-security-fixes.ts` - ✅ Created
  - `scripts/backend-audit.ts` - ✅ Created

**Action:**
1. Run `scripts/batch-apply-security-fixes.ts` to identify endpoints
2. Systematically migrate 5-10 endpoints per day
3. Test each migration

### 6. Documentation Updates
- **Status:** Needs updates
- **Files:**
  - `docs/API_DOCUMENTATION.md` - Needs update
  - `docs/ENDPOINT_MIGRATION_SUMMARY.md` - Needs update

**Action:**
1. Update API docs with new security features
2. Document rate limiting policies
3. Add examples for enhanced routes

---

## 🎯 Recommended Execution Order

### Week 1: Critical Security
1. ✅ **Day 1:** Protect all `/api/admin/*` endpoints
2. ✅ **Day 2:** Add rate limiting to top 10 public endpoints
3. ✅ **Day 3:** Add Zod validation to top 10 POST endpoints
4. ✅ **Day 4:** Test security improvements
5. ✅ **Day 5:** Deploy and monitor

### Week 2: Core Functionality
1. ✅ **Day 1:** Complete Stripe checkout integration
2. ✅ **Day 2:** Configure email service (Resend/SendGrid)
3. ✅ **Day 3:** Connect GA4 API
4. ✅ **Day 4:** Test all integrations
5. ✅ **Day 5:** Deploy and monitor

### Week 3: Optimization
1. ✅ **Day 1:** Implement database connection pooling
2. ✅ **Day 2:** Implement Redis caching strategy
3. ✅ **Day 3:** Standardize error handling
4. ✅ **Day 4:** Performance testing
5. ✅ **Day 5:** Deploy and monitor

---

## 📊 Progress Tracking

### Security Hardening
- [ ] Admin endpoints protected (0/15)
- [ ] Public endpoints with rate limiting (15/50)
- [ ] POST endpoints with Zod validation (20/80)

### Core Integrations
- [ ] Stripe checkout complete
- [ ] Email service configured
- [ ] GA4 API connected

### Performance
- [ ] Database pooling implemented
- [ ] Redis caching strategy
- [ ] Error handling standardized

---

## 🛠️ Tools & Resources

### Enhanced Route Wrappers
- `createAdminRoute()` - Admin endpoints with auth + rate limiting
- `createPublicRoute()` - Public endpoints with rate limiting + Zod
- `createAuthRoute()` - Authenticated endpoints (user must be logged in)

### Rate Limiters
- `rl_publicAPI` - Public API rate limiting (100 req/min)
- `rl_telemetry` - Telemetry rate limiting (1000 req/min)

### Example Migration
```typescript
// Before
export async function POST(req: NextRequest) {
  const body = await req.json();
  // ... handler
}

// After
export const POST = createPublicRoute(async (req: NextRequest) => {
  // body is already validated via Zod schema
  // rate limiting is automatic
  // ... handler
}, {
  schema: MySchema,
  rateLimit: { limiter: rl_publicAPI },
});
```

---

## 🚨 Blockers

1. **Next.js 15 Build Error** - May need to deploy to Vercel to test if their environment handles it
2. **Missing API Keys** - Need production keys for:
   - Resend/SendGrid (email)
   - GA4 Service Account (analytics)
   - Stripe (already configured?)

---

## ✅ Completed

- ✅ Mapbox API token configured (all environments)
- ✅ Enhanced route wrapper created
- ✅ Email service stub created
- ✅ Redis caching utilities created
- ✅ Database pooling utilities created
- ✅ Error handler created
- ✅ Several endpoints migrated to enhanced routes

---

**Next Immediate Action:** Try deploying to Vercel to see if build error resolves in their environment.

