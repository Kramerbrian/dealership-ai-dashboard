/**
 * Forecast Feedback Loop System
 * 
 * Self-correcting forecast feedback system integrating real recovery results
 * to continuously improve DealershipAI ROI projection accuracy.
 * 
 * Version: 3.6.3
 * Namespace: forecast.feedback.loop
 */

export interface ForecastRecord {
  forecast_id: string;
  forecast_date: string;
  forecast_window_days: number;
  predicted_roi: number;
  actual_roi: number;
  predicted_confidence: number;
  role: 'GM' | 'SM' | 'BDC' | 'Other';
}

export interface PerformanceInputs {
  actual_lead_volume: number;
  actual_close_rate: number;
  actual_avg_gross: number;
  actual_engagement_velocity: number;
  // Enhanced behavioral metrics
  alert_ack_rate?: number; // Alert acknowledgment rate (0-1)
  action_follow_through_rate?: number; // Action follow-through rate (0-1)
  avg_response_time_hours?: number; // Average response time in hours
  // Enhanced performance metrics
  DPI_trend?: number; // DPI trend change (percentage)
  LEE_change?: number; // Lead Efficiency Enhancement change (percentage)
  DLOC_reduction?: number; // Days Lost on Close reduction (dollars)
  trend_direction?: 'improving' | 'declining' | 'stable';
}

export interface FeedbackLoopInputs {
  forecast_records: ForecastRecord[];
  performance_inputs: PerformanceInputs;
  previous_confidence_score: number;
}

export interface FeedbackLoopResult {
  new_confidence_score: number;
  forecast_error: number;
  error_category: 'minor' | 'moderate' | 'major';
  adjustment_factor: number;
  behavioral_reinforcement: number;
  performance_reinforcement: number;
  contextual_decay: number;
  recommendations: string[];
}

/**
 * Calculate forecast error percentage
 */
function calculateForecastError(predicted: number, actual: number): number {
  if (predicted === 0) return 0;
  return (predicted - actual) / predicted;
}

/**
 * Calculate error weight (absolute value of error)
 */
function calculateErrorWeight(error: number): number {
  return Math.abs(error);
}

/**
 * Calculate adjustment factor based on error weight
 */
function calculateAdjustmentFactor(errorWeight: number): number {
  return 1 - (errorWeight * 0.75);
}

/**
 * Calculate behavioral reinforcement weight
 * Based on engagement velocity, alert acknowledgment, action follow-through, and response time
 */
function calculateBehavioralReinforcement(
  engagementVelocity: number,
  alertAckRate?: number,
  actionFollowThrough?: number,
  responseTimeHours?: number
): number {
  // Base weight: 0.3, scales up to 0.6 based on engagement
  const baseWeight = 0.3;
  const engagementBoost = Math.min(0.15, engagementVelocity * 10);
  
  // Alert acknowledgment rate boost (0-0.1)
  // Higher ack rate = better engagement = higher confidence
  const ackBoost = alertAckRate ? alertAckRate * 0.1 : 0;
  
  // Action follow-through boost (0-0.1)
  // Higher follow-through = better execution = higher confidence
  const followThroughBoost = actionFollowThrough ? actionFollowThrough * 0.1 : 0;
  
  // Response time boost (0-0.1)
  // Faster response = better engagement = higher confidence
  // Inverse relationship: lower hours = higher boost
  // Formula: max boost at 0 hours, decays to 0 at 24+ hours
  const responseBoost = responseTimeHours !== undefined 
    ? Math.max(0, (1 - Math.min(1, responseTimeHours / 24)) * 0.1)
    : 0;
  
  return Math.min(0.6, baseWeight + engagementBoost + ackBoost + followThroughBoost + responseBoost);
}

/**
 * Calculate performance reinforcement weight
 * Based on trend improvements, efficiency gains, and loss recovery
 */
function calculatePerformanceReinforcement(
  trendImprovement: number,
  dpiTrend?: number,
  leeChange?: number,
  dlocReduction?: number,
  trendDirection?: 'improving' | 'declining' | 'stable'
): number {
  // Base weight: 0.3, scales up to 0.5 based on performance
  const baseWeight = 0.3;
  const trendBoost = Math.min(0.1, trendImprovement * 0.2);
  
  // DPI trend boost (0-0.05)
  // Positive DPI trend = improving performance = higher confidence
  const dpiBoost = dpiTrend && dpiTrend > 0 
    ? Math.min(0.05, dpiTrend * 0.5)
    : 0;
  
  // Lead Efficiency Enhancement (LEE) boost (0-0.05)
  // Positive LEE change = better efficiency = higher confidence
  const leeBoost = leeChange && leeChange > 0
    ? Math.min(0.05, leeChange * 0.5)
    : 0;
  
  // Days Lost on Close (DLOC) reduction boost (0-0.05)
  // DLOC reduction = recovered revenue = higher confidence
  // Normalize: $20k reduction = max boost, scales down
  const dlocBoost = dlocReduction && dlocReduction > 0
    ? Math.min(0.05, (dlocReduction / 20000) * 0.05)
    : 0;
  
  // Trend direction multiplier
  // Improving = 1.0x, Stable = 0.8x, Declining = 0.5x
  const directionMultiplier = trendDirection === 'improving' ? 1.0
    : trendDirection === 'stable' ? 0.8
    : trendDirection === 'declining' ? 0.5
    : 1.0;
  
  const totalBoost = (baseWeight + trendBoost + dpiBoost + leeBoost + dlocBoost) * directionMultiplier;
  
  return Math.min(0.5, totalBoost);
}

