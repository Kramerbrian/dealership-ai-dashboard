# Migration Examples
## Real-World Examples of Route Migrations

This document shows actual before/after examples for common route patterns in the DealershipAI codebase.

---

## Example 1: Dashboard Overview Route

### Before Migration
```typescript
// app/api/dashboard/overview/route.ts
import { NextRequest } from 'next/server';
import { trackSLO } from '@/lib/slo';
import { logger } from '@/lib/logger';
import { cachedResponse, errorResponse, withRequestId } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || `dashboard-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const dealerId = searchParams.get('dealerId') || 'default';
    
    // No validation of timeRange or dealerId
    
    await logger.info('Dashboard overview requested', {
      requestId,
      timeRange,
      dealerId
    });

    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 100));

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    
    const baseScore = 85 + Math.random() * 10;
    const trend = (Math.random() - 0.5) * 10;

    const dashboardData = {
      timestamp: new Date().toISOString(),
      dealerId,
      timeRange,
      metrics: {
        aiVisibility: baseScore + trend,
        trustScore: baseScore + trend * 0.8,
        dataQuality: baseScore + trend * 0.6,
      },
      trends: {
        aiVisibility: trend > 0 ? 'up' : 'down',
        trustScore: trend > 0 ? 'up' : 'down',
        dataQuality: trend > 0 ? 'up' : 'down',
      }
    };

    const duration = Date.now() - startTime;
    await trackSLO('dashboard_overview', duration, duration < 500);

    return cachedResponse(
      dashboardData,
      300,
      600,
      [CACHE_TAGS.DASHBOARD_OVERVIEW, CACHE_TAGS.DASHBOARD]
    );
    
  } catch (error) {
    const duration = Date.now() - startTime;
    await logger.error('Dashboard overview error', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    });
    
    return errorResponse(error, 500, { requestId });
  }
}
```

### After Migration
```typescript
// app/api/dashboard/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { dashboardQuerySchema, validateQueryParams } from '@/lib/validation/schemas';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { logger } from '@/lib/logger';
import { trackSLO } from '@/lib/slo';

export const dynamic = 'force-dynamic';

export const GET = createApiRoute(
  {
    endpoint: '/api/dashboard/overview',
    requireAuth: true, // ✅ Now requires authentication
    validateQuery: dashboardQuerySchema, // ✅ Validates query params
    rateLimit: true, // ✅ Rate limiting enabled
    performanceMonitoring: true, // ✅ Performance tracking enabled
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    const startTime = Date.now();
    
    try {
      // Query validation handled by wrapper, but we can access validated data
      const queryValidation = validateQueryParams(req, dashboardQuerySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }
      
      const { dealerId, timeRange } = queryValidation.data;
      
      await logger.info('Dashboard overview requested', {
        requestId,
        timeRange,
        dealerId,
        userId: auth.userId, // ✅ Now has user context
      });

      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, 100));

      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      
      const baseScore = 85 + Math.random() * 10;
      const trend = (Math.random() - 0.5) * 10;

      const dashboardData = {
        timestamp: new Date().toISOString(),
        dealerId,
        timeRange,
        metrics: {
          aiVisibility: baseScore + trend,
          trustScore: baseScore + trend * 0.8,
          dataQuality: baseScore + trend * 0.6,
        },
        trends: {
          aiVisibility: trend > 0 ? 'up' : 'down',
          trustScore: trend > 0 ? 'up' : 'down',
          dataQuality: trend > 0 ? 'up' : 'down',
        }
      };

      const duration = Date.now() - startTime;
      await trackSLO('dashboard_overview', duration, duration < 500);

      return cachedResponse(
        dashboardData,
        300,
        600,
        [CACHE_TAGS.DASHBOARD_OVERVIEW, CACHE_TAGS.DASHBOARD]
      );
      
    } catch (error) {
      const duration = Date.now() - startTime;
      await logger.error('Dashboard overview error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        userId: auth.userId,
      });
      
      return errorResponse(error, 500, { 
        requestId,
        endpoint: '/api/dashboard/overview',
      });
    }
  }
);
```

**Key Improvements:**
- ✅ Authentication required
- ✅ Query parameter validation
- ✅ Rate limiting
- ✅ Performance monitoring (automatic)
- ✅ User context in logs

---

## Example 2: AI Analysis Route

### Before Migration
```typescript
// app/api/ai/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, dealershipSize, marketType, aiAdoption } = body;
    
    // Manual validation
    if (!domain) {
      return NextResponse.json(
        { error: 'domain is required' },
        { status: 400 }
      );
    }
    
    // Basic domain validation
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }
    
    // No authentication check
    
    // Perform analysis
    const result = await performAnalysis(domain, {
      dealershipSize: dealershipSize || 'medium',
      marketType: marketType || 'suburban',
      aiAdoption: aiAdoption || 'medium',
    });
    
    return NextResponse.json({ success: true, result });
    
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

