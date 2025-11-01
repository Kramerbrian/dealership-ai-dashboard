# DealershipAI Cognitive Ops Testing Guide

**Last Updated:** 2025-01-31  
**Version:** 3.0.0

---

## Quick Start Testing

### 1. **Test Orchestrator 3.0 Integration**

#### API Endpoint Test

```bash
# Start dev server
npm run dev

# Test Orchestrator Status (GET)
curl -X GET "http://localhost:3000/api/orchestrator?dealerId=demo-dealer-123" \
  -H "Content-Type: application/json"

# Test Analyze Visibility (POST)
curl -X POST "http://localhost:3000/api/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze_visibility",
    "dealerId": "demo-dealer-123",
    "domain": "terryreidhyundai.com"
  }'

# Test Compute QAI
curl -X POST "http://localhost:3000/api/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "compute_qai",
    "dealerId": "demo-dealer-123",
    "context": { "currentScore": 75 }
  }'

# Test Calculate OCI
curl -X POST "http://localhost:3000/api/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "calculate_oci",
    "dealerId": "demo-dealer-123",
    "context": { "monthlySales": 100000, "visibility": 65 }
  }'

# Test Generate ASR
curl -X POST "http://localhost:3000/api/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate_asr",
    "dealerId": "demo-dealer-123",
    "context": { "scores": { "aiv": 70, "qai": 75 } }
  }'

# Test Analyze UGC
curl -X POST "http://localhost:3000/api/orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze_ugc",
    "dealerId": "demo-dealer-123",
    "parameters": { "platforms": ["google", "yelp"] }
  }'
```

#### Expected Responses

**Status (GET):**
```json
{
  "status": "active",
  "dealerId": "demo-dealer-123",
  "confidence": 0.92,
  "lastSync": "2025-01-31T...",
  "agentsRunning": 4,
  "platformMode": "CognitiveOps",
  "orchestratorRole": "AI_CSO"
}
```

**Analyze Visibility (POST):**
```json
{
  "success": true,
  "result": {
    "aiv": 75,
    "ati": 70,
    "platforms": {
      "chatgpt": 68,
      "claude": 72,
      "gemini": 74,
      "perplexity": 71
    }
  },
  "confidence": 0.85,
  "rationale": "...",
  "traceId": "trace-..."
}
```

#### Browser Test

1. Navigate to: `http://localhost:3000/orchestrator`
2. Click **"AI CSO Status"** tab
3. Verify:
   - Status panel displays
   - Confidence score shows (0-100%)
   - Active agents count visible
   - "Run Full Orchestration" button works

---

### 2. **Test Mystery Shop Evaluations**

#### API Endpoint Test

```bash
# Generate Script (GET)
curl -X GET "http://localhost:3000/api/mystery-shop?dealerId=demo-dealer-123&scenario=full" \
  -H "Content-Type: application/json"

# Execute Mystery Shop (POST)
curl -X POST "http://localhost:3000/api/mystery-shop" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerId": "demo-dealer-123",
    "scenario": "full",
    "modelCategory": "luxury",
    "storePersona": "high-volume"
  }'
```

#### Expected Response

```json
{
  "success": true,
  "data": {
    "shopId": "shop-...",
    "timestamp": "2025-01-31T...",
    "scenario": "full",
    "scores": {
      "greeting": 85,
      "needs": 78,
      "demo": 82,
      "close": 70,
      "followUp": 75,
      "overall": 78
    },
    "varianceAnalysis": {
      "byStage": { ... },
      "priorityIssues": [
        { "stage": "close", "score": 70, "impact": "P0" }
      ]
    },
    "coachingRecommendations": [
      {
        "stage": "close",
        "issue": "Limited close attempts",
        "action": "Train on multiple close techniques",
        "expectedLift": 12
      }
    ]
  }
}
```

#### Browser Test

1. Navigate to: `http://localhost:3000/orchestrator`
2. Click **"Mystery Shop"** tab
3. **Test Scenarios:**
   - Select scenario: "Full Journey"
   - Select model category: "Luxury"
   - Click **"Execute Shop"**
   - Verify:
     - Loading state appears
     - Results display with scores
     - Priority issues highlighted
     - Coaching recommendations shown
     - Evidence section displays shop ID

---

### 3. **Test HAL Chat Natural Language Queries**

#### Browser Test

1. Navigate to: `http://localhost:3000/orchestrator`
2. Click **"HAL Chat"** tab
3. **Test Queries:**

   **Visibility Analysis:**
   ```
   What's my AI visibility?
   Show me my visibility across platforms
   How visible am I on ChatGPT and Claude?
   ```

   **QAI Calculation:**
   ```
   Compute my Quality Authority Index
   What's my QAI score?
   Calculate trust index
   ```

   **OCI Calculation:**
   ```
   Calculate my opportunity cost
   What's my revenue at risk?
   Show OCI for this month
   ```

   **ASR Generation:**
   ```
   Generate recommendations
   What should I fix first?
   Give me action items
   What are my ASRs?
   ```

   **UGC Analysis:**
   ```
   Analyze my reviews
   What's my UGC sentiment?
   Check review health
   ```

