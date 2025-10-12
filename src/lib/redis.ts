/**
 * DealershipAI v2.0 - Redis Configuration
 * Geographic pooling for 50x cost reduction
 */

import { Redis } from '@upstash/redis';

// Create a mock Redis client for development/build time
const createRedisClient = () => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  
  // Mock Redis for development/build time
  return {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    incr: async () => 1,
    decr: async () => 0,
    del: async () => 1,
    exists: async () => 0,
    expire: async () => 1,
    ttl: async () => -1,
    keys: async () => [],
    flushall: async () => 'OK',
    incrbyfloat: async () => 'OK',
    mget: async () => []
  } as any;
};

// Initialize Redis client
export const redis = createRedisClient();

// Session limits by tier
export const SESSION_LIMITS = {
  FREE: 0,
  PRO: 50,
  ENTERPRISE: 200
} as const;

// Cache TTL settings
export const CACHE_TTL = {
  GEO_POOL: 14 * 24 * 60 * 60, // 14 days in seconds
  SESSION_COUNT: 24 * 60 * 60,  // 24 hours in seconds
  SCORES: 60 * 60,              // 1 hour in seconds
} as const;

/**
 * Geographic Pooling Manager
 * Reduces costs by 50x through city-based caching
 */
export class GeoPoolManager {
  /**
   * Get or create geographic pool data
   */
  static async getPoolData(city: string, state: string, country: string = 'US') {
    const poolKey = `geo_pool:${city}:${state}:${country}`;
    
    try {
      // Try to get cached data
      const cached = await redis.get(poolKey);
      if (cached) {
        return JSON.parse(cached as string);
      }

      // If no cache, this would trigger expensive analysis
      // In production, this would call external APIs
      const poolData = await this.generatePoolData(city, state, country);
      
      // Cache for 14 days
      await redis.setex(poolKey, CACHE_TTL.GEO_POOL, JSON.stringify(poolData));
      
      return poolData;
    } catch (error) {
      console.error('GeoPool error:', error);
      return null;
    }
  }

  /**
   * Generate base analysis data for a geographic area
   */
  private static async generatePoolData(city: string, state: string, country: string) {
    // Simulate expensive analysis that would normally cost $15/dealer
    // This runs once per city and is shared across all dealers in that area
    
    const baseData = {
      city,
      state,
      country,
      marketAnalysis: {
        totalDealers: Math.floor(Math.random() * 50) + 20,
        averageScore: Math.random() * 40 + 30,
        topPerformer: this.getRandomDealerName(),
        marketTrends: this.generateMarketTrends(),
      },
      competitorData: this.generateCompetitorData(),
      localInsights: this.generateLocalInsights(city, state),
      generatedAt: new Date().toISOString(),
    };

    return baseData;
  }

  /**
   * Add variance to base data for individual dealerships
   */
  static addVariance(baseData: any, domain: string) {
    const seed = this.hashString(domain);
    const random = this.seededRandom(seed);

      return {
      ...baseData,
      marketAnalysis: {
        ...baseData.marketAnalysis,
        averageScore: Math.max(0, Math.min(100, 
          baseData.marketAnalysis.averageScore + (random() - 0.5) * 20
        )),
      },
      variance: {
        scoreAdjustment: (random() - 0.5) * 10,
        competitorRank: Math.floor(random() * 10) + 1,
        marketShare: random() * 0.1,
      }
    };
  }

  /**
   * Get session count for user
   */
  static async getSessionCount(userId: string): Promise<number> {
    try {
      const count = await redis.get(`sessions:${userId}`);
      return count ? parseInt(count as string) : 0;
    } catch (error) {
      console.error('Session count error:', error);
      return 0;
    }
  }

  /**
   * Increment session count
   */
  static async incrementSession(userId: string, cost: number = 0.01) {
    try {
      await redis.incr(`sessions:${userId}`);
      await redis.expire(`sessions:${userId}`, CACHE_TTL.SESSION_COUNT);
      
      // Track cost for monitoring
      await redis.incrbyfloat(`cost:${userId}`, cost);
      await redis.expire(`cost:${userId}`, CACHE_TTL.SESSION_COUNT);
    } catch (error) {
      console.error('Session increment error:', error);
    }
  }

  /**
   * Check if user has reached session limit
   */
  static async hasReachedLimit(userId: string, plan: keyof typeof SESSION_LIMITS): Promise<boolean> {
    const used = await this.getSessionCount(userId);
    const limit = SESSION_LIMITS[plan];
    return used >= limit;
  }

