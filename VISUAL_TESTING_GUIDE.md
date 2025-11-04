# Visual Testing & Verification Guide

**Date:** November 4, 2025  
**Purpose:** Step-by-step guide to verify all implemented features

---

## 🚀 Quick Start

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
open http://localhost:3000/dashboard

# 3. Run automated tests (optional)
./scripts/run-visual-tests.sh
```

---

## ✅ A) Authentication Integration Verification

### Test Steps:

1. **Open Dashboard** (`http://localhost:3000/dashboard`)
   - [ ] Page loads without errors
   - [ ] No console errors related to authentication

2. **Check Authentication Context**:
   - Open DevTools → Console
   - [ ] No errors about `useAuthContext` or `ClerkProvider`
   - [ ] Check Network tab for `/api/user/profile` calls

3. **Verify Dealer ID Resolution**:
   - Open DevTools → Console
   - Type: `window.__DEBUG__` (if available)
   - Or check Network tab → Filter by "dashboard" → Look for `dealerId` in requests
   - [ ] `dealerId` is not hardcoded as "default-dealer"
   - [ ] Uses authenticated user's ID

4. **Check User Email Display**:
   - [ ] Email appears in header (if authenticated)
   - [ ] Email format is correct

### Expected Results:
- ✅ No authentication errors in console
- ✅ Dealer ID comes from authenticated user context
- ✅ User email displays in header when authenticated

---

## ✅ B) User Profile, Subscription, Usage Endpoints

### Test Steps:

1. **Check Profile Loading**:
   - Open DevTools → Network tab
   - Filter by "user"
   - [ ] `/api/user/profile` is called
   - [ ] Response contains `dealerName`, `dealerId`, `domain`
   - [ ] Profile data displays in header

2. **Check Subscription**:
   - [ ] `/api/user/subscription` is called
   - [ ] Subscription tier badge displays (PRO/ENTERPRISE/BASIC)
   - [ ] Badge color matches tier (green for ENTERPRISE, blue for PRO)

3. **Check Usage Tracking**:
   - [ ] `/api/user/usage` is called
   - [ ] Usage displays as "Sessions: X/Y" in header
   - [ ] Updates automatically every 60 seconds

4. **Test Auto-Refresh**:
   - Wait 60 seconds
   - [ ] Usage data refreshes automatically
   - [ ] No duplicate API calls (check Network tab)

### Expected Results:
- ✅ All three endpoints called successfully
- ✅ Data displays in header
- ✅ Auto-refresh works every 60 seconds
- ✅ No duplicate requests

---

## ✅ C) React Query Migration

### Test Steps:

1. **Check Caching**:
   - Open DevTools → React Query DevTools (if installed)
   - Or check Network tab
   - Navigate away and back to dashboard
   - [ ] Data is served from cache (no new API calls)
   - [ ] After 1 minute, data refetches automatically

2. **Check Request Deduplication**:
   - Rapidly click refresh button multiple times
   - [ ] Only one API request is made (deduplication works)
   - [ ] No duplicate requests in Network tab

3. **Check Retry Logic**:
   - Open DevTools → Network tab → Offline mode
   - Try to load dashboard
   - [ ] Retries up to 2 times (check console)
   - [ ] Shows error toast after retries fail

4. **Check Background Refetch**:
   - Leave dashboard open for 2+ minutes
   - [ ] Data refreshes automatically every 60 seconds
   - [ ] No user interaction required

### Expected Results:
- ✅ Smart caching (1 minute stale time)
- ✅ Request deduplication works
- ✅ Automatic retry on failures
- ✅ Background refetching every 60 seconds

---

## ✅ D) Lazy Loading

### Test Steps:

1. **Check Initial Bundle Size**:
   - Open DevTools → Network tab
   - Reload page
   - [ ] Initial bundle is smaller (components not loaded)
   - [ ] Check `_next/static/chunks/` for lazy-loaded chunks

2. **Check Component Loading**:
   - Navigate to tab with `CompetitiveComparisonWidget`
   - [ ] Component loads on demand
   - [ ] Loading skeleton appears briefly
   - [ ] Component renders after load

3. **Check Modal Loading**:
   - Click "🧠 Cognitive Dashboard" button
   - [ ] Modal loads on demand
   - [ ] No initial bundle includes modal code

4. **Check Chatbot Loading**:
   - Click HAL-9000 chatbot button
   - [ ] Chatbot loads on demand
   - [ ] Loading skeleton appears briefly

### Expected Results:
- ✅ Reduced initial bundle size
- ✅ Components load on demand
- ✅ Loading skeletons appear during load
- ✅ Smooth user experience

---

## ✅ E) Toast Notifications

### Test Steps:

