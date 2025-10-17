import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc-server';
import { TRPCError } from '@trpc/server';

/**
 * Dealership router - handles dealership-related queries and mutations
 */
export const dealershipRouter = createTRPCRouter({
  /**
   * Get dashboard overview with scores and analytics
   */
  getDashboard: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        accessibleTenants: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = input.tenantId || ctx.tenant.id;

      // Get all dealerships for this tenant
      const { data: dealerships, error } = await ctx.db
        .from('dealership_data')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('last_ai_score', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dealerships',
        });
      }

      const dealershipList = dealerships || [];

      // Calculate analytics
      const totalDealerships = dealershipList.length;
      const averageScore =
        totalDealerships > 0
          ? Math.round(
              dealershipList.reduce((sum, d) => sum + (d.last_ai_score || 0), 0) /
                totalDealerships
            )
          : 0;

      const topPerformers = dealershipList.slice(0, 5);

      // Get recent analyses (audits)
      const { data: recentAnalyses } = await ctx.db
        .from('audits')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        dealerships: dealershipList,
        analytics: {
          totalDealerships,
          averageScore,
          topPerformers,
          recentAnalyses: recentAnalyses || [],
        },
        overallScore: averageScore,
        aiVisibilityScore: Math.round(
          dealershipList.reduce((sum, d) => sum + (d.last_ai_score || 0), 0) /
            (totalDealerships || 1)
        ),
        zeroClickScore: Math.round(
          dealershipList.reduce((sum, d) => sum + (d.last_zero_click_score || 0), 0) /
            (totalDealerships || 1)
        ),
        ugcHealthScore: Math.round(
          dealershipList.reduce((sum, d) => sum + (d.last_ugc_health_score || 0), 0) /
            (totalDealerships || 1)
        ),
        geoTrustScore: Math.round(
          dealershipList.reduce((sum, d) => sum + (d.last_geo_trust_score || 0), 0) /
            (totalDealerships || 1)
        ),
        sgpIntegrityScore: Math.round(
          dealershipList.reduce((sum, d) => sum + (d.last_sgp_integrity_score || 0), 0) /
            (totalDealerships || 1)
        ),
      };
    }),

  /**
   * Get dealership by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: dealership, error } = await ctx.db
        .from('dealership_data')
        .select('*')
        .eq('id', input.id)
        .eq('tenant_id', ctx.tenant.id)
        .single();

      if (error || !dealership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dealership not found',
        });
      }

      return {
        id: dealership.id,
        name: dealership.name,
        domain: dealership.domain,
        website: dealership.website,
        location: dealership.location,
        phone: dealership.phone,
        email: dealership.email,
        scores: {
          overall: dealership.last_ai_score || 0,
          ai_visibility: dealership.last_ai_score || 0,
          zero_click: dealership.last_zero_click_score || 0,
          ugc_health: dealership.last_ugc_health_score || 0,
          geo_trust: dealership.last_geo_trust_score || 0,
          sgp_integrity: dealership.last_sgp_integrity_score || 0,
        },
        lastAnalyzed: dealership.last_analyzed,
        createdAt: dealership.created_at,
      };
    }),

  /**
   * List all dealerships for tenant
   */
  list: protectedProcedure
    .input(
      z.object({
        tenantId: z.string().optional(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const tenantId = input.tenantId || ctx.tenant.id;

      const { data: dealerships, error, count } = await ctx.db
        .from('dealership_data')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('last_ai_score', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dealerships',
        });
      }

      return {
        dealerships: dealerships || [],
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      };
    }),

  /**
   * Create new dealership
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        website: z.string().url(),
        domain: z.string().min(1),
        location: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: dealership, error } = await ctx.db
        .from('dealership_data')
        .insert({
          tenant_id: ctx.tenant.id,
          name: input.name,
          website: input.website,
          domain: input.domain,
          location: input.location,
          phone: input.phone,
          email: input.email,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create dealership:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create dealership',
        });
      }

      return dealership;
    }),

  /**
   * Update dealership
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        website: z.string().url().optional(),
        location: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const { data: dealership, error } = await ctx.db
        .from('dealership_data')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', ctx.tenant.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update dealership',
        });
      }

      return dealership;
    }),

  /**
   * Delete dealership
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from('dealership_data')
        .delete()
        .eq('id', input.id)
        .eq('tenant_id', ctx.tenant.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete dealership',
        });
      }

      return { success: true };
    }),
});
