# Post-Deployment Verification Guide

## 🎯 Quick Verification Checklist

### Immediate (After Build Completes)

- [ ] **Health Endpoint**
  ```bash
  curl https://dash.dealershipai.com/api/health
  ```
  Expected: `{"status":"healthy",...}`

- [ ] **Dashboard Loads**
  - Visit: https://dash.dealershipai.com/dashboard
  - Verify: Page loads without errors
  - Check: Console (F12) for errors

- [ ] **Diagnostic Dashboard Visible**
  - Look for "Your Real-Time Diagnostic Dashboard" section
  - Verify: Issues list displays
  - Check: Relevance Overlay button works
  - Check: RI Simulator loads

### API Endpoints (Requires Authentication)

All endpoints require Clerk authentication. Test via browser DevTools after logging in:

- [ ] **GET /api/diagnostics**
  - Should return: `{ issues: [], overallScore: number, relevanceIndex: number }`
  - Test: Open DevTools → Network → Visit dashboard → Find `/api/diagnostics` request

- [ ] **GET /api/relevance/overlay**
  - Should return: Query relevance data
  - Test: Click "Relevance Overlay" button in dashboard

- [ ] **GET /api/scenarios/templates**
  - Should return: Array of scenario templates
  - Test: Open RI Simulator → Click "Show Templates"

- [ ] **GET /api/analytics/trends**
  - Should return: Historical trends and predictions
  - Test: Click "Show Trends" in diagnostic dashboard

- [ ] **POST /api/fix/action**
  - Should trigger: Automation workflow
  - Test: Click "Fix Now" on any issue

- [ ] **POST /api/relevance/scenarios**
  - Should save: Custom scenario
  - Test: Create custom scenario in RI Simulator

- [ ] **GET /api/export/data**
  - Should return: JSON or CSV file
  - Test: Click "Export Data" button

---

## 🔍 Detailed Verification Steps

### 1. Health Check

```bash
# Test health endpoint
curl https://dash.dealershipai.com/api/health

# Expected response:
{
  "status": "healthy",
  "checks": {
    "database": "up",
    "redis": "up",
    "api": "up",
    "cron": "up"
  }
}
```

**If health check fails:**
- Check Vercel logs for errors
- Verify environment variables
- Check database/Redis connections

### 2. Dashboard Access

1. **Visit:** https://dash.dealershipai.com/dashboard
2. **Sign in** (if not authenticated)
3. **Verify:**
   - Page loads without errors
   - No console errors (F12 → Console)
   - All components render
   - Diagnostic dashboard section visible

**If dashboard doesn't load:**
- Check browser console for errors
- Verify Clerk authentication is working
- Check Vercel build logs

### 3. Diagnostic Dashboard Features

#### A. Main Dashboard Section
- [ ] "Your Real-Time Diagnostic Dashboard" heading visible
- [ ] Quick stats display (Overall Score, Critical Issues, Revenue at Risk, Quick Wins)
- [ ] Issues list shows diagnostic issues
- [ ] Each issue has severity badge, description, and "Fix Now" button

#### B. Relevance Overlay
- [ ] "Relevance Overlay" button visible
- [ ] Clicking opens modal/overlay
- [ ] Query input field works
- [ ] Relevance scores display
- [ ] Competitor comparison shows

#### C. RI Simulator
- [ ] RI Simulator section visible
- [ ] Current vs. Projected RI displays
- [ ] Scenario selection works
- [ ] "Run Simulation" button works
- [ ] Templates load (click "Show Templates")
- [ ] Custom scenario creation works

#### D. Trends & Predictions
- [ ] "Show Trends" button visible
- [ ] Clicking displays historical trends chart
- [ ] Predictions show future projections
- [ ] Chart is interactive

#### E. Fix Actions
- [ ] "Fix Now" buttons visible on issues
- [ ] Clicking triggers workflow
- [ ] Success message appears
- [ ] Issue status updates

