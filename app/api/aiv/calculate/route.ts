/**
 * POST /api/aiv/calculate
 * 
 * Calculate AIV and AIVR scores from inputs
 * Returns computed scores, summaries, and breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api-wrapper';
import { z } from 'zod';
import { errorResponse, cachedResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';

const aivInputSchema = z.object({
  dealerId: z.string(),
  platform_scores: z.object({
    chatgpt: z.number().min(0).max(1),
    claude: z.number().min(0).max(1),
    perplexity: z.number().min(0).max(1),
    gemini: z.number().min(0).max(1),
    copilot: z.number().min(0).max(1),
    grok: z.number().min(0).max(1),
  }).optional(),
  google_aio_inclusion_rate: z.number().min(0).max(1).optional(),
  ugc_health_score: z.number().min(0).max(100).optional(),
  schema_coverage_ratio: z.number().min(0).max(1).optional(),
  semantic_clarity_score: z.number().min(0).max(1).optional(),
  silo_integrity_score: z.number().min(0).max(1).optional(),
  authority_depth_index: z.number().min(0).max(1).optional(),
  temporal_weight: z.number().optional(),
  entity_confidence: z.number().min(0).max(1).optional(),
  crawl_budget_mult: z.number().min(0).max(2).optional(),
  inventory_truth_mult: z.number().min(0).max(2).optional(),
  ctr_delta: z.number().optional(),
  conversion_delta: z.number().optional(),
  avg_gross_per_unit: z.number().optional(),
  monthly_opportunities: z.number().optional(),
});

function calculateAIV(inputs: z.infer<typeof aivInputSchema>): any {
  // Use defaults if not provided
  const platform_scores = inputs.platform_scores || {
    chatgpt: 0.86,
    claude: 0.82,
    perplexity: 0.78,
    gemini: 0.84,
    copilot: 0.75,
    grok: 0.70,
  };
  
  const platformAvg = Object.values(platform_scores).reduce((a, b) => a + b, 0) / Object.keys(platform_scores).length;
  
  // AIV_core components
  const SEO = (inputs.schema_coverage_ratio || 0.91) * 100;
  const AEO = (inputs.authority_depth_index || 0.87) * 100;
  const GEO = (inputs.google_aio_inclusion_rate || 0.62) * 100;
  const UGC = inputs.ugc_health_score || 84;
  const GeoLocal = ((inputs.silo_integrity_score || 0.82) + (inputs.authority_depth_index || 0.87)) / 2 * 100;
  
  const AIV_core = (0.25 * SEO + 0.30 * AEO + 0.25 * GEO + 0.10 * UGC + 0.05 * GeoLocal) / 100;
  
  // AIV_sel
  const SCS = inputs.semantic_clarity_score || 0.88;
  const SIS = inputs.silo_integrity_score || 0.82;
  const SCR = (SCS + SIS) / 2;
  const AIV_sel = 0.35 * SCS + 0.35 * SIS + 0.30 * SCR;
  
  // AIV_mods
  const AIV_mods = (inputs.temporal_weight || 1.05) * 
    (inputs.entity_confidence || 0.96) * 
    (inputs.crawl_budget_mult || 0.98) * 
    (inputs.inventory_truth_mult || 1.00);
  
  // AIV
  const AIV_score = Math.min(1.0, Math.max(0, (AIV_core * AIV_mods) * (1 + 0.25 * AIV_sel)));
  
  // AIVR
  const ctrDelta = inputs.ctr_delta || 0;
  const conversionDelta = inputs.conversion_delta || 0;
  const AIVR_score = Math.min(2.0, Math.max(0, AIV_score * (1 + ctrDelta + conversionDelta)));
  
  // Revenue at Risk
  const monthlyOpps = inputs.monthly_opportunities || 450;
  const avgGross = inputs.avg_gross_per_unit || 1200;
  const visibilityLoss = (1 - AIV_score) * 100;
  const Revenue_at_Risk_USD = Math.round((visibilityLoss / 100) * monthlyOpps * avgGross);
  
  // Summaries
  const percentile = Math.round((1 - AIV_score) * 100);
  const modal_summary = `Your dealership ranks in the top ${percentile}% for AI visibility across assistant platforms. ` +
    `Strong schema coverage (${Math.round((inputs.schema_coverage_ratio || 0.91) * 100)}%) and clarity signals ` +
    `(SCS ${SCS.toFixed(2)} / SIS ${SIS.toFixed(2)}) are driving visibility gains.`;
  
  const chat_summary = `Your AIV™ is **${AIV_score.toFixed(2)}** and your AIVR™ is **${AIVR_score.toFixed(2)}**, ` +
    `meaning you're capturing ${(AIVR_score * 50).toFixed(0)}% of your visibility potential. ` +
    `Estimated revenue at risk from missed AI exposure: **$${(Revenue_at_Risk_USD / 1000).toFixed(1)}K** per month.`;
  
  return {
    AIV_score: Math.round(AIV_score * 1000) / 1000,
    AIVR_score: Math.round(AIVR_score * 1000) / 1000,
    Revenue_at_Risk_USD: Math.round(Revenue_at_Risk_USD),
    modal_summary,
    chat_summary,
    breakdown: {
      AIV_core: Math.round(AIV_core * 1000) / 1000,
      AIV_sel: Math.round(AIV_sel * 1000) / 1000,
      AIV_mods: Math.round(AIV_mods * 1000) / 1000,
      SEO,
      AEO,
      GEO,
      UGC,
      GeoLocal,
    },
  };
}

export const POST = createApiRoute(
  {
    endpoint: '/api/aiv/calculate',
    requireAuth: false,
    validateBody: aivInputSchema,
    rateLimit: true,
    performanceMonitoring: true,
  },
  async (req) => {
    try {
      const body = await req.json();
      const inputs = body;
      
      const outputs = calculateAIV(inputs);
      
      await logger.info('AIV calculation completed', {
        dealerId: inputs.dealerId,
        AIV_score: outputs.AIV_score,
        AIVR_score: outputs.AIVR_score,
      });
      
      return cachedResponse({
        success: true,
        data: outputs,
        meta: {
          dealerId: inputs.dealerId,
          timestamp: new Date().toISOString(),
        },
      }, 300); // Cache for 5 minutes
    } catch (error) {
      await logger.error('AIV calculation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return errorResponse('Failed to calculate AIV scores', 500);
    }
  }
);

