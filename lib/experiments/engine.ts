/**
 * A/B Testing Experiments Framework
 *
 * Enables controlled rollout of new features, themes, and copilot behaviors
 * with statistical significance testing and automatic rollback on negative impact.
 *
 * Phase 3: Context + Copilot Evolution - Week 2
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  target: 'theme' | 'copilot' | 'feature' | 'ui';
  status: 'draft' | 'running' | 'paused' | 'completed' | 'rolled_back';
  variants: ExperimentVariant[];
  traffic_split: number; // 0-100 percentage of users in experiment
  start_date?: string;
  end_date?: string;
  winning_variant?: string;
  created_at: string;
  updated_at: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  is_control: boolean;
  allocation: number; // 0-100 percentage within experiment
  config: Record<string, any>; // Variant-specific configuration
}

export interface ExperimentAssignment {
  experiment_id: string;
  variant_id: string;
  user_id: string;
  dealer_id?: string;
  assigned_at: string;
}

export interface ExperimentMetric {
  experiment_id: string;
  variant_id: string;
  metric_name: string;
  value: number;
  user_id: string;
  dealer_id?: string;
  timestamp: string;
}

export interface ExperimentResult {
  experiment_id: string;
  variant_id: string;
  variant_name: string;
  is_control: boolean;
  metrics: {
    [key: string]: {
      mean: number;
      stddev: number;
      count: number;
      confidence_interval: [number, number];
    };
  };
  statistical_significance: {
    [key: string]: {
      p_value: number;
      is_significant: boolean; // p < 0.05
      lift: number; // percentage improvement over control
    };
  };
}

/**
 * Assign a user to an experiment variant
 *
 * Uses consistent hashing to ensure same user always gets same variant
 * during the experiment duration.
 */
export function assignVariant(
  experiment: Experiment,
  userId: string
): ExperimentVariant | null {
  // Check if user should be in experiment based on traffic split
  const userHash = hashString(userId);
  const isInExperiment = (userHash % 100) < experiment.traffic_split;

  if (!isInExperiment) {
    return null; // User not in experiment
  }

  // Assign to variant based on allocation
  const variantHash = hashString(`${experiment.id}-${userId}`);
  let cumulative = 0;

  for (const variant of experiment.variants) {
    cumulative += variant.allocation;
    if ((variantHash % 100) < cumulative) {
      return variant;
    }
  }

  // Fallback to control
  return experiment.variants.find(v => v.is_control) || experiment.variants[0];
}

/**
 * Get active variant for a user (from cache or assignment)
 */
export function getActiveVariant(
  experiment: Experiment,
  userId: string,
  cachedAssignment?: ExperimentAssignment
): ExperimentVariant | null {
  // Use cached assignment if available
  if (cachedAssignment && cachedAssignment.experiment_id === experiment.id) {
    return experiment.variants.find(v => v.id === cachedAssignment.variant_id) || null;
  }

  // Otherwise, assign new variant
  return assignVariant(experiment, userId);
}

/**
 * Track experiment metric (conversion, engagement, etc.)
 */
export async function trackMetric(
  experimentId: string,
  variantId: string,
  userId: string,
  metricName: string,
  value: number,
  dealerId?: string
): Promise<void> {
  const metric: ExperimentMetric = {
    experiment_id: experimentId,
    variant_id: variantId,
    metric_name: metricName,
    value,
    user_id: userId,
    dealer_id: dealerId,
    timestamp: new Date().toISOString(),
  };

  // TODO: Send to analytics backend
  // await fetch('/api/experiments/metrics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(metric),
  // });

  console.log('[experiments] Tracked metric:', metric);
}

/**
 * Calculate experiment results with statistical significance
 */
