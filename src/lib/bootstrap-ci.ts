// Bootstrap Confidence Intervals for DealershipAI Metrics
// TypeScript implementation of bootstrap confidence interval calculation

export interface BootstrapResult {
  mean: number;
  lower: number;
  upper: number;
  confidence: number;
  sampleSize: number;
}

/**
 * Calculate bootstrap confidence interval for a dataset
 * @param data - Array of numeric values
 * @param nBoot - Number of bootstrap samples (default: 1000)
 * @param alpha - Significance level (default: 0.05 for 95% CI)
 * @returns BootstrapResult with mean, lower, upper bounds, and metadata
 */
export function bootstrapCI(
  data: number[], 
  nBoot: number = 1000, 
  alpha: number = 0.05
): BootstrapResult {
  if (data.length === 0) {
    throw new Error('Data array cannot be empty');
  }

  if (nBoot < 100) {
    throw new Error('Number of bootstrap samples must be at least 100');
  }

  // Generate bootstrap samples
  const bootstrapMeans: number[] = [];
  
  for (let i = 0; i < nBoot; i++) {
    // Sample with replacement
    const sample: number[] = [];
    for (let j = 0; j < data.length; j++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    
    // Calculate mean of bootstrap sample
    const sampleMean = sample.reduce((sum, value) => sum + value, 0) / sample.length;
    bootstrapMeans.push(sampleMean);
  }

  // Sort bootstrap means
  bootstrapMeans.sort((a, b) => a - b);

  // Calculate statistics
  const mean = bootstrapMeans.reduce((sum, value) => sum + value, 0) / bootstrapMeans.length;
  const lowerPercentile = alpha / 2;
  const upperPercentile = 1 - alpha / 2;
  
  const lowerIndex = Math.floor(lowerPercentile * bootstrapMeans.length);
  const upperIndex = Math.floor(upperPercentile * bootstrapMeans.length);
  
  const lower = bootstrapMeans[lowerIndex];
  const upper = bootstrapMeans[upperIndex];
  const confidence = (1 - alpha) * 100;

  return {
    mean,
    lower,
    upper,
    confidence,
    sampleSize: data.length
  };
}

/**
 * Calculate confidence interval for conversion rates
 * @param conversions - Number of conversions
 * @param total - Total number of visitors
 * @param nBoot - Number of bootstrap samples
 * @returns BootstrapResult for conversion rate
 */
export function conversionRateCI(
  conversions: number, 
  total: number, 
  nBoot: number = 1000
): BootstrapResult {
  if (total === 0) {
    throw new Error('Total cannot be zero');
  }

  if (conversions > total) {
    throw new Error('Conversions cannot exceed total');
  }

  // Create binary data (1 for conversion, 0 for no conversion)
  const data: number[] = [];
  for (let i = 0; i < conversions; i++) {
    data.push(1);
  }
  for (let i = 0; i < total - conversions; i++) {
    data.push(0);
  }

  return bootstrapCI(data, nBoot);
}

/**
 * Calculate confidence interval for revenue metrics
 * @param revenueData - Array of revenue values
 * @param nBoot - Number of bootstrap samples
 * @returns BootstrapResult for revenue
 */
export function revenueCI(
  revenueData: number[], 
  nBoot: number = 1000
): BootstrapResult {
  return bootstrapCI(revenueData, nBoot);
}

/**
 * Calculate confidence interval for AI visibility scores
 * @param scores - Array of AI visibility scores (0-100)
 * @param nBoot - Number of bootstrap samples
 * @returns BootstrapResult for AI visibility
 */
export function aiVisibilityCI(
  scores: number[], 
  nBoot: number = 1000
): BootstrapResult {
  // Validate scores are between 0 and 100
  const validScores = scores.filter(score => score >= 0 && score <= 100);
  
  if (validScores.length !== scores.length) {
    console.warn('Some AI visibility scores were outside 0-100 range and filtered out');
  }

  return bootstrapCI(validScores, nBoot);
}

/**
 * Calculate confidence interval for competitor rankings
 * @param rankings - Array of ranking positions (1-based)
 * @param nBoot - Number of bootstrap samples
 * @returns BootstrapResult for rankings
 */
export function rankingCI(
  rankings: number[], 
  nBoot: number = 1000
): BootstrapResult {
  return bootstrapCI(rankings, nBoot);
}

/**
 * Calculate confidence interval for review scores
 * @param reviewScores - Array of review scores (typically 1-5)
 * @param nBoot - Number of bootstrap samples
 * @returns BootstrapResult for review scores
 */
export function reviewScoreCI(
  reviewScores: number[], 
  nBoot: number = 1000
): BootstrapResult {
  return bootstrapCI(reviewScores, nBoot);
}

/**
 * Format bootstrap result for display
 * @param result - BootstrapResult
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatBootstrapResult(
  result: BootstrapResult, 
  decimals: number = 1
): string {
  const { mean, lower, upper, confidence } = result;
  
  return `${mean.toFixed(decimals)} (${confidence}% CI: ${lower.toFixed(decimals)}-${upper.toFixed(decimals)})`;
}

/**
 * Check if two confidence intervals overlap
 * @param ci1 - First confidence interval
 * @param ci2 - Second confidence interval
 * @returns True if intervals overlap
 */
export function confidenceIntervalsOverlap(
  ci1: BootstrapResult, 
  ci2: BootstrapResult
): boolean {
  return !(ci1.upper < ci2.lower || ci2.upper < ci1.lower);
}

/**
 * Calculate effect size between two groups
 * @param group1 - First group data
 * @param group2 - Second group data
 * @returns Effect size (Cohen's d approximation)
 */
export function calculateEffectSize(group1: number[], group2: number[]): number {
  const mean1 = group1.reduce((sum, val) => sum + val, 0) / group1.length;
  const mean2 = group2.reduce((sum, val) => sum + val, 0) / group2.length;
  
  const variance1 = group1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / group1.length;
  const variance2 = group2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / group2.length;
  
  const pooledStd = Math.sqrt((variance1 + variance2) / 2);
  
  return Math.abs(mean1 - mean2) / pooledStd;
}

// Example usage and testing
export const exampleUsage = {
  // AI Visibility Scores
  aiScores: [78, 82, 75, 85, 79, 81, 77, 83, 80, 76],
  
  // Conversion Rates (binary data)
  conversions: 45,
  totalVisitors: 1000,
  
  // Revenue Data
  monthlyRevenue: [15000, 18000, 16500, 22000, 19500, 21000, 17500, 23000, 20000, 18500],
  
  // Review Scores
  reviewScores: [4.2, 4.5, 4.1, 4.7, 4.3, 4.6, 4.0, 4.8, 4.4, 4.2]
};

// Test function to demonstrate usage
export function runBootstrapTests(): void {
  console.log('=== Bootstrap Confidence Interval Tests ===');
  
  try {
    // Test AI Visibility Scores
    const aiCI = aiVisibilityCI(exampleUsage.aiScores);
    console.log('AI Visibility CI:', formatBootstrapResult(aiCI));
    
    // Test Conversion Rate
    const conversionCI = conversionRateCI(exampleUsage.conversions, exampleUsage.totalVisitors);
    console.log('Conversion Rate CI:', formatBootstrapResult(conversionCI, 3));
    
    // Test Revenue
    const revenueCIResult = revenueCI(exampleUsage.monthlyRevenue);
    console.log('Revenue CI:', formatBootstrapResult(revenueCIResult, 0));
    
    // Test Review Scores
    const reviewCI = reviewScoreCI(exampleUsage.reviewScores);
    console.log('Review Score CI:', formatBootstrapResult(reviewCI, 2));
    
  } catch (error) {
    console.error('Bootstrap test error:', error);
  }
}
