import { z } from "zod";

export const MarketEventSchema = z.object({
  id: z.string(),
  type: z.enum(["search_algorithm_update", "platform_policy_change", "competitor_action", "industry_trend"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  detectedAt: z.string().datetime(),
  affectedDealers: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const DealerModelImpactSchema = z.object({
  dealer_id: z.string(),
  model_id: z.string(),
  timestamp: z.date(),
  baseline: z.record(z.any()),
  forecast: z.record(z.any()),
  confidence: z.number().min(0).max(1),
});

export type MarketEvent = z.infer<typeof MarketEventSchema>;
export type DealerModelImpact = z.infer<typeof DealerModelImpactSchema>;

