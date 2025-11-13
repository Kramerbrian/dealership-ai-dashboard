# Clerk Domain Configuration Guide

## Overview
This document explains the Clerk authentication domain configuration for the DealershipAI dashboard, specifically addressing the subdomain architecture.

## Architecture

### Domain Structure
- **Main Domain**: `dealershipai.com` - Marketing landing page (NO Clerk authentication)
- **Dashboard Subdomain**: `dash.dealershipai.com` - Full application with Clerk authentication

### Problem Solved
When using Clerk authentication on a subdomain, cookies must be explicitly configured for that subdomain to prevent cross-domain cookie issues and infinite redirect loops.

## Configuration

### Middleware Setup
Location: [`middleware.ts:185`](../middleware.ts#L185)

```typescript
return clerkMw(async (auth: any, req: NextRequest) => {
  // ... authentication logic ...
}, {
  // CRITICAL: Set domain for Clerk cookies to match dashboard subdomain
  domain: 'dash.dealershipai.com',
  // CRITICAL: Tell Clerk these routes should skip auth entirely
  publicRoutes: [
    // ... routes ...
  ]
})(req);
```

### Key Points

1. **Explicit Domain Configuration**: The `domain: 'dash.dealershipai.com'` setting ensures all Clerk cookies are set with the correct domain attribute.

2. **Cookie Security**: Without this configuration, browsers may block cookies due to same-site security policies, causing authentication failures.

3. **Redirect Chain**: The middleware implements a two-tier redirect system:
   - Tier 1: Main domain redirects dashboard paths to subdomain
   - Tier 2: Dashboard subdomain handles authentication

## Common Issues

### Issue 1: Infinite Redirect Loop
**Symptom**: URL contains `__clerk_handshake` parameter and continuously redirects

**Cause**: Clerk cookies being set for wrong domain (dealershipai.com instead of dash.dealershipai.com)

**Solution**: Add explicit `domain` configuration to clerkMiddleware options

### Issue 2: 500 Errors on Main Domain
**Symptom**: Protected routes on main domain return HTTP 500

**Cause**: Clerk is disabled on main domain but routes are marked as protected

**Solution**: Redirect all dashboard paths to subdomain before authentication logic runs

## Testing

### Verify Authentication Flow
```bash
# Test main domain loads
curl -I https://dealershipai.com

# Test dashboard redirect
curl -I https://dealershipai.com/dash
# Should return: HTTP 308 -> dash.dealershipai.com/dash

# Test authentication redirect
curl -I https://dash.dealershipai.com/onboarding
# Should return: HTTP 307 -> /sign-in?redirect_url=...
```

### Inspect Cookies
Use browser DevTools to verify:
- Clerk cookies have `Domain=dash.dealershipai.com`
- No cookies with `Domain=dealershipai.com` from Clerk

## Deployment Checklist

- [ ] Verify `domain` configuration in middleware.ts
- [ ] Test authentication flow on subdomain
- [ ] Verify no handshake loops
- [ ] Check cookie domain attributes in browser
- [ ] Test redirect chain from main domain to subdomain
- [ ] Verify sign-in and sign-up flows work correctly

## References

- Clerk Documentation: https://clerk.com/docs/references/nextjs/custom-signup-signin-pages
- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Cookie Security: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

## Commit History

Key commits related to this configuration:
- `46efe6c` - Set explicit Clerk domain for dashboard subdomain cookies
- `8fda6d3` - Add redirects from main domain to dashboard subdomain
