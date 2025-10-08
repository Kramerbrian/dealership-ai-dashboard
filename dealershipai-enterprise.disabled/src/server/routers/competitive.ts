import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc'

export const competitiveRouter = createTRPCRouter({
  // Get competitor matrix
  getCompetitorMatrix: protectedProcedure
    .query(async ({ ctx }) => {
      // This would typically fetch from a competitors table
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Naples Honda',
          aiVisibility: 78,
          reviews: 342,
          seoScore: 82,
          trend: 'up' as const,
          lastUpdated: '2 hours ago'
        },
        {
          id: '2',
          name: 'Germain Toyota',
          aiVisibility: 65,
          reviews: 198,
          seoScore: 71,
          trend: 'neutral' as const,
          lastUpdated: '4 hours ago'
        },
        {
          id: '3',
          name: 'Mazda of Naples',
          aiVisibility: 58,
          reviews: 156,
          seoScore: 64,
          trend: 'down' as const,
          lastUpdated: '1 hour ago'
        },
        {
          id: '4',
          name: 'Ford of Naples',
          aiVisibility: 72,
          reviews: 287,
          seoScore: 76,
          trend: 'up' as const,
          lastUpdated: '3 hours ago'
        }
      ]
    }),

  // Get market positioning
  getMarketPositioning: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock market positioning data
      return {
        marketShare: 12.5,
        position: 3,
        totalCompetitors: 8,
        avgMarketScore: 68,
        yourScore: 72,
        topPerformer: {
          name: 'Naples Honda',
          score: 78
        }
      }
    }),

  // Get competitor alerts
  getCompetitorAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      // Mock competitor alerts
      return [
        {
          id: '1',
          type: 'score_change',
          competitor: 'Naples Honda',
          message: 'AI visibility score increased by 5 points',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          severity: 'medium' as const
        },
        {
          id: '2',
          type: 'new_review',
          competitor: 'Germain Toyota',
          message: 'Received 3 new 5-star reviews',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          severity: 'low' as const
        },
        {
          id: '3',
          type: 'price_change',
          competitor: 'Mazda of Naples',
          message: 'Adjusted pricing strategy',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          severity: 'high' as const
        }
      ]
    }),

  // Add competitor
  addCompetitor: protectedProcedure
    .input(z.object({
      name: z.string(),
      website: z.string().url(),
      location: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // This would typically add to a competitors table
      // For now, return mock success
      return {
        id: Date.now().toString(),
        ...input,
        aiVisibility: Math.floor(Math.random() * 40) + 40,
        reviews: Math.floor(Math.random() * 200) + 50,
        seoScore: Math.floor(Math.random() * 30) + 60,
        trend: 'neutral' as const
      }
    }),

  // Remove competitor
  removeCompetitor: protectedProcedure
    .input(z.object({
      competitorId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // This would typically remove from competitors table
      return { success: true }
    })
})