/**
 * Categorize error severity
 */
function categorizeError(error: number): 'minor' | 'moderate' | 'major' {
  const absError = Math.abs(error);
  if (absError < 0.05) return 'minor';
  if (absError <= 0.10) return 'moderate';
  return 'major';
}

/**
 * Get adaptive response based on error category
 */
function getAdaptiveResponse(errorCategory: 'minor' | 'moderate' | 'major') {
  const responses = {
    minor: {
      tone_profile_shift: 'executive',
      roi_multiplier_adjustment: 0.02,
      recommendations: [
        'Maintain current forecast methodology',
        'Continue monitoring trends',
        'Minor calibration may be needed'
      ]
    },
    moderate: {
      tone_profile_shift: 'advisory',
      roi_multiplier_adjustment: -0.05,
      recommendations: [
        'Review forecast assumptions',
        'Check for external factors affecting ROI',
        'Consider recalibrating elasticity coefficients',
        'Validate lead volume and close rate inputs'
      ]
    },
    major: {
      tone_profile_shift: 'corrective',
      roi_multiplier_adjustment: -0.10,
      recommendations: [
        'Immediate forecast model review required',
        'Validate all input data sources',
        'Check for systemic changes in market conditions',
        'Review elasticity assumptions',
        'Consider model recalibration',
        'Engage data science team for analysis'
      ]
    }
  };
  
  return responses[errorCategory];
}

/**
 * Main feedback loop calculation
 * 
 * Integrates behavioral, performance, and contextual factors to recalibrate
 * forecast confidence based on actual vs predicted results.
 */
export function calculateFeedbackLoop(
  inputs: FeedbackLoopInputs
): FeedbackLoopResult {
  const { forecast_records, performance_inputs, previous_confidence_score } = inputs;

  if (forecast_records.length === 0) {
    return {
      new_confidence_score: previous_confidence_score,
      forecast_error: 0,
      error_category: 'minor',
      adjustment_factor: 1,
      behavioral_reinforcement: 0.3,
      performance_reinforcement: 0.3,
      contextual_decay: 0.85,
      recommendations: ['No forecast records available for feedback loop']
    };
  }

  // Calculate average forecast error across all records
  const errors = forecast_records.map(record => 
    calculateForecastError(record.predicted_roi, record.actual_roi)
  );
  const avgError = errors.reduce((sum, err) => sum + err, 0) / errors.length;
  const errorWeight = calculateErrorWeight(avgError);
  const errorCategory = categorizeError(avgError);

  // Calculate adjustment factor
  const baseAdjustmentFactor = calculateAdjustmentFactor(errorWeight);

      // Calculate behavioral reinforcement (45% influence)
      const behavioralReinforcement = calculateBehavioralReinforcement(
        performance_inputs.actual_engagement_velocity,
        performance_inputs.alert_ack_rate,
        performance_inputs.action_follow_through_rate,
        performance_inputs.avg_response_time_hours
      );

      // Calculate performance reinforcement (40% influence)
      // Estimate trend improvement from actual vs predicted
      const trendImprovement = 1 - errorWeight; // Inverse of error
      const performanceReinforcement = calculatePerformanceReinforcement(
        trendImprovement,
        performance_inputs.DPI_trend,
        performance_inputs.LEE_change,
        performance_inputs.DLOC_reduction,
        performance_inputs.trend_direction
      );

  // Contextual decay (15% influence)
  const contextualDecay = 0.85;

  // Weighted confidence adjustment
  const behavioralAdjustment = behavioralReinforcement * 0.45;
  const performanceAdjustment = performanceReinforcement * 0.40;
  const contextualAdjustment = contextualDecay * 0.15;
  
  const weightedAdjustment = behavioralAdjustment + performanceAdjustment + contextualAdjustment;
  const adjustmentFactor = baseAdjustmentFactor * weightedAdjustment;

  // Calculate new confidence score
  const newConfidenceScore = Math.max(0, Math.min(1, previous_confidence_score * adjustmentFactor));

  // Get adaptive response recommendations
  const adaptiveResponse = getAdaptiveResponse(errorCategory);
  const recommendations = [
    ...adaptiveResponse.recommendations,
    `Forecast error: ${(avgError * 100).toFixed(2)}%`,
    `Confidence adjusted from ${(previous_confidence_score * 100).toFixed(1)}% to ${(newConfidenceScore * 100).toFixed(1)}%`,
    `Behavioral reinforcement: ${(behavioralReinforcement * 100).toFixed(1)}%`,
    `Performance reinforcement: ${(performanceReinforcement * 100).toFixed(1)}%`
  ];

  return {
    new_confidence_score: newConfidenceScore,
    forecast_error: avgError,
    error_category: errorCategory,
    adjustment_factor: adjustmentFactor,
    behavioral_reinforcement: behavioralReinforcement,
    performance_reinforcement: performanceReinforcement,
    contextual_decay: contextualDecay,
    recommendations
  };
}

/**
 * Calculate ROI from performance inputs
 */
export function calculateActualROI(inputs: PerformanceInputs): number {
  const { actual_lead_volume, actual_close_rate, actual_avg_gross } = inputs;
  return actual_lead_volume * actual_close_rate * actual_avg_gross;
}

/**
 * Batch process multiple forecast records
 */
export function processForecastFeedbackBatch(
  records: ForecastRecord[],
  performanceInputs: PerformanceInputs,
  initialConfidence: number = 0.89
): FeedbackLoopResult {
  return calculateFeedbackLoop({
    forecast_records: records,
    performance_inputs: performanceInputs,
    previous_confidence_score: initialConfidence
  });
}

