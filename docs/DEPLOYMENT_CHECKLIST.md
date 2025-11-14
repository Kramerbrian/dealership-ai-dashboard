# 🚀 DealershipAI Production Deployment Checklist

## Pre-Deployment Verification

### ✅ Environment Variables

Since you've confirmed Clerk keys are set in:
- ✅ `.env.local` (local development)
- ✅ Supabase (if using Supabase Auth)
- ✅ Vercel (production)

**Quick verification:**
```bash
npm run verify:env
```

If keys aren't detected locally, that's okay—Vercel will use its own env vars.

---

## Vercel Deployment Steps

### 1. Verify Vercel Project Configuration

In Vercel Dashboard → Your Project → Settings:

- ✅ **Framework Preset:** `Next.js`
- ✅ **Root Directory:** `apps/web` (if monorepo) or root (if single app)
- ✅ **Build Command:** `npm install --legacy-peer-deps && prisma generate && NEXT_TELEMETRY_DISABLED=1 next build`
- ✅ **Install Command:** `npm install --legacy-peer-deps`
- ✅ **Output Directory:** (leave empty for App Router)

### 2. Required Environment Variables in Vercel

**Must be set in Vercel → Settings → Environment Variables:**

1. **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`**
   - Value: Your Clerk publishable key (starts with `pk_test_` or `pk_live_`)
   - Environments: Production, Preview, Development

2. **`CLERK_SECRET_KEY`**
   - Value: Your Clerk secret key (starts with `sk_test_` or `sk_live_`)
   - Environments: Production, Preview, Development

3. **`NEXT_PUBLIC_BASE_URL`** (Recommended)
   - Value: Your production URL (e.g., `https://dealershipai.com` or `https://your-project.vercel.app`)
   - Environments: Production, Preview

### 3. Optional Environment Variables

These can be added later as needed:

- `DATABASE_URL` - Supabase connection string
- `ANTHROPIC_API_KEY` - For AI features
- `OPENAI_API_KEY` - For AI features
- `SENDGRID_API_KEY` or `RESEND_API_KEY` - For email
- `GOOGLE_ANALYTICS_ID` - For analytics

---

## Deployment Commands

### Option 1: Deploy via Vercel CLI

```bash
# Make sure you're logged in
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Git Push

```bash
# Push to your main branch
git push origin main

# Vercel will automatically deploy
```

---

## Post-Deployment Verification

### 1. Check Health Endpoint

```bash
# Replace with your actual Vercel domain
curl https://your-project.vercel.app/api/health | jq
```

**Expected response:**
```json
{
  "ok": true,
  "checks": {
    "env": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": true,
      "CLERK_SECRET_KEY": true
    },
    "clarity": {
      "ok": true,
      "hasScores": true,
      "hasLocation": true,
      "hasIntros": true
    }
  }
}
```

### 2. Test Landing Page

Visit: `https://your-project.vercel.app`

- ✅ Page loads without errors
- ✅ No console errors in browser DevTools
- ✅ Authentication redirects work (if testing `/dash`)

### 3. Test Dashboard (if applicable)

Visit: `https://your-project.vercel.app/dash`

- ✅ Clerk authentication works
- ✅ Dashboard loads
- ✅ No API errors

### 4. Check Vercel Function Logs

In Vercel Dashboard → Your Project → Functions:

- ✅ No errors in function logs
- ✅ API routes respond correctly

---

## Troubleshooting

### Build Fails

**Error:** `Module not found` or `Cannot resolve`
- **Fix:** Check `package.json` dependencies are up to date
- **Fix:** Ensure `node_modules` is not in `.gitignore` incorrectly

**Error:** `Environment variable not found`
- **Fix:** Add missing variables in Vercel → Settings → Environment Variables
- **Fix:** Redeploy after adding variables

### Runtime Errors

**Error:** `Clerk authentication not working`
- **Fix:** Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set in Vercel
- **Fix:** Check Clerk dashboard for correct app configuration

**Error:** `API route returns 500`
- **Fix:** Check Vercel Function Logs for detailed error
- **Fix:** Verify all required env vars are set

### Health Check Fails

**`/api/health` returns `ok: false`**
- Check `checks.env` to see which variables are missing
- Check `checks.clarity` to see if API routes are working
- Review Vercel Function Logs for errors

---

## Quick Reference

```bash
# Verify environment locally
npm run verify:env

# Test healthcheck locally (requires dev server running)
npm run verify:health

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View production logs
vercel logs --prod
```

---

## Success Indicators

✅ Build completes without errors  
✅ `/api/health` returns `ok: true`  
✅ Landing page loads correctly  
✅ Dashboard authentication works  
✅ No errors in Vercel Function Logs  

**You're ready for production! 🎉**

