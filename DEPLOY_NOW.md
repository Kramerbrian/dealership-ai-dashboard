# 🚀 Deploy Now - Quick Guide

## Step 1: Add Environment Variables

**These commands are interactive** - they will prompt you to paste values:

```bash
# 1. Add base URL (use your Vercel deployment URL)
npx vercel env add NEXT_PUBLIC_BASE_URL production
# When prompted, paste: https://dealership-ai-dashboard.vercel.app
# (or your actual domain)

# 2. Add admin emails
npx vercel env add ADMIN_EMAILS production
# When prompted, paste: admin@dealershipai.com,brian@dealershipai.com

# 3. Add public admin emails
npx vercel env add NEXT_PUBLIC_ADMIN_EMAILS production
# When prompted, paste: admin@dealershipai.com,brian@dealershipai.com
```

**Alternative: Add via Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Select: `dealership-ai-dashboard`
3. Navigate: **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable with values above
6. Select **Production** environment

---

## Step 2: Deploy

**Option A: Automated Script**
```bash
./scripts/deploy-production.sh
```

**Option B: Direct Vercel CLI**
```bash
npx vercel --prod
```

**Option C: Git Push (if connected to GitHub)**
```bash
git add .
git commit -m "chore: production deployment"
git push origin main
```

---

## Step 3: Verify

After deployment completes, get your URL and verify:

```bash
# Get deployment URL
npx vercel ls --prod | grep -o 'https://[^ ]*' | head -1

# Run verification
./scripts/verify-production.sh https://your-deployment-url.vercel.app
```

---

## Quick Test URLs

After deployment, test these:
- Landing: `https://your-url.vercel.app`
- Drive: `https://your-url.vercel.app/drive`
- Onboarding: `https://your-url.vercel.app/onboarding`
- Health: `https://your-url.vercel.app/api/health`

---

**Ready? Run the commands above!** 🚀
