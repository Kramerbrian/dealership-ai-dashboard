# API Routes Migration Guide
## Migrating Existing Routes to New Security Middleware

**Purpose:** Step-by-step guide to migrate existing API routes to use the new unified security middleware (rate limiting, authentication, validation, performance monitoring).

---

## 📋 Migration Checklist

Before starting, ensure you have:
- ✅ All security middleware files created (`lib/middleware/*`, `lib/validation/*`)
- ✅ Environment variables configured (Upstash Redis, etc.)
- ✅ Understanding of the new API wrapper pattern

---

## 🎯 Migration Strategy

### Phase 1: Critical Routes (High Priority)
- Dashboard endpoints
- User management endpoints
- Authentication endpoints
- Payment/Stripe endpoints

### Phase 2: Standard Routes (Medium Priority)
- AI/Analytics endpoints
- Automation endpoints
- Compliance endpoints

### Phase 3: Read-Only Routes (Low Priority)
- Health check endpoints
- Status endpoints
- Documentation endpoints

---

## 🔄 Migration Patterns

### Pattern 1: Simple GET Route (No Auth Required)

**Before:**
```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

**After:**
```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';

export const GET = createApiRoute(
  {
    endpoint: '/api/health',
    requireAuth: false, // Public endpoint
    rateLimit: true, // But still rate limited
    performanceMonitoring: true,
  },
  async (req, auth) => {
    // auth is null here since requireAuth is false
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }
);
```

---

### Pattern 2: Authenticated GET Route with Query Validation

**Before:**
```typescript
// app/api/dashboard/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeRange = searchParams.get('timeRange') || '30d';
  const dealerId = searchParams.get('dealerId');
  
  if (!dealerId) {
    return NextResponse.json({ error: 'dealerId required' }, { status: 400 });
  }
  
  // Fetch data...
  const data = await fetchDashboardData(dealerId, timeRange);
  
  return NextResponse.json({ data });
}
```

**After:**
```typescript
// app/api/dashboard/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { dashboardQuerySchema } from '@/lib/validation/schemas';
import { validateQueryParams } from '@/lib/validation/schemas';
import { cachedResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

export const GET = createApiRoute(
  {
    endpoint: '/api/dashboard/overview',
    requireAuth: true, // Requires authentication
    validateQuery: dashboardQuerySchema, // Validates query params
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    // auth is guaranteed to be non-null here
    const queryValidation = validateQueryParams(req, dashboardQuerySchema);
    if (!queryValidation.success) {
      return queryValidation.response;
    }
    
    const { dealerId, timeRange } = queryValidation.data;
    
    // Fetch data...
    const data = await fetchDashboardData(dealerId, timeRange);
    
    // Return cached response
    return cachedResponse(
      data,
      300, // 5 min cache
      600, // 10 min stale
      [CACHE_TAGS.DASHBOARD_OVERVIEW, CACHE_TAGS.DASHBOARD]
    );
  }
);
```

---

### Pattern 3: POST Route with Body Validation

**Before:**
```typescript
// app/api/ai/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { domain } = body;
  
  if (!domain) {
    return NextResponse.json({ error: 'domain required' }, { status: 400 });
  }
  
  // Validate domain format
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }
  
  // Perform analysis...
  const result = await performAnalysis(domain);
  
  return NextResponse.json({ result });
}
```

**After:**
```typescript
// app/api/ai/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { aiAnalysisRequestSchema, validateRequestBody } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/api-response';

export const POST = createApiRoute(
  {
    endpoint: '/api/ai/analysis',
    requireAuth: true,
    validateBody: aiAnalysisRequestSchema, // Validates request body
    rateLimit: true, // Stricter rate limit applied (10/min)
    performanceMonitoring: true,
  },
  async (req, auth) => {
    // Body already validated by wrapper
    const bodyValidation = await validateRequestBody(req, aiAnalysisRequestSchema);
    if (!bodyValidation.success) {
      return bodyValidation.response;
    }
    
    const { domain, dealershipSize, marketType } = bodyValidation.data;
    
    try {
      // Perform analysis...
      const result = await performAnalysis(domain, {
        dealershipSize,
        marketType,
        userId: auth.userId,
      });
      
      return NextResponse.json({ success: true, result });
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/ai/analysis',
      });
    }
  }
);
```

---

### Pattern 4: Route with Organization Check

**Before:**
```typescript
// app/api/marketplace/apps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (!orgId) {
    return NextResponse.json({ error: 'Organization required' }, { status: 403 });
  }
  
  // Fetch apps...
  const apps = await fetchAppsForOrg(orgId);
  
  return NextResponse.json({ apps });
}
```

**After:**
```typescript
// app/api/marketplace/apps/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { requireOrg } from '@/lib/middleware/auth';

