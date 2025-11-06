# Forecast Actual API - Usage Examples

## POST /api/forecast-actual

Submit actual KPI scores to compare with forecasts and calculate accuracy.

### Request Format

```json
{
  "forecastId": "string (required)",
  "actualScores": {
    "AIV": number (required),
    "ATI": number (required),
    "CVI": number (required),
    "ORI": number (required),
    "GRI": number (required),
    "DPI": number (required)
  },
  "actualLeads": number (optional),
  "actualRevenue": number (optional)
}
```

### Response Format

**Success (200):**
```json
{
  "status": "updated",
  "accuracy": "87.34%",
  "forecastId": "abc123"
}
```

**Error (400):**
```json
{
  "error": "Missing required fields: forecastId, actualScores"
}
```

**Error (404):**
```json
{
  "error": "Forecast not found"
}
```

## Usage Examples

### 1. Using cURL

```bash
curl -X POST http://localhost:3000/api/forecast-actual \
  -H "Content-Type: application/json" \
  -d '{
    "forecastId": "clx1234567890",
    "actualScores": {
      "AIV": 82,
      "ATI": 76,
      "CVI": 88,
      "ORI": 72,
      "GRI": 80,
      "DPI": 80
    },
    "actualLeads": 485,
    "actualRevenue": 582000
  }'
```

### 2. Using JavaScript/Fetch

```javascript
async function submitActualScores(forecastId, actualScores) {
  const response = await fetch('/api/forecast-actual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      forecastId,
      actualScores: {
        AIV: 82,
        ATI: 76,
        CVI: 88,
        ORI: 72,
        GRI: 80,
        DPI: 80,
      },
      actualLeads: 485,
      actualRevenue: 582000,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Error:', data.error);
    return null;
  }

  console.log('Accuracy:', data.accuracy);
  return data;
}

// Usage
submitActualScores('clx1234567890', {
  AIV: 82,
  ATI: 76,
  CVI: 88,
  ORI: 72,
  GRI: 80,
  DPI: 80,
});
```

### 3. Using TypeScript

```typescript
interface ActualScores {
  AIV: number;
  ATI: number;
  CVI: number;
  ORI: number;
  GRI: number;
  DPI: number;
}

interface SubmitActualRequest {
  forecastId: string;
  actualScores: ActualScores;
  actualLeads?: number;
  actualRevenue?: number;
}

interface SubmitActualResponse {
  status: string;
  accuracy: string;
  forecastId: string;
}

async function submitActualScores(
  request: SubmitActualRequest
): Promise<SubmitActualResponse | null> {
  try {
    const response = await fetch('/api/forecast-actual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit actual scores');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting actual scores:', error);
    return null;
  }
}
```

### 4. Using Python (requests)

```python
import requests

def submit_actual_scores(forecast_id, actual_scores, actual_leads=None, actual_revenue=None):
    url = 'http://localhost:3000/api/forecast-actual'
    
    payload = {
        'forecastId': forecast_id,
        'actualScores': actual_scores,
    }
    
    if actual_leads:
        payload['actualLeads'] = actual_leads
    if actual_revenue:
        payload['actualRevenue'] = actual_revenue
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f'Error: {response.json()}')
        return None

# Usage
result = submit_actual_scores(
    forecast_id='clx1234567890',
    actual_scores={
        'AIV': 82,
        'ATI': 76,
        'CVI': 88,
        'ORI': 72,
        'GRI': 80,
        'DPI': 80,
    },
    actual_leads=485,
    actual_revenue=582000
)

if result:
    print(f'Accuracy: {result["accuracy"]}')
```

## Getting Forecast IDs

### Option 1: From Forecast List API

```bash
curl http://localhost:3000/api/forecast-actual/list
```

Response:
```json
{
  "forecasts": [
    {
      "id": "clx1234567890",
      "timestamp": "2025-01-15T00:00:00Z",
      "dealers": ["Dealer A", "Dealer B"],
      "forecast": {
        "AIV": 80,
        "ATI": 75,
        "CVI": 85,
        "ORI": 70,
        "GRI": 78,
        "DPI": 79.5
      },
      "daysSince": 30
    }
  ]
}
```

