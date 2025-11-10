# 🚀 Quick Deploy Guide - Production

**Time to Deploy**: ~5 minutes  
**Status**: ✅ Ready

---

## Step 1: Set Environment Variables (2 min)

### Via Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select project: `dealership-ai-dashboard`
3. Navigate: **Settings** → **Environment Variables**
4. Add these variables (copy from your `.env.local`):

```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
NEXT_PUBLIC_BASE_URL=https://dealershipai.com
ADMIN_EMAILS=admin@dealershipai.com,brian@dealershipai.com
NEXT_PUBLIC_ADMIN_EMAILS=admin@dealershipai.com,brian@dealershipai.com
```

5. **Important**: Set for **Production**, **Preview**, AND **Development**

### Via Vercel CLI (Alternative)
```bash
# Pull existing env vars
npx vercel env pull .env.local

# Or add individually
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste value when prompted
```

---

## Step 2: Deploy (1 min)

### Option A: Automated Script (Recommended)
```bash
./scripts/deploy-production.sh
```

This script will:
- ✅ Verify all environment variables are set
- ✅ Run a local build test
- ✅ Deploy to Vercel production
- ✅ Run health checks

### Option B: Manual Deploy
```bash
# Build locally first (optional but recommended)
npm run build

# Deploy to production
npx vercel --prod
```

### Option C: Git Push (Auto-deploy)
```bash
git push origin main
# Vercel will auto-deploy if connected to GitHub
```

---

## Step 3: Verify (2 min)

### Automated Verification
```bash
./scripts/verify-production.sh https://your-domain.vercel.app
```

### Manual Verification

1. **Health Check**
   ```bash
   curl https://your-domain.vercel.app/api/health
   # Expected: {"ok":true}
   ```

2. **Test Landing Page**
   - Visit: `https://your-domain.vercel.app`
   - ✅ Page loads
   - ✅ Free Audit Widget visible
   - ✅ No console errors

3. **Test Authentication**
   - Click "Sign Up"
   - ✅ Clerk modal opens
   - ✅ Can create account

4. **Test Drive Dashboard**
   - Sign in
   - Visit: `https://your-domain.vercel.app/drive`
   - ✅ Page loads
   - ✅ Pulse cards appear (or loading state)
   - ✅ No errors in console

5. **Test Onboarding**
   - Visit: `https://your-domain.vercel.app/onboarding`
   - ✅ Multi-step form works
   - ✅ Can complete onboarding

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
npm run build

# Check for missing dependencies
npm install

# Check environment variables
npx vercel env ls
```

### API Returns 401/403
- Verify Clerk keys are correct
- Check `withAuth` wrapper is working
- Verify tenantId is set in session

### No Pulse Cards Showing
- Check browser console for errors
- Verify API response in Network tab
- Check `/api/pulse/snapshot` returns data

### Database Connection Fails
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies (if enabled)

---

## 📊 Post-Deployment Checklist

- [ ] Landing page loads
- [ ] Sign up/Sign in works
- [ ] Onboarding completes
- [ ] Drive dashboard loads
- [ ] Pulse cards render
- [ ] Fix drawer works
- [ ] Impact Ledger updates
- [ ] Admin access works
- [ ] No errors in Vercel logs
- [ ] Analytics tracking works

---

## 🎉 Success!

If all checks pass, your deployment is **100% production-ready**!

**Next Steps:**
1. Monitor Vercel logs for first 24 hours
2. Test critical user flows
3. Verify analytics tracking
4. Check error rates

---

**Need Help?** Check `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for detailed troubleshooting.

