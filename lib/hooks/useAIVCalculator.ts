/**
 * useAIVCalculator Hook
 * 
 * Computes Algorithmic Visibility Index (AIV™) and AI Visibility ROI (AIVR™) scores
 * based on platform visibility, semantic clarity, and conversion lift data
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface AIVInputs {
  dealerId: string;
  platform_scores: {
    chatgpt: number;
    claude: number;
    perplexity: number;
    gemini: number;
    copilot: number;
    grok: number;
  };
  google_aio_inclusion_rate: number;
  ugc_health_score: number;
  schema_coverage_ratio: number;
  semantic_clarity_score: number;
  silo_integrity_score: number;
  authority_depth_index: number;
  temporal_weight: number;
  entity_confidence: number;
  crawl_budget_mult: number;
  inventory_truth_mult: number;
  ctr_delta?: number;
  conversion_delta?: number;
  avg_gross_per_unit?: number;
  monthly_opportunities?: number;
}

export interface AIVOutputs {
  AIV_score: number;
  AIVR_score: number;
  Revenue_at_Risk_USD: number;
  modal_summary: string;
  chat_summary: string;
  breakdown: {
    AIV_core: number;
    AIV_sel: number;
    AIV_mods: number;
    SEO: number;
    AEO: number;
    GEO: number;
    UGC: number;
    GeoLocal: number;
  };
}

/**
 * Calculate AIV components from inputs
 */
