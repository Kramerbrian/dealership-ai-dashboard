import { NextRequest, NextResponse } from 'next/server';
import { CacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { PerformanceMonitor } from '@/lib/monitoring';

// Add missing cache keys and TTL values
const CACHE_KEYS_EXT = {
  ...CACHE_KEYS,
  WEBSITE_DATA: (domain: string, timeRange: string) => `website:${domain}:${timeRange}`,
  AI_HEALTH_DATA: (timeRange: string) => `ai-health:${timeRange}`
} as const;

const CACHE_TTL_EXT = {
  ...CACHE_TTL,
  WEBSITE_DATA: 300,
  AI_HEALTH_DATA: 60
} as const;

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
  const fidValue = Math.random() * 100;
  const coreWebVitals = {
    lcp: {
      value: pageSpeed.desktop.largestContentfulPaint,
      status: (pageSpeed.desktop.largestContentfulPaint <= 2.5 ? 'good' :
              pageSpeed.desktop.largestContentfulPaint <= 4.0 ? 'needs-improvement' : 'poor') as 'good' | 'needs-improvement' | 'poor'
    },
    fid: {
      value: fidValue, // 0-100ms
      status: (fidValue <= 100 ? 'good' :
              fidValue <= 300 ? 'needs-improvement' : 'poor') as 'good' | 'needs-improvement' | 'poor'
    },
    cls: {
      value: pageSpeed.desktop.cumulativeLayoutShift,
      status: (pageSpeed.desktop.cumulativeLayoutShift <= 0.1 ? 'good' :
              pageSpeed.desktop.cumulativeLayoutShift <= 0.25 ? 'needs-improvement' : 'poor') as 'good' | 'needs-improvement' | 'poor'
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

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const monitor = PerformanceMonitor.getInstance();

  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || undefined || 'dealershipai.com';
    const timeRange = searchParams.get('timeRange') || undefined || '30d';

    // Check cache first
    const cacheKey = CACHE_KEYS_EXT.WEBSITE_DATA(domain, timeRange);

    const cachedData = await CacheManager.get(cacheKey);
    if (cachedData) {
      const duration = Date.now() - startTime;

      const response = NextResponse.json({
        success: true,
        data: cachedData,
        meta: {
          domain,
          timeRange,
          timestamp: new Date().toISOString(),
          responseTime: `${duration}ms`,
          source: 'cache'
        }
      });

      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      response.headers.set('Server-Timing', `website-analysis;dur=${duration}`);

      return response;
    }

    // Generate Website data with performance tracking
    const websiteData = await monitor.trackApiCall(
      'website_analysis',
      async () => generateWebsiteData(),
      { domain, timeRange }
    );

    // Cache the result
    await CacheManager.set(cacheKey, websiteData, CACHE_TTL_EXT.WEBSITE_DATA);

    const duration = Date.now() - startTime;

    const response = NextResponse.json({
      success: true,
      data: websiteData,
      meta: {
        domain,
        timeRange,
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`,
        source: 'website_analysis_engine'
      }
    });

    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('Server-Timing', `website-analysis;dur=${duration}`);

    return response;

  } catch (error: any) {
    console.error('Website Analysis API Error:', error);
    monitor.trackError(error, { api: 'website_analysis', domain: req.url });

    // Return fallback data
    const fallbackData = generateWebsiteData();
    const duration = Date.now() - startTime;

    const response = NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch website data',
      data: fallbackData,
      meta: {
        domain: req.nextUrl.searchParams.get('domain') || undefined || 'dealershipai.com',
        timeRange: req.nextUrl.searchParams.get('timeRange') || undefined || '30d',
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`,
        source: 'fallback_mock_data'
      }
    }, { status: 500 });

    response.headers.set('Server-Timing', `website-analysis;dur=${duration}`);
    return response;
  }
}