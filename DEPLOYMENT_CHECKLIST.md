# 🚀 Production Deployment Checklist

## Pre-Deployment Testing

### ✅ Build Test
- [x] `npm run build` completes successfully
- [x] No critical errors (warnings about optional deps are OK)

### ✅ Code Quality
- [x] No linter errors
- [x] TypeScript types correct
- [x] Middleware properly configured

---

## Environment Variables (Vercel)

### Required Variables
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=eyJ...

# Upstash Redis (Optional but recommended)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Admin Access
ADMIN_EMAILS=admin@dealershipai.com,brian@dealershipai.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@dealershipai.com,brian@dealershipai.com

# Slack (Optional - for DriftGuard notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# ElevenLabs (Optional)
ELEVENLABS_API_KEY=...

# Backend (Optional - for probe verification)
BACKEND_BASE_URL=https://...
```

### Set in Vercel
```bash
# Check existing variables
vercel env ls

# Add missing variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production
# ... repeat for all required variables
```

---

## Clerk Configuration

### Dashboard Settings
1. Go to https://dashboard.clerk.com
2. Navigate to **Configure → Paths**
3. Set redirect URLs:
   - **After Sign In:** `/onboarding`
   - **After Sign Up:** `/onboarding`
   - **After Onboarding:** `/dashboard`

### Webhooks (Optional)
If using Clerk webhooks:
1. Go to **Webhooks** in Clerk dashboard
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`

---

## Deployment Steps

### 1. Verify Local Build
```bash
npm run build
# Should complete without errors
```

### 2. Deploy to Vercel
```bash
# If not already linked
vercel link

# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin main
```

### 3. Post-Deployment Verification

#### Test Landing Page
- [ ] Visit `/` - Should load without errors
- [ ] Test URL validation
- [ ] Test mobile menu
- [ ] Test exit intent modal

#### Test Authentication
- [ ] Sign up new user → Should redirect to `/onboarding`
- [ ] Sign in existing user → Should redirect based on onboarding status
- [ ] Sign out → Should redirect to `/`

#### Test Onboarding Flow
- [ ] Access `/onboarding` → Requires authentication
- [ ] Complete onboarding form
- [ ] Verify data saved to Clerk metadata
- [ ] Verify redirect to `/dashboard` after completion

#### Test Middleware
- [ ] Try accessing `/dashboard` without onboarding → Should redirect to `/onboarding`
- [ ] Complete onboarding → Should allow access to `/dashboard`
- [ ] Test protected routes require authentication

#### Test API Endpoints
- [ ] `/api/user/onboarding-complete` - POST saves metadata
- [ ] `/api/user/onboarding-complete` - GET checks status
- [ ] `/api/scan/quick` - Returns preview results
- [ ] `/api/visibility/presence` - Returns visibility data

---

## Monitoring

### Vercel Analytics
- Check deployment logs for errors
- Monitor function execution times
- Check error rates

### Clerk Dashboard
- Monitor sign-ups and sign-ins
- Check user metadata updates
- Verify webhook deliveries (if configured)

### Application Logs
- Check Vercel function logs
- Monitor API endpoint responses
- Track onboarding completion rates

---

## Rollback Plan

If issues occur:
```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific version
vercel --prod --force
```

---

## Post-Deployment Tasks

1. **Test End-to-End Flow**
   - Create test user account
   - Complete onboarding
   - Verify dashboard access

2. **Monitor for 24 Hours**
   - Check error rates
   - Monitor performance
   - Verify user flows

3. **Update Documentation**
   - Document any issues found
   - Update runbooks if needed

---

## Success Criteria

✅ Landing page loads without errors
✅ Authentication works (sign up/in/out)
✅ Onboarding flow completes successfully
✅ Middleware redirects work correctly
✅ Clerk metadata updates persist
✅ Dashboard accessible after onboarding
✅ All API endpoints respond correctly

---

**Status: Ready for Deployment** 🚀
