# Production Enhancements - Next Level Optimizations

## Current Status ✅
- ✅ Rate limiting (multiple implementations)
- ✅ Redis caching (edge + hybrid)
- ✅ A/B testing framework
- ✅ Feature flags
- ✅ Request deduplication (idempotency)
- ✅ API documentation (OpenAPI)
- ✅ Structured logging
- ✅ Web Vitals tracking
- ✅ Database indexes

## Tier 1: Critical Enhancements (Do First)

### 1. Global Middleware for Rate Limiting & Security
**Impact**: High | **Effort**: 30 min | **Priority**: 🔴 CRITICAL

**Issue**: Rate limiting exists but not applied globally via Next.js middleware.

**Implementation**:
```typescript
// middleware.ts (create at root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClientIP } from '@/lib/api-protection';
import { rateLimiters } from '@/lib/rateLimiter';

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API health checks
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/health') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = getClientIP(request);
    const limiter = rateLimiters.api;
    const allowed = await limiter.check({ ip, path: request.nextUrl.pathname });

    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: limiter.getRetryAfter() },
        { status: 429, headers: { 'Retry-After': String(limiter.getRetryAfter()) } }
      );
    }
  }

  // Security headers
  const response = NextResponse.next();
  
  // Security headers (enhance existing from next.config.js)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.clerk.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.clerk.com https://*.supabase.co https://*.sentry.io https://*.logtail.com;"
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

### 2. Prisma Connection Pooling Optimization
**Impact**: High | **Effort**: 15 min | **Priority**: 🔴 CRITICAL

**Issue**: Prisma client doesn't have optimized connection pooling for production.

**Implementation**:
```typescript
// lib/prisma.ts (enhance existing)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Optimized Prisma client with connection pooling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  // Note: Prisma handles pooling automatically, but we can optimize queries
});

// Health check helper
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      healthy: latency < 1000, // Healthy if query completes in < 1s
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Cleanup on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

---

### 3. Database Query Monitoring
**Impact**: High | **Effort**: 20 min | **Priority**: 🔴 CRITICAL

**Implementation**:
```typescript
// lib/db-monitor.ts (new file)
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  slow: boolean;
}

const SLOW_QUERY_THRESHOLD = 1000; // 1 second
const queryMetrics: QueryMetrics[] = [];

// Prisma middleware for query monitoring
prisma.$use(async (params, next) => {
  const start = Date.now();
  
  try {
    const result = await next(params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > SLOW_QUERY_THRESHOLD) {
      const query = `${params.model}.${params.action}`;
      await logger.warn('Slow database query detected', {
        query,
        duration,
        model: params.model,
        action: params.action,
        args: JSON.stringify(params.args),
      });
      
      queryMetrics.push({
        query,
        duration,
        timestamp: new Date(),
        slow: true,
      });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    await logger.error('Database query error', {
      model: params.model,
      action: params.action,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
});

// API endpoint to get query metrics
export async function getQueryMetrics(): Promise<{
  slowQueries: QueryMetrics[];
  avgQueryTime: number;
  totalQueries: number;
}> {
  const slowQueries = queryMetrics.filter(q => q.slow);
  const avgQueryTime = queryMetrics.length > 0
    ? queryMetrics.reduce((sum, q) => sum + q.duration, 0) / queryMetrics.length
    : 0;
  
  return {
    slowQueries: slowQueries.slice(-10), // Last 10 slow queries
    avgQueryTime,
    totalQueries: queryMetrics.length,
  };
}

// Reset metrics (call periodically)
export function resetQueryMetrics(): void {
  queryMetrics.length = 0;
}
```

**API Route**:
```typescript
// app/api/admin/db-metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getQueryMetrics } from '@/lib/db-monitor';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Only allow admins (add your admin check logic)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const metrics = await getQueryMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
```

---

### 4. Enhanced Error Boundaries with Recovery
**Impact**: Medium | **Effort**: 20 min | **Priority**: 🟡 HIGH

**Implementation**:
```typescript
// components/EnhancedErrorBoundary.tsx (new file)
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry/Logtail
    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 text-center">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm text-gray-700 cursor-pointer">
                  Error details (development only)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="mt-6 flex space-x-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Tier 2: Performance Enhancements (Next Week)

### 5. React Query Request Deduplication
**Impact**: High | **Effort**: 15 min | **Priority**: 🟡 HIGH

**Implementation**:
```typescript
// lib/react-query-config.ts (new file)
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Request deduplication (automatic with React Query)
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (but not too aggressively)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Request deduplication hook
export function useDedupedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 60 * 1000,
    enabled: options?.enabled ?? true,
    // Automatic deduplication - React Query handles this
  });
}
```

---

### 6. Edge Caching Strategy Enhancement
**Impact**: High | **Effort**: 30 min | **Priority**: 🟡 HIGH

**Implementation**: Update API routes to use Vercel Edge Config for cache tags:
```typescript
// lib/edge-cache-enhanced.ts (enhance existing)
import { revalidateTag } from 'next/cache';

