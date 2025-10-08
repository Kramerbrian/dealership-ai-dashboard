import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc-server';
import { TRPCError } from '@trpc/server';
import { 
  computeAOER, 
  priorityScores, 
  aoerByIntent, 
  dashboardTiles, 
  DEMO_SET,
  type QueryCheck,
  type Intent 
} from '@/lib/aoer-metrics';

/**
 * AOER (AI Overview Exposure Rate) Metrics Router
 * Handles AI search performance analytics and click-loss calculations
 */
export const aoerRouter = createTRPCRouter({
  /**
   * Get AOER dashboard tiles with key metrics
   */
  getDashboardTiles: protectedProcedure
    .input(
      z.object({
        useDemoData: z.boolean().default(true),
        timeframe: z.enum(['7d', '30d', '90d']).default('30d'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { useDemoData, timeframe } = input;

      try {
        if (useDemoData) {
          // Use demo data for now
          const tiles = dashboardTiles(DEMO_SET);
          return {
            ...tiles,
            dataSource: 'demo',
            lastUpdated: new Date().toISOString(),
          };
        }

        // TODO: Implement real data fetching from database
        // For now, return demo data with a note
        const tiles = dashboardTiles(DEMO_SET);
        return {
          ...tiles,
          dataSource: 'demo',
          lastUpdated: new Date().toISOString(),
          note: 'Real data integration coming soon',
        };
      } catch (error) {
        console.error('Error fetching AOER dashboard tiles:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch AOER metrics',
        });
      }
    }),

  /**
   * Get priority scores for queries
   */
  getPriorityScores: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        intent: z.enum(['local', 'inventory', 'finance', 'trade', 'info', 'service', 'brand']).optional(),
        useDemoData: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, intent, useDemoData } = input;

      try {
        let querySet = useDemoData ? DEMO_SET : [];

        if (intent && querySet.length > 0) {
          querySet = querySet.filter(q => q.intent === intent);
        }

        const priorityRows = priorityScores(querySet);
        return priorityRows.slice(0, limit);
      } catch (error) {
        console.error('Error fetching priority scores:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch priority scores',
        });
      }
    }),

  /**
   * Get AOER metrics by intent
   */
  getAOERByIntent: protectedProcedure
    .input(
      z.object({
        useDemoData: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { useDemoData } = input;

      try {
        const querySet = useDemoData ? DEMO_SET : [];
        const aoerByIntentData = aoerByIntent(querySet);
        
        return {
          data: aoerByIntentData,
          dataSource: useDemoData ? 'demo' : 'real',
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error fetching AOER by intent:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch AOER by intent',
        });
      }
    }),

  /**
   * Get detailed query analysis
   */
  getQueryAnalysis: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        intent: z.enum(['local', 'inventory', 'finance', 'trade', 'info', 'service', 'brand']).optional(),
        useDemoData: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, intent, useDemoData } = input;

      try {
        let querySet = useDemoData ? DEMO_SET : [];

        if (query) {
          querySet = querySet.filter(q => 
            q.query.toLowerCase().includes(query.toLowerCase())
          );
        }

        if (intent) {
          querySet = querySet.filter(q => q.intent === intent);
        }

        const aoerMetrics = computeAOER(querySet);
        const priorityRows = priorityScores(querySet);

        return {
          queries: querySet,
          aoerMetrics,
          priorityScores: priorityRows,
          totalQueries: querySet.length,
          dataSource: useDemoData ? 'demo' : 'real',
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error fetching query analysis:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch query analysis',
        });
      }
    }),

  /**
   * Get click loss analysis
   */
  getClickLossAnalysis: protectedProcedure
    .input(
      z.object({
        timeframe: z.enum(['7d', '30d', '90d']).default('30d'),
        useDemoData: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { timeframe, useDemoData } = input;

      try {
        const querySet = useDemoData ? DEMO_SET : [];
        const priorityRows = priorityScores(querySet);

        const totalClickLoss = priorityRows.reduce((sum, row) => sum + row.loss, 0);
        const avgClickLoss = totalClickLoss / Math.max(1, priorityRows.length);
        const maxClickLoss = Math.max(...priorityRows.map(row => row.loss));

        // Group by intent
        const clickLossByIntent = priorityRows.reduce((acc, row) => {
          if (!acc[row.intent]) {
            acc[row.intent] = { total: 0, count: 0, avg: 0 };
          }
          acc[row.intent].total += row.loss;
          acc[row.intent].count += 1;
          acc[row.intent].avg = acc[row.intent].total / acc[row.intent].count;
          return acc;
        }, {} as Record<Intent, { total: number; count: number; avg: number }>);

        return {
          totalClickLoss,
          avgClickLoss,
          maxClickLoss,
          clickLossByIntent,
          topLossQueries: priorityRows
            .sort((a, b) => b.loss - a.loss)
            .slice(0, 10),
          dataSource: useDemoData ? 'demo' : 'real',
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error fetching click loss analysis:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch click loss analysis',
        });
      }
    }),

  /**
   * Get AI claim score distribution
   */
  getACSDistribution: protectedProcedure
    .input(
      z.object({
        useDemoData: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { useDemoData } = input;

      try {
        const querySet = useDemoData ? DEMO_SET : [];
        const priorityRows = priorityScores(querySet);

        const acsScores = priorityRows.map(row => row.ACS);
        const distribution = {
          excellent: acsScores.filter(score => score >= 80).length,
          good: acsScores.filter(score => score >= 60 && score < 80).length,
          fair: acsScores.filter(score => score >= 40 && score < 60).length,
          poor: acsScores.filter(score => score < 40).length,
        };

        const avgACS = acsScores.reduce((sum, score) => sum + score, 0) / Math.max(1, acsScores.length);

        return {
          distribution,
          avgACS,
          totalQueries: acsScores.length,
          dataSource: useDemoData ? 'demo' : 'real',
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error fetching ACS distribution:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch ACS distribution',
        });
      }
    }),
});
