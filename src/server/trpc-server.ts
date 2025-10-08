import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Create context for tRPC requests
 * This runs for every request and provides context to all procedures
 */
export const createTRPCContext = async () => {
  const { userId, orgId } = await auth();

  // Get user from database if authenticated
  let user = null;
  let tenant = null;

  if (userId) {
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*, tenants(*)')
      .eq('clerk_id', userId)
      .single();

    if (userData) {
      user = userData;
      tenant = userData.tenants;
    }
  }

  return {
    userId,
    orgId,
    user,
    tenant,
    db: supabaseAdmin,
  };
};

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      user: ctx.user,
      tenant: ctx.tenant,
      db: ctx.db,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!['superadmin', 'enterprise_admin', 'dealership_admin'].includes(ctx.user.role)) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({ ctx });
});
