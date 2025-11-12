# 🤖 Automated Testing Orchestrator - Cognitive Interface 3.0

**Purpose:** Automated testing using CLI, MCP-style orchestration, and AI assistant integration

---

## 🚀 Quick Start

### Option 1: Shell Script (Bash)
```bash
# Run automated tests
./scripts/test-cognitive-interface.sh
```

### Option 2: Node.js Script
```bash
# Run API tests
node scripts/test-cognitive-interface-api.js
```

### Option 3: Manual Testing with Checklist
```bash
# Follow the interactive checklist
cat QUICK_TEST_CHECKLIST.md
```

---

## 📋 Test Orchestrator Features

### 1. **Server Health Checks**
- ✅ Verifies server is running on port 3000
- ✅ Checks build artifacts exist
- ✅ Validates TypeScript compilation

### 2. **Route Testing**
- ✅ Landing page (`/`)
- ✅ Onboarding route (`/onboarding`)
- ✅ Preview route (`/dashboard/preview`)
- ✅ Static assets

### 3. **API Endpoint Testing**
- ✅ Health endpoint (`/api/health`)
- ✅ Save metrics endpoint (`/api/save-metrics`)
- ✅ Error handling validation
- ✅ Input validation testing

### 4. **Error Scenario Testing**
- ✅ Invalid PVR values (negative, NaN, strings)
- ✅ Missing authentication
- ✅ Network failures
- ✅ Empty data handling

---

## 🧪 Test Execution

### Automated Test Flow

```bash
# 1. Check server status
curl -f http://localhost:3000

# 2. Run full test suite
./scripts/test-cognitive-interface.sh

# 3. Run API-specific tests
node scripts/test-cognitive-interface-api.js

# 4. Check test results
cat test-results-*.json
```

### Manual Testing Flow

1. **Start Server:**
   ```bash
   npm run dev
   ```

2. **Open Browser:**
   - Navigate to: http://localhost:3000
   - Open DevTools (F12)
   - Check Console tab

3. **Follow Flow:**
   - Landing → Sign Up → Onboarding → PVR → Preview → Dashboard

4. **Test Skip:**
   - Wait 2 seconds on any cinematic phase
   - Click "SKIP" button (top-right)

5. **Test Errors:**
   - Try invalid PVR values
   - Disable network, try saving
   - Check error messages

---

## 📊 Test Results

### Expected Output

```
🚀 DealershipAI Cognitive Interface 3.0 - Test Orchestrator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 Testing: Server Status
✅ PASS: Server is running on port 3000
🧪 Testing: Build Artifacts
✅ PASS: .next directory exists
🧪 Testing: TypeScript Compilation
✅ PASS: TypeScript compiles without errors
🧪 Testing: Landing Page (/)
✅ PASS: Landing page returns 200
🧪 Testing: Route: /onboarding
✅ PASS: Onboarding route exists
🧪 Testing: Route: /dashboard/preview
✅ PASS: Preview route exists
🧪 Testing: API: /api/health
✅ PASS: Health endpoint accessible
🧪 Testing: API: /api/save-metrics (POST validation)
✅ PASS: Save metrics endpoint validates input

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests: 8
✅ Passed: 8
❌ Failed: 0
✅ All tests passed!
```

---

## 🔧 CLI Commands for Testing

### Check Server Status
```bash
# Check if server is running
lsof -ti:3000 && echo "Server running" || echo "Server not running"

# Check server response
curl -I http://localhost:3000

# Check health endpoint
curl http://localhost:3000/api/health
```

### Test API Endpoints
```bash
# Test save-metrics (should return 401 without auth)
curl -X POST http://localhost:3000/api/save-metrics \
  -H "Content-Type: application/json" \
  -d '{"pvr": 500000, "adExpensePvr": 50000}'

# Test with invalid data (should return 400)
curl -X POST http://localhost:3000/api/save-metrics \
  -H "Content-Type: application/json" \
  -d '{"pvr": -1000, "adExpensePvr": "invalid"}'
```

### Test Routes
```bash
# Test landing page
curl -I http://localhost:3000

# Test onboarding
curl -I http://localhost:3000/onboarding

# Test preview
curl -I http://localhost:3000/dashboard/preview
```

---

## 🤖 AI Assistant Integration

### Using AI to Test

1. **Ask AI to run tests:**
   ```
   "Run the automated test suite for Cognitive Interface 3.0"
   ```

2. **Ask AI to check specific functionality:**
   ```
   "Test the skip functionality on the cinematic sequence"
   ```

3. **Ask AI to verify error handling:**
   ```
   "Test error scenarios: invalid PVR values and network failures"
   ```

---

## 📝 Test Checklist Integration

The orchestrator integrates with:
- ✅ `QUICK_TEST_CHECKLIST.md` - Manual testing checklist
- ✅ `TESTING_GUIDE.md` - Comprehensive testing guide
- ✅ `ENHANCEMENTS_COMPLETE.md` - Feature documentation

---

## 🎯 Next Steps

1. **Run automated tests:**
   ```bash
   ./scripts/test-cognitive-interface.sh
   ```

2. **Review results:**
   - Check console output
   - Review test-results-*.json files

3. **Manual testing:**
   - Follow QUICK_TEST_CHECKLIST.md
   - Test in browser with DevTools open

4. **Report issues:**
   - Document in test results
   - Fix and retest

---

## ✅ Success Criteria

All tests pass if:
- ✅ Server is running and accessible
- ✅ All routes return expected status codes
- ✅ API endpoints validate input correctly
- ✅ Error handling works as expected
- ✅ TypeScript compiles without errors

**Ready to test!** 🚀

