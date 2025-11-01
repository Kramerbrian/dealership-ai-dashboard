# 🚀 DealershipAI - Quick Start Setup

## Current Status
✅ **Deployed**: https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app  
⏳ **Next**: Add Clerk keys for authentication

---

## 🎯 Immediate Next Steps (5 minutes)

### Step 1: Get Clerk Keys
1. **Go to**: https://dashboard.clerk.com
2. **Sign in** to your account (or create one)
3. **Select** your app: `dealership-ai-dashboard`
4. **Go to**: API Keys section
5. **Copy these two keys**:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)

### Step 2: Add Keys to Vercel
**Option A: Web Dashboard (Easiest)**
1. **Open**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables
2. **Click**: "Add New"
3. **Add Variable 1**:
   - Key: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Value: `pk_test_xxxxxxxxxxxxxxxxxxxxx` (your publishable key)
   - Environment: **Production** ✓
   - Click **Save**
4. **Click**: "Add New" again
5. **Add Variable 2**:
   - Key: `CLERK_SECRET_KEY`
   - Value: `sk_test_xxxxxxxxxxxxxxxxxxxxx` (your secret key)
   - Environment: **Production** ✓
   - Click **Save**

**Option B: CLI (Interactive)**
```bash
# Add publishable key
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Paste your publishable key when prompted

# Add secret key
npx vercel env add CLERK_SECRET_KEY production
# Paste your secret key when prompted
```

### Step 3: Redeploy
```bash
npx vercel --prod
```

### Step 4: Test Authentication
1. **Visit**: https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app
2. **Click**: "Sign Up" button
3. **Complete**: registration process
4. **Should redirect**: to `/dashboard`

---

## 🔧 If You Don't Have Clerk Account Yet

### Create Clerk Account (2 minutes)
1. **Go to**: https://clerk.com
2. **Click**: "Start Building for Free"
3. **Sign up** with GitHub
4. **Click**: "Create Application"
5. **Name**: `DealershipAI` (or similar)
6. **Go to**: API Keys → Copy both keys

---

## 📋 Complete Environment Variables (For Later)

Once Clerk is working, you can add these gradually:

### Required for Full SaaS
```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.xxx.supabase.co:5432/postgres

# Caching (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Payments (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
```

### Optional Services
```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXX
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
RESEND_API_KEY=re_xxx

# Security
ENCRYPTION_KEY=32-character-hex-string
CRON_SECRET=random-secret-string
```

---

## 🎯 Priority Order

1. **Clerk Authentication** (5 min) - Get users signing up
2. **Supabase Database** (10 min) - Store real data
3. **Upstash Redis** (5 min) - Cache for performance
4. **Stripe Payments** (15 min) - Monetize the platform
5. **Optional Services** (10 min) - Analytics, monitoring

---

## 🚨 Troubleshooting

### "ClerkProvider not found"
- **Fix**: Add environment variables and redeploy

### "Invalid API key"
- **Fix**: Verify you copied the correct keys

### "Redirect URL mismatch"
- **Fix**: Add your Vercel URL to Clerk dashboard

### Deployment fails
- **Fix**: Check logs with `npx vercel logs`

---

## 📚 Resources

- **Full Setup Guide**: `FULL_SAAS_SETUP_GUIDE.md`
- **Production Guide**: `PRODUCTION_SETUP_GUIDE.md`
- **Quick Checklist**: `QUICK_SETUP_CHECKLIST.md`

---

**Status**: ⏳ Ready for Clerk setup  
**Time**: 5 minutes to working authentication  
**Next**: Get Clerk keys → Add to Vercel → Redeploy → Test

