# 📋 Vercel Environment Variables - Quick Reference

## 🔴 Required Variables (Add to Production, Preview, Development)

### Core App
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealershipai.com
```

### Database
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```
**Note:** Use your Supabase transaction pooler connection string

### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_[YOUR_KEY]
CLERK_SECRET_KEY=sk_live_[YOUR_KEY]
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## 🟡 Optional but Recommended

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_KEY]
```

### Sentry Error Tracking
```
SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]
NEXT_PUBLIC_SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]
SENTRY_ORG=[YOUR_ORG]
SENTRY_PROJECT=[YOUR_PROJECT]
```
**Note:** `SENTRY_DSN` is server-side (different from `NEXT_PUBLIC_SENTRY_DSN`)

### Rate Limiting (Upstash Redis)
```
UPSTASH_REDIS_REST_URL=https://[ENDPOINT].upstash.io
UPSTASH_REDIS_REST_TOKEN=[YOUR_TOKEN]
```
**Get from:** https://console.upstash.com

### Structured Logging (LogTail)
```
LOGTAIL_TOKEN=[YOUR_LOGTAIL_TOKEN]
```
**Get from:** https://logtail.com

### AI Providers
```
OPENAI_API_KEY=sk-[YOUR_KEY]
ANTHROPIC_API_KEY=sk-ant-[YOUR_KEY]
```

---

## 📝 Quick Export Command

Run this to see your current values formatted for Vercel:
```bash
npm run export:vercel-env
```

Or use the script directly:
```bash
bash scripts/export-vercel-env.sh
```

---

## 📝 How to Add to Vercel

### Method 1: Vercel Dashboard (Recommended)
1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Click **"Add New"**
3. For each variable:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Variable value (copy from export script output)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **"Save"**

---

## ⚠️ Important Notes

1. **Update `NEXT_PUBLIC_APP_URL`:**
   - Change from `http://localhost:3000` to your production domain
   - Example: `https://dealershipai.com`

2. **SENTRY_DSN vs NEXT_PUBLIC_SENTRY_DSN:**
   - `SENTRY_DSN` - Server-side error tracking (secret)
   - `NEXT_PUBLIC_SENTRY_DSN` - Client-side (public)
   - You need BOTH for full error tracking

3. **Database URL Format:**
   - Use Supabase **Transaction Pooler** format:
   - `postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - Port **6543** for pooler (not 5432)

---

## ✅ Verification

After adding variables, verify with:
```bash
npm run verify:env
```

---

**Quick Links:**
- **Vercel Dashboard:** https://vercel.com/YOUR_PROJECT/settings/environment-variables
- **Export Script:** `npm run export:vercel-env`