### After Migration
```typescript
// app/api/ai/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { aiAnalysisRequestSchema, validateRequestBody } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/api-response';

export const POST = createApiRoute(
  {
    endpoint: '/api/ai/analysis',
    requireAuth: true, // ✅ Requires authentication
    validateBody: aiAnalysisRequestSchema, // ✅ Validates request body
    rateLimit: true, // ✅ Rate limiting (stricter: 10/min)
    performanceMonitoring: true, // ✅ Performance tracking
  },
  async (req, auth) => {
    try {
      // Body validation handled by wrapper, but we can access validated data
      const bodyValidation = await validateRequestBody(req, aiAnalysisRequestSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }
      
      const { domain, dealershipSize, marketType, aiAdoption } = bodyValidation.data;
      
      // Perform analysis with user context
      const result = await performAnalysis(domain, {
        dealershipSize: dealershipSize || 'medium',
        marketType: marketType || 'suburban',
        aiAdoption: aiAdoption || 'medium',
        userId: auth.userId, // ✅ User context
      });
      
      return NextResponse.json({ 
        success: true, 
        result,
        requestedBy: auth.userId, // ✅ Audit trail
      });
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/ai/analysis',
        userId: auth.userId,
      });
    }
  }
);
```

**Key Improvements:**
- ✅ Authentication required
- ✅ Comprehensive input validation (domain format, enum values)
- ✅ Stricter rate limiting (10/min for expensive operations)
- ✅ User context in analysis and errors
- ✅ Standardized error responses

---

## Example 3: Public Health Check Route

### Before Migration
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

### After Migration
```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { checkDatabaseHealth } from '@/lib/db';

export const GET = createApiRoute(
  {
    endpoint: '/api/health',
    requireAuth: false, // ✅ Public endpoint, no auth required
    rateLimit: true, // ✅ Still rate limited (lenient: 1000/min)
    performanceMonitoring: true, // ✅ Performance tracking
  },
  async (req, auth) => {
    // Check database health
    const dbHealth = await checkDatabaseHealth();
    
    return NextResponse.json({
      status: dbHealth.healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        healthy: dbHealth.healthy,
        latency: dbHealth.latency,
      },
    });
  }
);
```

**Key Improvements:**
- ✅ No authentication required (public endpoint)
- ✅ Rate limiting still applied (prevents abuse)
- ✅ Database health check
- ✅ Performance monitoring

---

## Example 4: User Profile Route

### Before Migration
```typescript
// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Fetch user profile
  const profile = await getUserProfile(userId);
  
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const body = await req.json();
  const { firstName, lastName, email } = body;
  
  // No validation
  
  // Update profile
  const updated = await updateUserProfile(userId, {
    firstName,
    lastName,
    email,
  });
  
  return NextResponse.json({ profile: updated });
}
```

### After Migration
```typescript
// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { userProfileUpdateSchema, validateRequestBody } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/api-response';

export const GET = createApiRoute(
  {
    endpoint: '/api/user/profile',
    requireAuth: true, // ✅ Authentication required
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      // Fetch user profile
      const profile = await getUserProfile(auth.userId);
      
      return NextResponse.json({ 
        success: true,
        profile 
      });
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/user/profile',
        userId: auth.userId,
      });
    }
  }
);

export const PUT = createApiRoute(
  {
    endpoint: '/api/user/profile',
    requireAuth: true,
    validateBody: userProfileUpdateSchema, // ✅ Validates request body
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    try {
      // Body validation handled by wrapper
      const bodyValidation = await validateRequestBody(req, userProfileUpdateSchema);
      if (!bodyValidation.success) {
        return bodyValidation.response;
      }
      
      const { firstName, lastName, email, preferences } = bodyValidation.data;
      
      // Update profile
      const updated = await updateUserProfile(auth.userId, {
        firstName,
        lastName,
        email,
        preferences,
      });
      
      return NextResponse.json({ 
        success: true,
        profile: updated 
      });
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/user/profile',
        userId: auth.userId,
      });
    }
  }
);
```

