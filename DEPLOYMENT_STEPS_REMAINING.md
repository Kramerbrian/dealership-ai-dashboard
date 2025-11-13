# 🚀 Remaining Steps to Deploy to Vercel

## Current Status
- ✅ Code committed to GitHub
- ✅ Vercel configuration exists (`vercel.json`)
- ⚠️ Build errors need fixing
- ⚠️ Missing imports need resolution

## Steps Remaining

### 1. **Fix Build Errors** (CRITICAL - Must Complete)

#### A. Fix Missing Import Paths
The build is failing because of incorrect import paths. Files exist but are in different locations:

**Issues:**
- `@/src/components/drift/DriftTrendSpark` → Should be `@/components/drift/DriftTrendSpark` or `@/apps/web/components/DriftTrendSpark`
- `@/contexts/BrandColorContext` → File exists at `contexts/BrandColorContext.tsx`
- `@/styles/design-tokens` → File exists at `styles/design-tokens.ts` or `apps/web/lib/design-tokens.ts`

**Files to Fix:**
1. `app/(admin)/admin/driftguard/page.tsx` - Update import path
2. `app/(dashboard)/layout.tsx` - Update BrandColorContext import
3. `app/(deck)/inevitability/page.tsx` - Update design-tokens import
4. `components/modals/SettingsModal.tsx` - Update design-tokens import

#### B. Fix Syntax Error (Already Fixed)
- ✅ `apps/web/app/api/admin/integrations/visibility/route.ts` - Fixed

### 2. **Verify Environment Variables in Vercel**

Go to Vercel Dashboard → Project Settings → Environment Variables and ensure:

**Required:**
- `NEXT_PUBLIC_MAPBOX_KEY` - Mapbox API token
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Optional but Recommended:**
- `NEXT_PUBLIC_BASE_URL` - Base URL for API calls
- `UPSTASH_REDIS_REST_URL` - Redis URL (if using)
- `UPSTASH_REDIS_REST_TOKEN` - Redis token (if using)

### 3. **Test Build Locally** (Recommended)

```bash
# From project root
cd apps/web
npm install --legacy-peer-deps
npx prisma generate --schema=prisma/schema.prisma
NEXT_TELEMETRY_DISABLED=1 npm run build
```

If build succeeds, proceed. If not, fix remaining errors.

### 4. **Commit and Push Fixes**

```bash
git add .
git commit -m "Fix build errors: update import paths and resolve missing dependencies"
git push origin main
```

### 5. **Vercel Will Auto-Deploy**

Once you push to GitHub:
- Vercel detects the push
- Runs build command from `vercel.json`: `cd apps/web && npm install --legacy-peer-deps && npx prisma generate && NEXT_TELEMETRY_DISABLED=1 next build`
- Deploys to production

### 6. **Monitor Deployment**

1. Go to Vercel Dashboard
2. Click on your project
3. Watch "Deployments" tab
4. Check build logs for any errors

### 7. **Verify Deployment**

After successful deployment:

**Landing Page:**
- ✅ Visit `https://dealershipai.com/`
- ✅ Verify domain input form appears
- ✅ Test "Analyze my visibility" button
- ✅ Check Mapbox map loads
- ✅ Verify Clarity Stack panel displays

**Dashboard (Requires Auth):**
- ✅ Visit `https://dealershipai.com/dash`
- ✅ Verify Clerk sign-in redirect works
- ✅ After sign-in, check Pulse Overview displays
- ✅ Test navigation to:
  - `/dash/onboarding`
  - `/dash/autopilot`
  - `/dash/insights/ai-story`

**API Routes:**
- ✅ Test `/api/clarity/stack?domain=example.com`
- ✅ Test `/api/ai-story?tenant=example`

## Quick Fix Commands

### Fix Import Paths

```bash
# Find all files with incorrect imports
grep -r "@/src/components/drift" apps/web
grep -r "@/contexts/BrandColorContext" apps/web
grep -r "@/styles/design-tokens" apps/web

# Update imports to correct paths
# Replace:
# @/src/components/drift → @/components/drift or @/apps/web/components/drift
# @/contexts/BrandColorContext → @/contexts/BrandColorContext (verify path)
# @/styles/design-tokens → @/styles/design-tokens or @/apps/web/lib/design-tokens
```

## Summary

**Critical Path:**
1. Fix import paths (4 files)
2. Test build locally
3. Commit and push
4. Vercel auto-deploys
5. Verify deployment

**Estimated Time:** 15-30 minutes

**Blockers:** None - all issues are fixable import path problems

