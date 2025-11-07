# Forecast Feedback Loop System

## Overview

**Version:** 3.6.3  
**Namespace:** forecast.feedback.loop

Self-correcting forecast feedback system that integrates real recovery results to continuously improve DealershipAI ROI projection accuracy.

## Components & Influence

| Component       | Description                                                                                             | Impact on Confidence    |
| --------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Behavioral**  | Measures how users engage with recommendations — acknowledgments, action follow-through, response time. | Largest influence (45%) |
| **Performance** | Evaluates operational outcomes — trend improvements, efficiency gains, loss recovery.                   | 40% influence           |
| **Contextual**  | Considers current tone, engagement velocity, and market conditions.                                     | 15% influence           |

## How It Works

### 1. Input Processing
- Takes forecast records (predicted vs actual ROI)
- Processes performance inputs (lead volume, close rate, avg gross, engagement velocity)
- Uses previous confidence score as baseline

### 2. Error Calculation
```typescript
forecast_error = (predicted_roi - actual_roi) / predicted_roi
error_weight = abs(forecast_error)
adjustment_factor = 1 - (error_weight * 0.75)
```

### 3. Confidence Recalibration
```typescript
new_confidence_score = previous_confidence_score * adjustment_factor
```

### 4. Reinforcement Factors

**Behavioral (45%):**
- Base: 0.3, scales to 0.6
- Based on engagement velocity, action follow-through, response time

**Performance (40%):**
- Base: 0.3, scales to 0.5
- Based on trend improvements, efficiency gains, loss recovery

**Contextual (15%):**
- Fixed: 0.85
- Accounts for market conditions and tone

### 5. Error Categories

- **Minor** (<5% error): Executive tone, +2% ROI multiplier
- **Moderate** (5-10% error): Advisory tone, -5% ROI multiplier
- **Major** (>10% error): Corrective tone, -10% ROI multiplier

## Usage

### API Endpoint

```typescript
POST /api/forecast/feedback-loop

{
  "forecast_records": [
    {
      "forecast_id": "uuid",
      "forecast_date": "2025-11-06",
      "forecast_window_days": 30,
      "predicted_roi": 42000,
      "actual_roi": 39750,
      "predicted_confidence": 0.89,
      "role": "GM"
    }
  ],
  "performance_inputs": {
    "actual_lead_volume": 680,
    "actual_close_rate": 0.097,
    "actual_avg_gross": 1920,
    "actual_engagement_velocity": 0.041
  },
  "previous_confidence_score": 0.89
}
```

### React Component

```tsx
import ForecastFeedbackLoop from '@/app/components/ForecastFeedbackLoop';

<ForecastFeedbackLoop
  forecastRecords={[
    {
      forecast_id: 'uuid',
      forecast_date: '2025-11-06',
      forecast_window_days: 30,
      predicted_roi: 42000,
      actual_roi: 39750,
      predicted_confidence: 0.89,
      role: 'GM'
    }
  ]}
  performanceInputs={{
    actual_lead_volume: 680,
    actual_close_rate: 0.097,
    actual_avg_gross: 1920,
    actual_engagement_velocity: 0.041
  }}
  previousConfidence={0.89}
  onConfidenceUpdate={(newConfidence) => {
    console.log('New confidence:', newConfidence);
  }}
/>
```

### Direct Function Call

```typescript
import { calculateFeedbackLoop } from '@/lib/forecast-feedback-loop';

const result = calculateFeedbackLoop({
  forecast_records: [...],
  performance_inputs: {...},
  previous_confidence_score: 0.89
});

console.log('New confidence:', result.new_confidence_score);
console.log('Error category:', result.error_category);
console.log('Recommendations:', result.recommendations);
```

## Example Output

```json
{
  "success": true,
  "version": "3.6.3",
  "namespace": "forecast.feedback.loop",
  "result": {
    "new_confidence_score": 0.85,
    "forecast_error": 0.0536,
    "error_category": "moderate",
    "adjustment_factor": 0.955,
    "behavioral_reinforcement": 0.41,
    "performance_reinforcement": 0.35,
    "contextual_decay": 0.85,
    "recommendations": [
      "Review forecast assumptions",
      "Check for external factors affecting ROI",
      "Consider recalibrating elasticity coefficients",
      "Validate lead volume and close rate inputs",
      "Forecast error: 5.36%",
      "Confidence adjusted from 89.0% to 85.0%",
      "Behavioral reinforcement: 41.0%",
      "Performance reinforcement: 35.0%"
    ]
  }
}
```

## Integration with Forecast System

The feedback loop integrates seamlessly with the adaptive forecast system:

1. **Forecast Generation**: Creates predictions with confidence scores
2. **Actual Results**: Records actual ROI and performance metrics
3. **Feedback Loop**: Processes feedback to recalibrate confidence
4. **Next Forecast**: Uses updated confidence for improved accuracy

## Best Practices

1. **Run Monthly**: Process feedback loop at month-end when actual results are available
2. **Track Trends**: Monitor confidence scores over time to identify patterns
3. **Act on Recommendations**: Use error category recommendations to improve forecasts
4. **Validate Inputs**: Ensure performance inputs are accurate before processing

## Monitoring

Track feedback loop effectiveness:

- Confidence score trends over time
- Error category distribution
- Reinforcement factor patterns
- Recommendation follow-through rates

