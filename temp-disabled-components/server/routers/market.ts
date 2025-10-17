import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc-server';
import { TRPCError } from '@trpc/server';

/**
 * Market analysis router - provides market insights and trends
 */
export const marketRouter = createTRPCRouter({
  /**
   * Get market analysis for a specific location
   */
  getAnalysis: protectedProcedure
    .input(
      z.object({
        location: z.string().min(1),
        radius: z.number().min(1).max(100).default(25), // miles
      })
    )
    .query(async ({ ctx, input }) => {
      const { location, radius } = input;

      // Check cache first
      const cacheKey = `market:${location}:${radius}`;
      const { data: cached } = await ctx.db
        .from('market_analysis')
        .select('*')
        .eq('location', location)
        .eq('radius', radius)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cached) {
        console.log('✅ Returning cached market analysis');
        return cached;
      }

      // Generate new analysis
      console.log(`🔍 Generating market analysis for ${location} (${radius}mi radius)`);
      const analysis = await generateMarketAnalysis(location, radius);

      // Store in database
      const { data: stored, error } = await ctx.db
        .from('market_analysis')
        .insert({
          tenant_id: ctx.tenant.id,
          location,
          radius,
          total_dealerships: analysis.total_dealerships,
          average_score: analysis.average_score,
          top_performer_score: analysis.top_performer_score,
          market_trends: analysis.market_trends,
          opportunity_score: analysis.opportunity_score,
          insights: analysis.insights,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to store market analysis:', error);
      }

      return stored || analysis;
    }),

  /**
   * Get market trends over time
   */
  getTrends: protectedProcedure
    .input(
      z.object({
        location: z.string().min(1),
        months: z.number().min(1).max(12).default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      const { location, months } = input;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: trends, error } = await ctx.db
        .from('market_analysis')
        .select('*')
        .eq('location', location)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch market trends',
        });
      }

      return trends || [];
    }),

  /**
   * Get market benchmark - compare dealership to market average
   */
  getBenchmark: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        location: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { dealershipId, location } = input;

      // Get dealership scores
      const { data: dealership } = await ctx.db
        .from('dealership_data')
        .select('*')
        .eq('id', dealershipId)
        .single();

      if (!dealership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dealership not found',
        });
      }

      // Get market analysis
      const { data: market } = await ctx.db
        .from('market_analysis')
        .select('*')
        .eq('location', location)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!market) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Market analysis not found. Please generate one first.',
        });
      }

      // Calculate benchmark
      const yourScore = dealership.last_ai_score || 0;
      const marketAverage = market.average_score || 0;
      const topPerformer = market.top_performer_score || 0;

      const vsMarket = yourScore - marketAverage;
      const vsTopPerformer = yourScore - topPerformer;
      const percentile = calculatePercentile(yourScore, marketAverage, topPerformer);

      return {
        yourScore,
        marketAverage,
        topPerformer,
        vsMarket,
        vsTopPerformer,
        percentile,
        totalCompetitors: market.total_dealerships || 0,
        position: Math.ceil((100 - percentile) / 100 * (market.total_dealerships || 1)),
      };
    }),

  /**
   * Get opportunity areas in market
   */
  getOpportunities: adminProcedure
    .input(
      z.object({
        location: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get latest market analysis
      const { data: market } = await ctx.db
        .from('market_analysis')
        .select('*')
        .eq('location', input.location)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!market || !market.insights) {
        return [];
      }

      // Parse insights and extract opportunities
      const insights = market.insights as any;
      const opportunities = [];

      if (insights.lowAIVisibility) {
        opportunities.push({
          type: 'ai_visibility',
          severity: 'high',
          title: 'Low AI Visibility Market-Wide',
          description: `${insights.lowAIVisibility}% of dealerships have AI visibility scores below 70`,
          recommendation: 'Focus on improving AI citations and review management',
        });
      }

      if (insights.schemaMarkupGap) {
        opportunities.push({
          type: 'technical',
          severity: 'medium',
          title: 'Schema Markup Opportunity',
          description: `Only ${insights.schemaMarkupGap}% of dealerships use proper structured data`,
          recommendation: 'Implement comprehensive schema markup for competitive advantage',
        });
      }

      if (insights.reviewGap) {
        opportunities.push({
          type: 'reputation',
          severity: 'high',
          title: 'Review Management Gap',
          description: `Average review response rate is only ${insights.reviewGap}%`,
          recommendation: 'Improve review response rate to 80%+ for market leadership',
        });
      }

      return opportunities;
    }),
});

/**
 * Generate market analysis (mock implementation)
 * In production, this would aggregate data from multiple sources
 */
async function generateMarketAnalysis(location: string, radius: number) {
  // Mock data - in production, this would:
  // 1. Query dealership databases
  // 2. Aggregate scores from public data
  // 3. Use Google Places API for dealership discovery
  // 4. Analyze trends from historical data

  const mockData = {
    total_dealerships: Math.floor(Math.random() * 20) + 10, // 10-30 dealerships
    average_score: Math.floor(Math.random() * 20) + 65, // 65-85
    top_performer_score: Math.floor(Math.random() * 10) + 88, // 88-98
    opportunity_score: Math.floor(Math.random() * 30) + 60, // 60-90
    market_trends: {
      ai_visibility_trend: 'increasing',
      average_score_change: '+3.2',
      competitive_intensity: 'medium',
    },
    insights: {
      lowAIVisibility: Math.floor(Math.random() * 30) + 40, // 40-70%
      schemaMarkupGap: Math.floor(Math.random() * 30) + 20, // 20-50%
      reviewGap: Math.floor(Math.random() * 30) + 45, // 45-75%
      topCategories: ['ai_visibility', 'ugc_health', 'technical_seo'],
    },
  };

  return mockData;
}

/**
 * Calculate percentile rank
 */
function calculatePercentile(score: number, average: number, top: number): number {
  if (score >= top) return 100;
  if (score <= 0) return 0;

  // Simple linear interpolation
  const range = top - 0;
  const position = score - 0;
  return Math.round((position / range) * 100);
}
