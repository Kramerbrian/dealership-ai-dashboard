# Forecast vs. Actual Tracking System

## Overview

The Forecast vs. Actual Tracking system enables you to:
- ✅ Submit actual KPI scores after forecasts are made
- ✅ Automatically calculate forecast accuracy (MAPE)
- ✅ Track accuracy trends over time
- ✅ Identify which KPIs are most accurately predicted
- ✅ Improve model calibration based on real performance

## How It Works

### 1. Generate Forecast
When you click "Show Forecast" in Group Executive Summary:
- System generates 30-day forecast
- Forecast is logged to database with unique ID

### 2. Submit Actual Scores
After the forecast period (e.g., 30 days later):
```typescript
POST /api/forecast-actual
{
  "forecastId": "abc123",
  "actualScores": {
    "AIV": 82.5,
    "ATI": 76.2,
    "CVI": 88.1,
    "ORI": 72.3,
    "GRI": 79.8,
    "DPI": 80.1
  },
  "actualLeads": 485,
  "actualRevenue": 582000
}
```

### 3. Automatic Accuracy Calculation
The system calculates:
- **MAPE (Mean Absolute Percentage Error)**: Overall forecast accuracy
- **KPI-level accuracy**: Accuracy per individual KPI
- **Revenue accuracy**: How close revenue projections were

### 4. View Results
The **Forecast Accuracy Tracker** component displays:
- Average accuracy across all forecasts
- Accuracy trend over time
- KPI-level accuracy breakdown
- Recent forecast comparisons

## API Endpoints

### POST /api/forecast-actual
Submit actual scores for a forecast.

**Request:**
```json
{
  "forecastId": "string",
  "actualScores": {
    "AIV": number,
    "ATI": number,
    "CVI": number,
    "ORI": number,
    "GRI": number,
    "DPI": number
  },
  "actualLeads": number,
  "actualRevenue": number
}
```

**Response:**
```json
{
  "status": "updated",
  "accuracy": "87.3%",
  "forecastId": "abc123"
}
```

### GET /api/forecast-actual
Get forecast accuracy statistics.

**Query Parameters:**
- `limit` (optional): Number of forecasts to return (default: 10)

**Response:**
```json
{
  "accuracy": [
    {
      "id": "abc123",
      "timestamp": "2025-01-15T00:00:00Z",
      "accuracy": 87.3,
      "forecast": { "AIV": 80, "DPI": 79.5, ... },
      "actualScores": { "AIV": 82, "DPI": 80.1, ... }
    }
  ],
  "stats": {
    "averageAccuracy": 85.2,
    "minAccuracy": 72.1,
    "maxAccuracy": 94.5,
    "totalForecasts": 15
  }
}
```

## Accuracy Metrics

### MAPE Calculation
Mean Absolute Percentage Error (MAPE) is calculated as:
```
MAPE = 100 - (average of |actual - predicted| / actual * 100)
```

**Accuracy Interpretation:**
- **> 90%**: Excellent forecast
- **80-90%**: Good forecast
- **70-80%**: Acceptable forecast
- **< 70%**: Poor forecast (model needs improvement)

### KPI-Level Accuracy
Each KPI gets its own accuracy score:
- **AIV Accuracy**: How well we predicted AI Visibility
- **CVI Accuracy**: How well we predicted Conversion Visibility
- **DPI Accuracy**: How well we predicted overall composite score

## Integration with Model Improvement

The accuracy data can be used to:
1. **Identify model weaknesses**: Which KPIs are hardest to predict?
2. **Calibrate growth multipliers**: Adjust exponential smoothing based on accuracy
3. **Improve confidence intervals**: Tighten CI based on actual error distribution
4. **Retrain models**: Use historical accuracy to improve future forecasts

## Example Workflow

1. **Day 1**: Generate forecast for next 30 days
   - Forecast ID: `f_abc123`
   - Predicted DPI: 79.5

2. **Day 30**: Collect actual KPIs
   - Actual DPI: 80.1
   - Actual leads: 485

3. **Submit actual scores**:
   ```bash
   curl -X POST /api/forecast-actual \
     -H "Content-Type: application/json" \
     -d '{
       "forecastId": "f_abc123",
       "actualScores": { "DPI": 80.1, ... },
       "actualLeads": 485
     }'
   ```

4. **View accuracy**: Check Forecast Accuracy Tracker
   - Accuracy: 87.3%
   - DPI error: 0.6 points

5. **Improve model**: Use insights to adjust future forecasts

## Future Enhancements

- **Automated actual collection**: Integrate with KPI data sources
- **ML model training**: Use accuracy data to train better models
- **Accuracy alerts**: Notify when accuracy drops below threshold
- **Benchmark comparison**: Compare against industry standards

