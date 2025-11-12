# ⚡ Quick Deploy Guide

## 🚀 Fastest Path to Production

### Option 1: Interactive Script (Recommended)

```bash
./scripts/deploy.sh
```

This script will guide you through each step interactively.

---

### Option 2: Manual Steps

#### 1. Configure Environment

```bash
# Edit .env.local with your actual values
# Required: Clerk, Supabase, DealershipAI API keys
nano .env.local  # or use your preferred editor
```

**Critical Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `DAI_API_KEY`

---

#### 2. Run Supabase Migration

**Find your project reference:**
1. Go to Supabase Dashboard → Settings → General
2. Copy the **Reference ID**

**Link and push:**
```bash
# Login (first time only)
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

**Or use SQL Editor:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy SQL from `supabase/migrations/20250111000001_create_telemetry_events.sql`
3. Paste and click **Run**

---

#### 3. Test Locally

```bash
pnpm run dev
```

**Test these:**
- Visit `http://localhost:3000`
- Test sign-in/sign-up
- Test `/api/health`
- Test `/api/telemetry` (POST)

Press `Ctrl+C` to stop.

---

#### 4. Build

```bash
pnpm run build
```

**Fix any errors before deploying.**

---

#### 5. Deploy to Vercel

**Option A: Via Dashboard (Recommended)**
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Click **Deploy**

**Option B: Via CLI**
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod
```

**Important:** Add all environment variables to Vercel:
- Go to Project → Settings → Environment Variables
- Add each variable from `.env.local`
- Set for **Production**, **Preview**, and **Development**

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Production URL loads
- [ ] `/api/health` returns `{"ok":true}`
- [ ] Authentication works (sign-in/sign-up)
- [ ] Onboarding flow works
- [ ] Dashboard loads for authenticated users
- [ ] Admin dashboard accessible (if admin user)
- [ ] Telemetry endpoint works
- [ ] No errors in Vercel logs

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
pnpm run type-check

# Check for lint errors
pnpm run lint
```

### Environment Variables Not Loading
- Verify variables are set in Vercel Dashboard
- Check variable names match exactly (case-sensitive)
- Restart deployment after adding variables

### Supabase Connection Errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are correct
- Check Supabase project is active
- Verify table exists: `SELECT * FROM telemetry_events LIMIT 1;`

### Authentication Not Working
- Verify Clerk keys are correct
- Check middleware configuration
- Verify environment variables in Vercel

---

## 📞 Need Help?

- **Supabase Setup:** See `SUPABASE_SETUP.md`
- **Upstash Setup:** See `UPSTASH_SETUP.md`
- **Full Checklist:** See `DEPLOYMENT_CHECKLIST.md`

---

## 🎯 Quick Commands Summary

```bash
# 1. Configure
nano .env.local

# 2. Supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# 3. Test
pnpm run dev

# 4. Build
pnpm run build

# 5. Deploy
# Push to GitHub → Deploy via Vercel Dashboard
# Or: vercel --prod
```

---

**Ready? Run `./scripts/deploy.sh` to get started! 🚀**
