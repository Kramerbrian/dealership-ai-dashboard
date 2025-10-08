import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc-server';
import { getDealershipScores } from '@/lib/scoring-engine';
import { TRPCError } from '@trpc/server';

/**
 * Competitor analysis router
 */
export const competitorRouter = createTRPCRouter({
  /**
   * Add competitor to track
   */
  add: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        competitorName: z.string().min(1),
        competitorWebsite: z.string().url(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dealershipId, competitorName, competitorWebsite, location } = input;

      // Extract domain
      const domain = competitorWebsite.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

      // Run initial scoring
      console.log(`🔍 Analyzing competitor: ${competitorName} (${domain})`);
      const scores = await getDealershipScores(domain);

      // Store competitor
      const { data: competitor, error } = await ctx.db
        .from('competitors')
        .insert({
          dealership_id: dealershipId,
          name: competitorName,
          website: competitorWebsite,
          domain,
          location,
          last_score: scores.overall,
          ai_visibility_score: scores.ai_visibility,
          zero_click_score: scores.zero_click,
          ugc_health_score: scores.ugc_health,
          geo_trust_score: scores.geo_trust,
          sgp_integrity_score: scores.sgp_integrity,
          last_analyzed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to store competitor:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add competitor',
        });
      }

      return competitor;
    }),

  /**
   * List competitors for a dealership
   */
  list: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: competitors, error } = await ctx.db
        .from('competitors')
        .select('*')
        .eq('dealership_id', input.dealershipId)
        .order('last_score', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch competitors',
        });
      }

      return competitors || [];
    }),

  /**
   * Refresh competitor scores
   */
  refresh: protectedProcedure
    .input(z.object({ competitorId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Get competitor
      const { data: competitor, error: fetchError } = await ctx.db
        .from('competitors')
        .select('*')
        .eq('id', input.competitorId)
        .single();

      if (fetchError || !competitor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Competitor not found',
        });
      }

      // Run scoring
      console.log(`🔄 Refreshing scores for ${competitor.name}`);
      const scores = await getDealershipScores(competitor.domain);

      // Update competitor
      const { data: updated, error: updateError } = await ctx.db
        .from('competitors')
        .update({
          last_score: scores.overall,
          ai_visibility_score: scores.ai_visibility,
          zero_click_score: scores.zero_click,
          ugc_health_score: scores.ugc_health,
          geo_trust_score: scores.geo_trust,
          sgp_integrity_score: scores.sgp_integrity,
          last_analyzed: new Date().toISOString(),
        })
        .eq('id', input.competitorId)
        .select()
        .single();

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update competitor scores',
        });
      }

      return updated;
    }),

  /**
   * Get competitor comparison matrix
   */
  getMatrix: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get dealership scores
      const { data: dealership, error: dealershipError } = await ctx.db
        .from('dealership_data')
        .select('name, website, last_ai_score, last_zero_click_score, last_ugc_health_score, last_geo_trust_score, last_sgp_integrity_score')
        .eq('id', input.dealershipId)
        .single();

      if (dealershipError || !dealership) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Dealership not found',
        });
      }

      // Get competitors
      const { data: competitors, error: competitorsError } = await ctx.db
        .from('competitors')
        .select('*')
        .eq('dealership_id', input.dealershipId)
        .order('last_score', { ascending: false });

      if (competitorsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch competitors',
        });
      }

      // Build matrix
      const matrix = [
        {
          name: dealership.name,
          website: dealership.website,
          type: 'yours',
          overall: dealership.last_ai_score || 0,
          ai_visibility: dealership.last_ai_score || 0,
          zero_click: dealership.last_zero_click_score || 0,
          ugc_health: dealership.last_ugc_health_score || 0,
          geo_trust: dealership.last_geo_trust_score || 0,
          sgp_integrity: dealership.last_sgp_integrity_score || 0,
        },
        ...(competitors || []).map(c => ({
          id: c.id,
          name: c.name,
          website: c.website,
          type: 'competitor' as const,
          overall: c.last_score || 0,
          ai_visibility: c.ai_visibility_score || 0,
          zero_click: c.zero_click_score || 0,
          ugc_health: c.ugc_health_score || 0,
          geo_trust: c.geo_trust_score || 0,
          sgp_integrity: c.sgp_integrity_score || 0,
          last_analyzed: c.last_analyzed,
        })),
      ];

      return {
        matrix,
        yourRank: 1 + (competitors || []).filter(c => (c.last_score || 0) > (dealership.last_ai_score || 0)).length,
        totalCompetitors: (competitors || []).length,
      };
    }),

  /**
   * Remove competitor
   */
  remove: protectedProcedure
    .input(z.object({ competitorId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from('competitors')
        .delete()
        .eq('id', input.competitorId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove competitor',
        });
      }

      return { success: true };
    }),
});
