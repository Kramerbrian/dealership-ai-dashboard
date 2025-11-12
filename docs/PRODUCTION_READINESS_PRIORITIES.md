# 🚀 Production Readiness Priorities

**Goal:** Get Landing Page, Middleware, Onboarding, and Dashboard 100% operational

**Last Updated:** 2025-11-06

---

## 🔴 CRITICAL (Fix This Week - Blocks Launch)

### 1. **Middleware Authentication** ⚠️ BLOCKER
**Status:** ❌ Using deprecated Clerk API  
**Impact:** Authentication may break in production  
**Files:** `middleware.ts`

**Issue:**
```typescript
// Current (DEPRECATED):
import { authMiddleware } from '@clerk/nextjs';
export default authMiddleware({ ... });

// Should be:
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
```

**Fix:**
- [ ] Update to `clerkMiddleware` API
- [ ] Use `createRouteMatcher` for protected routes
- [ ] Test all public/protected route combinations
- [ ] Verify redirects work correctly

**Time:** 30 minutes

---

### 2. **Landing Page Auth Routes** ⚠️ BLOCKER
**Status:** ❌ Broken signup/signin links  
**Impact:** Users cannot create accounts  
**Files:** `app/(marketing)/page.tsx`, all landing variants

**Issue:**
```typescript
// Broken:
router.push('/auth/signup');  // ❌ 404
href="/auth/signin"           // ❌ 404

// Should be:
router.push('/sign-up');       // ✅ Clerk route
href="/sign-in"               // ✅ Clerk route
```

**Fix:**
- [ ] Find all `/auth/signup` and `/auth/signin` references
- [ ] Replace with `/sign-up` and `/sign-in`
- [ ] Test signup flow end-to-end
- [ ] Test signin flow end-to-end

**Time:** 1 hour

---

### 3. **Onboarding Completion API** ⚠️ BLOCKER
**Status:** ❌ API endpoint doesn't exist  
**Impact:** Onboarding status not persisted  
**Files:** `app/(marketing)/onboarding/page.tsx`, `app/api/user/onboarding-complete/route.ts`

**Issue:**
```typescript
// Called but doesn't exist:
await fetch('/api/user/onboarding-complete', { method: 'POST' });
```

**Fix:**
- [ ] Create `app/api/user/onboarding-complete/route.ts`
- [ ] Update Clerk user metadata with onboarding status
- [ ] Update middleware to check onboarding status
- [ ] Redirect incomplete users to onboarding

**Time:** 1 hour

---

## 🟠 HIGH (Fix This Week - Critical UX)

### 4. **Landing Page OG Images** 
**Status:** ❌ Missing  
**Impact:** Poor social sharing, low CTR  
**Files:** `app/(marketing)/page.tsx`, `app/opengraph-image.tsx`

**Fix:**
- [ ] Create OG image (1200x630px)
- [ ] Add dynamic OG image generation
- [ ] Test on Twitter, LinkedIn, Facebook
- [ ] Add fallback image

**Time:** 2 hours

---

### 5. **Console Logging in Production**
**Status:** ❌ Security risk  
**Impact:** Data leakage, performance issues  
**Files:** Multiple components

**Fix:**
- [ ] Find all `console.log`, `console.error`, `console.warn`
- [ ] Replace with proper logging service
- [ ] Add environment check: `if (process.env.NODE_ENV === 'development')`
- [ ] Use structured logging (e.g., `lib/logger.ts`)

**Time:** 2 hours

---

### 6. **Accessibility (ADA Compliance)**
**Status:** ❌ Missing ARIA attributes  
**Impact:** Legal risk, excludes disabled users  
**Files:** All landing/dashboard components

**Fix:**
- [ ] Add `aria-label` to all buttons
- [ ] Add `role` attributes where needed
- [ ] Ensure keyboard navigation works
- [ ] Test with screen reader
- [ ] Add focus indicators

**Time:** 4 hours

---

### 7. **Dashboard Data Loading States**
**Status:** ⚠️ Some missing  
**Impact:** Poor UX, appears broken  
**Files:** `app/(dashboard)/dashboard/page.tsx`

**Fix:**
- [ ] Add loading skeletons for all data fetches
- [ ] Add error boundaries
- [ ] Add empty states
- [ ] Test slow network conditions

**Time:** 3 hours

---

## 🟡 MEDIUM (Fix This Month - Quality)

