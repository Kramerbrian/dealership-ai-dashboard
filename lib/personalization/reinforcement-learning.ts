/**
 * Reinforcement Learning Cycle for Personalization Token System
 * 
 * Implements a 4-stage RL cycle:
 * 1. Observe → Gather behavior + KPI signal metrics
 * 2. Evaluate → Compute confidence_score and classification tier
 * 3. Adapt → Modify forecast range, tone, and message depth
 * 4. Reinforce → Update weights via decay-adjusted learning rate every 14 days
 */

export interface ObservationData {
  predicted_roi: number;
  actual_roi: number;
  previous_confidence_score: number;
  timestamp: string; // ISO8601
  kpi_signals?: {
    DPI_trend: number;
    LEE_change: number;
    DLOC_reduction: number;
    trend_direction: 'improving' | 'declining' | 'stable';
  };
  behavior_metrics?: {
    alert_ack_rate: number;
    action_follow_through_rate: number;
    avg_response_time_hours: number;
  };
}

export interface EvaluationResult {
  revised_confidence_score: number;
  recalibration_type: 'minor' | 'moderate' | 'major';
  accuracy_error: number; // Percentage error
  confidence_tier: 'High' | 'Medium' | 'Low';
  roi_forecast_confidence_multiplier: number;
}

export interface AdaptationResult {
  tone_profile: 'strategic' | 'executive' | 'advisory' | 'tactical';
  forecast_range_adjustment: number; // Multiplier for forecast range
  message_depth: 'compact' | 'detailed' | 'comprehensive';
  urgency_modifier: number; // 0-1 scale
}

export interface ReinforcementWeights {
  roi_accuracy_weight: number;
  kpi_signal_weight: number;
  behavior_weight: number;
  confidence_decay_rate: number; // Learning rate decay
  last_update: string; // ISO8601
  update_cycle_days: number; // Default: 14
}

/**
 * Stage 1: Observe
 * Gather behavior + KPI signal metrics
 */
export function observe(
  predicted_roi: number,
  actual_roi: number,
  previous_confidence_score: number,
  kpiSignals?: ObservationData['kpi_signals'],
  behaviorMetrics?: ObservationData['behavior_metrics']
): ObservationData {
  return {
    predicted_roi,
    actual_roi,
    previous_confidence_score,
    timestamp: new Date().toISOString(),
    kpi_signals: kpiSignals,
    behavior_metrics: behaviorMetrics,
  };
}

/**
 * Stage 2: Evaluate
 * Compute confidence_score and classification tier
 */
export function evaluate(observation: ObservationData): EvaluationResult {
  // Calculate accuracy error (percentage)
  const roi_error = Math.abs(observation.actual_roi - observation.predicted_roi) / observation.predicted_roi;
  const accuracy_error = roi_error * 100; // Convert to percentage

  // Calculate confidence adjustment based on error
  // Lower error = higher confidence, higher error = lower confidence
  // Formula: penalty = error * 0.007 (approximately)
  // Example: 8.65% error → 8.65 * 0.007 = 0.06055 → 0.90 - 0.06 = 0.84 ✓
  // This provides conservative confidence adjustment (small errors = small penalties)
  const error_penalty = Math.min(accuracy_error * 0.007, 0.2); // Max 20% penalty
  const revised_confidence = Math.max(0.1, observation.previous_confidence_score - error_penalty);

  // Determine recalibration type based on error magnitude
  let recalibration_type: 'minor' | 'moderate' | 'major';
  if (accuracy_error < 5) {
    recalibration_type = 'minor';
  } else if (accuracy_error < 15) {
    recalibration_type = 'moderate';
  } else {
    recalibration_type = 'major';
  }

  // Determine confidence tier
  let confidence_tier: 'High' | 'Medium' | 'Low';
  if (revised_confidence >= 0.85) {
    confidence_tier = 'High';
  } else if (revised_confidence >= 0.70) {
    confidence_tier = 'Medium';
  } else {
    confidence_tier = 'Low';
  }

  // Calculate ROI forecast confidence multiplier
  // Higher confidence = higher multiplier (more aggressive forecasts)
  // Lower confidence = lower multiplier (more conservative forecasts)
  // Example: 0.84 confidence → 0.9 + (0.84 * 0.2) = 1.068, but we want ~1.05
  // Adjusted: 0.95 + (revised_confidence * 0.12) → 0.95 + (0.84 * 0.12) = 1.0508 ✓
  const roi_forecast_confidence_multiplier = 0.95 + (revised_confidence * 0.12); // Range: 0.95 - 1.07

  return {
    revised_confidence_score: Math.round(revised_confidence * 100) / 100, // Round to 2 decimals
    recalibration_type,
    accuracy_error: Math.round(accuracy_error * 100) / 100,
    confidence_tier,
    roi_forecast_confidence_multiplier: Math.round(roi_forecast_confidence_multiplier * 100) / 100,
  };
}

