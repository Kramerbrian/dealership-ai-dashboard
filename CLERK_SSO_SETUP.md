# Clerk SSO Setup Guide
## Connecting marketing.dealershipai.com to dash.dealershipai.com

This guide explains how to set up Single Sign-On (SSO) between your marketing site and dashboard using Clerk's multi-domain satellite feature.

## Architecture Overview

- **Primary Domain**: `marketing.dealershipai.com` (Next.js app where users authenticate)
- **Satellite Domain**: `dash.dealershipai.com` (HTML dashboard that inherits auth state)

## Step 1: Configure Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Navigate to **Settings** → **Domains**
3. Add both domains:
   - `marketing.dealershipai.com`
   - `dash.dealershipai.com`
4. Mark `dash.dealershipai.com` as a **Satellite domain**
5. Set cookie domain to `.dealershipai.com` to enable cross-subdomain cookies
6. Under **Settings** → **Sessions**, ensure:
   - Session lifetime is appropriate (default: 7 days)
   - "Allow session token to be read by JavaScript" is enabled

## Step 2: Environment Variables (Already Configured)

### Marketing Site (.env.local)
```bash
# Use same Clerk keys for both domains
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_aXozRdS428MaeiDX9IYcYSnEnoxjgF4ROdDDMCF9JP

# Primary domain redirects to dashboard after auth
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://dash.dealershipai.com
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://dash.dealershipai.com

# Primary domain configuration
NEXT_PUBLIC_CLERK_DOMAIN=marketing.dealershipai.com
CLERK_IS_SATELLITE=false
```

### Dashboard (.env)
```bash
# Use SAME Clerk keys as marketing site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_aXozRdS428MaeiDX9IYcYSnEnoxjgF4ROdDDMCF9JP

# Satellite configuration - redirect auth to primary
NEXT_PUBLIC_CLERK_IS_SATELLITE=true
NEXT_PUBLIC_CLERK_DOMAIN=dash.dealershipai.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://marketing.dealershipai.com/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://marketing.dealershipai.com/sign-up
```

## Step 3: Code Configuration (Already Completed)

### Marketing Site - Dashboard Page
File: `/app/dashboard/page.tsx`

The dashboard page now includes a redirect button that:
1. Gets the current auth token using `getToken()`
2. Redirects to `dash.dealershipai.com` with the session token
3. The satellite domain automatically validates and syncs the session

### Dashboard - Clerk Config
File: `/clerk-config.js`

Updated to initialize Clerk as a satellite domain:
```javascript
const CLERK_CONFIG = {
    isSatellite: true,
    domain: 'dash.dealershipai.com',
    signInUrl: 'https://marketing.dealershipai.com/sign-in',
    signUpUrl: 'https://marketing.dealershipai.com/sign-up'
};

await this.clerk.load({
    publishableKey: CLERK_PUBLISHABLE_KEY,
    isSatellite: CLERK_CONFIG.isSatellite,
    domain: CLERK_CONFIG.domain,
    signInUrl: CLERK_CONFIG.signInUrl,
    signUpUrl: CLERK_CONFIG.signUpUrl
});
```

## Step 4: Deploy Configuration

### Vercel Environment Variables

**For marketing.dealershipai.com:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_DOMAIN=marketing.dealershipai.com
CLERK_IS_SATELLITE=false
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=https://dash.dealershipai.com
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=https://dash.dealershipai.com
```

**For dash.dealershipai.com:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # SAME as marketing
CLERK_SECRET_KEY=sk_test_... # SAME as marketing
NEXT_PUBLIC_CLERK_IS_SATELLITE=true
NEXT_PUBLIC_CLERK_DOMAIN=dash.dealershipai.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://marketing.dealershipai.com/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://marketing.dealershipai.com/sign-up
```

## Step 5: Testing the SSO Flow

1. **Sign up on marketing site:**
   - Go to `https://marketing.dealershipai.com/sign-up`
   - Create an account
   - After sign-up, you'll be redirected to `dash.dealershipai.com`

2. **Verify session sync:**
   - The dashboard should automatically recognize your logged-in state
   - No additional login required

3. **Manual redirect from marketing:**
   - Go to `https://marketing.dealershipai.com/dashboard`
   - Click "Open Full Dashboard →" button
   - Should seamlessly redirect to `dash.dealershipai.com` with active session

4. **Test sign out:**
   - Sign out from either domain
   - Both domains should lose authentication state

## User Flow Example

```
User visits marketing.dealershipai.com
    ↓
Clicks "Sign Up" or "Sign In"
    ↓
Completes authentication on marketing.dealershipai.com
    ↓
Automatically redirected to dash.dealershipai.com
    ↓
Dashboard loads with authenticated session (no re-login)
    ↓
User can navigate between domains without re-authenticating
```

## Troubleshooting

### Session Not Syncing
1. Verify both domains are added to Clerk Dashboard
2. Check that cookie domain is set to `.dealershipai.com`
3. Ensure both apps use the EXACT same publishable key
4. Clear cookies and try again

### Redirect Loop
1. Check that `CLERK_IS_SATELLITE` is correctly set (false for marketing, true for dashboard)
2. Verify redirect URLs are correctly configured
3. Ensure no conflicting middleware

### CORS Errors
1. Add both domains to Clerk's allowed origins in Dashboard
2. Check that cookies are being set with proper domain attribute

## Security Considerations

- Both domains must use HTTPS in production
- Session tokens are short-lived and automatically refreshed
- Clerk handles CSRF protection automatically
- Cookie domain is restricted to `.dealershipai.com` subdomains only

## Additional Features

### Auto-redirect After Sign-in
The marketing site is configured to automatically redirect users to the dashboard after successful authentication. This provides a seamless onboarding experience.

### Session Persistence
Sessions persist across both domains for 7 days (configurable in Clerk Dashboard). Users won't need to re-authenticate when switching between marketing and dashboard.

### User Data Access
Both domains can access the same user data:
- User profile (name, email, avatar)
- Authentication state
- Custom metadata
- Organization data (if using organizations)

## Production Checklist

- [ ] Both domains added to Clerk Dashboard
- [ ] Cookie domain set to `.dealershipai.com`
- [ ] Environment variables configured on Vercel for both projects
- [ ] HTTPS enabled for both domains
- [ ] Sign-in/sign-up URLs properly configured
- [ ] Test complete auth flow end-to-end
- [ ] Test sign-out across both domains
- [ ] Verify session persistence
- [ ] Check mobile experience
- [ ] Monitor Clerk logs for errors

## Support

If you encounter issues:
1. Check Clerk Dashboard → Logs for error messages
2. Review browser console for JavaScript errors
3. Verify all environment variables are correctly set
4. Contact Clerk support at https://clerk.com/support
