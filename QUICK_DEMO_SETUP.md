# ⚡ 30-Minute Demo Setup - DealershipAI.com

## 🎯 Critical Path (10 minutes)

### Step 1: Set Clerk Environment Variables (2 min)
**Vercel Dashboard → Settings → Environment Variables**

Add these (CRITICAL):
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

**Optional** (for demo, will use fallback data if missing):
```bash
FLEET_API_BASE=https://your-api.com
X_API_KEY=your_key
DEFAULT_TENANT=demo-dealer-001
```

### Step 2: Configure Clerk Redirects (3 min)
1. Go to: https://dashboard.clerk.com
2. Your App → Configure → Paths
3. Set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/onboarding`
   - After sign-up: `/onboarding`

### Step 3: Deploy (2 min)
```bash
# If changes need deployment
vercel --prod

# Or just push to trigger auto-deploy
git push origin main
```

### Step 4: Test Critical Paths (3 min)
1. ✅ Visit: `https://dealershipai.com` → Should load
2. ✅ Click "Sign Up" → Should redirect to Clerk
3. ✅ Complete sign-up → Should redirect to `/onboarding`
4. ✅ Complete onboarding → Should redirect to `/dashboard`
5. ✅ Visit `/fleet` → Should show demo data

## 🎬 Demo Flow (5 minutes)

### 1. Landing Page (`/`)
- Show clean landing
- Point out sign-up CTA

### 2. Authentication (`/sign-up`)
- Demonstrate Clerk SSO
- Show Google/GitHub options
- Complete sign-up

### 3. Onboarding (`/onboarding`)
- Walk through steps
- Enter website URL
- Skip optional steps
- Complete onboarding

### 4. Dashboard (`/dashboard`)
- Show main dashboard
- Navigate to Fleet

### 5. Fleet Dashboard (`/fleet`)
- Show origins table
- Point out evidence cards:
  - Schema count
  - CWV score
  - Robots status
  - Last AEO probe
- Click "Verify" toggle → Shows success

### 6. Bulk Upload (`/fleet/uploads`)
- Upload sample CSV
- Show preview
- Demonstrate commit

## 🚨 Emergency Fixes

### If Clerk sign-in fails:
1. Check Vercel env vars are deployed
2. Verify Clerk dashboard redirect URLs
3. Clear browser cache

### If API errors occur:
- ✅ System automatically uses demo data
- ✅ No user-facing errors
- ✅ Demo continues smoothly

### If build fails:
- Warnings are OK (Prisma/Sentry instrumentation)
- Check for actual TypeScript errors
- Deploy anyway if warnings only

## 📋 Pre-Demo Checklist

- [ ] Clerk keys in Vercel env vars
- [ ] Clerk redirects configured
- [ ] Deployed to production
- [ ] Landing page loads
- [ ] Sign-up works
- [ ] Onboarding completes
- [ ] Dashboard accessible
- [ ] Fleet shows data (demo or real)
- [ ] Bulk upload page loads

## 🎯 Key Features to Highlight

1. **SSO Authentication** - Clerk integration
2. **Onboarding Flow** - Multi-step setup
3. **Fleet Dashboard** - Evidence cards, verification
4. **Bulk Upload** - CSV preview and commit
5. **Demo Mode** - Works without backend API

## 💡 Demo Tips

- **Start with landing page** - Shows professional design
- **Use OAuth** - Faster than email/password
- **Skip optional steps** - Move quickly through onboarding
- **Show evidence cards** - Highlight the value proposition
- **Use demo data** - It's OK if Fleet API isn't configured

## ⚡ Quick Commands

```bash
# Check if deployed
vercel ls

# Check env vars
vercel env ls

# View logs
vercel logs

# Deploy
vercel --prod
```

---

**Status**: ✅ Ready for Demo
**Setup Time**: ~10 minutes
**Demo Time**: ~5 minutes

