/**
 * tRPC Server Configuration for DealershipAI
 * Handles server-side tRPC setup and context creation
 */

import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getCurrentUser } from '../auth';

/**
 * Context creation for tRPC
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;
  
  // Get user from authentication
  const user = await getCurrentUser();
  
  return {
    req,
    res,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

/**
 * Base router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Admin procedure that requires admin role
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  if (!['superadmin', 'enterprise_admin'].includes(ctx.user.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Mock API for compatibility
export const api = {
  dealership: {
    getDashboard: {
      query: async (params: any) => {
        // Mock dashboard data
        return {
          ai_visibility: 75,
          seo_score: 68,
          local_score: 82,
          overall_score: 75,
          recommendations: [],
          metrics: {
            total_dealerships: 1,
            active_dealerships: 1,
            avg_score: 75,
          }
        };
      }
    },
    getReviewsHealth: {
      query: async (params: any) => {
        // Mock reviews data
        return {
          total_reviews: 150,
          average_rating: 4.2,
          recent_reviews: 25,
          response_rate: 85,
          health_score: 78,
        };
      }
    },
    getWebsiteHealth: {
      query: async (params: any) => {
        // Mock website data - return as any to avoid type issues
        return {
          page_speed: 85,
          mobile_friendly: 92,
          seo_score: 68,
          technical_issues: 3,
          health_score: 82,
          schemaCompleteness: 85,
          issuesFound: [],
          performanceMetrics: {},
          faqCount: 12,
          howToCount: 8,
          structuredDataCount: 25,
        } as any;
      }
    }
  },
  enterprise: {
    getGroupOverview: {
      query: async (params: any) => {
        return {
          total_dealerships: 15,
          active_dealerships: 14,
          average_score: 78,
          dealerships: [],
        } as any;
      }
    }
  },
  superadmin: {
    getTenants: {
      query: async (params: any) => {
        return {
          total: 5,
          tenants: [],
        } as any;
      }
    }
  }
};