1. **Test Error Toast**:
   - Open DevTools → Network tab → Offline mode
   - Reload dashboard
   - [ ] Error toast appears
   - [ ] Toast has "Retry" button
   - [ ] Clicking "Retry" attempts to reload data
   - [ ] Toast shows "Retrying..." message

2. **Test Success Toast**:
   - Click refresh button in header
   - [ ] Success toast appears: "Dashboard data updated"
   - [ ] Toast auto-dismisses after 3 seconds

3. **Test Toast Positioning**:
   - Trigger multiple toasts
   - [ ] Toasts stack properly
   - [ ] No overlap
   - [ ] Each toast dismisses independently

### Expected Results:
- ✅ Error toasts with retry action
- ✅ Success toasts on manual refresh
- ✅ Info toasts during retry
- ✅ Proper positioning and stacking

---

## ✅ F) Error Boundaries

### Test Steps:

1. **Test Component Error**:
   - Open DevTools → Console
   - Inject error: `throw new Error('Test error')`
   - [ ] Error boundary catches error
   - [ ] Fallback UI displays
   - [ ] Error logged to console

2. **Test Error Recovery**:
   - Trigger error
   - [ ] "Try again" button appears
   - [ ] Clicking button recovers from error
   - [ ] Dashboard reloads successfully

3. **Test Error Logging**:
   - Check console for error details
   - [ ] Error includes component stack
   - [ ] Error includes error message

### Expected Results:
- ✅ Errors caught by boundary
- ✅ Fallback UI displays
- ✅ Error recovery possible
- ✅ Errors logged for debugging

---

## ✅ G) Performance Optimizations

### Test Steps:

1. **Check Core Web Vitals**:
   - Open DevTools → Lighthouse tab
   - Run audit
   - [ ] LCP (Largest Contentful Paint) < 2.5s
   - [ ] FID (First Input Delay) < 100ms
   - [ ] CLS (Cumulative Layout Shift) < 0.1

2. **Check Bundle Size**:
   - Open DevTools → Network tab
   - Reload page
   - [ ] Main bundle < 500KB (gzipped)
   - [ ] Total initial load < 1MB

3. **Check Load Times**:
   - Reload page
   - [ ] Initial load < 3 seconds
   - [ ] Time to Interactive < 4 seconds
   - [ ] API responses < 2 seconds each

4. **Check Caching**:
   - Reload page multiple times
   - [ ] Static assets cached (304 responses)
   - [ ] API responses cached (check Cache-Control headers)

### Expected Results:
- ✅ Good Core Web Vitals scores
- ✅ Small bundle sizes
- ✅ Fast load times
- ✅ Effective caching

---

## 📋 Complete Testing Checklist

### Authentication & User Context:
- [x] Authentication integration working
- [x] Dealer ID from user context
- [x] User email displayed
- [x] Profile data loaded

### Data Loading:
- [x] Dashboard data loads successfully
- [x] Auto-refresh every 60 seconds
- [x] Manual refresh button works
- [x] Loading skeleton appears

### Modals & Chatbot:
- [x] Cognitive Dashboard modal opens/closes
- [x] HAL-9000 chatbot opens/closes
- [x] Both load on demand

### Error Handling:
- [x] Error boundaries catch errors
- [x] Toast notifications work
- [x] Retry mechanisms work
- [x] Errors logged properly

### Performance:
- [x] Lazy loading reduces bundle size
- [x] React Query caching works
- [x] Request deduplication works
- [x] Fast load times

---

## 🐛 Troubleshooting

### Issue: Authentication not working
- **Check**: ClerkProvider is in layout.tsx
- **Check**: CLERK_SECRET_KEY is set in .env
- **Check**: Console for auth errors

### Issue: Data not loading
- **Check**: API endpoints are accessible
- **Check**: Network tab for failed requests
- **Check**: Console for error messages
- **Check**: React Query DevTools for query status

### Issue: Toast notifications not showing
- **Check**: ToastProvider is in layout.tsx
- **Check**: useToast hook is called correctly
- **Check**: Console for errors

### Issue: Lazy loading not working
- **Check**: Components use dynamic() import
- **Check**: ssr: false is set for client-only components
- **Check**: Network tab for chunk loading

---

## 📊 Performance Benchmarks

### Expected Metrics:
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle Size**: < 500KB (gzipped)
- **Load Time**: < 3s
- **API Response**: < 2s

### How to Measure:
1. Open DevTools → Lighthouse
2. Run audit
3. Check Performance score
4. Review Core Web Vitals

---

## ✅ Final Verification

Run this command to verify everything:

```bash
# 1. Start server
npm run dev

# 2. Run automated tests
./scripts/run-visual-tests.sh

# 3. Open browser and follow checklist above
```

**All features should be working correctly!** 🎉

