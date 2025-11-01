# 🧪 DealershipAI Cognitive Ops - Quick Testing Guide

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Verify server is running:**
   - Navigate to: `http://localhost:3000`
   - You should see the landing page

---

## 🚀 Quick Test Methods

### Method 1: Automated Script (Recommended)

```bash
# Make script executable
chmod +x scripts/test-cognitive-ops.sh

# Run all tests
./scripts/test-cognitive-ops.sh

# Or test against a different URL
./scripts/test-cognitive-ops.sh http://localhost:3001
```

**Expected Output:**
```
🧠 DealershipAI Cognitive Ops Platform - Testing Suite
==================================================
Base URL: http://localhost:3000
Dealer ID: demo-dealer-123

1️⃣  Testing Orchestrator 3.0 Status...
Testing Orchestrator Status... ✓ PASS (HTTP 200)

2️⃣  Testing Analyze Visibility...
Testing Analyze Visibility... ✓ PASS (HTTP 200)
...
```

### Method 2: Browser Testing Interface

1. **Open testing HTML file:**
   ```bash
   open scripts/test-hal-chat.html
   # Or double-click the file in your file explorer
   ```

2. **Use the interface:**
   - Click quick test buttons for common queries
   - Enter custom queries in the text field
   - Check orchestrator status
   - Run mystery shop evaluations

### Method 3: Manual Browser Testing

1. **Navigate to Command Center:**
   ```
   http://localhost:3000/orchestrator
   ```

2. **Test Each Component:**
   
   **AI CSO Status:**
   - Click "AI CSO Status" tab
   - Verify status panel displays
   - Click "Run Full Orchestration"
   - Watch for status updates

   **HAL Chat:**
   - Click "HAL Chat" tab
   - Try these queries:
     - "What's my AI visibility?"
     - "Calculate OCI"
     - "Generate ASRs"
     - "Analyze UGC sentiment"
   - Verify responses display correctly

   **Mystery Shop:**
   - Click "Mystery Shop" tab
   - Select scenario: "Full Journey"
   - Select model category: "Luxury"
   - Click "Execute Shop"
   - Verify results display with scores

### Method 4: cURL Commands

See `docs/TESTING_GUIDE.md` for detailed cURL commands for each endpoint.

---

## ✅ Verification Checklist

After running tests, verify:

- [ ] Orchestrator status endpoint returns valid JSON
- [ ] All 5 orchestrator actions work (visibility, QAI, OCI, ASR, UGC)
- [ ] Mystery Shop script generation works
- [ ] Mystery Shop execution returns scores
- [ ] HAL Chat interface renders without errors
- [ ] HAL Chat queries parse intent correctly
- [ ] Status panel auto-refreshes every 30s
- [ ] All tabs in command center work
- [ ] No console errors in browser

---

## 🐛 Troubleshooting

### Tests Fail with 401 Unauthorized

**Solution:** Some endpoints require authentication. For testing, you may need to:
1. Sign in through the UI first
2. Or modify the API routes to skip auth in development

### Tests Fail with Network Error

**Solution:** 
1. Verify dev server is running: `npm run dev`
2. Check the URL is correct: `http://localhost:3000`
3. Verify no firewall/proxy blocking requests

### HAL Chat Doesn't Respond

**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify API endpoint is accessible: `http://localhost:3000/api/orchestrator`
4. Check network tab for failed requests

### Status Panel Doesn't Update

**Solution:**
1. Check browser console for React errors
2. Verify `useEffect` hook is running
3. Check that API returns valid data format

---

## 📊 Expected Response Times

| Action | Expected Time | Notes |
|--------|---------------|-------|
| Status Check | < 100ms | Fast, no AI calls |
| Visibility Analysis | < 2s | May use OpenAI if configured |
| QAI Calculation | < 1.5s | Internal calculation |
| OCI Calculation | < 1s | Simple math |
| ASR Generation | < 3s | May use OpenAI if configured |
| UGC Analysis | < 2s | May use OpenAI if configured |
| Mystery Shop (Full) | < 5s | Mock data for now |

---

## 🔍 Next Steps

Once basic testing passes:

1. **Integration Testing:** Test with real OpenAI API key
2. **Performance Testing:** Load test with multiple concurrent requests
3. **Error Handling:** Test error scenarios (network failures, invalid inputs)
4. **UI/UX Testing:** Verify all animations, transitions work smoothly
5. **Accessibility Testing:** Test with screen readers, keyboard navigation

---

## 📝 Test Results Template

```markdown
## Test Results - [Date]

### Environment
- Node Version: [version]
- Next.js Version: [version]
- Browser: [browser]

### Tests Run
- [ ] Orchestrator Status
- [ ] Analyze Visibility
- [ ] Compute QAI
- [ ] Calculate OCI
- [ ] Generate ASR
- [ ] Analyze UGC
- [ ] Mystery Shop Script
- [ ] Mystery Shop Execution
- [ ] HAL Chat Interface
- [ ] Status Panel

### Issues Found
1. [Issue description]
2. [Issue description]

### Performance
- Average response time: [time]
- Slowest endpoint: [endpoint] ([time])
- Fastest endpoint: [endpoint] ([time])
```

---

**Happy Testing! 🚀**

For detailed testing documentation, see: `docs/TESTING_GUIDE.md`