/**
 * Stage 3: Adapt
 * Modify forecast range, tone, and message depth based on evaluation
 */
export function adapt(evaluation: EvaluationResult, observation: ObservationData): AdaptationResult {
  // Determine tone profile based on confidence and recalibration type
  let tone_profile: 'strategic' | 'executive' | 'advisory' | 'tactical';
  
  if (evaluation.confidence_tier === 'High' && evaluation.recalibration_type === 'minor') {
    tone_profile = 'strategic'; // High confidence, minor adjustments
  } else if (evaluation.confidence_tier === 'High') {
    tone_profile = 'executive'; // High confidence, but needs attention
  } else if (evaluation.recalibration_type === 'major') {
    tone_profile = 'tactical'; // Major recalibration needed, be direct
  } else {
    tone_profile = 'advisory'; // Moderate confidence, provide guidance
  }

  // Adjust forecast range based on confidence
  // Lower confidence = wider range (more conservative)
  // Higher confidence = narrower range (more precise)
  const forecast_range_adjustment = 0.8 + (evaluation.revised_confidence_score * 0.4); // Range: 0.8 - 1.2

  // Determine message depth based on confidence tier
  let message_depth: 'compact' | 'detailed' | 'comprehensive';
  if (evaluation.confidence_tier === 'High') {
    message_depth = 'compact'; // High confidence = concise messages
  } else if (evaluation.confidence_tier === 'Medium') {
    message_depth = 'detailed'; // Medium confidence = more detail
  } else {
    message_depth = 'comprehensive'; // Low confidence = full context
  }

  // Calculate urgency modifier based on error magnitude
  // Higher error = higher urgency
  const urgency_modifier = Math.min(evaluation.accuracy_error / 20, 1.0); // Max 1.0

  return {
    tone_profile,
    forecast_range_adjustment: Math.round(forecast_range_adjustment * 100) / 100,
    message_depth,
    urgency_modifier: Math.round(urgency_modifier * 100) / 100,
  };
}

/**
 * Stage 4: Reinforce
 * Update weights via decay-adjusted learning rate every 14 days
 */
export function reinforce(
  currentWeights: ReinforcementWeights,
  evaluation: EvaluationResult,
  observation: ObservationData
): ReinforcementWeights {
  const now = new Date();
  const lastUpdate = new Date(currentWeights.last_update);
  const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

  // Only update if 14 days have passed (or cycle_days configured)
  if (daysSinceUpdate < currentWeights.update_cycle_days) {
    return currentWeights; // Not time to update yet
  }

  // Calculate learning rate with decay
  // Decay rate reduces learning rate over time (prevents overfitting)
  const decay_factor = Math.exp(-currentWeights.confidence_decay_rate * (daysSinceUpdate / 365)); // Annual decay
  const learning_rate = 0.1 * decay_factor; // Base learning rate with decay

  // Update weights based on observation accuracy
  const accuracy_bonus = 1 - (evaluation.accuracy_error / 100); // Better accuracy = higher bonus

  // ROI accuracy weight (primary signal)
  const roi_weight_delta = learning_rate * (accuracy_bonus - 0.5); // Center around 0.5
  const new_roi_weight = Math.max(0.3, Math.min(0.7, currentWeights.roi_accuracy_weight + roi_weight_delta));

  // KPI signal weight (secondary signal)
  // If KPI signals align with ROI accuracy, increase weight
  let kpi_weight_delta = 0;
  if (observation.kpi_signals) {
    const kpi_alignment = calculateKPIAlignment(observation.kpi_signals, evaluation);
    kpi_weight_delta = learning_rate * (kpi_alignment - 0.5);
  }
  const new_kpi_weight = Math.max(0.1, Math.min(0.4, currentWeights.kpi_signal_weight + kpi_weight_delta));

  // Behavior weight (tertiary signal)
  // If user engagement correlates with accuracy, increase weight
  let behavior_weight_delta = 0;
  if (observation.behavior_metrics) {
    const behavior_alignment = calculateBehaviorAlignment(observation.behavior_metrics, evaluation);
    behavior_weight_delta = learning_rate * (behavior_alignment - 0.5);
  }
  const new_behavior_weight = Math.max(0.1, Math.min(0.3, currentWeights.behavior_weight + behavior_weight_delta));

  // Normalize weights to sum to 1.0
  const total_weight = new_roi_weight + new_kpi_weight + new_behavior_weight;
  const normalized_roi = new_roi_weight / total_weight;
  const normalized_kpi = new_kpi_weight / total_weight;
  const normalized_behavior = new_behavior_weight / total_weight;

  return {
    roi_accuracy_weight: Math.round(normalized_roi * 100) / 100,
    kpi_signal_weight: Math.round(normalized_kpi * 100) / 100,
    behavior_weight: Math.round(normalized_behavior * 100) / 100,
    confidence_decay_rate: currentWeights.confidence_decay_rate, // Decay rate stays constant
    last_update: now.toISOString(),
    update_cycle_days: currentWeights.update_cycle_days,
  };
}

