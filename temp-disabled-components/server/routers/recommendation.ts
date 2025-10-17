import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc-server';
import { TRPCError } from '@trpc/server';

/**
 * Recommendation engine router
 */
export const recommendationRouter = createTRPCRouter({
  /**
   * Generate recommendations based on latest audit
   */
  generate: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        auditId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dealershipId, auditId } = input;

      // Get latest audit if not specified
      let audit;
      if (auditId) {
        const { data } = await ctx.db
          .from('audits')
          .select('*')
          .eq('id', auditId)
          .single();
        audit = data;
      } else {
        const { data } = await ctx.db
          .from('audits')
          .select('*')
          .eq('dealership_id', dealershipId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        audit = data;
      }

      if (!audit) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No audit found for this dealership',
        });
      }

      // Generate recommendations based on scores
      const recommendations = generateRecommendations(audit);

      // Store recommendations
      const stored = await Promise.all(
        recommendations.map(async (rec) => {
          const { data, error } = await ctx.db
            .from('recommendations')
            .insert({
              dealership_id: dealershipId,
              category: rec.category,
              title: rec.title,
              description: rec.description,
              priority: rec.priority,
              impact_score: rec.impact_score,
              effort_level: rec.effort_level,
              estimated_improvement: rec.estimated_improvement,
              status: 'pending',
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) {
            console.error('Failed to store recommendation:', error);
            return null;
          }
          return data;
        })
      );

      return stored.filter(Boolean);
    }),

  /**
   * List recommendations for a dealership
   */
  list: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
        status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']).optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .from('recommendations')
        .select('*')
        .eq('dealership_id', input.dealershipId);

      if (input.status) {
        query = query.eq('status', input.status);
      }

      if (input.category) {
        query = query.eq('category', input.category);
      }

      const { data: recommendations, error } = await query.order('priority', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recommendations',
        });
      }

      return recommendations || [];
    }),

  /**
   * Update recommendation status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        recommendationId: z.string().uuid(),
        status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from('recommendations')
        .update({
          status: input.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.recommendationId)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update recommendation',
        });
      }

      return data;
    }),

  /**
   * Get priority matrix (impact vs effort)
   */
  getPriorityMatrix: protectedProcedure
    .input(
      z.object({
        dealershipId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: recommendations, error } = await ctx.db
        .from('recommendations')
        .select('*')
        .eq('dealership_id', input.dealershipId)
        .neq('status', 'dismissed')
        .neq('status', 'completed');

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recommendations',
        });
      }

      // Group by quadrant
      const matrix = {
        quickWins: [] as any[], // High impact, Low effort
        majorProjects: [] as any[], // High impact, High effort
        fillIns: [] as any[], // Low impact, Low effort
        thankless: [] as any[], // Low impact, High effort
      };

      (recommendations || []).forEach((rec) => {
        const impact = rec.impact_score || 0;
        const effort = rec.effort_level || 0;

        if (impact >= 7 && effort <= 4) {
          matrix.quickWins.push(rec);
        } else if (impact >= 7 && effort > 4) {
          matrix.majorProjects.push(rec);
        } else if (impact < 7 && effort <= 4) {
          matrix.fillIns.push(rec);
        } else {
          matrix.thankless.push(rec);
        }
      });

      return matrix;
    }),
});

/**
 * Generate recommendations based on audit scores
 */
function generateRecommendations(audit: any) {
  const recommendations = [];

  // AI Visibility recommendations
  if (audit.ai_visibility_score < 70) {
    recommendations.push({
      category: 'ai_visibility',
      title: 'Improve AI Visibility',
      description:
        'Your dealership has low visibility in AI-powered search results. Focus on building high-quality citations, improving review response rates, and creating FAQ content that answers common customer questions.',
      priority: 1,
      impact_score: 9,
      effort_level: 6,
      estimated_improvement: '+15-25 points',
    });
  }

  // SGP Integrity recommendations
  if (audit.sgp_integrity_score < 70) {
    recommendations.push({
      category: 'technical_seo',
      title: 'Implement Structured Data Markup',
      description:
        'Add LocalBusiness and AutoDealer schema markup to your website. This helps search engines and AI systems understand your business information correctly.',
      priority: 2,
      impact_score: 8,
      effort_level: 3,
      estimated_improvement: '+10-15 points',
    });
  }

  // Zero-Click recommendations
  if (audit.zero_click_score < 70) {
    recommendations.push({
      category: 'content',
      title: 'Optimize for Zero-Click Results',
      description:
        'Create content that targets featured snippets and knowledge panels. Focus on answering common questions directly and concisely.',
      priority: 3,
      impact_score: 7,
      effort_level: 4,
      estimated_improvement: '+8-12 points',
    });
  }

  // UGC Health recommendations
  if (audit.ugc_health_score < 70) {
    recommendations.push({
      category: 'reputation',
      title: 'Improve Review Management',
      description:
        'Increase your review volume and response rate. Aim for 80%+ response rate and encourage satisfied customers to leave reviews on Google, Yelp, and Facebook.',
      priority: 2,
      impact_score: 8,
      effort_level: 5,
      estimated_improvement: '+12-18 points',
    });
  }

  // Geo Trust recommendations
  if (audit.geo_trust_score < 70) {
    recommendations.push({
      category: 'local_seo',
      title: 'Strengthen Local Presence',
      description:
        'Ensure NAP (Name, Address, Phone) consistency across all platforms. Optimize your Google Business Profile and build local citations.',
      priority: 3,
      impact_score: 7,
      effort_level: 4,
      estimated_improvement: '+8-12 points',
    });
  }

  // Always recommend ongoing monitoring
  if (audit.overall_score < 90) {
    recommendations.push({
      category: 'monitoring',
      title: 'Set Up Competitor Monitoring',
      description:
        'Track your top 3-5 competitors to benchmark your performance and identify opportunities to gain competitive advantage.',
      priority: 4,
      impact_score: 6,
      effort_level: 2,
      estimated_improvement: 'Ongoing insights',
    });
  }

  return recommendations;
}
