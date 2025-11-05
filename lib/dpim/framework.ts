/**
 * Dealership Performance Intelligence Model (DPIM™)
 * 
 * Standardized diagnostic framework that grades dealerships across:
 * - A. Visibility (AIV™)
 * - B. Trust (ATI™)
 * - C. Conversion (CVI™)
 * - D. Operations (ORI™)
 * - E. Growth Readiness (GRI™)
 * 
 * Output: Composite Dealership Performance Index (DPI)
 */

export interface DPIMetrics {
  aiv: number; // AI Visibility Index (0-100)
  ati: number; // Algorithmic Trust Index (0-100)
  cvi: number; // Conversion Efficiency (0-100)
  ori: number; // Operational Health (0-100)
  gri: number; // Growth Readiness (0-100)
}

export interface DPIBreakdown {
  pillar: string;
  score: number;
  status: 'leader' | 'competitive' | 'underperforming' | 'at_risk';
  keyDriver: string;
  recommendedAction: string;
  benchmark: {
    brandTierMedian: number;
    dmaMedian: number;
    topQuartile: number;
  };
}

export interface DPIScorecard {
  dpi: number; // Composite score (0-100)
  metrics: DPIMetrics;
  breakdown: DPIBreakdown[];
  topRisks: string[];
  topOpportunities: string[];
  generatedAt: string;
  dealerId: string;
  dealerName: string;
}

/**
 * Calculate composite DPI score
 * Formula: DPI = 0.25*AIV + 0.20*ATI + 0.25*CVI + 0.20*ORI + 0.10*GRI
 */
export function calculateDPI(metrics: DPIMetrics): number {
  const dpi = 
    0.25 * metrics.aiv +
    0.20 * metrics.ati +
    0.25 * metrics.cvi +
    0.20 * metrics.ori +
    0.10 * metrics.gri;
  
  return Math.round(dpi * 100) / 100; // Round to 2 decimals
}

/**
 * Determine status band from score
 */
export function getStatusBand(score: number): 'leader' | 'competitive' | 'underperforming' | 'at_risk' {
  if (score >= 90) return 'leader';
  if (score >= 75) return 'competitive';
  if (score >= 60) return 'underperforming';
  return 'at_risk';
}

/**
 * Get status color code
 */
export function getStatusColor(status: DPIBreakdown['status']): string {
  switch (status) {
    case 'leader':
      return 'text-green-500';
    case 'competitive':
      return 'text-yellow-500';
    case 'underperforming':
      return 'text-orange-500';
    case 'at_risk':
      return 'text-red-500';
  }
}

/**
 * Get status emoji
 */
export function getStatusEmoji(status: DPIBreakdown['status']): string {
  switch (status) {
    case 'leader':
      return '✅';
    case 'competitive':
      return '⚠️';
    case 'underperforming':
      return '⚠️';
    case 'at_risk':
      return '🔴';
  }
}

/**
 * Generate recommended actions based on score
 */
export function generateRecommendedActions(metrics: DPIMetrics): string[] {
  const actions: string[] = [];

  if (metrics.aiv < 70) {
    actions.push('Fix schema markup + add FAQs');
  }

  if (metrics.ati < 70) {
    actions.push('Enable 24-hr review response automation');
  }

  if (metrics.cvi < 70) {
    actions.push('Add instant lead forms');
  }

  if (metrics.ori < 70) {
    actions.push('Reprice top 10 slow movers');
  }

  if (metrics.gri < 70) {
    actions.push('Expand auto-fix scope');
  }

  return actions;
}

/**
 * Generate top risks and opportunities
 */
export function generateRisksAndOpportunities(metrics: DPIMetrics, breakdown: DPIBreakdown[]): {
  risks: string[];
  opportunities: string[];
} {
  const risks: string[] = [];
  const opportunities: string[] = [];

  breakdown.forEach((item) => {
    if (item.status === 'at_risk') {
      risks.push(`${item.pillar}: ${item.keyDriver}`);
    } else if (item.status === 'leader') {
      opportunities.push(`${item.pillar}: ${item.keyDriver}`);
    }
  });

  return {
    risks: risks.slice(0, 3),
    opportunities: opportunities.slice(0, 3),
  };
}

