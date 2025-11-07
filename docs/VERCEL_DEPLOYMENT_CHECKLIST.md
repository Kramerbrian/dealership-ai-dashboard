# 🚀 Vercel Deployment Checklist - Clerk Migration

## ✅ Pre-Deployment Checklist

### 1. Update Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

#### Remove These (No Longer Needed):
- ❌ `NEXTAUTH_SECRET`
- ❌ `NEXTAUTH_URL`
- ❌ `WORKOS_CLIENT_ID`
- ❌ `WORKOS_API_KEY`
- ❌ Any other `WORKOS_*` variables

#### Add These (Required for Clerk):
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (Production) or `pk_test_...` (Development)
- ✅ `CLERK_SECRET_KEY` = `sk_live_...` (Production) or `sk_test_...` (Development)
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_URL` = `/sign-in`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_URL` = `/sign-up`
- ✅ `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` = `/dashboard`
- ✅ `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` = `/dashboard`

#### Configure for All Environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### 2. Verify Clerk Dashboard Configuration

1. **Go to [Clerk Dashboard](https://dashboard.clerk.com)**
2. **Select your application**
3. **Settings → Domains**:
   - Add `dealershipai.com` (primary)
   - Add `dash.dealershipai.com` (if using)
   - Add `localhost:3000` (for development)

4. **Settings → Redirect URLs**:
   ```
   https://dealershipai.com
   https://dealershipai.com/dashboard
   https://dealershipai.com/sign-in
   https://dealershipai.com/sign-up
   http://localhost:3000
   http://localhost:3000/dashboard
   http://localhost:3000/sign-in
   http://localhost:3000/sign-up
   ```

### 3. Verify vercel.json

✅ `vercel.json` has been updated (removed `NEXTAUTH_URL`)

### 4. Test Local Build

```bash
# Test the build locally
npm run build

# If successful, you're ready to deploy
```

### 5. Deploy to Vercel

#### Option A: Automatic (via Git Push)
- Push to `main` branch triggers automatic deployment
- ✅ Already pushed - deployment should be in progress

#### Option B: Manual Deployment
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### 6. Post-Deployment Verification

After deployment, test:

1. **Homepage**: `https://dealershipai.com`
   - Should load without errors

2. **Sign Up**: `https://dealershipai.com/sign-up`
   - Should show Clerk sign-up form
   - Test creating an account

3. **Sign In**: `https://dealershipai.com/sign-in`
   - Should show Clerk sign-in form
   - Test signing in

4. **Dashboard**: `https://dealershipai.com/dashboard`
   - Should redirect to sign-in if not authenticated
   - Should show dashboard if authenticated

5. **API Routes**: Test protected API routes
   ```bash
   # Should return 401 if not authenticated
   curl https://dealershipai.com/api/ai-scores?domain=example.com
   ```

### 7. Monitor for Errors

Check:
- ✅ Vercel deployment logs
- ✅ Vercel function logs
- ✅ Browser console (for client-side errors)
- ✅ Clerk dashboard (for auth errors)

## 🔧 Troubleshooting

### Issue: "Clerk not configured" errors

**Solution:**
1. Verify environment variables are set in Vercel
2. Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
3. Redeploy after adding variables

### Issue: Authentication redirects not working

**Solution:**
1. Verify Clerk dashboard settings match your domain
2. Check redirect URLs in Clerk dashboard
3. Verify `signInUrl` and `signUpUrl` in `app/layout.tsx`

### Issue: API routes returning 401

**Solution:**
1. Ensure user is signed in via Clerk
2. Check `lib/api-protection.ts` is using Clerk `auth()`
3. Verify API routes are calling `auth()` correctly

### Issue: Build fails

**Solution:**
1. Check build logs in Vercel
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors: `npm run type-check`

## 📋 Quick Reference

### Clerk Environment Variables Template

```bash
# Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Vercel Dashboard Links

- **Environment Variables**: `https://vercel.com/[your-project]/settings/environment-variables`
- **Deployments**: `https://vercel.com/[your-project]/deployments`
- **Logs**: `https://vercel.com/[your-project]/logs`

### Clerk Dashboard Links

- **API Keys**: `https://dashboard.clerk.com/apps/[your-app]/api-keys`
- **Domains**: `https://dashboard.clerk.com/apps/[your-app]/domains`
- **Redirect URLs**: `https://dashboard.clerk.com/apps/[your-app]/redirect-urls`

---

**Status**: ✅ Migration complete, ready for Vercel deployment  
**Next**: Update Vercel environment variables and deploy