export const GET = createApiRoute(
  {
    endpoint: '/api/marketplace/apps',
    requireAuth: true,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    // Additional org check if needed
    const orgId = req.nextUrl.searchParams.get('orgId');
    if (orgId && auth.orgId !== orgId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Organization access denied' },
        { status: 403 }
      );
    }
    
    // Fetch apps...
    const apps = await fetchAppsForOrg(auth.orgId || auth.userId);
    
    return NextResponse.json({ success: true, apps });
  }
);
```

---

### Pattern 5: Route with Custom Rate Limiting

**Before:**
```typescript
// app/api/compliance/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Heavy operation, no rate limiting
  const body = await req.json();
  const result = await performHeavyAudit(body);
  return NextResponse.json({ result });
}
```

**After:**
```typescript
// app/api/compliance/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { complianceAuditRequestSchema, validateRequestBody } from '@/lib/validation/schemas';

export const POST = createApiRoute(
  {
    endpoint: '/api/compliance/audit',
    requireAuth: true,
    validateBody: complianceAuditRequestSchema,
    rateLimit: true, // Uses strict limit (5/min) from rate-limit.ts config
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const bodyValidation = await validateRequestBody(req, complianceAuditRequestSchema);
    if (!bodyValidation.success) {
      return bodyValidation.response;
    }
    
    const { dealershipId, auditType } = bodyValidation.data;
    
    // Heavy operation
    const result = await performHeavyAudit(dealershipId, auditType, auth.userId);
    
    return NextResponse.json({ success: true, result });
  }
);
```

---

## 🔧 Step-by-Step Migration Process

### Step 1: Identify the Route Type
- ✅ Public endpoint (no auth)
- ✅ Authenticated endpoint (requires auth)
- ✅ Organization endpoint (requires org)
- ✅ Permission endpoint (requires permission)

### Step 2: Identify Required Validation
- ✅ Query parameters? → Use `validateQuery` in config
- ✅ Request body? → Use `validateBody` in config
- ✅ Path parameters? → Validate manually in handler

### Step 3: Choose the Pattern
- ✅ Simple GET → Pattern 1
- ✅ Authenticated GET → Pattern 2
- ✅ POST with body → Pattern 3
- ✅ Organization check → Pattern 4
- ✅ Custom requirements → Pattern 5

### Step 4: Update the Route
1. Import `createApiRoute` and required schemas
2. Replace `export async function` with `export const GET/POST = createApiRoute(...)`
3. Move handler logic into the wrapper function
4. Update error handling to use standardized responses
5. Add caching if appropriate

### Step 5: Test the Route
- ✅ Test authentication requirements
- ✅ Test input validation
- ✅ Test rate limiting
- ✅ Test error handling
- ✅ Verify performance monitoring

---

## 📝 Common Migration Scenarios

### Scenario 1: Route with Manual Auth Check

**Before:**
```typescript
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

**After:**
```typescript
export const GET = createApiRoute(
  { endpoint: '/api/example', requireAuth: true },
  async (req, auth) => {
    // auth is guaranteed to be non-null
    // ... rest of handler
  }
);
```

---

### Scenario 2: Route with Manual Validation

**Before:**
```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.domain) {
    return NextResponse.json({ error: 'domain required' }, { status: 400 });
  }
  // ... rest of handler
}
```

**After:**
```typescript
export const POST = createApiRoute(
  {
    endpoint: '/api/example',
    requireAuth: true,
    validateBody: aiAnalysisRequestSchema, // Validates domain automatically
  },
  async (req, auth) => {
    const bodyValidation = await validateRequestBody(req, aiAnalysisRequestSchema);
    if (!bodyValidation.success) {
      return bodyValidation.response; // Already has proper error format
    }
    const { domain } = bodyValidation.data;
    // ... rest of handler
  }
);
```

---

### Scenario 3: Route with Manual Error Handling

**Before:**
```typescript
export async function GET(req: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**After:**
```typescript
import { errorResponse } from '@/lib/api-response';

