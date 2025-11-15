# 🚀 ACTIVATE NOW: 100% Go Live

**Time**: 30 minutes  
**Status**: Ready to activate both domains

---

## ⚡ Quick Start (3 Steps)

### Step 1: Set Environment Variables (10 min)

**Run this script**:
```bash
./scripts/sync-env-to-vercel-interactive.sh
```

**Or set manually**:
```bash
# Supabase (from MCP - already known)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://gzlgfghpkbqlhgfozjkb.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6bGdmZ2hwa2JxbGhnZm96amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTg1MDQsImV4cCI6MjA3MDk3NDUwNH0.0X_zVfNH9K5FBDcMl_O7yeXJYwuWvGLALwjIe5JRlqg

# Supabase Service Role (get from Supabase Dashboard)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Get from: Supabase Dashboard → Settings → API → service_role key

# Clerk (get from Clerk Dashboard)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Get from: Clerk Dashboard → API Keys → Publishable Key

vercel env add CLERK_SECRET_KEY production
# Get from: Clerk Dashboard → API Keys → Secret Key
```

### Step 2: Configure Clerk Dashboard (5 min)

**Go to**: https://dashboard.clerk.com

1. **Allowed Origins** (Configure → Allowed Origins):
   - Add: `https://dealershipai.com`
   - Add: `https://www.dealershipai.com`
   - Add: `https://dash.dealershipai.com`
   - Add: `https://*.vercel.app`

2. **Domain & Cookies** (Configure → Domain & Cookies):
   - Set Cookie Domain: `.dealershipai.com`

3. **Redirect URLs** (Configure → Paths):
   - After Sign In: `/onboarding`
   - After Sign Up: `/onboarding`

### Step 3: Deploy & Test (15 min)

```bash
# Deploy to production
vercel --prod

# Test endpoints
curl https://dealershipai.com/api/health
curl -I https://dash.dealershipai.com/sign-in
```

**Browser Testing**:
1. Visit: `https://dealershipai.com` → Should load landing page
2. Visit: `https://dash.dealershipai.com/sign-in` → Should show Clerk form (not "Loading...")
3. Sign in → Should redirect to `/onboarding`
4. Complete onboarding → Should access dashboard

---

## 🔴 Critical Blockers

### If Sign-In Shows "Loading...":

1. **Check**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in Vercel
2. **Check**: Clerk Dashboard allowed origins include `dash.dealershipai.com`
3. **Fix**: Set missing env vars and redeploy

### If Landing Page Doesn't Load:

1. **Check**: DNS records point to Vercel
2. **Check**: Domain verified in Vercel Dashboard
3. **Fix**: Wait for DNS propagation or fix DNS

---

## ✅ Success Criteria

**100% Ready When**:
- [x] All environment variables set
- [x] Clerk Dashboard configured
- [x] DNS records configured
- [x] Deployment is READY
- [ ] Landing page loads (`dealershipai.com`)
- [ ] Sign-in page shows form (`dash.dealershipai.com`)
- [ ] Authentication flow works
- [ ] Dashboard routes accessible

---

## 📋 Complete Checklist

See `GO_LIVE_100_PERCENT_CHECKLIST.md` for full details.

---

**Next Action**: Run Step 1 (Set Environment Variables)  
**Time**: 30 minutes total