### 8. **API Route TODOs**
**Status:** ⚠️ Many stubbed  
**Impact:** Features don't work fully  
**Files:** Multiple API routes

**Priority Routes:**
- [ ] `/api/visibility/presence` - Filter by tenant prefs
- [ ] `/api/ai-scores` - Real data integration
- [ ] `/api/metrics/rar` - Real revenue calculations
- [ ] `/api/fix/deploy` - Actual fix deployment

**Time:** 8 hours

---

### 9. **Onboarding Data Persistence**
**Status:** ⚠️ Uses localStorage  
**Impact:** Data lost on clear cache  
**Files:** `app/(marketing)/onboarding/page.tsx`

**Fix:**
- [ ] Move to Clerk user metadata
- [ ] Add database persistence
- [ ] Add resume capability
- [ ] Test cross-device sync

**Time:** 3 hours

---

### 10. **Error Handling & Boundaries**
**Status:** ⚠️ Incomplete  
**Impact:** App crashes on errors  
**Files:** All pages

**Fix:**
- [ ] Add React Error Boundaries
- [ ] Add API error handling
- [ ] Add user-friendly error messages
- [ ] Add error reporting (Sentry)

**Time:** 4 hours

---

## 🟢 LOW (Nice to Have)

### 11. **Performance Optimization**
- [ ] Image optimization
- [ ] Code splitting
- [ ] Bundle size reduction
- [ ] Lighthouse score > 90

**Time:** 6 hours

---

### 12. **Analytics Integration**
- [ ] Google Analytics 4
- [ ] PostHog/Mixpanel
- [ ] Conversion tracking
- [ ] Funnel analysis

**Time:** 4 hours

---

## 📋 Implementation Checklist

### Week 1 (Critical)
- [ ] Day 1: Fix middleware authentication
- [ ] Day 1: Fix landing page auth routes
- [ ] Day 2: Create onboarding completion API
- [ ] Day 2: Test complete signup → onboarding → dashboard flow
- [ ] Day 3: Add OG images
- [ ] Day 3: Remove console logs
- [ ] Day 4: Add accessibility attributes
- [ ] Day 5: Add loading states

### Week 2 (High Priority)
- [ ] Day 1-2: Fix API route TODOs (priority routes)
- [ ] Day 3: Move onboarding to Clerk metadata
- [ ] Day 4: Add error boundaries
- [ ] Day 5: Testing & bug fixes

### Week 3 (Polish)
- [ ] Performance optimization
- [ ] Analytics integration
- [ ] Final testing
- [ ] Documentation

---

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out
- [ ] Protected route access
- [ ] Public route access
- [ ] Redirect after auth

### Onboarding Flow
- [ ] Start onboarding
- [ ] Complete all steps
- [ ] Skip optional steps
- [ ] Resume after refresh
- [ ] Redirect to dashboard on complete

### Dashboard Flow
- [ ] Load dashboard data
- [ ] Handle loading states
- [ ] Handle error states
- [ ] All modals open/close
- [ ] All API calls work

### Landing Page Flow
- [ ] Enter URL
- [ ] Run scan
- [ ] View results
- [ ] Share to unlock
- [ ] Sign up from landing
- [ ] Social sharing works

---

## 🚨 Known Issues

1. **Middleware uses deprecated API** - Must fix before deploy
2. **Landing page has broken auth links** - Blocks signups
3. **Onboarding API missing** - Status not saved
4. **Many API routes stubbed** - Features incomplete
5. **No error boundaries** - App can crash
6. **Console logs in production** - Security risk

---

## 📊 Success Metrics

**Launch Ready When:**
- ✅ All CRITICAL items fixed
- ✅ All HIGH items fixed
- ✅ Authentication flow works end-to-end
- ✅ Onboarding flow works end-to-end
- ✅ Dashboard loads with real data
- ✅ Landing page converts visitors
- ✅ No console errors in production
- ✅ Lighthouse score > 80
- ✅ All tests passing

---

## 🎯 Quick Wins (Do First)

1. **Fix middleware** (30 min) - Unblocks everything
2. **Fix auth routes** (1 hour) - Unblocks signups
3. **Create onboarding API** (1 hour) - Completes flow
4. **Add OG images** (2 hours) - Improves sharing

**Total: 4.5 hours to unblock launch**

---

## 📞 Support

If you get stuck:
1. Check Clerk docs: https://clerk.com/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Review error logs in Vercel dashboard
4. Test locally with `npm run dev`