#### F. Export Functionality
- [ ] "Export Data" button visible
- [ ] Clicking prompts for format (JSON/CSV)
- [ ] File downloads successfully

### 4. API Endpoint Testing

#### Using Browser DevTools

1. **Open Dashboard:** https://dash.dealershipai.com/dashboard
2. **Open DevTools:** F12
3. **Go to Network Tab**
4. **Filter by:** `api`
5. **Interact with dashboard features**
6. **Verify API calls:**
   - Status: 200 OK
   - Response: Valid JSON
   - No 404 or 500 errors

#### Manual API Testing (with Auth Token)

If you have a Clerk session token:

```bash
# Get session token from browser (DevTools → Application → Cookies)
SESSION_TOKEN="your-session-token"

# Test diagnostics endpoint
curl -H "Cookie: __session=$SESSION_TOKEN" \
  https://dash.dealershipai.com/api/diagnostics?domain=test.com

# Test scenarios templates
curl -H "Cookie: __session=$SESSION_TOKEN" \
  https://dash.dealershipai.com/api/scenarios/templates
```

### 5. Error Checking

#### Browser Console
- [ ] No red errors
- [ ] No failed network requests
- [ ] No React warnings
- [ ] No TypeScript errors

#### Vercel Logs
1. Go to: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. Click: "Deployments" → Latest deployment → "Logs"
3. Check for:
   - Build errors
   - Runtime errors
   - API errors

---

## 🐛 Troubleshooting

### Issue: Dashboard Returns 404

**Solution:**
- Verify route exists: `app/(dashboard)/dashboard/page.tsx`
- Check Vercel build logs for routing errors
- Verify middleware allows dashboard route

### Issue: Diagnostic Dashboard Not Visible

**Solution:**
- Verify component imported: `components/dashboard/DiagnosticDashboard.tsx`
- Check browser console for import errors
- Verify domain/dealerId props are passed

### Issue: API Returns 401 Unauthorized

**Solution:**
- This is expected for unauthenticated requests
- Sign in to dashboard first
- Verify Clerk authentication is configured

### Issue: API Returns 404

**Solution:**
- Verify route file exists: `app/api/[endpoint]/route.ts`
- Check Vercel build logs
- Verify route is exported correctly

### Issue: Build Fails

**Solution:**
1. Check Vercel build logs
2. Verify all dependencies installed
3. Check for TypeScript errors: `npm run type-check`
4. Verify Prisma schema: `npx prisma generate`

---

## 📊 Success Criteria

### Must Have (Critical)
- [x] Health endpoint responds
- [ ] Dashboard loads
- [ ] Diagnostic dashboard visible
- [ ] No console errors
- [ ] API endpoints accessible (with auth)

### Should Have (Important)
- [ ] All diagnostic features work
- [ ] Relevance Overlay opens
- [ ] RI Simulator runs
- [ ] Fix actions trigger
- [ ] Export generates files

### Nice to Have (Optional)
- [ ] Trends chart displays
- [ ] Custom scenarios save
- [ ] Templates load
- [ ] Notifications work

---

## 🔗 Quick Reference

### URLs
- **Dashboard:** https://dash.dealershipai.com/dashboard
- **Health:** https://dash.dealershipai.com/api/health
- **Vercel:** https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard

### Commands
```bash
# Health check
curl https://dash.dealershipai.com/api/health

# Check build status
npx vercel ls

# View logs
npx vercel logs --follow
```

### Documentation
- `DEPLOYMENT_COMPLETE.md` - Deployment summary
- `DEPLOYMENT_ISSUE_REPORT.md` - Issue tracking
- `NEXT_STEPS_DEPLOYMENT.md` - Next steps guide

---

## ✅ Verification Complete

Once all items are checked:
1. Document any issues found
2. Create tickets for bugs
3. Update deployment status
4. Notify team of successful deployment

---

**Last Updated:** November 12, 2025  
**Status:** Ready for verification

