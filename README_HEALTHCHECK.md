# Healthcheck & Environment Verification

Quick reference for verifying your deployment is working correctly.

## 🚀 Quick Start

### 1. Verify Environment Variables (Local)

```bash
npm run verify:env
```

This checks all required and optional environment variables and shows what's missing.

### 2. Test Healthcheck (Local)

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test healthcheck
npm run verify:health
```

### 3. Test Healthcheck (Production)

After deploying to Vercel:

```bash
# Replace with your actual domain
curl https://your-vercel-domain.vercel.app/api/health | jq
```

Or visit in browser:
```
https://your-vercel-domain.vercel.app/healthcheck
```

## 📋 Required Environment Variables

### Must Have (Production)

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (starts with `pk_`)
- `CLERK_SECRET_KEY` - Clerk secret key (starts with `sk_`)

**If missing**: `/dash` will break with authentication errors.

### Recommended

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox public token (starts with `pk.`)
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g. `https://dealershipai.vercel.app`)

## 🔧 Setting Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter **Key** and **Value**
4. Select **Environments** (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project

## ✅ Success Indicators

### Healthcheck Response

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
      "status": 200
    }
  }
}
```

### What to Check

- ✅ `ok: true` - Overall system is healthy
- ✅ All required env vars show `true`
- ✅ Clarity API returns `ok: true`
- ✅ Trust API and Assistant API show `exists: true`

## ❌ Troubleshooting

### Issue: `ok: false`

**Check**:
1. `checks.env` - Are required variables missing?
2. `checks.clarity` - Is the API endpoint working?
3. Vercel logs - Any runtime errors?

**Fix**:
1. Add missing environment variables in Vercel
2. Redeploy
3. Test again

### Issue: Missing Clerk Keys

**Symptoms**: `/dash` redirects in a loop or shows auth errors

**Fix**:
1. Get keys from Clerk Dashboard → API Keys
2. Add to Vercel Environment Variables
3. Redeploy

### Issue: Clarity API Fails

**Note**: If the endpoint doesn't exist yet, this is OK. The healthcheck will show:
```json
{
  "clarity": {
    "ok": false,
    "note": "Clarity API endpoint may not be implemented yet"
  }
}
```

This won't fail the overall healthcheck.

## 📚 More Information

- Full guide: `docs/ENV_VERIFICATION_GUIDE.md`
- Vercel checklist: `docs/VERCEL_ENV_CHECKLIST.md`