export const GET = createApiRoute(
  { endpoint: '/api/example', requireAuth: true },
  async (req, auth) => {
    try {
      const data = await fetchData();
      return NextResponse.json({ success: true, data });
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/example',
      });
    }
  }
);
```

---

## 🎯 Migration Priority Order

### Priority 1: Critical Security Endpoints
1. **User Management** (`/api/user/*`)
   - `/api/user/profile`
   - `/api/user/subscription`
   - `/api/user/usage`

2. **Payment/Stripe** (`/api/stripe/*`)
   - `/api/stripe/webhook`
   - `/api/stripe/create-checkout`
   - `/api/stripe/verify-session`

3. **Authentication** (`/api/auth/*`)
   - `/api/auth/sso`
   - `/api/auth/google/*`

### Priority 2: High-Value Endpoints
4. **Dashboard** (`/api/dashboard/*`)
   - `/api/dashboard/overview`
   - `/api/dashboard/reviews`
   - `/api/dashboard/website`

5. **AI/Analytics** (`/api/ai/*`)
   - `/api/ai/analysis`
   - `/api/ai/visibility-index`
   - `/api/ai/predictive-analytics`

6. **Automation** (`/api/automation/*`)
   - `/api/automation-tasks`
   - `/api/automation/tasks/[id]/execute`

### Priority 3: Standard Endpoints
7. **Compliance** (`/api/compliance/*`)
8. **Marketplace** (`/api/marketplace/*`)
9. **Analytics** (`/api/analytics/*`)

### Priority 4: Read-Only Endpoints
10. **Health/Status** (`/api/health`, `/api/system/status`)
11. **Documentation** (`/api/docs/*`)

---

## ✅ Testing Checklist

After migrating each route, verify:

- [ ] **Authentication**: Unauthenticated requests return 401
- [ ] **Rate Limiting**: Too many requests return 429
- [ ] **Input Validation**: Invalid input returns 400 with error details
- [ ] **Error Handling**: Errors return standardized format
- [ ] **Performance**: Response times are logged
- [ ] **Headers**: Rate limit and performance headers are present
- [ ] **Functionality**: Route still works as expected

---

## 🐛 Troubleshooting

### Issue: Rate limiting not working
**Solution:** Check environment variables:
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Issue: Authentication always fails
**Solution:** Ensure Clerk is properly configured and `auth()` is working

### Issue: Validation errors not showing
**Solution:** Check that schema matches the data structure. Use `validateAndSanitize()` for debugging

### Issue: Performance monitoring not logging
**Solution:** Check `NODE_ENV` - logging is more verbose in development

---

## 📊 Migration Progress Tracker

### Completed Routes
- [ ] `/api/health`
- [ ] `/api/dashboard/overview`
- [ ] `/api/dashboard/reviews`
- [ ] `/api/dashboard/website`
- [ ] `/api/user/profile`
- [ ] `/api/user/subscription`
- [ ] `/api/ai/analysis`
- [ ] `/api/automation-tasks`
- [ ] `/api/stripe/webhook`
- [ ] ... (add more as you migrate)

### Estimated Time per Route
- Simple route: 5-10 minutes
- Complex route: 15-30 minutes
- Routes with custom logic: 30-60 minutes

---

## 🚀 Quick Start Template

Copy this template to start migrating a route:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { /* your schema */ } from '@/lib/validation/schemas';
import { validateRequestBody, validateQueryParams } from '@/lib/validation/schemas';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

export const GET = createApiRoute(
  {
    endpoint: '/api/your-endpoint',
    requireAuth: true, // or false
    validateQuery: yourQuerySchema, // if needed
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    // Your handler logic here
    // auth is non-null if requireAuth is true
    
    try {
      // ... your logic
      return NextResponse.json({ success: true, data: '...' });
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/your-endpoint',
      });
    }
  }
);

// For POST routes, add validateBody:
export const POST = createApiRoute(
  {
    endpoint: '/api/your-endpoint',
    requireAuth: true,
    validateBody: yourBodySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const bodyValidation = await validateRequestBody(req, yourBodySchema);
    if (!bodyValidation.success) {
      return bodyValidation.response;
    }
    
    const { /* destructure validated data */ } = bodyValidation.data;
    
    // ... your logic
    return NextResponse.json({ success: true });
  }
);
```

---

## 📚 Additional Resources

- **Validation Schemas**: See `lib/validation/schemas.ts` for all available schemas
- **API Response Utilities**: See `lib/api-response.ts` for response helpers
- **Cache Tags**: See `lib/cache-tags.ts` for cache tag constants
- **Error Handling**: See `lib/middleware/auth.ts` for auth error patterns

---

**Next Steps:**
1. Start with Priority 1 routes (critical security)
2. Test thoroughly after each migration
3. Monitor performance metrics
4. Adjust rate limits based on usage

**Questions?** Check the implementation files or refer to the example route in `app/api/dashboard/overview/route.ts.example`

