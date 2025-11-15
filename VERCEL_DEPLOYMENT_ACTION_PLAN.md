# Vercel Dashboard Deployment - Action Plan

## 🎯 Problem

Vercel is not deploying the dashboard to `dash.dealershipai.com`.

## ✅ Root Cause

**Root Directory Setting** in Vercel dashboard is likely incorrect.

## 🚀 Immediate Action (Do This Now)

### Step 1: Fix Vercel Dashboard Settings (2 min)

1. **Open**: https://vercel.com/[your-team]/dealership-ai-dashboard/settings
2. **Navigate to**: "Build & Development Settings"
3. **Find**: "Root Directory" field
4. **Change to**: `.` (single dot, or leave completely empty)
5. **Click**: "Save"

### Step 2: Verify Build Settings

While in Settings, confirm:
- ✅ **Framework Preset**: Next.js
- ✅ **Build Command**: `npm install --legacy-peer-deps && prisma generate && NEXT_TELEMETRY_DISABLED=1 next build`
- ✅ **Output Directory**: `.next` (default)
- ✅ **Install Command**: `npm install --legacy-peer-deps`

### Step 3: Check Environment Variables

Go to: Settings → Environment Variables

**Required for Dashboard**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_FRONTEND_API` (if using)
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Trigger Deployment

```bash
# Option 1: Empty commit to trigger auto-deploy
git commit --allow-empty -m "Fix: Set Vercel root directory to ."
git push origin main

# Option 2: Manual deploy via CLI
vercel --prod
```

### Step 5: Verify Deployment

1. **Check**: https://vercel.com/[your-team]/dealership-ai-dashboard/deployments
2. **Wait**: For build to complete (usually 2-5 minutes)
3. **Test**: Visit `https://dash.dealershipai.com`
4. **Verify**: Dashboard loads correctly

## 🔍 If Still Not Working

### Check Build Logs

1. Go to: Deployments → Latest deployment
2. Click: "View Build Logs"
3. Look for:
   - ❌ "Module not found" errors
   - ❌ TypeScript errors
   - ❌ Missing environment variables
   - ❌ Build timeout

### Common Issues & Fixes

#### Issue 1: Build Fails with "Cannot find module"
**Fix**: Root directory is wrong. Set to `.` in Vercel dashboard.

#### Issue 2: Routes Return 404
**Fix**: Verify routes exist in `app/(dashboard)/` directory.

#### Issue 3: Component Import Errors
**Fix**: Component exists at `components/DealershipAI_PulseDecisionInbox.jsx` - verify import path.

#### Issue 4: Clerk Auth Not Working
**Fix**: Add Clerk environment variables and configure domain in Clerk dashboard.

## 📋 Pre-Deployment Checklist

- [ ] Root directory is `.` in Vercel dashboard
- [ ] Build command works locally (`npm run build`)
- [ ] All routes exist in `app/` directory
- [ ] Components exist and imports are correct
- [ ] Environment variables are set
- [ ] Domain `dash.dealershipai.com` is added to Vercel project
- [ ] DNS CNAME record points to Vercel

## 🎯 Expected Result

After fixing root directory:
- ✅ Build succeeds in Vercel
- ✅ `dash.dealershipai.com` loads dashboard
- ✅ Routes work: `/dashboard`, `/pulse`, `/onboarding`
- ✅ Authentication works via Clerk

## 📞 Quick Links

- **Vercel Dashboard**: https://vercel.com/[your-team]/dealership-ai-dashboard
- **Settings**: https://vercel.com/[your-team]/dealership-ai-dashboard/settings
- **Deployments**: https://vercel.com/[your-team]/dealership-ai-dashboard/deployments
- **Environment Variables**: https://vercel.com/[your-team]/dealership-ai-dashboard/settings/environment-variables

---

**TL;DR**: Set root directory to `.` in Vercel dashboard settings, then redeploy.

