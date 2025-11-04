import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { dashboardReviewsQuerySchema, validateQueryParams } from '@/lib/validation/schemas';
import { CacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import { PerformanceMonitor } from '@/lib/monitoring';
import { cachedResponse, errorResponse } from '@/lib/api-response';
import { CACHE_TAGS } from '@/lib/cache-tags';
import { logger } from '@/lib/logger';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ReviewData {
  summary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      rating: number;
      count: number;
      percentage: number;
    }[];
  };
  sources: {
    name: string;
    count: number;
    averageRating: number;
    lastUpdate: string;
  }[];
  recentReviews: {
    id: string;
    name: string;
    rating: number;
    text: string;
    source: string;
    date: string;
    verified: boolean;
  }[];
  trends: {
    period: string;
    averageRating: number;
    reviewCount: number;
  }[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Mock Review data generator
function generateReviewData(): ReviewData {
  // Generate realistic rating distribution
  const ratingDistribution = [
    { rating: 5, count: 0, percentage: 0 },
    { rating: 4, count: 0, percentage: 0 },
    { rating: 3, count: 0, percentage: 0 },
    { rating: 2, count: 0, percentage: 0 },
    { rating: 1, count: 0, percentage: 0 }
  ];

  // Generate realistic distribution (more 5-star reviews)
  const totalReviews = 300 + Math.floor(Math.random() * 100); // 300-400 reviews
  ratingDistribution[0].count = Math.floor(totalReviews * 0.65); // 65% 5-star
  ratingDistribution[1].count = Math.floor(totalReviews * 0.25); // 25% 4-star
  ratingDistribution[2].count = Math.floor(totalReviews * 0.07); // 7% 3-star
  ratingDistribution[3].count = Math.floor(totalReviews * 0.02); // 2% 2-star
  ratingDistribution[4].count = Math.floor(totalReviews * 0.01); // 1% 1-star

  // Calculate percentages
  ratingDistribution.forEach(rating => {
    rating.percentage = Math.round((rating.count / totalReviews) * 100);
  });

  // Calculate average rating
  const totalStars = ratingDistribution.reduce((sum, rating) => sum + (rating.count * rating.rating), 0);
  const averageRating = Math.round((totalStars / totalReviews) * 10) / 10;

  const sources = [
    {
      name: 'Google',
      count: Math.floor(totalReviews * 0.4),
      averageRating: averageRating + (Math.random() * 0.4 - 0.2),
      lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Facebook',
      count: Math.floor(totalReviews * 0.25),
      averageRating: averageRating + (Math.random() * 0.3 - 0.15),
      lastUpdate: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'Yelp',
      count: Math.floor(totalReviews * 0.2),
      averageRating: averageRating + (Math.random() * 0.2 - 0.1),
      lastUpdate: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'DealerRater',
      count: Math.floor(totalReviews * 0.15),
      averageRating: averageRating + (Math.random() * 0.3 - 0.15),
      lastUpdate: new Date(Date.now() - Math.random() * 96 * 60 * 60 * 1000).toISOString()
    }
  ];

  const recentReviews = [
    {
      id: '1',
      name: 'John D.',
      rating: 5,
      text: 'Excellent service and great prices! The team was very professional and helped me find the perfect car.',
      source: 'Google',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      verified: true
    },
    {
      id: '2',
      name: 'Sarah M.',
      rating: 5,
      text: 'Very professional team. They made the car buying process smooth and stress-free.',
      source: 'Facebook',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      verified: true
    },
    {
      id: '3',
      name: 'Mike R.',
      rating: 4,
      text: 'Good experience overall. The sales team was knowledgeable and helpful.',
      source: 'Yelp',
      date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      verified: false
    },
    {
      id: '4',
      name: 'Lisa K.',
      rating: 5,
      text: 'Amazing customer service! They went above and beyond to help me with financing.',
      source: 'DealerRater',
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      verified: true
    },
    {
      id: '5',
      name: 'David W.',
      rating: 4,
      text: 'Great selection of vehicles and competitive pricing. Would recommend to others.',
      source: 'Google',
      date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      verified: true
    }
  ];

  // Generate trends for the last 6 months
  const trends = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    trends.push({
      period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      averageRating: averageRating + (Math.random() * 0.4 - 0.2),
      reviewCount: Math.floor(totalReviews / 6) + Math.floor(Math.random() * 20 - 10)
    });
  }

  const sentiment = {
    positive: Math.floor(totalReviews * 0.85), // 85% positive
    neutral: Math.floor(totalReviews * 0.12),  // 12% neutral
    negative: Math.floor(totalReviews * 0.03)  // 3% negative
  };

  return {
    summary: {
      averageRating,
      totalReviews,
      ratingDistribution
    },
    sources,
    recentReviews,
    trends,
    sentiment
  };
}

/**
 * Dashboard Reviews API Endpoint
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
    endpoint: '/api/dashboard/reviews',
    requireAuth: true,
    validateQuery: dashboardReviewsQuerySchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req, auth) => {
    const requestId = req.headers.get('x-request-id') || 'unknown';
    const monitor = PerformanceMonitor.getInstance();

    try {
      // Query validation handled by wrapper
      const queryValidation = validateQueryParams(req, dashboardReviewsQuerySchema);
      if (!queryValidation.success) {
        return queryValidation.response;
      }

      const timeRange = queryValidation.data.timeRange || '30d';
      const source = queryValidation.data.source;

      await logger.info('Reviews analysis requested', {
        requestId,
        timeRange,
        source,
        userId: auth.userId,
      });

      // Check cache first
      const cache = CacheManager.getInstance();
      const domain = 'dealershipai.com'; // Default domain - can be enhanced later
      const cacheKey = CACHE_KEYS.REVIEWS_DATA(domain, timeRange);

      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        await logger.info('Reviews cache hit', {
          requestId,
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
          300, // 5 minutes cache
          600, // 10 minutes stale-while-revalidate
          [CACHE_TAGS.DASHBOARD_REVIEWS, CACHE_TAGS.DASHBOARD]
        );
      }

      // Generate Review data with performance tracking
      const reviewData = await monitor.trackApiCall(
        'reviews_analysis',
        () => generateReviewData(),
        { domain, timeRange }
      );

      // Cache the result
      await cache.set(cacheKey, reviewData, CACHE_TTL.REVIEWS_DATA);

      await logger.info('Reviews analysis completed', {
        requestId,
        timeRange,
        userId: auth.userId,
      });

      return cachedResponse(
        {
          success: true,
          data: reviewData,
          meta: {
            domain,
            timeRange,
            timestamp: new Date().toISOString(),
            source: 'reviews_analysis_engine'
          }
        },
        300,
        600,
        [CACHE_TAGS.DASHBOARD_REVIEWS, CACHE_TAGS.DASHBOARD]
      );

    } catch (error) {
      await logger.error('Reviews analysis error', {
        requestId,
        userId: auth.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      return errorResponse(error, 500, {
        requestId,
        endpoint: '/api/dashboard/reviews',
        userId: auth.userId,
      });
    }
  }
);