# Clerk SSO Configuration Across Domains

**Status:** Ready to Configure  
**Domains:** `dealershipai.com` + `dash.dealershipai.com`  
**Goal:** Single Sign-On (SSO) across both domains

## 🔧 Configuration Steps

### Step 1: Configure Clerk Dashboard

1. **Go to Clerk Dashboard:**
   - Visit: https://dashboard.clerk.dev
   - Select your application

2. **Settings → Domain & Cookies:**
   - **Cookie Domain:** `.dealershipai.com` (with leading dot)
   - **Allowed Origins:**
     - `https://dealershipai.com`
     - `https://www.dealershipai.com`
     - `https://dash.dealershipai.com`
     - `http://localhost:3000` (for development)
   - **Redirect URLs:**
     - `https://dealershipai.com/sign-in`
     - `https://dealershipai.com/sign-up`
     - `https://dash.dealershipai.com/sign-in`
     - `https://dash.dealershipai.com/sign-up`

3. **Save Changes**

### Step 2: Environment Variables

**Both domains need the same Clerk keys:**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Set in Vercel:**
- Landing project: `dealershipai-landing`
- Dashboard project: `dealershipai-dashboard`

### Step 3: Middleware Configuration

The middleware is already configured in `middleware.ts`:

```typescript
domain: hostname?.includes('dealershipai.com') ? '.dealershipai.com' : undefined,
```

This sets the cookie domain to `.dealershipai.com`, allowing cookies to be shared across:
- `dealershipai.com`
- `dash.dealershipai.com`
- `www.dealershipai.com`

### Step 4: Domain Routing

**Landing Domain (`dealershipai.com`):**
- `/` → Landing page (public)
- `/sign-in` → Clerk sign-in
- `/sign-up` → Clerk sign-up

**Dashboard Domain (`dash.dealershipai.com`):**
- `/` → Redirects to `/dashboard` (protected)
- `/dashboard` → Dashboard (protected)
- `/pulse` → Pulse Dashboard (protected)
- `/sign-in` → Clerk sign-in

## 🧪 Testing SSO

### Test Flow:

1. **Visit Landing:**
   ```
   https://dealershipai.com
   ```

2. **Sign In:**
   - Click "Sign In"
   - Complete Clerk authentication
   - Cookie is set for `.dealershipai.com`

3. **Visit Dashboard:**
   ```
   https://dash.dealershipai.com
   ```
   - Should be automatically signed in
   - No need to sign in again

### Verify Cookie Domain:

```javascript
// In browser console on dash.dealershipai.com
document.cookie
// Should show Clerk cookies with domain=.dealershipai.com
```

## 🔍 Troubleshooting

### Issue: Not Signed In on Dashboard After Landing Sign-In

**Check:**
1. Cookie domain is `.dealershipai.com` (not `dealershipai.com`)
2. Clerk keys match in both projects
3. Allowed origins include both domains
4. Browser allows third-party cookies (if testing locally)

**Fix:**
```bash
# Verify environment variables
vercel env ls --scope production

# Check Clerk dashboard settings
# Ensure cookie domain has leading dot: .dealershipai.com
```

### Issue: Infinite Redirect Loop

**Cause:** Cookie domain mismatch or middleware misconfiguration

**Fix:**
1. Clear browser cookies for `.dealershipai.com`
2. Verify middleware domain configuration
3. Check Clerk dashboard redirect URLs

### Issue: CORS Errors

**Cause:** Allowed origins not configured in Clerk

**Fix:**
1. Add both domains to Clerk allowed origins
2. Include `http://localhost:3000` for development
3. Save and wait 1-2 minutes for propagation

## 📝 Verification Checklist

- [ ] Clerk cookie domain set to `.dealershipai.com`
- [ ] Allowed origins include both domains
- [ ] Redirect URLs configured for both domains
- [ ] Environment variables set in both Vercel projects
- [ ] Middleware configured with domain cookie
- [ ] Test sign-in on landing domain
- [ ] Test auto sign-in on dashboard domain
- [ ] Verify cookies are shared (browser dev tools)

## 🔗 Resources

- **Clerk SSO Docs:** https://clerk.com/docs/authentication/sso
- **Cookie Domain Guide:** https://clerk.com/docs/authentication/cookies
- **Multi-Domain Setup:** https://clerk.com/docs/deployments/overview

---

**Last Updated:** 2025-01-20

