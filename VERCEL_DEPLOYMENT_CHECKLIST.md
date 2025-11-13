# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Steps

### 1. **Vercel Configuration** ✅
- [x] `vercel.json` configured with `rootDirectory: "apps/web"`
- [x] Build command includes Prisma generation
- [x] Install command uses `--legacy-peer-deps` for peer dependency conflicts

### 2. **Build Verification** ✅
- [x] Local build successful: `cd apps/web && npm run build`
- [x] No critical TypeScript errors (warnings are acceptable)
- [x] All dependencies installed

### 3. **Environment Variables Required in Vercel**

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add:

#### **Critical (Required for Landing Page & Dashboard)**

```bash
# Mapbox (Required for landing page map)
NEXT_PUBLIC_MAPBOX_KEY=your_mapbox_token_here

# Clerk Authentication (Required for dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... or pk_test_...
CLERK_SECRET_KEY=sk_live_... or sk_test_...

# Supabase (Required for database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base URL (Optional but recommended)
NEXT_PUBLIC_BASE_URL=https://dealershipai.com
```

#### **Optional but Recommended**

```bash
# Database (if using direct PostgreSQL)
DATABASE_URL=postgresql://...

# Redis (if using Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Analytics
NEXT_PUBLIC_GA=G-XXXXXXXXXX

# Sentry (Error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### 4. **Deployment Steps**

1. **Commit and Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment for monorepo"
   git push origin main
   ```

2. **Vercel will automatically:**
   - Detect the push to `main` branch
   - Run `installCommand` from repository root
   - Change to `apps/web` directory
   - Run `buildCommand` (Prisma generate + Next.js build)
   - Deploy the application

3. **Monitor Deployment:**
   - Go to Vercel Dashboard → Deployments
   - Watch build logs for any errors
   - Check deployment status

### 5. **Post-Deployment Verification**

#### **Landing Page** (`https://dealershipai.com/`)
- [ ] Page loads without errors
- [ ] Domain input form appears
- [ ] "Analyze my visibility" button works
- [ ] Mapbox map loads (check browser console for errors)
- [ ] Clarity Stack panel displays after analysis
- [ ] AI Intro Card displays after analysis

#### **Dashboard** (`https://dealershipai.com/dash`)
- [ ] Clerk sign-in redirect works
- [ ] After sign-in, Pulse Overview displays
- [ ] Navigation to `/dash/onboarding` works
- [ ] Navigation to `/dash/autopilot` works
- [ ] Navigation to `/dash/insights/ai-story` works

#### **API Routes**
- [ ] `/api/clarity/stack?domain=example.com` returns data
- [ ] `/api/ai-story?tenant=example` returns data

### 6. **Troubleshooting**

#### **Build Fails:**
- Check build logs in Vercel dashboard
- Verify `rootDirectory` is set correctly
- Ensure Prisma schema path is correct: `../../prisma/schema.prisma`
- Check that all dependencies are in `apps/web/package.json`

#### **Mapbox Not Loading:**
- Verify `NEXT_PUBLIC_MAPBOX_KEY` is set in Vercel
- Check browser console for Mapbox errors
- Ensure Mapbox style URL is correct in code

#### **Clerk Authentication Issues:**
- Verify both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Check Clerk dashboard for correct keys
- Ensure keys match the environment (test vs. production)

#### **Database Errors:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check Supabase dashboard for correct values
- Ensure database is accessible from Vercel

## 📝 Current Configuration

**File:** `vercel.json`
- `rootDirectory`: `apps/web`
- `installCommand`: `npm install --legacy-peer-deps`
- `buildCommand`: `npm install --legacy-peer-deps && prisma generate --schema=../../prisma/schema.prisma && NEXT_TELEMETRY_DISABLED=1 next build`

**Note:** The build command includes `npm install` again because Vercel's `installCommand` runs from root, but we need dependencies in the workspace directory.

## 🎯 Quick Deploy Command

```bash
# 1. Ensure all changes are committed
git add .
git commit -m "Ready for Vercel deployment"

# 2. Push to trigger deployment
git push origin main

# 3. Monitor in Vercel dashboard
# https://vercel.com/dashboard
```

## ✅ Ready to Deploy!

Your project is configured for Vercel deployment. Just push to GitHub and Vercel will handle the rest!
