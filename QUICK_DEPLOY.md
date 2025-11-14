# 🚀 Quick Deployment Guide

## Status: Ready to Deploy ✅

You've confirmed Clerk keys are set in:
- ✅ Vercel (production)
- ✅ Supabase (if applicable)
- ⚠️ `.env.local` (empty locally, but that's okay for production)

---

## Deploy Now

### Option 1: Vercel CLI (Recommended)

```bash
# 1. Make sure you're logged in
vercel login

# 2. Deploy to production
vercel --prod
```

### Option 2: Git Push (Auto-deploy)

```bash
git push origin main
# Vercel will automatically deploy
```

---

## Verify Deployment

After deployment completes:

### 1. Test Health Endpoint

```bash
# Replace with your actual Vercel domain
curl https://your-project.vercel.app/api/health | jq
```

**Expected:**
```json
{
  "ok": true,
  "checks": {
    "env": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": true,
      "CLERK_SECRET_KEY": true
    },
    "clarity": { "ok": true }
  }
}
```

### 2. Test Landing Page

Visit: `https://your-project.vercel.app`

### 3. Test Dashboard

Visit: `https://your-project.vercel.app/dash`

---

## Vercel Configuration Checklist

In Vercel Dashboard → Your Project → Settings:

### Environment Variables ✅
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (set)
- `CLERK_SECRET_KEY` (set)
- `NEXT_PUBLIC_BASE_URL` (recommended)

### Build Settings ✅
- Framework: `Next.js`
- Build Command: `npm install --legacy-peer-deps && prisma generate && NEXT_TELEMETRY_DISABLED=1 next build`
- Install Command: `npm install --legacy-peer-deps`
- Root Directory: (check if monorepo: `apps/web` or root)

---

## Troubleshooting

**If health check fails:**
1. Check Vercel → Settings → Environment Variables
2. Verify keys are set for Production environment
3. Redeploy after adding variables

**If build fails:**
1. Check Vercel build logs
2. Verify `package.json` dependencies
3. Check for TypeScript errors (though they're ignored in build)

---

## Next Steps After Deployment

1. ✅ Verify `/api/health` returns `ok: true`
2. ✅ Test landing page loads
3. ✅ Test dashboard authentication
4. ✅ Monitor Vercel Function Logs
5. ✅ Set up custom domain (if needed)

**You're ready! 🎉**
