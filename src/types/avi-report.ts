import { z } from "zod";

export const AviReportZ = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  version: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/),
  asOf: z.string(),
  windowWeeks: z.number().int().min(4).max(16),
  aivPct: z.number().min(0).max(100),
  atiPct: z.number().min(0).max(100),
  crsPct: z.number().min(0).max(100),
  elasticity: z.object({ usdPerPoint: z.number().min(0), r2: z.number().min(0).max(1) }),
  pillars: z.object({ seo: z.number().min(0).max(100), aeo: z.number().min(0).max(100), geo: z.number().min(0).max(100), ugc: z.number().min(0).max(100), geoLocal: z.number().min(0).max(100) }),
  modifiers: z.object({ temporalWeight: z.number().min(0).max(2), entityConfidence: z.number().min(0).max(1), crawlBudgetMult: z.number().min(0).max(2), inventoryTruthMult: z.number().min(0).max(2) }),
  clarity: z.object({ scs: z.number().min(0).max(1), sis: z.number().min(0).max(1), adi: z.number().min(0).max(1), scr: z.number().min(0).max(1), selComposite: z.number().min(0).max(1) }),
  secondarySignals: z.object({ engagementDepth: z.number().min(0).max(100).optional(), technicalHealth: z.number().min(0).max(100).optional(), localEntityAccuracy: z.number().min(0).max(100).optional(), brandSemanticFootprint: z.number().min(0).max(100).optional() }).partial().optional(),
  ci95: z.object({ aiv: z.object({ low: z.number(), high: z.number() }), ati: z.object({ low: z.number(), high: z.number() }), crs: z.object({ low: z.number(), high: z.number() }), elasticity: z.object({ low: z.number(), high: z.number() }) }),
  regimeState: z.enum(['Normal', 'ShiftDetected', 'Quarantine']),
  counterfactual: z.object({ rarObservedUsd: z.number().min(0).optional(), rarCounterfactualUsd: z.number().min(0).optional(), deltaUsd: z.number().optional() }).partial().optional(),
  drivers: z.array(z.object({ metric: z.enum(['AIV', 'ATI']), name: z.string(), contribution: z.number() })).optional(),
  anomalies: z.array(z.object({ signal: z.string(), zScore: z.number(), note: z.string().optional() })).optional(),
  backlogSummary: z.array(z.object({ taskId: z.string(), title: z.string(), estDeltaAivLow: z.number(), estDeltaAivHigh: z.number(), projectedImpactLowUsd: z.number(), projectedImpactHighUsd: z.number(), effortPoints: z.number().int().min(1), banditScore: z.number().optional() })).optional()
});

export type AviReport = z.infer<typeof AviReportZ>;
export type RegimeState = 'Normal' | 'ShiftDetected' | 'Quarantine';
