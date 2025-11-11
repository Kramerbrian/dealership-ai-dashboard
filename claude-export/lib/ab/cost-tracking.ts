/**
 * Cost Tracking and AROI (Adjusted Return on Investment) Calculation
 * Tracks content generation costs, review hours, and infrastructure costs per variant
 */

export interface CostBreakdown {
  contentGeneration: {
    llmTokens: number;
    llmCost: number;
    apiCalls: number;
    apiCost: number;
    totalCost: number;
  };
  humanReview: {
    hours: number;
    hourlyRate: number;
    totalCost: number;
  };
  infrastructure: {
    computeHours: number;
    storageGB: number;
    bandwidthGB: number;
    totalCost: number;
  };
  totalCost: number;
}

export interface RevenueMetrics {
  baselineRevenue: number;
  treatmentRevenue: number;
  revenueDelta: number;
  conversionDelta: number;
  visitorDelta: number;
}

export interface AROICalculation {
  revenueDelta: number;
  costDelta: number;
  aroi: number;
  paybackPeriod: number; // days
  netPresentValue: number;
  costBreakdown: CostBreakdown;
  revenueMetrics: RevenueMetrics;
}

export interface CostConfig {
  llmCostPerToken: number;
  apiCostPerCall: number;
  humanReviewHourlyRate: number;
  computeCostPerHour: number;
  storageCostPerGB: number;
  bandwidthCostPerGB: number;
  discountRate: number; // for NPV calculation
}

/**
 * Default cost configuration (can be overridden per tenant)
 */
export const DEFAULT_COST_CONFIG: CostConfig = {
  llmCostPerToken: 0.00002, // $0.02 per 1K tokens
  apiCostPerCall: 0.001, // $0.001 per API call
  humanReviewHourlyRate: 50, // $50/hour
  computeCostPerHour: 0.10, // $0.10/hour
  storageCostPerGB: 0.023, // $0.023/GB/month
  bandwidthCostPerGB: 0.09, // $0.09/GB
  discountRate: 0.05 // 5% annual discount rate
};

/**
 * Calculate cost breakdown for a variant
 * @param variantData Variant performance and usage data
 * @param config Cost configuration
 * @returns Detailed cost breakdown
 */
export function calculateCostBreakdown(
  variantData: {
    llmTokens: number;
    apiCalls: number;
    reviewHours: number;
    computeHours: number;
    storageGB: number;
    bandwidthGB: number;
  },
  config: CostConfig = DEFAULT_COST_CONFIG
): CostBreakdown {
  // Content generation costs
  const llmCost = variantData.llmTokens * config.llmCostPerToken;
  const apiCost = variantData.apiCalls * config.apiCostPerCall;
  const contentGenerationTotal = llmCost + apiCost;

  // Human review costs
  const humanReviewTotal = variantData.reviewHours * config.humanReviewHourlyRate;

  // Infrastructure costs
  const computeCost = variantData.computeHours * config.computeCostPerHour;
  const storageCost = variantData.storageGB * config.storageCostPerGB;
  const bandwidthCost = variantData.bandwidthGB * config.bandwidthCostPerGB;
  const infrastructureTotal = computeCost + storageCost + bandwidthCost;

  const totalCost = contentGenerationTotal + humanReviewTotal + infrastructureTotal;

  return {
    contentGeneration: {
      llmTokens: variantData.llmTokens,
      llmCost,
      apiCalls: variantData.apiCalls,
      apiCost,
      totalCost: contentGenerationTotal
    },
    humanReview: {
      hours: variantData.reviewHours,
      hourlyRate: config.humanReviewHourlyRate,
      totalCost: humanReviewTotal
    },
    infrastructure: {
      computeHours: variantData.computeHours,
      storageGB: variantData.storageGB,
      bandwidthGB: variantData.bandwidthGB,
      totalCost: infrastructureTotal
    },
    totalCost
  };
}

/**
 * Calculate AROI for A/B test variant
 * @param baselineData Baseline variant data
 * @param treatmentData Treatment variant data
 * @param config Cost configuration
 * @returns AROI calculation results
 */
export function calculateAROI(
  baselineData: {
    costBreakdown: CostBreakdown;
    revenue: number;
    conversions: number;
    visitors: number;
  },
  treatmentData: {
    costBreakdown: CostBreakdown;
    revenue: number;
    conversions: number;
    visitors: number;
  },
  config: CostConfig = DEFAULT_COST_CONFIG
): AROICalculation {
  // Calculate deltas
  const revenueDelta = treatmentData.revenue - baselineData.revenue;
  const costDelta = treatmentData.costBreakdown.totalCost - baselineData.costBreakdown.totalCost;
  const conversionDelta = treatmentData.conversions - baselineData.conversions;
  const visitorDelta = treatmentData.visitors - baselineData.visitors;

  // Calculate AROI
  const aroi = costDelta !== 0 ? (revenueDelta - costDelta) / costDelta : 0;

  // Calculate payback period (days)
  const dailyRevenueDelta = revenueDelta / 30; // Assuming 30-day period
  const paybackPeriod = dailyRevenueDelta > 0 ? costDelta / dailyRevenueDelta : Infinity;

  // Calculate NPV (simplified - assumes 1 year)
  const netPresentValue = revenueDelta - costDelta;

  const revenueMetrics: RevenueMetrics = {
    baselineRevenue: baselineData.revenue,
    treatmentRevenue: treatmentData.revenue,
    revenueDelta,
    conversionDelta,
    visitorDelta
  };

  return {
    revenueDelta,
    costDelta,
    aroi,
    paybackPeriod,
    netPresentValue,
    costBreakdown: treatmentData.costBreakdown,
    revenueMetrics
  };
}