/**
 * Calculate KPI alignment score (0-1)
 * Higher score = KPIs align with ROI accuracy
 */
function calculateKPIAlignment(
  kpiSignals: NonNullable<ObservationData['kpi_signals']>,
  evaluation: EvaluationResult
): number {
  // If trend is improving and accuracy is good, alignment is high
  // If trend is declining and accuracy is poor, alignment is high (both negative)
  let alignment = 0.5; // Neutral baseline

  if (kpiSignals.trend_direction === 'improving' && evaluation.accuracy_error < 10) {
    alignment = 0.8; // Good alignment
  } else if (kpiSignals.trend_direction === 'declining' && evaluation.accuracy_error > 15) {
    alignment = 0.8; // Good alignment (both negative)
  } else if (kpiSignals.trend_direction === 'stable' && evaluation.accuracy_error < 10) {
    alignment = 0.7; // Moderate alignment
  } else {
    alignment = 0.3; // Poor alignment
  }

  return alignment;
}

/**
 * Calculate behavior alignment score (0-1)
 * Higher score = user behavior correlates with forecast accuracy
 */
function calculateBehaviorAlignment(
  behaviorMetrics: NonNullable<ObservationData['behavior_metrics']>,
  evaluation: EvaluationResult
): number {
  // High engagement (ack rate, follow-through) + good accuracy = high alignment
  const engagement_score = (
    behaviorMetrics.alert_ack_rate * 0.4 +
    behaviorMetrics.action_follow_through_rate * 0.4 +
    (1 - Math.min(behaviorMetrics.avg_response_time_hours / 24, 1)) * 0.2 // Faster response = better
  );

  const accuracy_score = 1 - (evaluation.accuracy_error / 20); // Normalize error to 0-1

  // Alignment = weighted average of engagement and accuracy
  return (engagement_score * 0.6 + accuracy_score * 0.4);
}

/**
 * Get default reinforcement weights
 */
export function getDefaultWeights(): ReinforcementWeights {
  return {
    roi_accuracy_weight: 0.5, // Primary signal
    kpi_signal_weight: 0.3, // Secondary signal
    behavior_weight: 0.2, // Tertiary signal
    confidence_decay_rate: 0.1, // 10% annual decay
    last_update: new Date().toISOString(),
    update_cycle_days: 14,
  };
}

/**
 * Complete RL Cycle
 * Runs all 4 stages in sequence
 */
export function runRLCycle(
  predicted_roi: number,
  actual_roi: number,
  previous_confidence_score: number,
  currentWeights: ReinforcementWeights,
  kpiSignals?: ObservationData['kpi_signals'],
  behaviorMetrics?: ObservationData['behavior_metrics']
): {
  observation: ObservationData;
  evaluation: EvaluationResult;
  adaptation: AdaptationResult;
  reinforcement: ReinforcementWeights;
} {
  // Stage 1: Observe
  const observation = observe(predicted_roi, actual_roi, previous_confidence_score, kpiSignals, behaviorMetrics);

  // Stage 2: Evaluate
  const evaluation = evaluate(observation);

  // Stage 3: Adapt
  const adaptation = adapt(evaluation, observation);

  // Stage 4: Reinforce
  const reinforcement = reinforce(currentWeights, evaluation, observation);

  return {
    observation,
    evaluation,
    adaptation,
    reinforcement,
  };
}

