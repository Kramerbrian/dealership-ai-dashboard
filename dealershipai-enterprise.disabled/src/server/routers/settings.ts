import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, requirePermissionProcedure } from '@/lib/trpc'
import { UserRole } from '@prisma/client'

export const settingsRouter = createTRPCRouter({
  // Get user profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
        include: {
          tenant: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          type: user.tenant.type
        },
        lastSeenAt: user.lastSeenAt,
        createdAt: user.createdAt
      }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().min(1).max(100).optional(),
      email: z.string().email().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          ...input,
          updatedAt: new Date()
        }
      })

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          action: 'user.profile_updated',
          resourceType: 'user',
          resourceId: ctx.user.id,
          changes: input
        }
      })

      return updatedUser
    }),

  // Get tenant settings
  getTenantSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const tenant = await ctx.db.tenant.findUnique({
        where: { id: ctx.user.tenantId },
        include: {
          _count: {
            select: {
              users: true,
              dealershipData: true
            }
          }
        }
      })

      if (!tenant) {
        throw new Error('Tenant not found')
      }

      return {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
        settings: tenant.settings,
        subscriptionTier: tenant.subscriptionTier,
        subscriptionStatus: tenant.subscriptionStatus,
        mrr: tenant.mrr,
        rooftopCount: tenant.rooftopCount,
        userCount: tenant._count.users,
        dealershipCount: tenant._count.dealershipData,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt
      }
    }),

  // Update tenant settings
  updateTenantSettings: protectedProcedure
    .use(requirePermissionProcedure('update:settings'))
    .input(z.object({
      name: z.string().min(1).max(100).optional(),
      settings: z.record(z.string(), z.unknown()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedTenant = await ctx.db.tenant.update({
        where: { id: ctx.user.tenantId },
        data: {
          ...input,
          updatedAt: new Date()
        }
      })

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          action: 'tenant.settings_updated',
          resourceType: 'tenant',
          resourceId: ctx.user.tenantId,
          changes: input
        }
      })

      return updatedTenant
    }),

  // Get team members
  getTeamMembers: protectedProcedure
    .query(async ({ ctx }) => {
      const users = await ctx.db.user.findMany({
        where: { tenantId: ctx.user.tenantId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          permissions: true,
          lastSeenAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

      return users
    }),

  // Invite team member
  inviteTeamMember: protectedProcedure
    .use(requirePermissionProcedure('manage:team'))
    .input(z.object({
      email: z.string().email(),
      role: z.enum(['dealership_admin', 'user']),
      permissions: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // In production, this would integrate with Clerk to send an invitation
      // For now, we'll create a pending invitation record
      
      const invitation = {
        id: `invite_${Date.now()}`,
        email: input.email,
        role: input.role,
        permissions: input.permissions || [],
        tenantId: ctx.user.tenantId,
        invitedBy: ctx.user.id,
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date()
      }

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          action: 'user.invited',
          resourceType: 'user',
          changes: {
            email: input.email,
            role: input.role,
            permissions: input.permissions
          }
        }
      })

      return invitation
    }),

  // Update team member role
  updateTeamMemberRole: protectedProcedure
    .use(requirePermissionProcedure('manage:team'))
    .input(z.object({
      userId: z.string(),
      role: z.enum(['dealership_admin', 'user']),
      permissions: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user belongs to the same tenant
      const targetUser = await ctx.db.user.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.user.tenantId
        }
      })

      if (!targetUser) {
        throw new Error('User not found or access denied')
      }

      // Prevent users from changing their own role
      if (input.userId === ctx.user.id) {
        throw new Error('Cannot modify your own role')
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          role: input.role,
          permissions: input.permissions,
          updatedAt: new Date()
        }
      })

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          action: 'user.role_updated',
          resourceType: 'user',
          resourceId: input.userId,
          changes: {
            oldRole: targetUser.role,
            newRole: input.role,
            permissions: input.permissions
          }
        }
      })

      return updatedUser
    }),

  // Remove team member
  removeTeamMember: protectedProcedure
    .use(requirePermissionProcedure('manage:team'))
    .input(z.object({
      userId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify the user belongs to the same tenant
      const targetUser = await ctx.db.user.findFirst({
        where: {
          id: input.userId,
          tenantId: ctx.user.tenantId
        }
      })

      if (!targetUser) {
        throw new Error('User not found or access denied')
      }

      // Prevent users from removing themselves
      if (input.userId === ctx.user.id) {
        throw new Error('Cannot remove yourself')
      }

      await ctx.db.user.delete({
        where: { id: input.userId }
      })

      // Log the action
      await ctx.db.auditLog.create({
        data: {
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          action: 'user.removed',
          resourceType: 'user',
          resourceId: input.userId,
          changes: {
            removedUser: targetUser.email
          }
        }
      })

      return { success: true }
    }),

  // Get audit log
  getAuditLog: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      action: z.string().optional(),
      resourceType: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        tenantId: ctx.user.tenantId
      }

      if (input.action) {
        where.action = { contains: input.action }
      }

      if (input.resourceType) {
        where.resourceType = input.resourceType
      }

      const [logs, total] = await Promise.all([
        ctx.db.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset
        }),
        ctx.db.auditLog.count({ where })
      ])

      return {
        logs,
        total,
        hasMore: input.offset + input.limit < total
      }
    }),

  // Get notification settings
  getNotificationSettings: protectedProcedure
    .query(async ({ ctx }) => {
      const settings = await ctx.db.notificationSetting.findMany({
        where: { userId: ctx.user.id }
      })

      return settings
    }),

  // Update notification settings
  updateNotificationSettings: protectedProcedure
    .input(z.object({
      type: z.string(),
      enabled: z.boolean(),
      channels: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const setting = await ctx.db.notificationSetting.upsert({
        where: {
          userId_type: {
            userId: ctx.user.id,
            type: input.type
          }
        },
        update: {
          enabled: input.enabled,
          channels: input.channels,
          updatedAt: new Date()
        },
        create: {
          userId: ctx.user.id,
          type: input.type,
          enabled: input.enabled,
          channels: input.channels || ['email']
        }
      })

      return setting
    })
})
