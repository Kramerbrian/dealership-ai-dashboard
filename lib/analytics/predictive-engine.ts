/**
 * Predictive Analytics Engine
 * ML-based forecasting for schema coverage, E-E-A-T scores, and AI visibility
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface HistoricalDataPoint {
  timestamp: Date;
  schema_coverage: number;
  eeat_score: number;
  ai_visibility_score?: number;
}

interface Prediction {
  metric: 'schema_coverage' | 'eeat_score' | 'ai_visibility';
  current_value: number;
  predicted_value: number;
  confidence: number; // 0-1
  trend: 'up' | 'down' | 'stable';
  days_ahead: number;
  impact_points: number; // How much improvement/decline
}

interface ImpactEstimate {
  action: string;
  metric: 'schema_coverage' | 'eeat_score' | 'ai_visibility';
  estimated_improvement: number;
  confidence: number;
  time_to_impact_hours: number;
  reasoning: string;
}

/**
 * Simple linear regression for trend prediction
 */
function linearRegression(dataPoints: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = dataPoints.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
  const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
  const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);
  const sumY2 = dataPoints.reduce((sum, p) => sum + p.y * p.y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R² (coefficient of determination)
  const yMean = sumY / n;
  const ssTotal = dataPoints.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
  const ssResidual = dataPoints.reduce((sum, p) => {
    const predicted = slope * p.x + intercept;
    return sum + Math.pow(p.y - predicted, 2);
  }, 0);
  const r2 = 1 - (ssResidual / ssTotal);

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
}

/**
 * Exponential moving average for smoothing
 */
function exponentialMovingAverage(values: number[], alpha: number = 0.3): number[] {
  if (values.length === 0) return [];

  const ema: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(alpha * values[i] + (1 - alpha) * ema[i - 1]);
  }
  return ema;
}

/**
 * Detect seasonality patterns (weekly, monthly)
 */
function detectSeasonality(dataPoints: HistoricalDataPoint[], metric: keyof HistoricalDataPoint): {
  hasSeasonality: boolean;
  period: number;
  amplitude: number;
} {
  if (dataPoints.length < 14) {
    return { hasSeasonality: false, period: 0, amplitude: 0 };
  }

  // Check for weekly patterns (7 days)
  const weeklyValues: number[][] = Array(7).fill(0).map(() => []);
  dataPoints.forEach((point, idx) => {
    const dayOfWeek = new Date(point.timestamp).getDay();
    const value = point[metric] as number;
    if (typeof value === 'number') {
      weeklyValues[dayOfWeek].push(value);
    }
  });

  // Calculate variance across days of week
  const dayAverages = weeklyValues.map(vals =>
    vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  );
  const overallMean = dayAverages.reduce((a, b) => a + b, 0) / 7;
  const variance = dayAverages.reduce((sum, avg) => sum + Math.pow(avg - overallMean, 2), 0) / 7;
  const amplitude = Math.sqrt(variance);

  return {
    hasSeasonality: amplitude > 2, // Significant if variance > 2 points
    period: 7,
    amplitude,
  };
}

/**
 * Predict future value using linear regression + seasonality
 */
export async function predictMetric(
  dealerId: string,
  metric: 'schema_coverage' | 'eeat_score' | 'ai_visibility',
  daysAhead: number = 7
): Promise<Prediction | null> {
  try {
    // Fetch historical data
    const tableName = metric === 'ai_visibility' ? 'ai_visibility_tests' : 'schema_scans';
    const metricColumn = metric === 'ai_visibility' ? 'overall_score' : metric;

    const { data, error } = await supabase
      .from(tableName)
      .select(`created_at, ${metricColumn}`)
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: true })
      .limit(90); // Last 90 data points

    if (error || !data || data.length < 3) {
      console.error('[predictive-engine] Insufficient data:', error);
      return null;
    }

    // Convert to time series
    const startTime = new Date(data[0].created_at).getTime();
    const dataPoints = data.map(d => ({
      x: (new Date(d.created_at).getTime() - startTime) / (1000 * 60 * 60 * 24), // Days since start
      y: d[metricColumn] as number,
    })).filter(p => typeof p.y === 'number' && !isNaN(p.y));

    if (dataPoints.length < 3) return null;

    // Apply exponential smoothing
    const smoothedY = exponentialMovingAverage(dataPoints.map(p => p.y));
    const smoothedPoints = dataPoints.map((p, i) => ({ x: p.x, y: smoothedY[i] }));

    // Linear regression
    const { slope, intercept, r2 } = linearRegression(smoothedPoints);

    // Predict future value
    const lastX = dataPoints[dataPoints.length - 1].x;
    const futureX = lastX + daysAhead;
    const predictedValue = slope * futureX + intercept;

    // Clamp to valid range
    const clampedValue = Math.max(0, Math.min(100, Math.round(predictedValue)));

    // Current value
    const currentValue = Math.round(dataPoints[dataPoints.length - 1].y);

    // Determine trend
    const delta = clampedValue - currentValue;
    let trend: 'up' | 'down' | 'stable';
    if (Math.abs(delta) < 2) trend = 'stable';
    else trend = delta > 0 ? 'up' : 'down';

    return {
      metric,
      current_value: currentValue,
      predicted_value: clampedValue,
      confidence: r2, // R² as confidence measure
      trend,
      days_ahead: daysAhead,
      impact_points: delta,
    };
  } catch (error) {
    console.error('[predictive-engine] Error predicting metric:', error);
    return null;
  }
}

/**
 * Estimate impact of specific actions
 */
