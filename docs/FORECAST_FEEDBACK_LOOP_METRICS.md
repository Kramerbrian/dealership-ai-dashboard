# Forecast Feedback Loop - Enhanced Metrics

## Behavioral Metrics (45% Influence)

### Alert Acknowledgment Rate
- **Metric**: `alert_ack_rate` (0-1)
- **Impact**: Higher acknowledgment = better engagement = higher confidence
- **Boost**: `alert_ack_rate × 0.1` (max 0.1)
- **Example**: 0.83 ack rate = +0.083 boost

### Action Follow-Through Rate
- **Metric**: `action_follow_through_rate` (0-1)
- **Impact**: Higher follow-through = better execution = higher confidence
- **Boost**: `action_follow_through_rate × 0.1` (max 0.1)
- **Example**: 0.75 follow-through = +0.075 boost

### Average Response Time
- **Metric**: `avg_response_time_hours` (hours)
- **Impact**: Faster response = better engagement = higher confidence
- **Boost**: `(1 - min(1, hours/24)) × 0.1` (max 0.1)
- **Formula**: Inverse relationship - faster = higher boost
- **Example**: 2.5 hours = +0.090 boost

### Engagement Velocity
- **Metric**: `actual_engagement_velocity` (0-1)
- **Impact**: Higher velocity = more active engagement
- **Boost**: `min(0.15, velocity × 10)`
- **Example**: 0.041 velocity = +0.041 boost

**Total Behavioral Boost**: Sum of all boosts, capped at 0.6

## Performance Metrics (40% Influence)

### DPI Trend
- **Metric**: `DPI_trend` (percentage change)
- **Impact**: Positive DPI trend = improving performance
- **Boost**: `min(0.05, DPI_trend × 0.5)` (only if positive)
- **Example**: +0.042 (4.2%) = +0.021 boost

### Lead Efficiency Enhancement (LEE)
- **Metric**: `LEE_change` (percentage change)
- **Impact**: Positive LEE = better lead efficiency
- **Boost**: `min(0.05, LEE_change × 0.5)` (only if positive)
- **Example**: +0.045 (4.5%) = +0.0225 boost

### Days Lost on Close (DLOC) Reduction
- **Metric**: `DLOC_reduction` (dollars recovered)
- **Impact**: DLOC reduction = recovered revenue = higher confidence
- **Boost**: `min(0.05, (reduction / 20000) × 0.05)`
- **Normalization**: $20k reduction = max boost
- **Example**: $19,800 reduction = +0.0495 boost

### Trend Direction
- **Metric**: `trend_direction` ('improving' | 'declining' | 'stable')
- **Impact**: Multiplier applied to total performance boost
- **Multipliers**:
  - `improving`: 1.0x (full boost)
  - `stable`: 0.8x (reduced boost)
  - `declining`: 0.5x (significantly reduced boost)

**Total Performance Boost**: Sum of boosts × direction multiplier, capped at 0.5

## Example Calculation

Given the metrics:
```json
{
  "alert_ack_rate": 0.83,
  "action_follow_through_rate": 0.75,
  "avg_response_time_hours": 2.5,
  "DPI_trend": 0.042,
  "LEE_change": 0.045,
  "DLOC_reduction": 19800,
  "trend_direction": "improving"
}
```

### Behavioral Reinforcement:
- Base: 0.3
- Engagement velocity (0.041): +0.041
- Alert ack (0.83): +0.083
- Follow-through (0.75): +0.075
- Response time (2.5h): +0.090
- **Total**: 0.589 (capped at 0.6)

### Performance Reinforcement:
- Base: 0.3
- Trend improvement: +0.1
- DPI trend (+4.2%): +0.021
- LEE change (+4.5%): +0.0225
- DLOC reduction ($19.8k): +0.0495
- **Subtotal**: 0.493
- **Direction multiplier** (improving): ×1.0
- **Total**: 0.493 (capped at 0.5)

## Integration

### API Request
```json
{
  "forecast_records": [...],
  "performance_inputs": {
    "actual_lead_volume": 680,
    "actual_close_rate": 0.097,
    "actual_avg_gross": 1920,
    "actual_engagement_velocity": 0.041,
    "alert_ack_rate": 0.83,
    "action_follow_through_rate": 0.75,
    "avg_response_time_hours": 2.5,
    "DPI_trend": 0.042,
    "LEE_change": 0.045,
    "DLOC_reduction": 19800,
    "trend_direction": "improving"
  },
  "previous_confidence_score": 0.89
}
```

### React Component
```tsx
<ForecastFeedbackLoop
  performanceInputs={{
    actual_lead_volume: 680,
    actual_close_rate: 0.097,
    actual_avg_gross: 1920,
    actual_engagement_velocity: 0.041,
    alert_ack_rate: 0.83,
    action_follow_through_rate: 0.75,
    avg_response_time_hours: 2.5,
    DPI_trend: 0.042,
    LEE_change: 0.045,
    DLOC_reduction: 19800,
    trend_direction: 'improving'
  }}
  // ...
/>
```

## Benefits

1. **More Accurate**: Incorporates real behavioral and performance data
2. **Granular**: Tracks specific engagement and efficiency metrics
3. **Responsive**: Adjusts confidence based on actual outcomes
4. **Actionable**: Clear metrics show where improvements are needed

