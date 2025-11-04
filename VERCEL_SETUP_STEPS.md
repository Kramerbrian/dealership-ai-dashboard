# 🚀 Vercel Environment Variables - Step-by-Step Setup

## Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/YOUR_PROJECT/settings/environment-variables
2. Replace `YOUR_PROJECT` with your actual project name/slug

---

## Step 2: Add Required Variables (One by One)

### 2.1 NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### 2.2 NEXT_PUBLIC_APP_URL
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://dealershipai.com` (or your actual production domain)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **IMPORTANT:** Use your production domain here!
- Click **Save**

### 2.3 DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** 
  ```
  postgresql://postgres.gzlgfghpkbqlhgfozjkb:Autonation2077%24@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require
  ```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **Note:** Updated to use port **6543** (transaction pooler) instead of 5432
- Click **Save**

### 2.4 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Key:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value:** `pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### 2.5 CLERK_SECRET_KEY
- **Key:** `CLERK_SECRET_KEY`
- **Value:** `sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### 2.6 Clerk Redirect URLs
Add these one by one:

- **Key:** `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- **Value:** `/sign-in`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- **Value:** `/sign-up`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- **Value:** `/dashboard`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- **Value:** `/onboarding`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## Step 3: Add Optional but Recommended Variables

### 3.1 Supabase Variables

- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://vxrdvkhkombwlhjvtsmw.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### 3.2 Sentry Variables

- **Key:** `NEXT_PUBLIC_SENTRY_DSN`
- **Value:** `https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `SENTRY_ORG`
- **Value:** `dealershipai`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `SENTRY_PROJECT`
- **Value:** `javascript-nextjs`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `SENTRY_DSN` ⚠️ **ACTION REQUIRED**
- **Value:** Get from Sentry Dashboard → Project Settings → Client Keys (DSN)
- **Note:** This is the server-side DSN (different from NEXT_PUBLIC_SENTRY_DSN)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### 3.3 AI Provider Keys

- **Key:** `OPENAI_API_KEY`
- **Value:** `sk-your-openai-api-key-here`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

- **Key:** `ANTHROPIC_API_KEY`
- **Value:** `sk-ant-your-anthropic-api-key-here`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## Step 4: Get Missing Optional Variables (If Needed)

### 4.1 Get SENTRY_DSN

1. Go to: https://sentry.io/organizations/dealershipai/projects/javascript-nextjs/settings/keys/
2. Find the **DSN** in the "Client Keys (DSN)" section
3. Copy the full DSN URL
4. Add to Vercel as `SENTRY_DSN`

### 4.2 Set Up Upstash Redis (Optional - for rate limiting)

1. Go to: https://console.upstash.com
2. Create a new database (or use existing)
3. Copy the **REST URL** → Add as `UPSTASH_REDIS_REST_URL`
4. Copy the **REST TOKEN** → Add as `UPSTASH_REDIS_REST_TOKEN`
5. Both values go in Vercel

### 4.3 Set Up LogTail (Optional - for structured logging)

1. Go to: https://logtail.com
2. Sign up / Log in
3. Create a new source
4. Copy the **Source Token** → Add as `LOGTAIL_TOKEN` in Vercel

---

## Step 5: Verify All Variables Added

After adding all variables:

1. Check that you have at least **13 variables** in Vercel
2. Verify each has all three environments selected (Production, Preview, Development)
3. Double-check `NEXT_PUBLIC_APP_URL` is set to production domain

---

## Step 6: Deploy

After adding variables:

1. Go to Vercel Dashboard → Deployments
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger deployment
4. Wait for build to complete

---

## Step 7: Post-Deployment Verification

After deployment:

1. **Check Health Endpoint:**
   ```bash
   curl https://dealershipai.com/api/health
   ```
   Should return: `{"success": true, "data": {"status": "healthy"}}`

2. **Verify Environment Variables:**
   ```bash
   # Locally
   npm run verify:env
   ```

3. **Check Sentry (if added):**
   - Go to Sentry dashboard
   - Check for any new errors

---

## ✅ Checklist

Before deploying to production:

- [ ] All required variables added (5 minimum)
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] `DATABASE_URL` uses port 6543 (transaction pooler)
- [ ] All variables have Production environment enabled
- [ ] Optional variables added (Supabase, Sentry, AI keys)
- [ ] `SENTRY_DSN` retrieved and added (server-side)
- [ ] Upstash Redis set up (optional, for rate limiting)
- [ ] LogTail set up (optional, for logging)
- [ ] Deployment triggered after adding variables
- [ ] Health check passing after deployment

---

**🎉 Once complete, you're ready for production!**

