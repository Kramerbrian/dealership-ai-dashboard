import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { dashboardWebsiteQuerySchema, validateQueryParams } from '@/lib/validation/schemas';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { logger } from '@/lib/logger';
import { CacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { PerformanceMonitor } from '@/lib/monitoring';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface WebsiteData {
  pageSpeed: {
    desktop: {
      score: number;
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      cumulativeLayoutShift: number;
      speedIndex: number;
      totalBlockingTime: number;
    };
    mobile: {
      score: number;
      firstContentfulPaint: number;
      largestContentfulPaint: number;
      cumulativeLayoutShift: number;
      speedIndex: number;
      totalBlockingTime: number;
    };
  };
  coreWebVitals: {
    lcp: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
    fid: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
    cls: { value: number; status: 'good' | 'needs-improvement' | 'poor' };
  };
  devicePerformance: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  recommendations: {
    id: string;
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'easy' | 'medium' | 'hard';
    description: string;
  }[];
}

// Mock Website data generator
function generateWebsiteData(): WebsiteData {
  // Generate realistic PageSpeed scores with some variation
  const desktopScore = 88 + Math.random() * 8; // 88-96
  const mobileScore = 72 + Math.random() * 12; // 72-84

  const pageSpeed = {
    desktop: {
      score: Math.round(desktopScore),
      firstContentfulPaint: 0.8 + Math.random() * 0.4, // 0.8-1.2s
      largestContentfulPaint: 1.5 + Math.random() * 0.8, // 1.5-2.3s
      cumulativeLayoutShift: Math.random() * 0.1, // 0-0.1
      speedIndex: 1.2 + Math.random() * 0.6, // 1.2-1.8s
      totalBlockingTime: Math.random() * 150 // 0-150ms
    },
    mobile: {
      score: Math.round(mobileScore),
      firstContentfulPaint: 1.2 + Math.random() * 0.8, // 1.2-2.0s
      largestContentfulPaint: 2.0 + Math.random() * 1.2, // 2.0-3.2s
      cumulativeLayoutShift: Math.random() * 0.15, // 0-0.15
      speedIndex: 2.0 + Math.random() * 1.0, // 2.0-3.0s
      totalBlockingTime: 100 + Math.random() * 200 // 100-300ms
    }
  };

  // Generate Core Web Vitals with realistic values
  const coreWebVitals = {
    lcp: {
      value: pageSpeed.desktop.largestContentfulPaint,
      status: pageSpeed.desktop.largestContentfulPaint <= 2.5 ? 'good' : 
              pageSpeed.desktop.largestContentfulPaint <= 4.0 ? 'needs-improvement' : 'poor'
    },
    fid: {
      value: Math.random() * 100, // 0-100ms
      status: Math.random() * 100 <= 100 ? 'good' : 
              Math.random() * 100 <= 300 ? 'needs-improvement' : 'poor'
    },
    cls: {
      value: pageSpeed.desktop.cumulativeLayoutShift,
      status: pageSpeed.desktop.cumulativeLayoutShift <= 0.1 ? 'good' : 
              pageSpeed.desktop.cumulativeLayoutShift <= 0.25 ? 'needs-improvement' : 'poor'
    }
  };

  const devicePerformance = {
    desktop: Math.round(desktopScore),
    mobile: Math.round(mobileScore),
    tablet: Math.round(desktopScore - 5 + Math.random() * 10) // Similar to desktop with variation
  };

  const recommendations = [
    {
      id: '1',
      title: 'Optimize Images',
      impact: 'high' as const,
      effort: 'medium' as const,
      description: 'Compress and resize images to reduce load times'
    },
    {
      id: '2',
      title: 'Enable Compression',
      impact: 'high' as const,
      effort: 'easy' as const,
      description: 'Enable Gzip compression to reduce file sizes'
    },
    {
      id: '3',
      title: 'Minify CSS/JS',
      impact: 'medium' as const,
      effort: 'easy' as const,
      description: 'Remove unnecessary characters from CSS and JavaScript files'
    },
    {
      id: '4',
      title: 'Use CDN',
      impact: 'high' as const,
      effort: 'hard' as const,
      description: 'Implement a Content Delivery Network for faster global access'
    },
    {
      id: '5',
      title: 'Lazy Load Images',
      impact: 'medium' as const,
      effort: 'medium' as const,
      description: 'Load images only when they are about to enter the viewport'
    }
  ];

  return {
    pageSpeed,
    coreWebVitals,
    devicePerformance,
    recommendations
  };
}

/**
 * Dashboard Website API Endpoint
 * 
 * ✅ Migrated to new security middleware:
 * - Authentication required
 * - Query parameter validation
 * - Rate limiting
 * - Performance monitoring
 * - Standardized error handling
 */
export const GET = createApiRoute(
  {
    endpoint: '/api/dashboard/website',
    requireAuth: true,
    validateQuery: dashboardWebsiteQuerySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    const monitor = PerformanceMonitor.getInstance();

    try {
      // Query validation handled by wrapper
      const queryValidation = validateQueryParams(req, dashboardWebsiteQuerySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }

      const domain = queryValidation.data.domain || 'dealershipai.com';
      const timeRange = queryValidation.data.timeRange || '30d';

      await logger.info('Website analysis requested', {
        requestId,
        domain,
        timeRange,
        userId: auth.userId,
      });

      // Check cache first
      const cache = CacheManager.getInstance();
      const cacheKey = CACHE_KEYS.WEBSITE_DATA(domain, timeRange);

      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        await logger.info('Website cache hit', {
          requestId,
          domain,
          timeRange,
        });

        return cachedResponse(
          {
            success: true,
            data: cachedData,
            meta: {
              domain,
              timeRange,
              timestamp: new Date().toISOString(),
              source: 'cache'
            }
          },
          300, // 5 min cache
          600, // 10 min stale
          [CACHE_TAGS.DASHBOARD_WEBSITE, CACHE_TAGS.DASHBOARD]
        );
      }

      // Generate Website data with performance tracking
      const websiteData = await monitor.trackApiCall(
        'website_analysis',
        () => generateWebsiteData(),
        { domain, timeRange }
      );

      // Cache the result
      await cache.set(cacheKey, websiteData, CACHE_TTL.WEBSITE_DATA);

      await logger.info('Website analysis completed', {
        requestId,
        domain,
        timeRange,
        userId: auth.userId,
      });

      return cachedResponse(
        {
          success: true,
          data: websiteData,
          meta: {
            domain,
            timeRange,
            timestamp: new Date().toISOString(),
            source: 'website_analysis_engine'
          }
        },
        300,
        600,
        [CACHE_TAGS.DASHBOARD_WEBSITE, CACHE_TAGS.DASHBOARD]
      );

    } catch (error) {
      await logger.error('Website analysis error', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/dashboard/website',
        userId: auth.userId,
      });
    }
  }
);