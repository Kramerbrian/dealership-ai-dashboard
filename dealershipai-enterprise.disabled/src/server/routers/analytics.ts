import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc'
import { UserRole } from '@prisma/client'

export const analyticsRouter = createTRPCRouter({
  // Get AI visibility scores
  getAIVisibilityScores: protectedProcedure
    .query(async ({ ctx }) => {
      const user = ctx.user

      if (user.role === UserRole.SUPERADMIN) {
        return await ctx.db.dealershipData.findMany({
          select: {
            aiVisibilityScore: true,
            lastUpdatedAt: true,
            tenant: {
              select: {
                name: true,
                type: true
              }
            }
          },
          orderBy: { aiVisibilityScore: 'desc' }
        })
      }

      if (user.role === UserRole.ENTERPRISE_ADMIN) {
        return await ctx.db.dealershipData.findMany({
          where: {
            tenant: {
              OR: [
                { id: user.tenantId },
                { parentId: user.tenantId }
              ]
            }
          },
          select: {
            aiVisibilityScore: true,
            lastUpdatedAt: true,
            tenant: {
              select: {
                name: true,
                type: true
              }
            }
          },
          orderBy: { aiVisibilityScore: 'desc' }
        })
      }

      return await ctx.db.dealershipData.findMany({
        where: { tenantId: user.tenantId },
        select: {
          aiVisibilityScore: true,
          lastUpdatedAt: true,
          tenant: {
            select: {
              name: true,
              type: true
            }
          }
        },
        orderBy: { aiVisibilityScore: 'desc' }
      })
    }),

  // Get competitor analysis
  getCompetitorAnalysis: protectedProcedure
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
          trend: 'up' as const
        },
        {
          id: '2',
          name: 'Germain Toyota',
          aiVisibility: 65,
          reviews: 198,
          seoScore: 71,
          trend: 'neutral' as const
        },
        {
          id: '3',
          name: 'Mazda of Naples',
          aiVisibility: 58,
          reviews: 156,
          seoScore: 64,
          trend: 'down' as const
        }
      ]
    }),

  // Get review sentiment analysis
  getReviewSentiment: protectedProcedure
    .input(z.object({
      timeframe: z.enum(['7d', '30d', '90d']).default('30d')
    }))
    .query(async ({ ctx, input }) => {
      // This would typically analyze review data
      // For now, return mock sentiment data
      const days = input.timeframe === '7d' ? 7 : input.timeframe === '30d' ? 30 : 90
      const data = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toISOString().split('T')[0],
          positive: Math.floor(Math.random() * 20) + 60,
          neutral: Math.floor(Math.random() * 15) + 20,
          negative: Math.floor(Math.random() * 10) + 5
        })
      }

      return data
    }),

  // Get performance trends
  getPerformanceTrends: protectedProcedure
    .input(z.object({
      metric: z.enum(['ai_visibility', 'seo_score', 'review_rating']),
      timeframe: z.enum(['7d', '30d', '90d']).default('30d')
    }))
    .query(async ({ ctx, input }) => {
      const days = input.timeframe === '7d' ? 7 : input.timeframe === '30d' ? 30 : 90
      const data = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        let value = 0
        switch (input.metric) {
          case 'ai_visibility':
            value = Math.floor(Math.random() * 20) + 60
            break
          case 'seo_score':
            value = Math.floor(Math.random() * 15) + 75
            break
          case 'review_rating':
            value = Math.random() * 2 + 3.5
            break
        }

        data.push({
          date: date.toISOString().split('T')[0],
          value
        })
      }

      return data
    })
})