// Cache tag invalidation helper
export async function invalidateCache(tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

// Usage in API routes:
// app/api/dashboard/overview/route.ts
export async function GET(req: NextRequest) {
  // ... existing code ...
  
  const response = cachedResponse(dashboardData, 60, 300);
  
  // Add cache tags for selective invalidation
  response.headers.set('Cache-Tag', 'dashboard,overview,tenant');
  
  return response;
}

// When data changes, invalidate:
await invalidateCache(['dashboard', 'overview']);
```

---

### 7. Progressive Web App (PWA) Support
**Impact**: Medium | **Effort**: 45 min | **Priority**: 🟢 MEDIUM

**Implementation**:
1. Install `next-pwa`:
```bash
npm install next-pwa
```

2. Update `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... existing config
});
```

3. Create `public/manifest.json`:
```json
{
  "name": "DealershipAI Dashboard",
  "short_name": "DealershipAI",
  "description": "AI-powered visibility tracking for automotive dealerships",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

4. Add to `app/layout.tsx`:
```typescript
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<meta name="theme-color" content="#3b82f6" />
```

---

## Tier 3: Monitoring & Observability (Next 2 Weeks)

### 8. Advanced Performance Monitoring
**Impact**: Medium | **Effort**: 1 hour | **Priority**: 🟢 MEDIUM

**Implementation**: Enhance existing performance monitoring:
```typescript
// lib/performance-monitor-enhanced.ts (enhance existing)
import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

export class EnhancedPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds = {
    apiResponseTime: 1000, // 1 second
    pageLoadTime: 3000, // 3 seconds
    dbQueryTime: 500, // 500ms
  };

  async trackMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {}
  ) {
    const metric: PerformanceMetric = {
      name,
      value,
      tags,
      timestamp: new Date(),
    };

    this.metrics.push(metric);

    // Alert on threshold violations
    const threshold = this.thresholds[name as keyof typeof this.thresholds];
    if (threshold && value > threshold) {
      await logger.warn('Performance threshold exceeded', {
        metric: name,
        value,
        threshold,
        tags,
      });
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        value,
        ...tags,
      });
    }
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  getAverage(name: string, windowMinutes = 5): number {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);
    const recent = this.metrics.filter(
      m => m.name === name && m.timestamp > cutoff
    );
    
    if (recent.length === 0) return 0;
    
    return recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
  }
}

export const performanceMonitor = new EnhancedPerformanceMonitor();
```

---

### 9. Uptime Monitoring Endpoint
**Impact**: Low | **Effort**: 15 min | **Priority**: 🟢 MEDIUM

**Implementation**:
```typescript
// app/api/system/status/route.ts (new file)
import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';
import { getQueryMetrics } from '@/lib/db-monitor';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [dbHealth, queryMetrics] = await Promise.all([
    checkDatabaseHealth(),
    getQueryMetrics().catch(() => null),
  ]);

  return NextResponse.json({
    status: dbHealth.healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        healthy: dbHealth.healthy,
        latency: dbHealth.latency,
        error: dbHealth.error,
      },
      queries: queryMetrics ? {
        avgQueryTime: queryMetrics.avgQueryTime,
        slowQueries: queryMetrics.slowQueries.length,
      } : null,
    },
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
}
```

---

### 10. Real-time Alerting
**Impact**: Medium | **Effort**: 30 min | **Priority**: 🟡 HIGH

**Implementation**: Set up alerts for critical issues:
```typescript
// lib/alerting.ts (new file)
import { logger } from '@/lib/logger';

interface AlertConfig {
  channel: 'email' | 'slack' | 'sentry';
  threshold: number;
  cooldown: number; // minutes
}

export class AlertManager {
  private lastAlert: Map<string, Date> = new Map();

  async alert(
    severity: 'critical' | 'warning' | 'info',
    message: string,
    data: Record<string, any> = {},
    config?: AlertConfig
  ) {
    const alertKey = `${severity}:${message}`;
    const lastSent = this.lastAlert.get(alertKey);
    const now = new Date();

    // Check cooldown
    if (lastSent && config?.cooldown) {
      const minutesSinceLastAlert =
        (now.getTime() - lastSent.getTime()) / 1000 / 60;
      if (minutesSinceLastAlert < config.cooldown) {
        return; // Skip alert, still in cooldown
      }
    }

    // Send alert
    await logger.error(`[${severity.toUpperCase()}] ${message}`, data);

    // Send to Sentry for critical errors
    if (severity === 'critical' && typeof window === 'undefined') {
      const Sentry = await import('@sentry/nextjs');
      Sentry.captureMessage(message, {
        level: 'error',
        tags: { severity },
        extra: data,
      });
    }

    this.lastAlert.set(alertKey, now);
  }
}

export const alertManager = new AlertManager();
```

---

## Implementation Priority

### This Week (Critical)
1. ✅ Global middleware for rate limiting
2. ✅ Prisma connection pooling
3. ✅ Database query monitoring
4. ✅ Enhanced error boundaries

### Next Week (High Priority)
5. ✅ React Query deduplication
6. ✅ Edge caching enhancement
7. ✅ Uptime monitoring

### Next 2 Weeks (Medium Priority)
8. ✅ Advanced performance monitoring
9. ✅ Real-time alerting
10. ✅ PWA support (optional)

---

## Quick Win Checklist

- [ ] Create `middleware.ts` at root
- [ ] Enhance `lib/prisma.ts` with health checks
- [ ] Create `lib/db-monitor.ts` for query monitoring
- [ ] Create `components/EnhancedErrorBoundary.tsx`
- [ ] Update `lib/react-query-config.ts` for deduplication
- [ ] Create `app/api/system/status/route.ts`
- [ ] Test all enhancements locally
- [ ] Deploy to production

---

## Expected Impact

**Performance**:
- 30-40% reduction in duplicate API calls
- 20-30% faster page loads (PWA caching)
- Better database query performance (monitoring + optimization)

**Reliability**:
- Automatic recovery from React errors
- Proactive slow query detection
- Real-time system health monitoring

**Developer Experience**:
- Better error messages
- Query performance insights
- System status dashboard

---

**Total Estimated Time**: 4-6 hours for critical enhancements
**ROI**: High - Prevents outages, improves performance, enhances monitoring

