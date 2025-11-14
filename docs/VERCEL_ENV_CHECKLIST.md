# Vercel + Environment Variables Sanity Checklist

**Purpose:** Quick reference for deploying DealershipAI to Vercel and verifying critical environment variables.

**Last Updated:** November 2025

---

## A. Vercel Project Basics

In the Vercel dashboard → Project Settings:

### Required Settings

- ✅ **Framework Preset**: `Next.js`
- ✅ **Root Directory**: `apps/web` (monorepo structure)
- ✅ **Build Command**: `npm install --legacy-peer-deps && prisma generate --schema=../../prisma/schema.prisma && NEXT_TELEMETRY_DISABLED=1 next build`
- ✅ **Install Command**: `npm install --legacy-peer-deps`
- ✅ **Output Directory**: leave empty (Next.js App Router handles this automatically)

**Note:** These are configured in `vercel.json` at the repo root. You shouldn't need to override them unless you're doing something custom.

---

## B. Environment Variables That Must Exist (Production)

These are the ones that will **actually break things** if missing.

### 2.1 Clerk (Authentication)

If `/dash` is Clerk-guarded (which it is in our code):

**Required:**
- **`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`** - Public key from Clerk dashboard
- **`CLERK_SECRET_KEY`** - Secret key from Clerk dashboard