/**
 * Calculate cost efficiency metrics
 * @param aroi AROI calculation results
 * @returns Cost efficiency metrics
 */
export function calculateCostEfficiency(aroi: AROICalculation): {
  costPerConversion: number;
  revenuePerDollar: number;
  costRatio: number;
  efficiency: 'excellent' | 'good' | 'fair' | 'poor';
} {
  const costPerConversion = aroi.costBreakdown.totalCost / 
    (aroi.revenueMetrics.conversionDelta > 0 ? aroi.revenueMetrics.conversionDelta : 1);
  
  const revenuePerDollar = aroi.costBreakdown.totalCost > 0 ? 
    aroi.revenueMetrics.treatmentRevenue / aroi.costBreakdown.totalCost : 0;
  
  const costRatio = aroi.revenueMetrics.treatmentRevenue > 0 ? 
    aroi.costBreakdown.totalCost / aroi.revenueMetrics.treatmentRevenue : 0;

  let efficiency: 'excellent' | 'good' | 'fair' | 'poor';
  if (aroi.aroi > 2) {
    efficiency = 'excellent';
  } else if (aroi.aroi > 1) {
    efficiency = 'good';
  } else if (aroi.aroi > 0) {
    efficiency = 'fair';
  } else {
    efficiency = 'poor';
  }

  return {
    costPerConversion,
    revenuePerDollar,
    costRatio,
    efficiency
  };
}

/**
 * Generate cost optimization recommendations
 * @param aroi AROI calculation results
 * @param efficiency Cost efficiency metrics
 * @returns Array of optimization recommendations
 */
export function generateCostOptimizations(
  aroi: AROICalculation,
  efficiency: ReturnType<typeof calculateCostEfficiency>
): string[] {
  const recommendations: string[] = [];

  // AROI-based recommendations
  if (aroi.aroi < 0) {
    recommendations.push('Negative AROI - consider pausing or redesigning this variant');
  } else if (aroi.aroi < 1) {
    recommendations.push('Low AROI - optimize costs or increase conversion rates');
  }

  // Payback period recommendations
  if (aroi.paybackPeriod > 90) {
    recommendations.push('Long payback period - consider shorter test duration or higher impact changes');
  }

  // Cost breakdown recommendations
  if (aroi.costBreakdown.contentGeneration.totalCost > aroi.costBreakdown.totalCost * 0.7) {
    recommendations.push('High content generation costs - consider prompt optimization or caching');
  }

  if (aroi.costBreakdown.humanReview.totalCost > aroi.costBreakdown.totalCost * 0.5) {
    recommendations.push('High review costs - consider automated quality checks or reduced review scope');
  }

  if (aroi.costBreakdown.infrastructure.totalCost > aroi.costBreakdown.totalCost * 0.3) {
    recommendations.push('High infrastructure costs - consider optimization or different hosting');
  }

  // Efficiency recommendations
  if (efficiency.costPerConversion > 100) {
    recommendations.push('High cost per conversion - focus on conversion rate optimization');
  }

  if (efficiency.revenuePerDollar < 2) {
    recommendations.push('Low revenue per dollar spent - improve targeting or value proposition');
  }

  return recommendations;
}

/**
 * Calculate cost per acquisition (CPA) for variant
 * @param costBreakdown Cost breakdown
 * @param conversions Number of conversions
 * @returns CPA metrics
 */
export function calculateCPA(
  costBreakdown: CostBreakdown,
  conversions: number
): {
  totalCPA: number;
  contentCPA: number;
  reviewCPA: number;
  infrastructureCPA: number;
} {
  const safeConversions = Math.max(conversions, 1);
  
  return {
    totalCPA: costBreakdown.totalCost / safeConversions,
    contentCPA: costBreakdown.contentGeneration.totalCost / safeConversions,
    reviewCPA: costBreakdown.humanReview.totalCost / safeConversions,
    infrastructureCPA: costBreakdown.infrastructure.totalCost / safeConversions
  };
}

/**
 * Calculate cost variance between variants
 * @param baselineCosts Baseline cost breakdown
 * @param treatmentCosts Treatment cost breakdown
 * @returns Cost variance analysis
 */
export function calculateCostVariance(
  baselineCosts: CostBreakdown,
  treatmentCosts: CostBreakdown
): {
  totalVariance: number;
  contentVariance: number;
  reviewVariance: number;
  infrastructureVariance: number;
  variancePercentage: number;
} {
  const totalVariance = treatmentCosts.totalCost - baselineCosts.totalCost;
  const contentVariance = treatmentCosts.contentGeneration.totalCost - baselineCosts.contentGeneration.totalCost;
  const reviewVariance = treatmentCosts.humanReview.totalCost - baselineCosts.humanReview.totalCost;
  const infrastructureVariance = treatmentCosts.infrastructure.totalCost - baselineCosts.infrastructure.totalCost;
  
  const variancePercentage = baselineCosts.totalCost > 0 ? 
    (totalVariance / baselineCosts.totalCost) * 100 : 0;

  return {
    totalVariance,
    contentVariance,
    reviewVariance,
    infrastructureVariance,
    variancePercentage
  };
}
