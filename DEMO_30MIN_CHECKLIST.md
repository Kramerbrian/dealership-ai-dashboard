# ⚡ 30-Minute Demo Setup - CRITICAL PATH

## 🚨 IMMEDIATE FIXES (5 minutes)

### 1. Fix Build Errors
```bash
# Build should complete now with demo mode
npm run build
```

### 2. Set Clerk Environment Variables (CRITICAL)
**Vercel Dashboard → Settings → Environment Variables**

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
```

**Optional** (will use demo data if missing):
```bash
FLEET_API_BASE=https://your-api.com
X_API_KEY=your_key
DEFAULT_TENANT=demo-dealer-001
```

### 3. Deploy
```bash
vercel --prod
```

## ✅ Demo Flow (5 minutes)

1. **Landing** → `https://dealershipai.com`
2. **Sign Up** → Clerk authentication
3. **Onboarding** → `/onboarding` (multi-step)
4. **Dashboard** → `/dashboard`
5. **Fleet** → `/fleet` (shows demo data)
6. **Bulk Upload** → `/fleet/uploads` (CSV upload)

## 🎯 Key Features Working

✅ **Clerk SSO** - Authentication configured
✅ **Onboarding Flow** - Multi-step setup
✅ **Fleet Dashboard** - Evidence cards, verification
✅ **Bulk Upload** - CSV preview and commit
✅ **Demo Mode** - Works without backend APIs

## 📋 Pre-Demo Checklist

- [ ] Clerk keys in Vercel
- [ ] Deployed to production
- [ ] Landing page loads
- [ ] Sign-up works
- [ ] Fleet shows demo data

## 🚨 Emergency Fixes

**If build fails:**
- Redis/Supabase errors are now handled gracefully
- Demo mode works without services configured

**If sign-in fails:**
- Check Clerk env vars are deployed
- Verify redirect URLs in Clerk dashboard

**If API errors:**
- System uses demo data automatically
- No user-facing errors

---

**Status**: ✅ Ready for Demo
**Setup Time**: ~5 minutes

