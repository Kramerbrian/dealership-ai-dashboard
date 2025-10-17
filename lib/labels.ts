// KPI Labels and Constants
// DealershipAI - Centralized labels and display constants

export const KPI_LABELS = {
  aiv: "AI Visibility",
  ati: "Algorithmic Trust",
  crs: "Composite Risk Score",
  elasticity: "AIV Elasticity",
  vli: "Vehicle Listing Integrity"
} as const;

export const KPI_DESCRIPTIONS = {
  aiv: "Measures how well your content is optimized for AI systems and search engines",
  ati: "Evaluates the trustworthiness and reliability of your content",
  crs: "Combined risk assessment based on AIV and ATI scores",
  elasticity: "Revenue impact per 1% change in AI Visibility score",
  vli: "Integrity and completeness of vehicle listing data"
} as const;

export const CI_TOOLTIPS = {
  aiv: "95% confidence band based on last 8 weeks. 'Unstable' if the band is wide.",
  ati: "Trust score confidence. Wide band = verify data consistency.",
  crs: "Composite confidence. Wide band = visibility or trust volatility."
} as const;

export const SEVERITY_COLORS = {
  low: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200", 
  high: "text-orange-600 bg-orange-50 border-orange-200",
  critical: "text-red-600 bg-red-50 border-red-200"
} as const;

export const ANOMALY_MESSAGES = {
  ctr: "CTR anomaly detected - unusual click-through rate pattern",
  cvr: "CVR anomaly detected - unusual conversion rate pattern",
  revenue: "Revenue anomaly detected - unusual revenue pattern",
  traffic: "Traffic anomaly detected - unusual traffic pattern"
} as const;