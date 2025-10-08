import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, requirePermissionProcedure } from '@/lib/trpc'
import { createCheckoutSession, plans, getBillingHistory, cancelSubscription } from '@/lib/stripe'

export const billingRouter = createTRPCRouter({
  // Get subscription details
  getSubscription: protectedProcedure
    .use(requirePermissionProcedure('view:billing'))
    .query(async ({ ctx }) => {
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: ctx.user.tenantId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          mrr: true,
          settings: true
        }
      })

      return {
        ...tenant,
        plan: plans[tenant?.subscriptionTier as keyof typeof plans]
      }
    }),

  // Create checkout session for upgrade
  createCheckoutSession: protectedProcedure
    .use(requirePermissionProcedure('manage:billing'))
    .input(z.object({
      plan: z.enum(['tier_1', 'tier_2', 'tier_3', 'enterprise'])
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await createCheckoutSession(ctx.user.tenantId, input.plan)
      return { url: session.url }
    }),

  // Get usage statistics
  getUsage: protectedProcedure
    .use(requirePermissionProcedure('view:billing'))
    .input(z.object({
      timeframe: z.enum(['current', 'last_month', 'last_quarter']).default('current')
    }))
    .query(async ({ ctx, input }) => {
      const startDate = getTimeframeStartDate(input.timeframe)

      return {
        aiQueries: await ctx.db.aiQueryResult.count({
          where: {
            tenantId: ctx.user.tenantId,
            executedAt: { gte: startDate }
          }
        }),
        analysesRun: await ctx.db.dealershipData.count({
          where: {
            tenantId: ctx.user.tenantId,
            lastUpdatedAt: { gte: startDate }
          }
        }),
        reportsGenerated: await ctx.db.auditLog.count({
          where: {
            tenantId: ctx.user.tenantId,
            action: 'export.generated',
            createdAt: { gte: startDate }
          }
        })
      }
    }),

  // Get billing history
  getBillingHistory: protectedProcedure
    .use(requirePermissionProcedure('view:billing'))
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0)
    }))
    .query(async ({ ctx, input }) => {
      return await getBillingHistory(ctx.user.tenantId, input)
    }),

  // Get available plans
  getPlans: protectedProcedure
    .query(async () => {
      return Object.entries(plans).map(([key, plan]) => ({
        id: key,
        ...plan
      }))
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .use(requirePermissionProcedure('manage:billing'))
    .input(z.object({
      reason: z.string().optional(),
      feedback: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Cancel in Stripe
      await cancelSubscription(ctx.user.tenantId)

      // Update database
      return await ctx.db.tenant.update({
        where: { id: ctx.user.tenantId },
        data: {
          subscriptionStatus: 'cancelled',
          settings: {
            cancellationReason: input.reason,
            cancellationFeedback: input.feedback,
            cancelledAt: new Date().toISOString()
          }
        }
      })
    })
})

function getTimeframeStartDate(timeframe: string): Date {
  const now = new Date()
  
  switch (timeframe) {
    case 'current':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'last_month':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1)
    case 'last_quarter':
      return new Date(now.getFullYear(), now.getMonth() - 3, 1)
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1)
  }
}
