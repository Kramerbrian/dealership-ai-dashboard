import { z } from 'zod';
import { router, protectedProcedure, adminProcedure, enterpriseProcedure, superAdminProcedure } from '../../trpc';
import { ScoringEngine } from '@/core/scoring-engine';

export const dealershipRouter = router({
  // Get dealership data for current user's tenant
  getDealershipData: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('dealership_data')
      .select('*')
      .eq('tenant_id', ctx.user.tenant.id)
      .single();

    if (error) {
      throw new Error('Failed to fetch dealership data');
    }

    return data;
  }),

  // Get scoring data
  getScores: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('dealership_data')
      .select('*')
      .eq('tenant_id', ctx.user.tenant.id)
      .single();

    if (error) {
      throw new Error('Failed to fetch scores');
    }

    return {
      seo: {
        score: data.seo_score,
        components: data.seo_components,
        confidence: data.seo_confidence
      },
      aeo: {
        score: data.aeo_score,
        components: data.aeo_components,
        mentions: data.aeo_mentions,
        queries: data.aeo_queries,
        mention_rate: data.aeo_mention_rate
      },
      geo: {
        score: data.geo_score,
        components: data.geo_components,
        sge_appearance_rate: data.sge_appearance_rate
      },
      eeat: {
        experience: data.eeat_experience,
        expertise: data.eeat_expertise,
        authoritativeness: data.eeat_authoritativeness,
        trustworthiness: data.eeat_trustworthiness,
        overall: data.eeat_overall,
        confidence: data.eeat_confidence
      },
      overall: data.overall_score,
      last_updated: data.last_analyzed
    };
  }),

  // Calculate fresh scores
  calculateScores: adminProcedure.mutation(async ({ ctx }) => {
    const scoringEngine = new ScoringEngine();
    
    const dealer = {
      id: ctx.user.tenant.id,
      name: ctx.user.tenant.name,
      domain: ctx.user.tenant.domain || '',
      city: ctx.user.tenant.city || '',
      state: ctx.user.tenant.state || '',
      established_date: new Date('2020-01-01'), // Default date
      tier: (ctx.user.tenant.tier || 3) as 1 | 2 | 3
    };

    const scores = await scoringEngine.calculateScores(dealer);
    
    // Save scores to database
    const { error } = await ctx.supabase
      .from('dealership_data')
      .upsert({
        tenant_id: ctx.user.tenant.id,
        domain: dealer.domain,
        business_name: dealer.name,
        seo_score: scores.seo.score,
        aeo_score: scores.aeo.score,
        geo_score: scores.geo.score,
        overall_score: scores.overall,
        seo_components: scores.seo.components,
        seo_confidence: scores.seo.confidence,
        aeo_components: scores.aeo.components,
        aeo_mentions: scores.aeo.mentions,
        aeo_queries: scores.aeo.queries,
        aeo_mention_rate: scores.aeo.mention_rate,
        geo_components: scores.geo.components,
        sge_appearance_rate: scores.geo.sge_appearance_rate,
        eeat_experience: scores.eeat.experience,
        eeat_expertise: scores.eeat.expertise,
        eeat_authoritativeness: scores.eeat.authoritativeness,
        eeat_trustworthiness: scores.eeat.trustworthiness,
        eeat_overall: scores.eeat.overall,
        eeat_confidence: scores.eeat.confidence,
        raw_data: scores,
        last_analyzed: new Date().toISOString(),
        analysis_version: '1.0.0'
      });

    if (error) {
      throw new Error('Failed to save scores');
    }

    return scores;
  }),

  // Get score history
  getScoreHistory: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(365).default(30)
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('score_history')
        .select('*')
        .eq('tenant_id', ctx.user.tenant.id)
        .gte('recorded_at', new Date(Date.now() - input.days * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: true });

      if (error) {
        throw new Error('Failed to fetch score history');
      }

      return data;
    }),

  // Update dealership settings
  updateSettings: adminProcedure
    .input(z.object({
      domain: z.string().url().optional(),
      business_name: z.string().min(1).optional(),
      city: z.string().optional(),
      state: z.string().length(2).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update tenant
      const { error: tenantError } = await ctx.supabase
        .from('tenants')
        .update({
          domain: input.domain,
          name: input.business_name,
          city: input.city,
          state: input.state,
        })
        .eq('id', ctx.user.tenant.id);

      if (tenantError) {
        throw new Error('Failed to update tenant');
      }

      // Update dealership data
      const { error: dataError } = await ctx.supabase
        .from('dealership_data')
        .update({
          domain: input.domain,
          business_name: input.business_name,
        })
        .eq('tenant_id', ctx.user.tenant.id);

      if (dataError) {
        throw new Error('Failed to update dealership data');
      }

      return { success: true };
    }),
});
