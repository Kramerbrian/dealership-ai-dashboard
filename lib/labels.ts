/**
 * KPI Labels for DealershipAI Command Center
 * Standardized naming across dashboard components
 */

export const KPI_LABELS = {
  clarity: 'Clarity Intelligence Score',
  trust: 'Algorithmic Trust Index (ATI)',
  reputation: 'Composite Reputation Score (CRS)',
  aiv: 'Algorithmic Visibility Index (AIV)',
  elasticity: 'Elasticity ($ per +1 AIV pt)',
} as const;

export type KPILabel = keyof typeof KPI_LABELS;