export function calculateResults(
  experiment: Experiment,
  metrics: ExperimentMetric[]
): ExperimentResult[] {
  const results: ExperimentResult[] = [];

  for (const variant of experiment.variants) {
    const variantMetrics = metrics.filter(m => m.variant_id === variant.id);

    // Group by metric name
    const metricGroups = groupBy(variantMetrics, 'metric_name');

    const variantStats: ExperimentResult['metrics'] = {};

    for (const [metricName, metricValues] of Object.entries(metricGroups)) {
      const values = metricValues.map(m => m.value);
      const mean = calculateMean(values);
      const stddev = calculateStdDev(values);
      const ci = calculateConfidenceInterval(values);

      variantStats[metricName] = {
        mean,
        stddev,
        count: values.length,
        confidence_interval: ci,
      };
    }

    results.push({
      experiment_id: experiment.id,
      variant_id: variant.id,
      variant_name: variant.name,
      is_control: variant.is_control,
      metrics: variantStats,
      statistical_significance: {},
    });
  }

  // Calculate statistical significance vs control
  const control = results.find(r => r.is_control);
  if (control) {
    for (const result of results) {
      if (result.is_control) continue;

      result.statistical_significance = {};

      for (const metricName of Object.keys(result.metrics)) {
        const controlMetric = control.metrics[metricName];
        const variantMetric = result.metrics[metricName];

        if (!controlMetric || !variantMetric) continue;

        // Simple t-test approximation
        const pValue = calculateTTest(
          controlMetric.mean,
          controlMetric.stddev,
          controlMetric.count,
          variantMetric.mean,
          variantMetric.stddev,
          variantMetric.count
        );

        const lift = ((variantMetric.mean - controlMetric.mean) / controlMetric.mean) * 100;

        result.statistical_significance[metricName] = {
          p_value: pValue,
          is_significant: pValue < 0.05,
          lift,
        };
      }
    }
  }

  return results;
}

/**
 * Determine if experiment should be auto-rolled-back due to negative impact
 */
export function shouldRollback(results: ExperimentResult[]): boolean {
  const control = results.find(r => r.is_control);
  if (!control) return false;

  for (const result of results) {
    if (result.is_control) continue;

    // Check for statistically significant negative impact on key metrics
    for (const [metricName, sig] of Object.entries(result.statistical_significance)) {
      // Critical metrics (conversion, engagement, trust)
      const isCriticalMetric = ['conversion', 'engagement', 'trust_score', 'aiv'].includes(metricName);

      if (isCriticalMetric && sig.is_significant && sig.lift < -5) {
        // Significant negative impact (>5% decline)
        return true;
      }
    }
  }

  return false;
}

// --- Helper Functions ---

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function calculateConfidenceInterval(values: number[]): [number, number] {
  if (values.length === 0) return [0, 0];
  const mean = calculateMean(values);
  const stddev = calculateStdDev(values);
  const margin = 1.96 * (stddev / Math.sqrt(values.length)); // 95% CI
  return [mean - margin, mean + margin];
}

function calculateTTest(
  mean1: number,
  stddev1: number,
  n1: number,
  mean2: number,
  stddev2: number,
  n2: number
): number {
  if (n1 === 0 || n2 === 0) return 1;

  // Welch's t-test
  const variance1 = Math.pow(stddev1, 2);
  const variance2 = Math.pow(stddev2, 2);

  const t = (mean1 - mean2) / Math.sqrt(variance1 / n1 + variance2 / n2);

  // Approximate p-value (simplified - use proper stats library in production)
  // This is a rough approximation; consider using jstat or similar
  const absT = Math.abs(t);

  if (absT > 2.576) return 0.01; // p < 0.01
  if (absT > 1.96) return 0.05;  // p < 0.05
  if (absT > 1.645) return 0.10; // p < 0.10
  return 0.5; // Not significant
}

/**
 * Create a new experiment
 */
export function createExperiment(
  name: string,
  description: string,
  target: Experiment['target'],
  variants: Array<{
    name: string;
    description: string;
    is_control: boolean;
    allocation: number;
    config: Record<string, any>;
  }>,
  trafficSplit: number = 100
): Experiment {
  // Validate allocations sum to 100
  const totalAllocation = variants.reduce((sum, v) => sum + v.allocation, 0);
  if (Math.abs(totalAllocation - 100) > 0.01) {
    throw new Error(`Variant allocations must sum to 100, got ${totalAllocation}`);
  }

  // Ensure exactly one control
  const controlCount = variants.filter(v => v.is_control).length;
  if (controlCount !== 1) {
    throw new Error(`Experiment must have exactly one control variant, got ${controlCount}`);
  }

  const now = new Date().toISOString();

  return {
    id: generateId(),
    name,
    description,
    target,
    status: 'draft',
    variants: variants.map(v => ({
      id: generateId(),
      ...v,
    })),
    traffic_split: trafficSplit,
    created_at: now,
    updated_at: now,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
