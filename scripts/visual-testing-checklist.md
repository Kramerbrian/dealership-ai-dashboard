# Visual Testing Checklist - DealershipAI Dashboard

**Date:** November 4, 2025  
**Purpose:** End-to-end visual verification of dashboard functionality

## Pre-Testing Setup

- [ ] Start dev server: `npm run dev`
- [ ] Open browser: `http://localhost:3000/dashboard`
- [ ] Clear browser cache
- [ ] Open DevTools (F12)
- [ ] Check Network tab for API calls
- [ ] Check Console for errors

---

## 1. Authentication & User Context ✅

### Visual Checks:
- [ ] **Login/Signup**: Can access dashboard without errors
- [ ] **User Info**: User email/name displays in header (if authenticated)
- [ ] **Dealer ID**: Dashboard loads with correct dealerId (check Network tab)
- [ ] **Fallback**: If not authenticated, shows "default-dealer" gracefully

### Network Checks:
- [ ] Verify `/api/user/profile` is called
- [ ] Check response contains `dealerId` or `tenantId`
- [ ] Verify no 401/403 errors

### Code Verification:
- [ ] `useAuthContext` hook is working
- [ ] `dealerId` is passed to `useDashboardData`
- [ ] No hardcoded "default-dealer" in production

---

## 2. Dashboard Data Loading ✅

### Visual Checks:
- [ ] **Loading State**: Skeleton loader appears during initial load
- [ ] **Data Display**: All metrics display correctly:
  - SEO Visibility Score (87.3 or from API)
  - AEO Visibility Score (73.8 or from API)
  - GEO Visibility Score (65.2 or from API)
  - Total Visibility Score
  - Revenue Impact
  - Opportunities Found
  - Trust Score
- [ ] **Trends**: Percentage changes display (e.g., +12%, +8%)
- [ ] **Progress Bars**: Progress bars animate correctly
- [ ] **No Errors**: No red error messages in UI

### Network Checks:
- [ ] All 7 API endpoints called in parallel:
  - `/api/dashboard/overview`
  - `/api/visibility/seo`
  - `/api/visibility/aeo`
  - `/api/visibility/geo`
  - `/api/dashboard/ai-health`
  - `/api/dashboard/website`
  - `/api/dashboard/reviews`
- [ ] Response times < 2 seconds each
- [ ] No failed requests (check Network tab)

### Console Checks:
- [ ] No console errors
- [ ] No React warnings
- [ ] No hydration errors

---

## 3. Auto-Refresh Functionality ✅

### Visual Checks:
- [ ] **Initial Load**: Data loads immediately
- [ ] **Auto-Refresh**: Data updates every 60 seconds (watch for changes)
- [ ] **No Flicker**: Updates happen smoothly without page reload
- [ ] **Loading Indicator**: Subtle indicator shows refresh (optional)

### Network Checks:
- [ ] API calls repeat every 60 seconds
- [ ] Requests are cached (check Cache-Control headers)
- [ ] No duplicate requests

---

## 4. Cognitive Dashboard Modal ✅

### Visual Checks:
- [ ] **Button**: "🧠 Cognitive Dashboard" button visible in header
- [ ] **Modal Opens**: Clicking button opens modal
- [ ] **Modal Content**: All 6 manager sections visible:
  - General Sales Manager
  - New Car Manager
  - Used Car Manager
  - Service Director/Manager
  - Parts Manager
  - Marketing / eCommerce Director
- [ ] **Expandable Sections**: Clicking sections expands/collapses
- [ ] **KPI Display**: Each section shows:
  - 1 Positive KPI (green)
  - 2 Opportunity KPIs (orange)
- [ ] **Priority Badges**: High priority KPIs show "HIGH PRIORITY" badge
- [ ] **ROI Display**: Revenue opportunities show (e.g., "$45K/month")
- [ ] **Drawer Opens**: Clicking KPI opens drawer with insights
- [ ] **Drawer Content**: Drawer shows:
  - Title and description
  - Revenue opportunity
  - Action items
  - Expected impact
  - Timeline
- [ ] **Drawer Closes**: X button closes drawer
- [ ] **Modal Closes**: Clicking outside or X button closes modal

