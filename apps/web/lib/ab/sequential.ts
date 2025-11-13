/**
 * Sequential Testing Implementation
 * SPRT (Sequential Probability Ratio Test) and Alpha-Spending for early stopping
 */

export interface SequentialTestParams {
  alpha: number;           // Overall significance level
  power: number;           // Target power
  baseline: number;        // Baseline conversion rate
  alternative: number;     // Alternative hypothesis rate
  maxSampleSize: number;   // Maximum sample size before forced stop
}

export interface SequentialTestResult {
  shouldStop: boolean;
  decision: 'continue' | 'reject_null' | 'accept_null' | 'inconclusive';
  currentSampleSize: number;
  testStatistic: number;
  criticalValue: number;
  pValue: number;
  alphaSpent: number;
  powerAchieved: number;
}

export interface AlphaSpendingFunction {
  (t: number, alpha: number): number; // t = information fraction, alpha = total alpha
}

/**
 * O'Brien-Fleming alpha spending function
 * More conservative early stopping, allows more looks
 */
export function obrienFlemingAlphaSpending(t: number, alpha: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return alpha;
  
  // O'Brien-Fleming boundary
  const zAlpha = 2.796; // For alpha = 0.05
  const boundary = zAlpha / Math.sqrt(t);
  
  // Convert to alpha spent
  return 2 * (1 - normalCDF(boundary));
}

/**
 * Pocock alpha spending function
 * More liberal early stopping, fewer looks
 */
export function pocockAlphaSpending(t: number, alpha: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return alpha;
  
  // Pocock boundary (approximate)
  const zAlpha = 2.178; // For alpha = 0.05
  return alpha * t;
}

/**
 * Calculate sequential test decision
 * @param params Test parameters
 * @param currentData Current test data
 * @param alphaSpending Alpha spending function
 * @returns Sequential test result
 */
export function calculateSequentialTest(
  params: SequentialTestParams,
  currentData: {
    controlConversions: number;
    controlTrials: number;
    treatmentConversions: number;
    treatmentTrials: number;
  },
  alphaSpending: AlphaSpendingFunction = obrienFlemingAlphaSpending
): SequentialTestResult {
  const { alpha, power, baseline, alternative, maxSampleSize } = params;
  const { controlConversions, controlTrials, treatmentConversions, treatmentTrials } = currentData;
  
  const totalTrials = controlTrials + treatmentTrials;
  const informationFraction = totalTrials / maxSampleSize;
  
  // Calculate alpha spent so far
  const alphaSpent = alphaSpending(informationFraction, alpha);
  
  // Calculate test statistic (log-likelihood ratio)
  const p1 = controlConversions / controlTrials;
  const p2 = treatmentConversions / treatmentTrials;
  const pPooled = (controlConversions + treatmentConversions) / totalTrials;
  
  // Log-likelihood ratio
  const llr = calculateLogLikelihoodRatio(p1, p2, pPooled, controlTrials, treatmentTrials);
  
  // Critical value for current alpha spent
  const criticalValue = Math.sqrt(2 * alphaSpent);
  
  // Decision logic
  let decision: 'continue' | 'reject_null' | 'accept_null' | 'inconclusive';
  let shouldStop = false;
  
  if (Math.abs(llr) >= criticalValue) {
    if (llr > 0) {
      decision = 'reject_null';
    } else {
      decision = 'accept_null';
    }
    shouldStop = true;
  } else if (totalTrials >= maxSampleSize) {
    decision = 'inconclusive';
    shouldStop = true;
  } else {
    decision = 'continue';
  }
  
  // Calculate p-value (approximate)
  const pValue = 2 * (1 - normalCDF(Math.abs(llr) / Math.sqrt(2)));
  
  // Calculate achieved power
  const powerAchieved = calculateAchievedPower(
    baseline, alternative, controlTrials, treatmentTrials, alphaSpent
  );

    return {
    shouldStop,
      decision,
    currentSampleSize: totalTrials,
    testStatistic: llr,
    criticalValue,
      pValue,
    alphaSpent,
    powerAchieved
    };
  }

  /**
 * Calculate log-likelihood ratio for sequential testing
 */
function calculateLogLikelihoodRatio(
  p1: number,
  p2: number,
  pPooled: number,
  n1: number,
  n2: number
): number {
  // Avoid log(0) issues
  const eps = 1e-10;
  p1 = Math.max(eps, Math.min(1 - eps, p1));
  p2 = Math.max(eps, Math.min(1 - eps, p2));
  pPooled = Math.max(eps, Math.min(1 - eps, pPooled));
  
  const ll1 = n1 * (p1 * Math.log(p1) + (1 - p1) * Math.log(1 - p1));
  const ll2 = n2 * (p2 * Math.log(p2) + (1 - p2) * Math.log(1 - p2));
  const llPooled = (n1 + n2) * (pPooled * Math.log(pPooled) + (1 - pPooled) * Math.log(1 - pPooled));
  
  return ll1 + ll2 - llPooled;
}

/**
 * Calculate achieved power for current sample size
 */
function calculateAchievedPower(
  baseline: number,
  alternative: number,
  n1: number,
  n2: number,
  alphaSpent: number
): number {
  const effectSize = Math.abs(alternative - baseline);
  const se = Math.sqrt(baseline * (1 - baseline) * (1/n1 + 1/n2));
  const zAlpha = Math.sqrt(2 * alphaSpent);
  const zPower = (effectSize - zAlpha * se) / se;
  
  return Math.max(0, Math.min(1, normalCDF(zPower)));
}

/**
 * Approximate normal CDF using error function
 */
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Approximate error function
 */
function erf(x: number): number {
  // Abramowitz and Stegun approximation
  const a1 =  0.254829592;
    const a2 = -0.284496736;
  const a3 =  1.421413741;
    const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
}

/**
 * Calculate optimal stopping boundaries for sequential test
 * @param params Test parameters
 * @param alphaSpending Alpha spending function
 * @returns Array of stopping boundaries by information fraction
 */
export function calculateStoppingBoundaries(
  params: SequentialTestParams,
  alphaSpending: AlphaSpendingFunction = obrienFlemingAlphaSpending
): Array<{ informationFraction: number; criticalValue: number; alphaSpent: number }> {
  const boundaries = [];
  const maxLooks = 10; // Maximum number of interim looks
  
  for (let i = 1; i <= maxLooks; i++) {
    const informationFraction = i / maxLooks;
    const alphaSpent = alphaSpending(informationFraction, params.alpha);
    const criticalValue = Math.sqrt(2 * alphaSpent);
    
    boundaries.push({
      informationFraction,
      criticalValue,
      alphaSpent
    });
  }
  
  return boundaries;
}