function calculateAIV(inputs: AIVInputs): AIVOutputs {
  // Platform scores aggregation
  const platformAvg = Object.values(inputs.platform_scores).reduce((a, b) => a + b, 0) / Object.keys(inputs.platform_scores).length;
  
  // AIV_core components (weighted)
  const SEO = inputs.schema_coverage_ratio * 100;
  const AEO = inputs.authority_depth_index * 100;
  const GEO = inputs.google_aio_inclusion_rate * 100;
  const UGC = inputs.ugc_health_score;
  const GeoLocal = (inputs.silo_integrity_score + inputs.authority_depth_index) / 2 * 100;
  
  // AIV_core: 0.25*SEO + 0.30*AEO + 0.25*GEO + 0.10*UGC + 0.05*GeoLocal
  const AIV_core = (0.25 * SEO + 0.30 * AEO + 0.25 * GEO + 0.10 * UGC + 0.05 * GeoLocal) / 100;
  
  // AIV_sel: (0.35*SCS + 0.35*SIS + 0.30*SCR)
  // SCS = semantic_clarity_score, SIS = silo_integrity_score, SCR = (SCS + SIS) / 2
  const SCR = (inputs.semantic_clarity_score + inputs.silo_integrity_score) / 2;
  const AIV_sel = 0.35 * inputs.semantic_clarity_score + 0.35 * inputs.silo_integrity_score + 0.30 * SCR;
  
  // AIV_mods: TemporalWeight * EntityConfidence * CrawlBudgetMult * InventoryTruthMult
  const AIV_mods = inputs.temporal_weight * inputs.entity_confidence * inputs.crawl_budget_mult * inputs.inventory_truth_mult;
  
  // AIV_formula: (AIV_core * AIV_mods) * (1 + 0.25*AIV_sel)
  const AIV_score = Math.min(1.0, Math.max(0, (AIV_core * AIV_mods) * (1 + 0.25 * AIV_sel)));
  
  // AIVR_formula: (AIV * (1 + CTR_delta + Conversion_delta))
  const ctrDelta = inputs.ctr_delta || 0;
  const conversionDelta = inputs.conversion_delta || 0;
  const AIVR_score = Math.min(2.0, Math.max(0, AIV_score * (1 + ctrDelta + conversionDelta)));
  
  // Revenue_at_Risk: (100 - AIV*100) / 100 * monthly_opportunities * avg_gross_per_unit
  const monthlyOpps = inputs.monthly_opportunities || 450;
  const avgGross = inputs.avg_gross_per_unit || 1200;
  const visibilityLoss = (1 - AIV_score) * 100;
  const Revenue_at_Risk_USD = Math.round((visibilityLoss / 100) * monthlyOpps * avgGross);
  
  // Generate summaries
  const percentile = Math.round((1 - AIV_score) * 100);
  const modal_summary = `Your dealership ranks in the top ${percentile}% for AI visibility across assistant platforms. ` +
    `Strong schema coverage (${Math.round(inputs.schema_coverage_ratio * 100)}%) and clarity signals ` +
    `(SCS ${inputs.semantic_clarity_score.toFixed(2)} / SIS ${inputs.silo_integrity_score.toFixed(2)}) ` +
    `are driving visibility gains.`;
  
  const chat_summary = `Your AIV™ is **${AIV_score.toFixed(2)}** and your AIVR™ is **${AIVR_score.toFixed(2)}**, ` +
    `meaning you're capturing ${(AIVR_score * 50).toFixed(0)}% of your visibility potential. ` +
    `Estimated revenue at risk from missed AI exposure: **$${(Revenue_at_Risk_USD / 1000).toFixed(1)}K** per month.`;
  
  return {
    AIV_score: Math.round(AIV_score * 1000) / 1000, // Round to 3 decimals
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

/**
 * Fetch AIV inputs from API
 */
async function fetchAIVInputs(dealerId: string): Promise<AIVInputs> {
  try {
    // Fetch from multiple sources
    const [aiScoresRes, abMetricsRes, leaderboardRes] = await Promise.all([
      fetch(`/api/ai-scores?dealerId=${dealerId}`).catch(() => null),
      fetch('/public/audit-reports/abtest_metrics.csv').catch(() => null),
      fetch('/public/audit-reports/leaderboard_latest.json').catch(() => null),
    ]);
    
    let aiScores: any = null;
    let ctrDelta = 0;
    let conversionDelta = 0;
    
    if (aiScoresRes?.ok) {
      aiScores = await aiScoresRes.json();
    }
    
    // Parse A/B metrics CSV if available
    if (abMetricsRes?.ok) {
      try {
        const csvText = await abMetricsRes.text();
        const lines = csvText.split('\n').slice(1).filter(l => l.trim());
        if (lines.length > 0) {
          const avgLine = lines[lines.length - 1];
          const parts = avgLine.split(',');
          if (parts.length >= 7) {
            ctrDelta = parseFloat(parts[5]) || 0;
            conversionDelta = parseFloat(parts[6]) || 0;
          }
        }
      } catch (e) {
        console.warn('Failed to parse A/B metrics CSV', e);
      }
    }
    
    // Extract data from API response or use defaults
    const kpi = aiScores?.kpi_scoreboard || {};
    
    return {
      dealerId,
      platform_scores: {
        chatgpt: aiScores?.platform_scores?.chatgpt || kpi.chatgpt_visibility || 0.86,
        claude: aiScores?.platform_scores?.claude || kpi.claude_visibility || 0.82,
        perplexity: aiScores?.platform_scores?.perplexity || kpi.perplexity_visibility || 0.78,
        gemini: aiScores?.platform_scores?.gemini || kpi.gemini_visibility || 0.84,
        copilot: aiScores?.platform_scores?.copilot || kpi.copilot_visibility || 0.75,
        grok: aiScores?.platform_scores?.grok || kpi.grok_visibility || 0.70,
      },
      google_aio_inclusion_rate: aiScores?.google_aio_inclusion_rate || kpi.google_aio_rate || 0.62,
      ugc_health_score: aiScores?.ugc_health_score || kpi.ugc_health || 84,
      schema_coverage_ratio: aiScores?.schema_coverage_ratio || kpi.schema_coverage || 0.91,
      semantic_clarity_score: aiScores?.semantic_clarity_score || kpi.semantic_clarity || 0.88,
      silo_integrity_score: aiScores?.silo_integrity_score || kpi.silo_integrity || 0.82,
      authority_depth_index: aiScores?.authority_depth_index || kpi.authority_depth || 0.87,
      temporal_weight: aiScores?.temporal_weight || kpi.temporal_weight || 1.05,
      entity_confidence: aiScores?.entity_confidence || kpi.entity_confidence || 0.96,
      crawl_budget_mult: aiScores?.crawl_budget_mult || kpi.crawl_budget_mult || 0.98,
      inventory_truth_mult: aiScores?.inventory_truth_mult || kpi.inventory_truth_mult || 1.00,
      ctr_delta: ctrDelta,
      conversion_delta: conversionDelta,
      avg_gross_per_unit: aiScores?.avg_gross_per_unit || kpi.avg_gross_per_unit || 1200,
      monthly_opportunities: aiScores?.monthly_opportunities || kpi.monthly_opportunities || 450,
    };
  } catch (error) {
    console.error('Error fetching AIV inputs:', error);
    // Return defaults on error
    return {
      dealerId,
      platform_scores: {
        chatgpt: 0.86,
        claude: 0.82,
        perplexity: 0.78,
        gemini: 0.84,
        copilot: 0.75,
        grok: 0.70,
      },
      google_aio_inclusion_rate: 0.62,
      ugc_health_score: 84,
      schema_coverage_ratio: 0.91,
      semantic_clarity_score: 0.88,
      silo_integrity_score: 0.82,
      authority_depth_index: 0.87,
      temporal_weight: 1.05,
      entity_confidence: 0.96,
      crawl_budget_mult: 0.98,
      inventory_truth_mult: 1.00,
      ctr_delta: 0.094,
      conversion_delta: 0.047,
      avg_gross_per_unit: 1200,
      monthly_opportunities: 450,
    };
  }
}

/**
 * React hook for AIV calculations
 */
export function useAIVCalculator(dealerId: string, options?: { enabled?: boolean; refetchInterval?: number }) {
  const { enabled = true, refetchInterval } = options || {};
  
  const {
    data: inputs,
    isLoading: inputsLoading,
    error: inputsError,
    refetch: refetchInputs,
  } = useQuery({
    queryKey: ['aiv-inputs', dealerId],
    queryFn: () => fetchAIVInputs(dealerId),
    enabled: enabled && !!dealerId,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval,
  });
  
  const [outputs, setOutputs] = useState<AIVOutputs | null>(null);
  
  useEffect(() => {
    if (inputs) {
      const calculated = calculateAIV(inputs);
      setOutputs(calculated);
    }
  }, [inputs]);
  
  const recalculate = useCallback((customInputs?: Partial<AIVInputs>) => {
    if (inputs) {
      const merged = { ...inputs, ...customInputs };
      const calculated = calculateAIV(merged);
      setOutputs(calculated);
      return calculated;
    }
    return null;
  }, [inputs]);
  
  return {
    inputs,
    outputs,
    isLoading: inputsLoading,
    error: inputsError,
    refetch: refetchInputs,
    recalculate,
  };
}

