import { z } from 'zod';
import { router, protectedProcedure, adminProcedure, enterpriseProcedure, superAdminProcedure } from '../../trpc';

export const analyticsRouter = router({
  // Get dashboard metrics
  getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    const { data: dealershipData, error } = await ctx.supabase
      .from('dealership_data')
      .select('*')
      .eq('tenant_id', ctx.user.tenant.id)
      .single();

    if (error) {
      throw new Error('Failed to fetch dashboard metrics');
    }

    // Get score history for trends
    const { data: history } = await ctx.supabase
      .from('score_history')
      .select('overall_score, recorded_at')
      .eq('tenant_id', ctx.user.tenant.id)
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: true });

    const currentScore = dealershipData.overall_score || 0;
    const previousScore = history && history.length > 1 ? history[history.length - 2].overall_score : currentScore;
    const trend = currentScore - previousScore;

    return {
      overallScore: currentScore,
      trend: trend,
      trendPercentage: previousScore > 0 ? (trend / previousScore) * 100 : 0,
      seoScore: dealershipData.seo_score || 0,
      aeoScore: dealershipData.aeo_score || 0,
      geoScore: dealershipData.geo_score || 0,
      eeatScore: dealershipData.eeat_overall || 0,
      lastAnalyzed: dealershipData.last_analyzed,
      history: history || []
    };
  }),

  // Get competitor analysis
  getCompetitors: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('competitors')
      .select('*')
      .eq('tenant_id', ctx.user.tenant.id)
      .order('overall_score', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch competitors');
    }

    return data || [];
  }),

  // Add competitor
  addCompetitor: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      domain: z.string().url().optional(),
      city: z.string().optional(),
      state: z.string().length(2).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('competitors')
        .insert({
          tenant_id: ctx.user.tenant.id,
          name: input.name,
          domain: input.domain,
          city: input.city,
          state: input.state,
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to add competitor');
      }

      return data;
    }),

  // Get market analysis
  getMarketAnalysis: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('market_analysis')
      .select('*')
      .eq('tenant_id', ctx.user.tenant.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found error
      throw new Error('Failed to fetch market analysis');
    }

    return data;
  }),

  // Get API usage
  getApiUsage: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30)
    }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('api_usage')
        .select('*')
        .eq('tenant_id', ctx.user.tenant.id)
        .gte('usage_date', new Date(Date.now() - input.days * 24 * 60 * 60 * 1000).toISOString())
        .order('usage_date', { ascending: true });

      if (error) {
        throw new Error('Failed to fetch API usage');
      }

      return data || [];
    }),

  // Get all tenants (superadmin only)
  getAllTenants: superAdminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('tenants')
      .select(`
        *,
        users(count),
        dealership_data(overall_score, last_analyzed)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch tenants');
    }

    return data || [];
  }),

  // Get system health (superadmin only)
  getSystemHealth: superAdminProcedure.query(async ({ ctx }) => {
    const [
      { count: totalTenants },
      { count: totalUsers },
      { count: totalDealerships },
      { data: recentActivity }
    ] = await Promise.all([
      ctx.supabase.from('tenants').select('*', { count: 'exact', head: true }),
      ctx.supabase.from('users').select('*', { count: 'exact', head: true }),
      ctx.supabase.from('dealership_data').select('*', { count: 'exact', head: true }),
      ctx.supabase
        .from('audit_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    return {
      totalTenants: totalTenants || 0,
      totalUsers: totalUsers || 0,
      totalDealerships: totalDealerships || 0,
      recentActivity: recentActivity || []
    };
  }),
});
