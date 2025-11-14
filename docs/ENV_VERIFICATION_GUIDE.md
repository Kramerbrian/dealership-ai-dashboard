# Environment Variables Verification Guide

Quick guide to verify your environment variables are set correctly before and after deployment.

---

## Quick Verification Steps

### 1. Local Verification (Before Deploy)

Run the verification script:

```bash
# Check environment variables
npx tsx scripts/verify-env.ts

# Test healthcheck endpoint (requires dev server running)
npm run dev  # In one terminal
npx tsx scripts/test-healthcheck.ts  # In another terminal
```

### 2. Production Verification (After Deploy)

#### Option A: Programmatic Check

```bash
# Replace with your actual Vercel domain
curl https://your-vercel-domain.vercel.app/api/health | jq
```

#### Option B: Browser Check

Visit: `https://your-vercel-domain.vercel.app/healthcheck`

---

## Required Variables Checklist

### ✅ Must Have (Production)

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - Starts with `pk_`
  - Found in Clerk Dashboard → API Keys
  - **If missing**: `/dash` will break

- [ ] `CLERK_SECRET_KEY`
  - Starts with `sk_`
  - Found in Clerk Dashboard → API Keys
  - **If missing**: `/dash` will break

### ⚠️ Optional (But Recommended)


- [ ] `NEXT_PUBLIC_BASE_URL`
  - Your production URL, e.g. `https://dealershipai.vercel.app`
  - **If missing**: Server-side API calls may fail

- [ ] `DATABASE_URL`
  - Only if using Prisma in landing/clarity paths
  - **If missing**: Build may fail if Prisma is imported

- [ ] `ANTHROPIC_API_KEY`
  - For Assistant API
  - **If missing**: Assistant API won't work

---

## Setting Variables in Vercel

### Step-by-Step

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click **Settings** → **Environment Variables**

2. **Add Each Variable**
   - Click **Add New**
   - Enter **Key** (e.g. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
   - Enter **Value** (your actual key)
   - Select **Environments**: Production, Preview, Development
   - Click **Save**

3. **Redeploy**
   - After adding variables, trigger a new deployment
   - Go to **Deployments** → Click **Redeploy** on latest deployment
   - Or push a new commit to trigger auto-deploy

---

## Interpreting Healthcheck Results

### ✅ Success Response

```json
{
  "ok": true,
  "checks": {
    "env": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": true,
      "CLERK_SECRET_KEY": true,
      "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN": true
    },
    "clarity": {
      "ok": true,
      "status": 200,
      "hasScores": true
    }
  }
}
```

**Meaning**: All critical systems are operational.

### ❌ Failure Response

```json
{
  "ok": false,
  "checks": {
    "env": {
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": false,
      "CLERK_SECRET_KEY": false,
      "_critical_missing": "Clerk keys required for /dash"
    },
    "clarity": {
      "ok": false,
      "error": "..."
    }
  }
}
```

**Meaning**: Missing required variables or API errors.

---

## Common Issues & Solutions

### Issue: `ok: false` with missing Clerk keys

**Solution**:
1. Go to Clerk Dashboard → API Keys
2. Copy `Publishable Key` → Set as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
3. Copy `Secret Key` → Set as `CLERK_SECRET_KEY`
4. Add both to Vercel Environment Variables
5. Redeploy

### Issue: Clarity API shows `ok: false`

**Possible causes**:
- Endpoint doesn't exist yet (OK if not implemented)
- Endpoint is broken (check server logs)
- Base URL is incorrect

**Solution**:
- If endpoint doesn't exist: This is OK, it's optional
- If endpoint exists but fails: Check `/app/api/clarity/stack/route.ts`
- Verify `NEXT_PUBLIC_BASE_URL` is set correctly


---

## Automated Verification

### GitHub Actions (Optional)

Create `.github/workflows/healthcheck.yml`:

```yaml
name: Healthcheck After Deploy

on:
  deployment_status:

jobs:
  healthcheck:
    runs-on: ubuntu-latest
    steps:
      - name: Check Health
        run: |
          curl -f https://your-vercel-domain.vercel.app/api/health || exit 1
```

This will automatically verify health after each deployment.

---

## Quick Reference

### Local Testing
```bash
# Verify env vars
npx tsx scripts/verify-env.ts

# Test healthcheck
npm run dev
npx tsx scripts/test-healthcheck.ts
```

### Production Testing
```bash
# JSON check
curl https://your-domain.vercel.app/api/health | jq

# Browser check
open https://your-domain.vercel.app/healthcheck
```

### Vercel Setup
1. Dashboard → Project → Settings → Environment Variables
2. Add each variable
3. Redeploy

---

## Next Steps

Once healthcheck passes:

1. ✅ Landing page loads
2. ✅ Clarity API responds
3. ✅ Dashboard authentication works
4. ✅ All critical env vars are set

You're ready to go! 🚀