### Interaction Tests:
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test mobile touch interactions
- [ ] Test scroll behavior in modal

---

## 5. HAL-9000 Chatbot ✅

### Visual Checks:
- [ ] **Floating Button**: Chatbot button appears at bottom center
- [ ] **Button Style**: Gradient blue/purple, animated sparkles
- [ ] **Chat Window**: Clicking button opens chat window
- [ ] **Header**: Shows "HAL-9000" with animated icon
- [ ] **Welcome Message**: Initial greeting message displays
- [ ] **Quick Actions**: Quick action buttons show (if available)
- [ ] **Input Field**: Text input at bottom
- [ ] **Send Button**: Send button enabled when typing
- [ ] **Messages**: User and bot messages display correctly
- [ ] **Loading State**: "HAL is thinking..." shows during response
- [ ] **Close Button**: X button closes chat window

### Interaction Tests:
- [ ] Type message and press Enter
- [ ] Click Send button
- [ ] Test quick action buttons
- [ ] Test closing and reopening
- [ ] Test scrolling in message history

---

## 6. Error Handling ✅

### Visual Checks:
- [ ] **API Errors**: If API fails, toast notification appears
- [ ] **Retry Button**: Toast has "Retry" action button
- [ ] **Error Boundary**: Component errors show error boundary UI
- [ ] **Fallback Values**: Dashboard shows fallback values if data fails
- [ ] **No Crashes**: Page never completely crashes

### Test Scenarios:
- [ ] Disable network (Offline mode)
- [ ] Block API endpoints (Network tab → Block request)
- [ ] Simulate 500 error
- [ ] Simulate 401 error
- [ ] Simulate slow network (throttle to Slow 3G)

---

## 7. Performance ✅

### Core Web Vitals:
- [ ] **LCP** (Largest Contentful Paint): < 2.5s
- [ ] **FID** (First Input Delay): < 100ms
- [ ] **CLS** (Cumulative Layout Shift): < 0.1

### Load Times:
- [ ] **Initial Load**: < 3 seconds
- [ ] **Time to Interactive**: < 4 seconds
- [ ] **API Response**: < 2 seconds per endpoint

### Bundle Size:
- [ ] Check Network tab for bundle sizes
- [ ] Main bundle < 500KB (gzipped)
- [ ] Total initial load < 1MB

### Lighthouse Score:
- [ ] Run Lighthouse audit
- [ ] Performance: > 80
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90

---

## 8. Responsive Design ✅

### Desktop (> 1024px):
- [ ] All components display correctly
- [ ] Grid layouts work (3 columns, 4 columns)
- [ ] Modals are properly sized
- [ ] Chatbot is positioned correctly

### Tablet (768px - 1024px):
- [ ] Layout adapts to 2 columns
- [ ] Modals are responsive
- [ ] Text is readable
- [ ] Touch targets are adequate

### Mobile (< 768px):
- [ ] Single column layout
- [ ] Navigation tabs scroll horizontally
- [ ] Modals are full-screen or close to it
- [ ] Chatbot button is accessible
- [ ] All text is readable without zooming

---

## 9. Accessibility ✅

### Keyboard Navigation:
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Focus indicators visible

### Screen Reader:
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] All images have alt text
- [ ] Buttons have descriptive labels
- [ ] Modals announce when opened
- [ ] Form fields have labels

### ARIA:
- [ ] Check ARIA labels in DevTools
- [ ] Modals have proper roles
- [ ] Loading states are announced
- [ ] Error messages are announced

---

## 10. Browser Compatibility ✅

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Test Results

**Date:** ___________  
**Tester:** ___________  
**Browser:** ___________  
**OS:** ___________

### Summary:
- Total Tests: 50+
- Passed: ___
- Failed: ___
- Issues Found: ___

### Critical Issues:
1. _________________________________
2. _________________________________
3. _________________________________

### Recommendations:
1. _________________________________
2. _________________________________
3. _________________________________

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Run audit
npx tsx scripts/dashboard-audit.ts

# Run endpoint tests (when server running)
npx tsx scripts/test-dashboard-endpoints.ts

# Check for linting errors
npm run lint

# Check TypeScript errors
npx tsc --noEmit
```