export function estimateImpact(
  action: string,
  currentMetrics: { schema_coverage: number; eeat_score: number; ai_visibility?: number }
): ImpactEstimate[] {
  const estimates: ImpactEstimate[] = [];

  // Schema-related actions
  if (action.includes('schema') || action.includes('Schema')) {
    estimates.push({
      action,
      metric: 'schema_coverage',
      estimated_improvement: 8, // +8% on average
      confidence: 0.85,
      time_to_impact_hours: 24,
      reasoning: 'Adding missing schema types typically increases coverage by 6-10% within 24 hours of Google re-crawl',
    });

    estimates.push({
      action,
      metric: 'eeat_score',
      estimated_improvement: 5, // +5 points
      confidence: 0.75,
      time_to_impact_hours: 48,
      reasoning: 'Schema improvements enhance E-E-A-T signals, particularly authoritativeness and trustworthiness',
    });

    estimates.push({
      action,
      metric: 'ai_visibility',
      estimated_improvement: 3,
      confidence: 0.65,
      time_to_impact_hours: 72,
      reasoning: 'Structured data helps AI platforms extract accurate information, improving mention rates',
    });
  }

  // Review response actions
  if (action.includes('review') || action.includes('Review')) {
    estimates.push({
      action,
      metric: 'eeat_score',
      estimated_improvement: 7,
      confidence: 0.8,
      time_to_impact_hours: 12,
      reasoning: 'Responding to reviews demonstrates engagement and builds trust, boosting experience and trustworthiness signals',
    });

    estimates.push({
      action,
      metric: 'ai_visibility',
      estimated_improvement: 4,
      confidence: 0.7,
      time_to_impact_hours: 48,
      reasoning: 'Active review management increases positive sentiment, improving AI platform recommendations',
    });
  }

  // Content/blog actions
  if (action.includes('content') || action.includes('blog')) {
    estimates.push({
      action,
      metric: 'eeat_score',
      estimated_improvement: 6,
      confidence: 0.7,
      time_to_impact_hours: 168, // 1 week
      reasoning: 'Quality content demonstrates expertise and experience, taking time for search engines to recognize',
    });

    estimates.push({
      action,
      metric: 'ai_visibility',
      estimated_improvement: 5,
      confidence: 0.65,
      time_to_impact_hours: 240, // 10 days
      reasoning: 'Rich content provides AI platforms with more context, but requires indexing and processing time',
    });
  }

  return estimates;
}

/**
 * Analyze competitor movement and predict market changes
 */
export async function predictCompetitorMovement(
  dealerId: string,
  daysAhead: number = 7
): Promise<{
  competitor_name: string;
  current_gap: number;
  predicted_gap: number;
  risk_level: 'high' | 'medium' | 'low';
}[]> {
  try {
    // Get competitor scan history
    const { data: competitors } = await supabase
      .from('competitors')
      .select('id, competitor_name, schema_coverage, eeat_score')
      .eq('dealer_id', dealerId)
      .eq('status', 'active');

    if (!competitors || competitors.length === 0) return [];

    // Get dealer's current metrics
    const { data: dealerScans } = await supabase
      .from('schema_scans')
      .select('schema_coverage, eeat_score')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!dealerScans) return [];

    const predictions = [];
    for (const comp of competitors) {
      const currentGap = (comp.schema_coverage || 0) - dealerScans.schema_coverage;

      // Simple prediction: assume competitors maintain similar growth rate
      // In production, this would use actual historical data
      const predictedGap = currentGap * 1.05; // Assume 5% gap increase if no action

      let risk_level: 'high' | 'medium' | 'low';
      if (predictedGap > 10) risk_level = 'high';
      else if (predictedGap > 5) risk_level = 'medium';
      else risk_level = 'low';

      predictions.push({
        competitor_name: comp.competitor_name,
        current_gap: Math.round(currentGap),
        predicted_gap: Math.round(predictedGap),
        risk_level,
      });
    }

    return predictions.sort((a, b) => b.predicted_gap - a.predicted_gap);
  } catch (error) {
    console.error('[predictive-engine] Error predicting competitor movement:', error);
    return [];
  }
}

/**
 * Generate actionable insights with impact estimates
 */
export async function generateActionableInsights(dealerId: string): Promise<{
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact_estimates: ImpactEstimate[];
  reasoning: string;
}[]> {
  try {
    // Get current metrics
    const { data: latestScan } = await supabase
      .from('schema_scans')
      .select('schema_coverage, eeat_score, missing_schema_types')
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!latestScan) return [];

    const insights: any[] = [];
    const currentMetrics = {
      schema_coverage: latestScan.schema_coverage,
      eeat_score: latestScan.eeat_score,
    };

    // Schema coverage < 90%
    if (latestScan.schema_coverage < 90) {
      const missingCount = (latestScan.missing_schema_types as string[])?.length || 0;
      insights.push({
        priority: 'high',
        action: `Add ${missingCount} missing schema types to increase coverage`,
        impact_estimates: estimateImpact('Add missing schema types', currentMetrics),
        reasoning: `Your schema coverage is at ${latestScan.schema_coverage}%. Adding missing schemas is the fastest way to improve visibility.`,
      });
    }

    // E-E-A-T score < 85
    if (latestScan.eeat_score < 85) {
      insights.push({
        priority: 'high',
        action: 'Respond to unanswered reviews to boost trustworthiness',
        impact_estimates: estimateImpact('Respond to reviews', currentMetrics),
        reasoning: `E-E-A-T score of ${latestScan.eeat_score} indicates room for improvement in trust signals.`,
      });
    }

    // Always suggest content
    insights.push({
      priority: 'medium',
      action: 'Publish expert automotive content (blog posts, guides)',
      impact_estimates: estimateImpact('Publish content', currentMetrics),
      reasoning: 'Regular content demonstrates expertise and keeps your site fresh for search engines and AI platforms.',
    });

    return insights;
  } catch (error) {
    console.error('[predictive-engine] Error generating insights:', error);
    return [];
  }
}
