/**
 * Zod validation schemas for scoring inputs
 */

import { z } from "zod";

const z01 = z.number().min(0).max(1);

export const SEOZ = z.object({
  cwv: z01,
  crawlIndex: z01,
  contentQuality: z01
});

export const AEOZ = z.object({
  paaShare: z01,
  faqSchema: z01,
  localCitations: z01
});

export const GEOZ = z.object({
  csgv: z01,
  hallucinationRisk: z01,
  lambdaHRP: z01.optional()
});

export const QAIZ = z.object({
  lambdaPIQR: z.number().min(0.5).max(1.5),
  vdpQuality: z01
});

export const EEATZ = z.object({
  eeatMultiplier: z01
});

export const FinancialZ = z.object({
  deltaLeadsPotential: z.number().min(0),
  avgGPPUOrg: z.number().min(0),
  riskAdjFactor: z.number().min(0.1).max(1.0),
  touchpoints: z.array(z.object({ value: z01, proximity: z01 })).optional(),
  closingRate: z.number().min(0).max(1).optional(),
  cacIncrease: z.number().min(0).optional(),
  monthlyLeadVolume: z.number().min(0).optional(),
  tsm: z.number().min(0).optional()
});

