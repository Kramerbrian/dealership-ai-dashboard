# ✅ Final Vercel Setup Checklist - Copy & Paste Ready

## 🎯 Complete Environment Variables List

Go to: **https://vercel.com/YOUR_PROJECT/settings/environment-variables**

Add each variable below, one by one. Select **all three environments** (Production, Preview, Development) for each.

---

## 🔴 Required Variables (Must Add)

### 1. NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- ✅ Production, ✅ Preview, ✅ Development

### 2. NEXT_PUBLIC_APP_URL
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://dealershipai.com` (or your production domain)
- ✅ Production, ✅ Preview, ✅ Development

### 3. DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `postgresql://postgres.gzlgfghpkbqlhgfozjkb:Autonation2077$@aws-0-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require`
- ✅ Production, ✅ Preview, ✅ Development
- ⚠️ **Note:** Uses transaction pooler (port 6543)

### 4. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Key:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value:** `pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ`
- ✅ Production, ✅ Preview, ✅ Development

### 5. CLERK_SECRET_KEY
- **Key:** `CLERK_SECRET_KEY`
- **Value:** `sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl`
- ✅ Production, ✅ Preview, ✅ Development

### 6. NEXT_PUBLIC_CLERK_SIGN_IN_URL
- **Key:** `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- **Value:** `/sign-in`
- ✅ Production, ✅ Preview, ✅ Development

### 7. NEXT_PUBLIC_CLERK_SIGN_UP_URL
- **Key:** `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- **Value:** `/sign-up`
- ✅ Production, ✅ Preview, ✅ Development

### 8. NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
- **Key:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- **Value:** `/dashboard`
- ✅ Production, ✅ Preview, ✅ Development

### 9. NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
- **Key:** `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- **Value:** `/onboarding`
- ✅ Production, ✅ Preview, ✅ Development

---

## 🟡 Recommended Variables (Add These Too)

### 10. NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://vxrdvkhkombwlhjvtsmw.supabase.co`
- ✅ Production, ✅ Preview, ✅ Development

### 11. NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s`
- ✅ Production, ✅ Preview, ✅ Development

### 12. SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0`
- ✅ Production, ✅ Preview, ✅ Development

### 13. NEXT_PUBLIC_SENTRY_DSN
- **Key:** `NEXT_PUBLIC_SENTRY_DSN`
- **Value:** `https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584`
- ✅ Production, ✅ Preview, ✅ Development

### 14. SENTRY_DSN ✅ **ADD THIS NOW**
- **Key:** `SENTRY_DSN`
- **Value:** `https://6917c43cd0ee4d8c5c79c9a7a3ebc806@o4510049793605632.ingest.us.sentry.io/4510298696515584`
- ✅ Production, ✅ Preview, ✅ Development
- 📝 **Note:** Same value as NEXT_PUBLIC_SENTRY_DSN (most common setup)

### 15. SENTRY_ORG
- **Key:** `SENTRY_ORG`
- **Value:** `dealershipai`
- ✅ Production, ✅ Preview, ✅ Development

### 16. SENTRY_PROJECT
- **Key:** `SENTRY_PROJECT`
- **Value:** `javascript-nextjs`
- ✅ Production, ✅ Preview, ✅ Development

### 17. OPENAI_API_KEY
- **Key:** `OPENAI_API_KEY`
- **Value:** `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`
- ✅ Production, ✅ Preview, ✅ Development

### 18. ANTHROPIC_API_KEY
- **Key:** `ANTHROPIC_API_KEY`
- **Value:** `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`
- ✅ Production, ✅ Preview, ✅ Development

---

## 🟢 Optional Variables (Set Up Later If Needed)

### Upstash Redis (for rate limiting)
- `UPSTASH_REDIS_REST_URL` - Get from https://console.upstash.com
- `UPSTASH_REDIS_REST_TOKEN` - Get from https://console.upstash.com

### LogTail (for structured logging)
- `LOGTAIL_TOKEN` - Get from https://logtail.com

### Google Analytics
- `NEXT_PUBLIC_GA` - Your Google Analytics ID (e.g., `G-XXXXXXXXXX`)

### Stripe (if using payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

---

## ✅ Verification Checklist

After adding all variables:

- [ ] All 18 recommended variables added
- [ ] SENTRY_DSN added (same as NEXT_PUBLIC_SENTRY_DSN)
- [ ] All variables have Production environment enabled
- [ ] All variables have Preview environment enabled
- [ ] All variables have Development environment enabled
- [ ] NEXT_PUBLIC_APP_URL set to production domain (not localhost)
- [ ] DATABASE_URL uses port 6543 (transaction pooler)

---

## 🚀 After Adding Variables

1. **Redeploy your project:**
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on latest deployment
   - Or push a commit to trigger new deployment

2. **Verify deployment:**
   ```bash
   curl https://dealershipai.com/api/health
   ```
   Should return: `{"success": true, "data": {"status": "healthy"}}`

3. **Check Sentry:**
   - Go to Sentry dashboard
   - Check for any new errors or events

---

## 📝 Quick Summary

**Total Variables to Add:** 18 (9 required + 9 recommended)

**Most Important:**
1. ✅ SENTRY_DSN - Add this now (same value as NEXT_PUBLIC_SENTRY_DSN)
2. ✅ DATABASE_URL - Use transaction pooler format (port 6543)
3. ✅ NEXT_PUBLIC_APP_URL - Set to production domain

**Time Estimate:** 10-15 minutes to add all variables

---

**🎉 Once complete, you're ready for production deployment!**