  /**
   * Get user's monthly cost
   */
  static async getMonthlyCost(userId: string): Promise<number> {
    try {
      const cost = await redis.get(`cost:${userId}`);
      return cost ? parseFloat(cost as string) : 0;
    } catch (error) {
      console.error('Cost retrieval error:', error);
      return 0;
    }
  }

  /**
   * Cache scoring results
   */
  static async cacheScores(domain: string, scores: any) {
    try {
      const key = `scores:${domain}`;
      await redis.setex(key, CACHE_TTL.SCORES, JSON.stringify(scores));
    } catch (error) {
      console.error('Score caching error:', error);
    }
  }

  /**
   * Get cached scores
   */
  static async getCachedScores(domain: string) {
    try {
      const key = `scores:${domain}`;
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached as string) : null;
    } catch (error) {
      console.error('Score retrieval error:', error);
      return null;
    }
  }

  // Helper methods
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private static seededRandom(seed: number) {
    return () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };
  }

  private static getRandomDealerName(): string {
    const names = [
      'Premier Auto Group', 'Elite Motors', 'Champion Cars',
      'Metro Auto Center', 'Sunshine Motors', 'Golden Gate Auto',
      'Liberty Car Company', 'Heritage Motors', 'Summit Auto Group'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateMarketTrends() {
    return {
      aiAdoption: Math.random() * 0.3 + 0.2, // 20-50%
      avgResponseTime: Math.floor(Math.random() * 4) + 1, // 1-4 hours
      topConcerns: ['Price transparency', 'Response time', 'Inventory accuracy'],
      growthRate: Math.random() * 0.1 + 0.05, // 5-15%
    };
  }

  private static generateCompetitorData() {
      return {
      count: Math.floor(Math.random() * 20) + 5,
      avgScore: Math.random() * 30 + 40,
      topPerformer: this.getRandomDealerName(),
      marketShare: Math.random() * 0.2 + 0.1,
    };
  }

  private static generateLocalInsights(city: string, state: string) {
      return {
      population: Math.floor(Math.random() * 500000) + 50000,
      medianIncome: Math.floor(Math.random() * 50000) + 30000,
      carOwnership: Math.random() * 0.2 + 0.7, // 70-90%
      seasonalTrends: ['Spring buying surge', 'Holiday promotions', 'Year-end clearances'],
      };
    }
  }

  /**
 * Cost optimization metrics
 */
export class CostOptimizer {
  /**
   * Calculate cost savings from geographic pooling
   */
  static calculateSavings(dealerCount: number, cityCount: number): {
    withoutPooling: number;
    withPooling: number;
    savings: number;
    savingsPercent: number;
  } {
    const costPerDealer = 15; // $15 per dealer without pooling
    const costPerCity = 15;   // $15 per city with pooling
    
    const withoutPooling = dealerCount * costPerDealer;
    const withPooling = cityCount * costPerCity;
    const savings = withoutPooling - withPooling;
    const savingsPercent = (savings / withoutPooling) * 100;

    return {
      withoutPooling,
      withPooling,
      savings,
      savingsPercent: Math.round(savingsPercent)
    };
  }

  /**
   * Get cost optimization report
   */
  static async getOptimizationReport() {
    try {
      const stats = await redis.mget([
        'total_queries',
        'cached_queries',
        'geo_pool_hits',
        'total_cost'
      ]);

      const [totalQueries, cachedQueries, geoPoolHits, totalCost] = stats.map(s => 
        s ? parseInt(s as string) : 0
      );

      const cacheHitRate = totalQueries > 0 ? (cachedQueries / totalQueries) : 0;
      const geoPoolRate = totalQueries > 0 ? (geoPoolHits / totalQueries) : 0;
      const avgCostPerQuery = totalQueries > 0 ? (totalCost / totalQueries) : 0;
      
      return {
        totalQueries,
        cachedQueries,
        geoPoolHits,
        totalCost,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        geoPoolRate: Math.round(geoPoolRate * 100) / 100,
        avgCostPerQuery: Math.round(avgCostPerQuery * 100) / 100,
        efficiency: cacheHitRate > 0.8 ? 'Excellent' : cacheHitRate > 0.6 ? 'Good' : 'Needs Improvement'
      };
    } catch (error) {
      console.error('Optimization report error:', error);
      return null;
    }
  }
}