4. **Verify:**
   - Message sends successfully
   - Loading indicator appears
   - Response displays with formatted results
   - Confidence score shown
   - Trace ID included (if available)

#### Expected Behavior

- **Intent Parsing:** Queries correctly route to appropriate orchestrator action
- **Response Formatting:** Results displayed in readable format
- **Confidence Scores:** Shown for each response
- **Error Handling:** Graceful fallback if orchestrator unavailable

---

### 4. **Monitor AI CSO Status in Real Time**

#### Browser Test

1. Navigate to: `http://localhost:3000/orchestrator`
2. Click **"AI CSO Status"** tab
3. **Verify Real-Time Updates:**
   - Status refreshes every 30 seconds automatically
   - Confidence meter updates
   - Last sync timestamp updates
   - Active agents count reflects current state

#### Manual Refresh Test

1. Click **"Run Full Orchestration"** button
2. Verify:
   - Button state changes (loading)
   - Status panel updates
   - Confidence score may change
   - Last sync timestamp updates

#### Status Indicators

- **Active (Green):** All systems operational
- **Degraded (Yellow):** Some functions limited
- **Critical (Red):** Major issues detected

---

## Integration Testing Checklist

### ✅ Orchestrator 3.0 Integration

- [ ] GET `/api/orchestrator` returns status
- [ ] POST `/api/orchestrator` with `analyze_visibility` works
- [ ] POST `/api/orchestrator` with `compute_qai` works
- [ ] POST `/api/orchestrator` with `calculate_oci` works
- [ ] POST `/api/orchestrator` with `generate_asr` works
- [ ] POST `/api/orchestrator` with `analyze_ugc` works
- [ ] Response headers include `X-Orchestrator-Role: AI_CSO`
- [ ] Trace IDs included in responses
- [ ] Fallback logic works when GPT unavailable
- [ ] Confidence scores in valid range (0-1)

### ✅ Mystery Shop Agent

- [ ] GET `/api/mystery-shop` returns script
- [ ] POST `/api/mystery-shop` executes shop
- [ ] All scenarios work (greeting, needs, demo, close, follow-up, full)
- [ ] Scores calculated correctly
- [ ] Priority issues identified
- [ ] Coaching recommendations generated
- [ ] Evidence saved with shop ID
- [ ] UI panel displays results correctly

### ✅ HAL Chat Interface

- [ ] Component renders without errors
- [ ] Messages send successfully
- [ ] Intent parsing routes correctly:
  - Visibility → `analyze_visibility`
  - QAI → `compute_qai`
  - OCI → `calculate_oci`
  - ASR → `generate_asr`
  - UGC → `analyze_ugc`
- [ ] Responses formatted correctly
- [ ] Confidence scores displayed
- [ ] Loading states work
- [ ] Error handling graceful
- [ ] Message history preserved

### ✅ Orchestrator Status Panel

- [ ] Panel renders correctly
- [ ] Status fetched on mount
- [ ] Auto-refresh every 30s works
- [ ] Confidence meter displays
- [ ] Active agents count accurate
- [ ] "Run Full Orchestration" button functional
- [ ] Cognitive Ops principles displayed
- [ ] Status colors correct (green/yellow/red)

### ✅ Command Center Integration

- [ ] All tabs render correctly
- [ ] Tab switching works
- [ ] Active tab highlighted
- [ ] Components load without errors
- [ ] Responsive layout works
- [ ] Cognitive Ops header displays

---

## Environment Variables Required

```env
# Optional - for OpenAI/GPT integration
OPENAI_API_KEY=sk-...

# Required for auth (if using protected routes)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

**Note:** Orchestrator will fallback to internal calculations if `OPENAI_API_KEY` not set.

---

## Troubleshooting

### Issue: Orchestrator returns fallback data

**Cause:** `OPENAI_API_KEY` not configured or invalid  
**Solution:** Add valid OpenAI API key to `.env.local`, or verify fallback logic works

### Issue: Mystery Shop doesn't execute

**Cause:** Missing `dealerId` parameter  
**Solution:** Ensure `dealerId` is provided in request body

### Issue: HAL Chat doesn't respond

**Cause:** Network error or orchestrator unavailable  
**Solution:** Check browser console, verify API endpoint accessible

### Issue: Status panel doesn't update

**Cause:** Auto-refresh interval not working  
**Solution:** Check browser console, verify no React errors

---

## Performance Benchmarks

| Action | Expected Response Time | Target |
|--------|------------------------|--------|
| Status Check | < 100ms | ✅ |
| Analyze Visibility | < 2s | ✅ |
| Compute QAI | < 1.5s | ✅ |
| Calculate OCI | < 1s | ✅ |
| Generate ASR | < 3s | ✅ |
| Analyze UGC | < 2s | ✅ |
| Mystery Shop (Full) | < 5s | ✅ |

---

## Next Steps After Testing

1. **Document Findings:** Note any issues or improvements
2. **Update Configuration:** Adjust timeouts, intervals as needed
3. **Add Analytics:** Track usage patterns
4. **Optimize Performance:** Cache frequent queries
5. **Enhance Error Handling:** Improve user feedback

---

**Testing Status:** ✅ Ready for Testing  
**Last Tested:** Pending