**Optional (with defaults):**
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (defaults to `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (defaults to `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (defaults to `/dash`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (defaults to `/dash`)

**If these are missing:**
- Build may still pass, but `/dash` will throw runtime errors or redirect loops
- Healthcheck will show `CLERK_SECRET_KEY: false` and mark overall status as `ok: false`
- Users cannot access the dashboard

---

### 2.1 Base URL (Optional but Helpful)

- **`NEXT_PUBLIC_BASE_URL`**

This is handy when you fetch from your own APIs server-side:

- **In production:** Set to your Vercel URL, e.g. `https://dealershipai.vercel.app`
- **In dev:** Can be blank; your code should fall back to relative URLs

**If missing:**
Our examples already handle fallback:

```typescript
const base = process.env.NEXT_PUBLIC_BASE_URL || '';
const url = base ? `${base}/api/clarity/stack?...` : `/api/clarity/stack?...`;
```

So this one is **optional**, not fatal. Healthcheck will show it as missing but won't fail.

---

### 4. Database / Prisma (Only if Used in Landing Path)

- **`DATABASE_URL`** (or your specific DSN)

**When required:**
- If Prisma is used in `/app/page.tsx` or `/api/clarity/stack`
- If any landing page components import Prisma client

**When optional:**
- If Prisma is only used in deeper parts of the app (e.g., `/api/leads/capture`)
- If you're just shipping landing + dash without real DB connections

**If missing and required:**
- Build will fail with Prisma errors
- Runtime will fail when those routes are hit

---

### 5. Supabase (If Using Lead Capture)

- **`NEXT_PUBLIC_SUPABASE_URL`**
- **`SUPABASE_SERVICE_ROLE_KEY`**

**When required:**
- If `/api/leads/capture` is enabled
- If you're storing leads in Supabase

**If missing:**
- `/api/leads/capture` will return `503 Database not configured`
- Landing page FreeScanWidget will still work, but leads won't be saved

---

## C. Variables That Can Be Stubbed or Omitted (For Now)

If you are just trying to get **landing + clarity API + dash** online:

### Email Services
- `SENDGRID_API_KEY` - Can be omitted if email sending isn't used
- `SENDGRID_FROM_EMAIL` - Can be omitted if email sending isn't used

### External APIs
- `OPENAI_API_KEY` - Only needed if AI features are enabled
- `ANTHROPIC_API_KEY` - Only needed if Claude features are enabled
- `PERPLEXITY_API_KEY` - Only needed if Perplexity features are enabled

### Redis / Rate Limiting
- `UPSTASH_REDIS_REST_URL` - Optional, rate limiting will be disabled if missing
- `UPSTASH_REDIS_REST_TOKEN` - Optional, rate limiting will be disabled if missing

### Other Services
- `CRON_SECRET` - Only needed if cron jobs are enabled
- `SENTRY_DSN` - Optional, error tracking will be disabled if missing

**The rule:**
> If a route isn't used for landing/clarity/dash and it breaks the build, move it to `app/api_disabled/*` or disable it. You can re-enable once you care.

---

## D. Quick Verification

### 1. Check Health Endpoint

After deployment, hit:

```
https://your-vercel-domain.com/api/health
```

Expected response:
```json
{
  "ok": true,
  "checks": {
    "env": {
      "NEXT_PUBLIC_MAPBOX_KEY": true,
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": true,
      "CLERK_SECRET_KEY": true,
      "NEXT_PUBLIC_BASE_URL": true
    },
    "clarity": {
      "ok": true,
      "status": 200,
      "hasScores": true,
      "hasLocation": true,
      "hasIntros": true
    }
  },
  "timestamp": "2025-11-13T22:00:00.000Z"
}
```

### 2. Check Healthcheck Page

Visit:

```
https://your-vercel-domain.com/healthcheck
```

You should see a visual status page with green "OK" indicators.

### 3. Test Landing Page

Visit:

```
https://your-vercel-domain.com/
```

Should render:
- Hero section with headline
- FreeScanWidget (if enabled)
- No console errors

### 4. Test Dashboard

Visit:

```
https://your-vercel-domain.com/dash
```

Should:
- Redirect to `/sign-in` if not authenticated
- Show dashboard with PulseOverview if authenticated

---

## E. Common Issues

### Issue: Build Fails with "Module not found"

**Solution:**
- Check that `rootDirectory` in `vercel.json` is set to `apps/web`
- Verify `package.json` exists in `apps/web/`
- Run `npm install --legacy-peer-deps` locally to verify dependencies

### Issue: Dashboard Shows Auth Errors

**Solution:**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Check that Clerk app is configured with correct redirect URLs
- Verify environment variables are set for the correct environment (Production/Preview)

### Issue: Clarity API Returns 404

**Solution:**
- Verify `/api/clarity/stack/route.ts` exists in `apps/web/app/api/clarity/stack/`
- Check that route is not in `api_disabled/`
- Verify build completed successfully

---

## F. Environment-Specific Variables

### Production
- Set all required variables in Vercel → Settings → Environment Variables → Production
- Use production Clerk keys
- Use production database URLs

### Preview
- Can use same variables as Production (recommended)
- Or use separate preview/staging keys

### Development
- Use `.env.local` file (not committed to git)
- Can use development/staging keys

---

## G. Quick Setup Script

For a new Vercel project, minimum required variables:

```bash
# In Vercel Dashboard → Settings → Environment Variables

# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional but recommended
NEXT_PUBLIC_MAPBOX_KEY=pk.eyJ1Ijoi...
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Optional (if using features)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## H. Verification Checklist

Before considering deployment "done":

- [ ] Build completes successfully in Vercel
- [ ] `/api/health` returns `ok: true`
- [ ] `/healthcheck` page shows green status
- [ ] Landing page (`/`) loads without errors
- [ ] Dashboard (`/dash`) redirects to sign-in when not authenticated
- [ ] Dashboard loads when authenticated
- [ ] `/api/clarity/stack` returns valid JSON with scores
- [ ] No console errors in browser
- [ ] Map loads (if Mapbox key is set)

---

## I. Support

If healthcheck shows `ok: false`:

1. Check `checks.env` for missing required variables
2. Check `checks.clarity` for API endpoint issues
3. Review Vercel build logs for errors
4. Verify `vercel.json` configuration is correct

For detailed troubleshooting, see `docs/TROUBLESHOOTING.md` (if it exists).

---

## J. Automated Healthcheck (GitHub Actions)

We have an automated healthcheck that runs after every push to `main`:

**File:** `.github/workflows/healthcheck.yml`

### Setup

1. **Set Production URL** (optional):
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Add secret: `PRODUCTION_URL` = `https://dealershipai.com` (or your Vercel URL)

2. **Set Slack Webhook** (optional):
   - Create a Slack incoming webhook
   - Add secret: `SLACK_WEBHOOK_URL` = your webhook URL

### What It Does

- ✅ Runs automatically on every push to `main`
- ✅ Can be triggered manually via "Run workflow"
- ✅ Checks `/api/health` endpoint
- ✅ Fails if `ok: false` or non-200 status
- ✅ Sends Slack notification on failure (if configured)
- ✅ Comments on PRs with healthcheck status (if PR workflow)

### Manual Trigger

You can manually trigger the healthcheck:

1. Go to GitHub → Actions → "Production Healthcheck"
2. Click "Run workflow"
3. Select branch (usually `main`)
4. Click "Run workflow"

### Viewing Results

- **Success:** ✅ Green checkmark in GitHub Actions
- **Failure:** ❌ Red X with detailed logs
- **Slack:** Message sent to configured channel (if webhook is set)

### Customization

Edit `.github/workflows/healthcheck.yml` to:
- Change the production URL
- Add email notifications
- Add more checks
- Change trigger conditions
