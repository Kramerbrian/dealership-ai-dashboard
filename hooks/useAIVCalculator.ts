import { useEffect, useState } from "react";

export interface AIVInputs {
  dealerId: string;
  platform_scores: Record<string, number>;
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
  ctr_delta: number;
  conversion_delta: number;
  avg_gross_per_unit: number;
  monthly_opportunities: number;
}

export interface AIVOutputs {
  AIV_score: number;
  AIVR_score: number;
  Revenue_at_Risk_USD: number;
  modal_summary: string;
  chat_summary: string;
}

/**
 * Core computational hook — computes AIV™, AIVR™, and Revenue-at-Risk.
 */
export function useAIVCalculator(inputs: AIVInputs | null): AIVOutputs {
  const [result, setResult] = useState<AIVOutputs>({
    AIV_score: 0,
    AIVR_score: 0,
    Revenue_at_Risk_USD: 0,
    modal_summary: "",
    chat_summary: ""
  });

  useEffect(() => {
    if (!inputs) return;

    // ---- Core calculation section ----

    // AIV_core proxy from platform visibility
    const avgPlatform =
      Object.values(inputs.platform_scores).reduce((a, b) => a + b, 0) /
      Object.keys(inputs.platform_scores).length;

    const AIV_core =
      0.25 * avgPlatform + // SEO
      0.3 * inputs.google_aio_inclusion_rate +
      0.25 * (inputs.ugc_health_score / 100) +
      0.1 * inputs.schema_coverage_ratio +
      0.05 * inputs.entity_confidence;

    const AIV_sel =
      0.35 * inputs.semantic_clarity_score +
      0.35 * inputs.silo_integrity_score +
      0.3 * inputs.schema_coverage_ratio;

    const AIV_mods =
      inputs.temporal_weight *
      inputs.entity_confidence *
      inputs.crawl_budget_mult *
      inputs.inventory_truth_mult;

    let AIV = AIV_core * AIV_mods * (1 + 0.25 * Math.min(1, AIV_sel));
    if (AIV > 1) AIV = 1; // clamp upper bound

    // ---- ROI Layer ----
    const AIVR = AIV * (1 + inputs.ctr_delta + inputs.conversion_delta);
    const revenueAtRisk =
      ((1 - AIV) * inputs.monthly_opportunities * inputs.avg_gross_per_unit);

    // ---- UI + Chat summaries ----
    const modalSummary = `Your dealership's Algorithmic Visibility Index (AIV™) is ${(
      AIV * 100
    ).toFixed(1)}%. Schema coverage and clarity signals are performing strongly.`;
    const chatSummary = `Your current AIV™ is ${(AIV * 100).toFixed(
      1
    )}% and AIVR™ is ${(AIVR * 100).toFixed(
      1
    )}%, representing an estimated $${revenueAtRisk.toLocaleString()} in monthly revenue at risk.`;

    // ---- Set computed state ----
    setResult({
      AIV_score: parseFloat(AIV.toFixed(3)),
      AIVR_score: parseFloat(AIVR.toFixed(3)),
      Revenue_at_Risk_USD: Math.round(revenueAtRisk),
      modal_summary: modalSummary,
      chat_summary: chatSummary
    });
  }, [JSON.stringify(inputs)]);

  return result;
}
