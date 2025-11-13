# Vercel + Environment Variables Sanity Checklist

**"Am I insane or is the stack actually broken?" toolkit**

Use this checklist to verify your Vercel deployment is configured correctly and all required environment variables are set.

---

## 1. Vercel Project Basics

In the Vercel dashboard → Project Settings:

### Framework Preset
- ✅ **Framework Preset**: `Next.js`
- ✅ **Root Directory**: Leave empty (or set to repo root if monorepo)
- ✅ **Build Command**: `npm run build` (or `next build`)
- ✅ **Install Command**: Leave empty (Vercel runs `npm install` by default)
- ✅ **Output Directory**: Leave empty for App Router (Next.js handles it automatically)

**Note:** You shouldn't need to override these unless you're doing something custom.

---

## 2. Required Environment Variables (Production)

These are the ones that will **actually break things** if missing.

### 2.1 Mapbox (for DealerFlyInMap)

**Required if using map components on landing page:**

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` or `NEXT_PUBLIC_MAPBOX_KEY`
  - **Where to set**: Vercel → Settings → Environment Variables
  - **Value**: Your Mapbox public access token
  - **Example**: `pk.eyJ1IjoibXl1c2VyIiwiYSI6Im...`
  - **Environment**: Production, Preview, Development

**If missing:**
- The map may fail silently or throw errors in the browser
- Build will pass, but landing experience is degraded
- Healthcheck will show `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: false`

---

### 2.2 Clerk (Authentication)

**Required for `/dash` and protected routes:**

#### Core Keys (Required)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Your Clerk publishable key (starts with `pk_`)
- `CLERK_SECRET_KEY`
  - Your Clerk secret key (starts with `sk_`)

#### Optional URLs (Recommended)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (default: `/sign-in`)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (default: `/sign-up`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (default: `/dashboard`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (default: `/dashboard`)

**If missing:**
- Build may pass, but `/dash` will throw runtime errors or redirect loops
- Healthcheck will show `CLERK_SECRET_KEY: false` and mark overall status as broken
- Users cannot authenticate

---

### 2.3 Base URL (Optional but Helpful)

- `NEXT_PUBLIC_BASE_URL`
  - **Production**: Your Vercel URL, e.g. `https://dealershipai.vercel.app`
  - **Preview**: Leave empty (Vercel provides `VERCEL_URL`)
  - **Development**: Leave empty (code falls back to relative URLs)

**If missing:**
- Code should handle fallback gracefully
- Server-side API calls may fail if using absolute URLs
- Healthcheck will show `NEXT_PUBLIC_BASE_URL: false` (not critical)

---

### 2.4 Database (Only if Prisma is used in landing/clarity paths)

- `DATABASE_URL`
  - Your database connection string
  - Only required if `/app/page.tsx` or `/api/clarity/stack` imports Prisma
  - If Prisma is only used in deeper parts of the app, you can ship landing + dash without it

**If missing and Prisma is imported:**
- Build will fail with database connection errors
- Landing page won't load

---

## 3. Optional Environment Variables

These can be stubbed or omitted if the features aren't used yet.

### Email Service
- `SENDGRID_API_KEY` or `RESEND_API_KEY`
  - Only needed if email capture routes are enabled
  - Can be omitted if those routes are disabled

### External APIs
- `ANTHROPIC_API_KEY` (for Assistant API)
- `OPENAI_API_KEY` (if using OpenAI)
- `GOOGLE_ANALYTICS_ID` (for analytics)

**Rule:**
> If a route isn't used for landing/clarity/dash and it breaks the build, move it or disable it.
> You can re-enable once you care.

---

## 4. Healthcheck Endpoints

### 4.1 Programmatic Check

**Endpoint**: `GET /api/health`

**Returns JSON:**
```json
{
  "ok": true,
  "checks": {
    "env": {
      "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN": true,
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": true,
      "CLERK_SECRET_KEY": true
    },
    "clarity": {
      "ok": true,
      "status": 200,
      "hasScores": true,
      "hasLocation": true
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

**Usage:**
```bash
curl https://your-vercel-domain.com/api/health
```

### 4.2 Human-Readable Check

**Page**: `/healthcheck`

Visit in browser to see a visual status page.

**What it checks:**
- ✅ Environment variables presence
- ✅ Clarity API reachability
- ✅ Trust API endpoint existence
- ✅ Assistant API endpoint existence

---

## 5. Quick Verification Steps

### Step 1: Check Healthcheck
1. Visit `https://your-vercel-domain.com/healthcheck`
2. Verify `Overall Status: OK`
3. Check that all required env vars show `✓`

### Step 2: Test Landing Page
1. Visit `https://your-vercel-domain.com/`
2. Verify page loads without errors
3. Check browser console for any missing env var errors

### Step 3: Test Dashboard (if Clerk is configured)
1. Visit `https://your-vercel-domain.com/dash`
2. Should redirect to sign-in if not authenticated
3. Should load dashboard if authenticated

### Step 4: Test Clarity API
1. Visit `https://your-vercel-domain.com/api/clarity/stack?domain=exampledealer.com`
2. Should return JSON with scores and location data

---

## 6. Common Issues

### Issue: Build passes but landing page shows errors
**Solution**: Check browser console for missing `NEXT_PUBLIC_*` env vars

### Issue: `/dash` redirects in a loop
**Solution**: Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` are set

### Issue: Map doesn't load
**Solution**: Verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set in Vercel

### Issue: Healthcheck shows `ok: false`
**Solution**: Check `checks.env` and `checks.clarity` in the response to identify missing vars

---

## 7. Setting Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - **Key**: e.g. `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
   - **Value**: Your actual token/key
   - **Environment**: Select Production, Preview, and/or Development
3. Click "Save"
4. **Important**: Redeploy for changes to take effect

---

## 8. Next Steps

Once healthcheck passes:

1. ✅ Landing page loads
2. ✅ Clarity API responds
3. ✅ Dashboard authentication works
4. ✅ All critical env vars are set

You can then:
- Set up monitoring (ping `/api/health` periodically)
- Add GitHub Actions to verify health after deploys
- Set up alerts for healthcheck failures

---

## TL;DR

**Must-have env vars:**
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (for map)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (for auth)
- `CLERK_SECRET_KEY` (for auth)
- `DATABASE_URL` (only if Prisma used in landing/clarity)

**Healthcheck:**
- `/api/health` → JSON programmatic check
- `/healthcheck` → Human-readable check

**Quick test:**
```bash
curl https://your-vercel-domain.com/api/health | jq
```

If `ok: true`, you're good to go! 🚀

