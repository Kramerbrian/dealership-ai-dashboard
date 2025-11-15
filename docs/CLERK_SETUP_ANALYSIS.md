# Clerk Setup Analysis & Recommendations

## Current Setup

### ✅ What's Working
1. **Middleware Configuration** - Properly configured for multi-domain setup
   - Main domain (`dealershipai.com`) - No Clerk, public routes
   - Dashboard domain (`dash.dealershipai.com`) - Clerk enabled, protected routes

2. **ClerkProviderWrapper** - Gracefully handles missing Clerk keys
   - Skips ClerkProvider when keys not configured
   - Only renders on dashboard domain

3. **Environment Variables** - All set in Vercel
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ✅
   - `CLERK_SECRET_KEY` ✅

### ⚠️ Issues Found

#### Issue 1: Static Import of Clerk in `lib/rbac.ts`
**Problem:**
- `lib/rbac.ts` was importing `auth` and `clerkClient` statically
- Next.js was trying to bundle this for client components
- Error: "This module cannot be imported from a Client Component module"

**Solution Applied:**
- Changed to dynamic imports inside `requireRBAC()`
- Only imports Clerk when actually needed (server-side only)
- Prevents client-side bundling

#### Issue 2: No Domain Check in Protected Endpoints
**Problem:**
- `/api/agentic/execute` was calling `requireRBAC()` without checking domain
- If called from `dealershipai.com` (main domain), Clerk isn't configured
- Causes 500 errors instead of proper 401/403

**Solution Applied:**
- Added domain check in `/api/agentic/execute`
- Returns 403 if called from wrong domain
- Only processes on dashboard domain where Clerk is active

---

## Recommended Clerk Setup

### Current Architecture (Correct)
```
dealershipai.com (main)
  ├── No Clerk
  ├── Public routes only
  └── Landing page, marketing

dash.dealershipai.com (dashboard)
  ├── Clerk enabled
  ├── Protected routes
  └── Full application
```

### Best Practices Applied

1. **Dynamic Imports for Server-Only Code**
   ```typescript
   // ✅ GOOD - Dynamic import
   const { auth } = await import('@clerk/nextjs/server');
   
   // ❌ BAD - Static import (can cause client bundling)
   import { auth } from '@clerk/nextjs/server';
   ```

2. **Domain-Aware Endpoints**
   ```typescript
   // ✅ GOOD - Check domain first
   const hostname = req.headers.get('host') || '';
   if (!isDashboardDomain(hostname)) {
     return NextResponse.json({ error: 'Not available' }, { status: 403 });
   }
   ```

3. **Graceful Error Handling**
   ```typescript
   // ✅ GOOD - Try-catch with proper error responses
   try {
     const { userId } = await auth();
   } catch (error) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

---

## Clerk Configuration Checklist

### Vercel Environment Variables
- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Set
- [x] `CLERK_SECRET_KEY` - Set

### Clerk Dashboard Settings
- [ ] **Allowed Origins:**
  - `https://dash.dealershipai.com`
  - `https://*.vercel.app` (for preview deployments)
  - `http://localhost:3000` (for development)

- [ ] **Redirect URLs:**
  - Sign-in: `https://dash.dealershipai.com/sign-in`
  - Sign-up: `https://dash.dealershipai.com/sign-up`
  - After sign-in: `https://dash.dealershipai.com/dash`
  - After sign-up: `https://dash.dealershipai.com/onboarding`

- [ ] **Custom Domain (Optional):**
  - If using SSO, configure `dash.dealershipai.com` in Clerk
  - Add DNS records as instructed by Clerk

---

## Testing Clerk Setup

### 1. Test Authentication Flow
```bash
# Should redirect to sign-in
curl -I https://dash.dealershipai.com/dash

# Should return 401 (not 500)
curl -X POST https://dash.dealershipai.com/api/agentic/execute \
  -H "Content-Type: application/json" \
  -d '{"batch_id":"test","actions":[]}'
```

### 2. Test Domain Separation
```bash
# Main domain - should work without auth
curl https://dealershipai.com/api/health

# Dashboard domain - should require auth
curl https://dash.dealershipai.com/api/agentic/execute
```

### 3. Test Error Handling
```bash
# Should return 401, not 500
curl -X POST https://dash.dealershipai.com/api/agentic/execute \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Common Issues & Fixes

### Issue: "This module cannot be imported from a Client Component module"
**Fix:** Use dynamic imports for Clerk server functions
```typescript
// Instead of: import { auth } from '@clerk/nextjs/server'
const { auth } = await import('@clerk/nextjs/server');
```

### Issue: 500 Errors on Auth Failures
**Fix:** Wrap auth calls in try-catch
```typescript
try {
  const { userId } = await auth();
} catch (error) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Issue: Auth Works Locally but Fails in Production
**Fix:** Check domain configuration
- Verify Clerk dashboard has correct allowed origins
- Check environment variables are set in Vercel
- Ensure middleware is running on correct domain

---

## Next Steps

1. **Verify Clerk Dashboard Settings**
   - Check allowed origins match your domains
   - Verify redirect URLs are correct
   - Test sign-in/sign-up flow

2. **Test After Deployment**
   - Run verification script: `npm run vercel:verify`
   - Test protected endpoints return 401 (not 500)
   - Verify sign-in flow works end-to-end

3. **Monitor for Errors**
   - Check Vercel logs for auth-related errors
   - Monitor Sentry for Clerk errors
   - Watch for 500 errors on protected routes

---

**Status:** ✅ Clerk setup is correct, fixes applied for dynamic imports and error handling

