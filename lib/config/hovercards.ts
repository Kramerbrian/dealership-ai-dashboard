/**
 * Hovercard text definitions for DealershipAI metrics
 * Used in dashboard components and tooltips
 */
export const hovercardText = {
  AIV: "Visibility (AIV™) — Measures how easily your dealership can be found across search engines and AI assistants. Ingredients: SEO health, AEO inclusion, local search accuracy, and UGC quality.",
  ATI: "Trust (ATI™) — Quantifies credibility and authenticity online. Includes reviews, schema consistency, and E-E-A-T markers.",
  CVI: "Conversion (CVI™) — Evaluates efficiency of turning visitors into real leads via form completions, CTAs, and engagement.",
  ORI: "Operations (ORI™) — Measures inventory and service performance efficiency.",
  GRI: "Growth Readiness (GRI™) — Indicates scalability readiness based on automation, response time, and data quality.",
  DPI: "Dealership Performance Index (DPI) — Weighted composite of AIV, ATI, CVI, ORI, and GRI.",
} as const;

export type MetricKey = keyof typeof hovercardText;

