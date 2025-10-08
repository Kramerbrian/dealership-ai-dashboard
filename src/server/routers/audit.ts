import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc-server';
import { getDealershipScores, getDetailedDealershipScores } from '@/lib/scoring-engine';
import { TRPCError } from '@trpc/server';

/**
 * Audit router - handles AI visibility audits
 */
export const auditRouter = createTRPCRouter({
  /**
   * Generate a new audit for a dealership
   */
  generate: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        website: z.string().url(),
        detailed: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dealershipId, website, detailed } = input;

      try {
        // Extract domain from URL
        const domain = website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

        // Run scoring engine
        console.log(`🔍 Running audit for ${domain}...`);
        const scores = detailed
          ? await getDetailedDealershipScores(domain)
          : await getDealershipScores(domain);

        // Store audit in database
        const { data: audit, error: auditError } = await ctx.db
          .from('audits')
          .insert({
            tenant_id: ctx.tenant.id,
            dealership_id: dealershipId,
            overall_score: scores.overall,
            ai_visibility_score: scores.ai_visibility,
            zero_click_score: scores.zero_click,
            ugc_health_score: scores.ugc_health,
            geo_trust_score: scores.geo_trust,
            sgp_integrity_score: scores.sgp_integrity,
            detailed_results: detailed ? (scores as any).details : null,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (auditError) {
          console.error('Failed to store audit:', auditError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to store audit results',
          });
        }

        // Store in score_history
        await ctx.db.from('score_history').insert({
          dealership_id: dealershipId,
          overall_score: scores.overall,
          ai_visibility_score: scores.ai_visibility,
          zero_click_score: scores.zero_click,
          ugc_health_score: scores.ugc_health,
          geo_trust_score: scores.geo_trust,
          sgp_integrity_score: scores.sgp_integrity,
          recorded_at: new Date().toISOString(),
        });

        // Log API usage for cost tracking
        await ctx.db.from('api_usage').insert({
          tenant_id: ctx.tenant.id,
          user_id: ctx.user.id,
          service_name: detailed ? 'audit_detailed' : 'audit_basic',
          cost: detailed ? 0.05 : 0.02, // Estimated cost
          metadata: { domain, dealershipId },
          created_at: new Date().toISOString(),
        });

        return {
          success: true,
          audit: {
            id: audit.id,
            scores: {
              overall: scores.overall,
              ai_visibility: scores.ai_visibility,
              zero_click: scores.zero_click,
              ugc_health: scores.ugc_health,
              geo_trust: scores.geo_trust,
              sgp_integrity: scores.sgp_integrity,
            },
            details: detailed ? (scores as any).details : null,
            timestamp: scores.timestamp,
          },
        };
      } catch (error) {
        console.error('Audit generation failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Audit generation failed',
        });
      }
    }),

  /**
   * Get audit by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data: audit, error } = await ctx.db
        .from('audits')
        .select('*')
        .eq('id', input.id)
        .eq('tenant_id', ctx.tenant.id)
        .single();

      if (error || !audit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Audit not found',
        });
      }

      return audit;
    }),

  /**
   * List audits for a dealership
   */
  list: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: audits, error, count } = await ctx.db
        .from('audits')
        .select('*', { count: 'exact' })
        .eq('tenant_id', ctx.tenant.id)
        .eq('dealership_id', input.dealershipId)
        .order('created_at', { ascending: false })
        .range(input.offset, input.offset + input.limit - 1);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch audits',
        });
      }

      return {
        audits: audits || [],
        total: count || 0,
        hasMore: (count || 0) > input.offset + input.limit,
      };
    }),

  /**
   * Get score history for a dealership
   */
  getScoreHistory: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: history, error } = await ctx.db
        .from('score_history')
        .select('*')
        .eq('dealership_id', input.dealershipId)
        .order('recorded_at', { ascending: false })
        .limit(input.limit);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch score history',
        });
      }

      return history || [];
    }),
});
