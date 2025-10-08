import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc'
import { UserRole } from '@prisma/client'

export const adminRouter = createTRPCRouter({
  // List all tenants (superadmin only)
  listTenants: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== UserRole.SUPERADMIN) {
        throw new Error('Forbidden')
      }

      return await ctx.db.tenant.findMany({
        include: {
          _count: {
            select: {
              users: true,
              dealershipData: true
            }
          },
          dealershipData: {
            select: {
              aiVisibilityScore: true,
              lastUpdatedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }),

  // System-wide analytics
  getSystemMetrics: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== UserRole.SUPERADMIN) {
        throw new Error('Forbidden')
      }

      return {
        totalTenants: await ctx.db.tenant.count(),
        activeUsers: await ctx.db.user.count({
          where: {
            lastSeenAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        totalMrr: await ctx.db.tenant.aggregate({
          _sum: { mrr: true }
        }),
        avgVisibilityScore: await ctx.db.dealershipData.aggregate({
          _avg: { aiVisibilityScore: true }
        })
      }
    }),

  // Provision enterprise group
  createEnterpriseGroup: protectedProcedure
    .input(z.object({
      name: z.string(),
      rooftopCount: z.number().max(350),
      adminEmail: z.string().email()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== UserRole.SUPERADMIN) {
        throw new Error('Forbidden')
      }

      // Create enterprise tenant
      const enterprise = await ctx.db.tenant.create({
        data: {
          name: input.name,
          type: 'ENTERPRISE',
          rooftopCount: input.rooftopCount,
          subscriptionTier: 'enterprise'
        }
      })

      // Create Clerk organization (this would be done via Clerk API)
      // const clerkOrg = await clerkClient.organizations.createOrganization({
      //   name: input.name
      // })

      // Link Clerk org to tenant
      // await ctx.db.tenant.update({
      //   where: { id: enterprise.id },
      //   data: { clerkOrgId: clerkOrg.id }
      // })

      // Invite enterprise admin
      // await clerkClient.organizations.createOrganizationInvitation({
      //   organizationId: clerkOrg.id,
      //   emailAddress: input.adminEmail,
      //   role: 'admin'
      // })

      return enterprise
    }),

  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      tenantId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== UserRole.SUPERADMIN && ctx.user.role !== UserRole.ENTERPRISE_ADMIN) {
        throw new Error('Forbidden')
      }

      const where = input.tenantId ? { tenantId: input.tenantId } : {}

      return await ctx.db.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          },
          tenant: {
            select: {
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset
      })
    })
})