### Option 2: From Forecast Log Response

When you create a forecast via `POST /api/forecast-log`, the response includes the ID:

```json
{
  "status": "logged",
  "message": "Forecast logged successfully",
  "timestamp": "2025-01-15T00:00:00Z",
  "id": "clx1234567890"
}
```

## Accuracy Calculation

The system calculates **MAPE (Mean Absolute Percentage Error)**:

```
For each KPI:
  error = |actual - predicted| / actual * 100

accuracy = 100 - (average of all errors)
```

**Example:**
- Predicted AIV: 80, Actual AIV: 82
- Error: |82 - 80| / 82 * 100 = 2.44%
- Accuracy: 100 - 2.44 = 97.56%

**Accuracy Interpretation:**
- **> 90%**: Excellent forecast
- **80-90%**: Good forecast  
- **70-80%**: Acceptable forecast
- **< 70%**: Poor forecast (model needs improvement)

## Complete Workflow Example

### Step 1: Generate Forecast

```bash
# Generate forecast via Group Executive Summary UI
# Or via API:
curl -X POST http://localhost:3000/api/forecast-log \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-01-15T00:00:00Z",
    "dealers": ["Dealer A"],
    "forecast": {
      "AIV": 80,
      "ATI": 75,
      "CVI": 85,
      "ORI": 70,
      "GRI": 78,
      "DPI": 79.5
    },
    "ci": "2.1",
    "leadsForecast": 450,
    "revenueForecast": 540000
  }'
```

### Step 2: Wait 30 Days

### Step 3: Get Forecast ID

```bash
curl http://localhost:3000/api/forecast-actual/list
```

### Step 4: Submit Actual Scores

```bash
curl -X POST http://localhost:3000/api/forecast-actual \
  -H "Content-Type: application/json" \
  -d '{
    "forecastId": "clx1234567890",
    "actualScores": {
      "AIV": 82,
      "ATI": 76,
      "CVI": 88,
      "ORI": 72,
      "GRI": 80,
      "DPI": 80
    },
    "actualLeads": 485,
    "actualRevenue": 582000
  }'
```

### Step 5: View Accuracy

```bash
curl http://localhost:3000/api/forecast-actual?limit=10
```

## Error Handling

### Common Errors

**400 Bad Request:**
```json
{
  "error": "Missing required fields: forecastId, actualScores"
}
```
**Solution:** Ensure both `forecastId` and `actualScores` are provided.

**404 Not Found:**
```json
{
  "error": "Forecast not found"
}
```
**Solution:** Verify the forecast ID is correct and exists in the database.

**500 Internal Server Error:**
```json
{
  "error": "Failed to update forecast with actual scores"
}
```
**Solution:** Check database connection and forecast log table exists.

## Best Practices

1. **Submit actual scores within 30-35 days** of forecast generation
2. **Include all KPIs** for accurate MAPE calculation
3. **Provide actual leads/revenue** for complete analysis
4. **Use consistent KPI measurement** as the forecast
5. **Submit regularly** to build accuracy history

## Integration Tips

### Automated Submission

You can automate actual score submission by:

1. **Scheduled Job**: Run monthly after KPI data collection
2. **Webhook**: Trigger when KPI data is updated
3. **API Integration**: Connect to your KPI data source

### Example Scheduled Script

```javascript
// scripts/submit-actual-scores.js
const forecasts = await fetch('/api/forecast-actual/list').then(r => r.json());

for (const forecast of forecasts.forecasts) {
  if (forecast.daysSince >= 30) {
    // Get actual scores from your KPI system
    const actualScores = await getActualKPIs(forecast.dealers);
    
    await fetch('/api/forecast-actual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        forecastId: forecast.id,
        actualScores,
      }),
    });
  }
}
```

