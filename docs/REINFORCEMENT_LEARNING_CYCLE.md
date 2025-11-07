# Reinforcement Learning Cycle for Personalization

## Overview

The Reinforcement Learning (RL) Cycle is a 4-stage adaptive system that continuously improves forecast accuracy and personalization by learning from actual performance data.

## 4-Stage Cycle

### 1. Observe → Gather Behavior + KPI Signal Metrics

**Purpose:** Collect actual performance data and contextual signals

**Inputs:**
- `predicted_roi`: Forecasted ROI value
- `actual_roi`: Actual realized ROI value
- `previous_confidence_score`: Current confidence level (0-1)
- `kpi_signals` (optional): DPI trend, LEE change, DLOC reduction, trend direction
- `behavior_metrics` (optional): Alert ack rate, action follow-through rate, response time

**Output:** `ObservationData` object with all collected metrics

**Example:**
```typescript
const observation = observe(
  52000,  // predicted_roi
  47500,  // actual_roi
  0.90,   // previous_confidence_score
  {
    DPI_trend: 0.042,
    LEE_change: 0.045,
    DLOC_reduction: 19800,
    trend_direction: 'improving'
  },
  {
    alert_ack_rate: 0.83,
    action_follow_through_rate: 0.75,
    avg_response_time_hours: 2.5
  }
);
```

### 2. Evaluate → Compute Confidence Score and Classification Tier

**Purpose:** Assess forecast accuracy and determine confidence adjustments

**Calculations:**
- **Accuracy Error:** `|actual_roi - predicted_roi| / predicted_roi * 100`
- **Error Penalty:** `error * 0.007` (conservative scaling, max 0.2)
- **Revised Confidence:** `previous_confidence - error_penalty` (min 0.1)
- **Recalibration Type:**
  - `minor`: error < 5%
  - `moderate`: error 5-15%
  - `major`: error > 15%
- **Confidence Tier:**
  - `High`: confidence ≥ 0.85
  - `Medium`: confidence 0.70-0.85
  - `Low`: confidence < 0.70
- **ROI Forecast Multiplier:** `0.95 + (confidence * 0.12)` (range: 0.95-1.07)

**Output:** `EvaluationResult` with revised confidence and classification

**Example:**
```typescript
// Input: predicted=52000, actual=47500, previous_confidence=0.90
// Error: 8.65%
// Penalty: 8.65 * 0.007 = 0.06055
// Revised: 0.90 - 0.06 = 0.84
// Multiplier: 0.95 + (0.84 * 0.12) = 1.0508 ≈ 1.05

{
  revised_confidence_score: 0.84,
  recalibration_type: 'moderate',
  accuracy_error: 8.65,
  confidence_tier: 'Medium',
  roi_forecast_confidence_multiplier: 1.05
}
```

### 3. Adapt → Modify Forecast Range, Tone, and Message Depth

**Purpose:** Adjust communication and forecast parameters based on confidence

**Adaptations:**

**Tone Profile:**
- `strategic`: High confidence + minor recalibration
- `executive`: High confidence + moderate recalibration
- `advisory`: Medium confidence (default for moderate recalibration)
- `tactical`: Major recalibration needed

**Forecast Range Adjustment:**
- Lower confidence = wider range (more conservative)
- Higher confidence = narrower range (more precise)
- Formula: `0.8 + (confidence * 0.4)` (range: 0.8-1.2)

**Message Depth:**
- `compact`: High confidence (concise messages)
- `detailed`: Medium confidence (more context)
- `comprehensive`: Low confidence (full context)

**Urgency Modifier:**
- Based on error magnitude: `min(error / 20, 1.0)`
- Higher error = higher urgency

**Output:** `AdaptationResult` with adjusted parameters

**Example:**
```typescript
{
  tone_profile: 'advisory',  // Medium confidence, moderate recalibration
  forecast_range_adjustment: 1.136,  // 0.8 + (0.84 * 0.4)
  message_depth: 'detailed',
  urgency_modifier: 0.43  // 8.65 / 20
}
```

### 4. Reinforce → Update Weights via Decay-Adjusted Learning Rate

**Purpose:** Update model weights every 14 days based on accumulated observations

**Update Conditions:**
- Only updates if 14 days (or configured `update_cycle_days`) have passed since last update
- Uses decay-adjusted learning rate to prevent overfitting

**Weight Updates:**

**Learning Rate Calculation:**
```typescript
decay_factor = exp(-decay_rate * (days_since_update / 365))
learning_rate = 0.1 * decay_factor
```

**Weight Adjustments:**
1. **ROI Accuracy Weight** (primary signal, 0.3-0.7 range)
   - Increases if accuracy is good
   - Decreases if accuracy is poor

