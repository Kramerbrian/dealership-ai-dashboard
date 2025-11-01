# 🚀 Quick Test - DealershipAI Cognitive Ops

## Start Testing in 3 Steps

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Testing Interface
```bash
open scripts/test-hal-chat.html
```

### 3. Or Test Manually
Navigate to: http://localhost:3000/orchestrator

---

## Quick Test Commands

### Test Orchestrator Status
```bash
curl http://localhost:3000/api/orchestrator?dealerId=demo-dealer-123
```

### Test Analyze Visibility
```bash
curl -X POST http://localhost:3000/api/orchestrator \
  -H "Content-Type: application/json" \
  -d '{"action":"analyze_visibility","dealerId":"demo-dealer-123","domain":"terryreidhyundai.com"}'
```

### Test Mystery Shop
```bash
curl -X POST http://localhost:3000/api/mystery-shop \
  -H "Content-Type: application/json" \
  -d '{"dealerId":"demo-dealer-123","scenario":"full"}'
```

---

## Browser Testing

1. Go to: http://localhost:3000/orchestrator
2. Click "AI CSO Status" tab
3. Click "HAL Chat" tab
4. Try: "What's my AI visibility?"
5. Click "Mystery Shop" tab
6. Execute a shop

---

## Expected Results

✅ All endpoints return HTTP 200  
✅ JSON responses are valid  
✅ HAL Chat responds to queries  
✅ Mystery Shop generates scores  
✅ Status panel shows metrics  

See README_TESTING.md for detailed guide.
