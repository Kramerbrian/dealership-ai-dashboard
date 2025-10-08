import { initTRPC, TRPCError } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { getCurrentUser, requirePermission } from './auth'
import { db } from './db'

type CreateContextOptions = {
  user: any
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    db,
  }
}

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  // For demo purposes, always return a mock user
  try {
    const user = await getCurrentUser()
    return createInnerTRPCContext({
      user,
    })
  } catch (error) {
    console.error('tRPC context creation failed:', error)
    // Return a fallback context
    return createInnerTRPCContext({
      user: {
        id: 'fallback-user',
        email: 'demo@dealershipai.com',
        role: 'user',
        tenantId: 'fallback-tenant'
      }
    })
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const requirePermissionProcedure = (permission: string) =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const hasPermission = await requirePermission(ctx.user, permission)
    
    if (!hasPermission) {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }

    return next({
      ctx,
    })
  })
