# 🔧 Fix Build Issue & Run Tests

## Quick Fix (3 Steps)

### Step 1: Clean Build Cache
```bash
rm -rf .next
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

Wait for: `✓ Ready in [time]` and `- Local: http://localhost:3000`

### Step 3: Run Tests

**Option A: Automated Script**
```bash
./scripts/test-cognitive-ops.sh
```

**Option B: Individual cURL Commands**
See `TESTING_RESULTS.md` for all commands.

**Option C: Browser Testing**
1. Open: `http://localhost:3000/orchestrator`
2. Test each tab: Status, HAL Chat, Mystery Shop

---

## Expected Results

After fixing the build, all endpoints should return HTTP 200 with valid JSON responses.

See `TESTING_RESULTS.md` for expected response formats.

---

## If Build Issue Persists

If cleaning `.next` doesn't work:

```bash
# Full clean rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

This will take longer but ensures a clean build.