**Key Improvements:**
- ✅ Consistent authentication (no manual checks)
- ✅ Input validation for PUT requests
- ✅ Standardized error handling
- ✅ User context in all operations

---

## Example 5: Automation Task Execution Route

### Before Migration
```typescript
// app/api/automation/tasks/[id]/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  
  // No validation of taskId
  // No authentication check
  
  try {
    const task = await getTask(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    if (task.status !== 'approved') {
      return NextResponse.json(
        { error: 'Task not approved' },
        { status: 400 }
      );
    }
    
    // Execute task
    const result = await executeTask(taskId);
    
    return NextResponse.json({ success: true, result });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Execution failed' },
      { status: 500 }
    );
  }
}
```

### After Migration
```typescript
// app/api/automation/tasks/[id]/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { uuidSchema } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/api-response';

export const POST = createApiRoute(
  {
    endpoint: '/api/automation/tasks/[id]/execute',
    requireAuth: true, // ✅ Requires authentication
    rateLimit: true, // ✅ Rate limiting (20/min for automation)
    performanceMonitoring: true,
  },
  async (req, auth, { params }: { params: { id: string } }) => {
    try {
      const taskId = params.id;
      
      // Validate taskId format
      const taskIdValidation = uuidSchema.safeParse(taskId);
      if (!taskIdValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid task ID format',
            errors: taskIdValidation.error.errors,
          },
          { status: 400 }
        );
      }
      
      const task = await getTask(taskId);
      
      if (!task) {
        return NextResponse.json(
          {
            success: false,
            error: 'Task not found',
          },
          { status: 404 }
        );
      }
      
      // Verify user has access to this task
      if (task.userId !== auth.userId && !auth.orgId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You do not have access to this task',
          },
          { status: 403 }
        );
      }
      
      if (task.status !== 'approved') {
        return NextResponse.json(
          {
            success: false,
            error: 'Task not approved',
            message: 'Task must be approved before execution',
          },
          { status: 400 }
        );
      }
      
      // Execute task with user context
      const result = await executeTask(taskId, {
        executedBy: auth.userId,
        orgId: auth.orgId,
      });
      
      return NextResponse.json({ 
        success: true, 
        result,
        executedBy: auth.userId,
      });
      
    } catch (error) {
      return errorResponse(error, 500, {
        requestId: req.headers.get('x-request-id'),
        endpoint: '/api/automation/tasks/[id]/execute',
        userId: auth.userId,
      });
    }
  }
);
```

**Key Improvements:**
- ✅ Authentication required
- ✅ Task ID validation (UUID format)
- ✅ User authorization check
- ✅ Standardized error responses
- ✅ Audit trail (executedBy)

---

## Migration Tips

1. **Start Small**: Begin with simple routes (GET requests, no complex logic)
2. **Test Thoroughly**: Test each route after migration
3. **Keep Old Code**: Comment out old code first, don't delete immediately
4. **Validate Incrementally**: Add validation schemas as needed
5. **Monitor Performance**: Check performance metrics after migration

---

## Common Patterns Reference

### Pattern: GET with Query Params
```typescript
validateQuery: dashboardQuerySchema
```

### Pattern: POST with Body
```typescript
validateBody: aiAnalysisRequestSchema
```

### Pattern: No Auth Required
```typescript
requireAuth: false
```

### Pattern: Organization Required
```typescript
requireAuth: true
// Then check orgId in handler
```

### Pattern: Custom Rate Limit
Already configured in `rate-limit.ts` based on endpoint pattern

---

**Next Steps:**
1. Use these examples as templates
2. Migrate routes one at a time
3. Test each migration
4. Monitor for issues