2. **KPI Signal Weight** (secondary signal, 0.1-0.4 range)
   - Increases if KPI trends align with ROI accuracy
   - Decreases if misaligned

3. **Behavior Weight** (tertiary signal, 0.1-0.3 range)
   - Increases if user engagement correlates with accuracy
   - Decreases if no correlation

**Weight Normalization:**
- All weights normalized to sum to 1.0
- Ensures balanced signal weighting

**Output:** Updated `ReinforcementWeights` with new values

**Example:**
```typescript
{
  roi_accuracy_weight: 0.52,  // Increased from 0.50 (good accuracy)
  kpi_signal_weight: 0.31,     // Slight increase (aligned signals)
  behavior_weight: 0.17,       // Slight decrease
  confidence_decay_rate: 0.1,  // 10% annual decay
  last_update: '2025-01-20T12:00:00Z',
  update_cycle_days: 14
}
```

## Complete Cycle Example

```typescript
import { runRLCycle, getDefaultWeights } from '@/lib/personalization/reinforcement-learning';

const result = runRLCycle(
  52000,  // predicted_roi
  47500,  // actual_roi
  0.90,   // previous_confidence_score
  getDefaultWeights(),
  {
    DPI_trend: 0.042,
    LEE_change: 0.045,
    DLOC_reduction: 19800,
    trend_direction: 'improving'
  },
  {
    alert_ack_rate: 0.83,
    action_follow_through_rate: 0.75,
    avg_response_time_hours: 2.5
  }
);

// Result includes:
// - observation: All collected data
// - evaluation: Revised confidence (0.84), recalibration type (moderate)
// - adaptation: Tone (advisory), forecast range, message depth
// - reinforcement: Updated weights (if 14 days passed)
```

## API Usage

### POST /api/personalization/rl-cycle

Run a complete RL cycle:

```typescript
const response = await fetch('/api/personalization/rl-cycle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    predicted_roi: 52000,
    actual_roi: 47500,
    previous_confidence_score: 0.90,
    weights: { /* optional, uses defaults if omitted */ },
    kpi_signals: { /* optional */ },
    behavior_metrics: { /* optional */ }
  })
});

const { data } = await response.json();
// data.observation, data.evaluation, data.adaptation, data.reinforcement
```

### GET /api/personalization/rl-cycle

Get current weights and update status:

```typescript
const response = await fetch('/api/personalization/rl-cycle?userId=user123');
const { data } = await response.json();
// data.weights, data.status (days_since_update, ready_for_update, etc.)
```

## Integration with Personalization Tokens

The RL cycle outputs integrate directly with the personalization token system:

```typescript
import { generatePersonalizedMessage } from '@/lib/personalization/token-system';
import { runRLCycle } from '@/lib/personalization/reinforcement-learning';

// Run RL cycle
const rlResult = runRLCycle(/* ... */);

// Update token groups with RL results
tokenGroups.confidence_metrics = {
  confidence_score: rlResult.evaluation.revised_confidence_score,
  confidence_tier: rlResult.evaluation.confidence_tier,
  roi_forecast_confidence_multiplier: rlResult.evaluation.roi_forecast_confidence_multiplier,
  tone_profile: rlResult.adaptation.tone_profile,
  forecast_variance_reduction: `-${rlResult.evaluation.accuracy_error.toFixed(1)}%`
};

// Generate personalized message with updated tokens
const message = generatePersonalizedMessage(
  'slack_alert',
  tokenGroups,
  {
    recommendation: 'Optimize ad spend allocation',
    roi_projection: 52000 * rlResult.evaluation.roi_forecast_confidence_multiplier
  }
);
```

## Key Benefits

1. **Continuous Improvement:** System learns from actual performance
2. **Adaptive Communication:** Tone and depth adjust based on confidence
3. **Conservative Confidence:** Small errors result in small confidence adjustments
4. **Weighted Learning:** Multiple signals (ROI, KPI, behavior) contribute to updates
5. **Decay Protection:** Learning rate decays over time to prevent overfitting
6. **14-Day Cycles:** Regular but not too frequent weight updates

## Monitoring

Track these metrics to monitor RL cycle effectiveness:

- **Confidence Score Trends:** Should stabilize over time
- **Accuracy Error Distribution:** Should decrease as system learns
- **Weight Evolution:** Should converge to optimal values
- **Recalibration Frequency:** Should decrease as accuracy improves
- **Tone Profile Distribution:** Should reflect confidence levels

## Best Practices

1. **Run cycles regularly:** After each forecast period (weekly/monthly)
2. **Include all signals:** Provide KPI and behavior metrics when available
3. **Monitor confidence trends:** Watch for rapid drops (may indicate data issues)
4. **Review weight updates:** Ensure weights are converging, not oscillating
5. **Test adaptations:** Verify tone and message depth match user preferences

