# 🚀 DealershipAI Enterprise - Deployment Setup Guide

## ✅ Deployment Status

**Production URL:** https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app

**Status:** Deployed ✅ | **Build:** Successful ✅ | **Environment:** Production

---

## 📋 Post-Deployment Configuration Checklist

### 1️⃣ Configure Environment Variables in Vercel

Navigate to: [Vercel Dashboard](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/environment-variables)

#### Required Environment Variables:

```bash
# Database (Choose one)
DATABASE_URL=postgresql://user:password@host:5432/dbname
# OR use Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-here

# OAuth Providers (Optional - enables social login)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# AI Providers (Optional - for AI features)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Other
NODE_ENV=production
```

#### How to Add Environment Variables:

```bash
# Method 1: Via Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Add each variable with its value
3. Select environments: Production, Preview, Development
4. Click "Save"

# Method 2: Via CLI
cd dealershipai-enterprise
vercel env add DATABASE_URL
# Enter value when prompted
# Select environments when prompted
```

---

### 2️⃣ Disable Vercel Deployment Protection (for Public Access)

**Current Status:** Deployment Protection is ENABLED (requires authentication)

**To Disable:**

1. Go to [Project Settings → Deployment Protection](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection)
2. Toggle "Protection" to **OFF**
3. Save changes
4. Test: `curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health`

**Alternatively, keep it enabled and add bypass tokens for authorized users**

---

### 3️⃣ Configure Stripe Webhooks

**Webhook URL:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/webhooks/stripe`

#### Steps:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter webhook URL (above)
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing Secret** (starts with `whsec_`)
7. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

#### Test Webhook:

```bash
# Use Stripe CLI to test locally
stripe listen --forward-to https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/webhooks/stripe

# Send test event
stripe trigger checkout.session.completed
```

---

### 4️⃣ Configure OAuth Providers

#### GitHub OAuth:

1. Go to [GitHub Settings → Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** DealershipAI Enterprise
   - **Homepage URL:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app`
   - **Authorization callback URL:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/auth/callback/github`
4. Click **"Register application"**
5. Copy **Client ID** → Add to Vercel as `GITHUB_ID`
6. Generate **Client Secret** → Add to Vercel as `GITHUB_SECRET`

#### Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select a project
3. Enable **Google+ API**
4. Go to **Credentials** → Create Credentials → **OAuth 2.0 Client ID**
5. Configure consent screen
6. Create OAuth client ID:
   - **Application type:** Web application
   - **Authorized redirect URIs:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/auth/callback/google`
7. Copy **Client ID** → Add to Vercel as `GOOGLE_CLIENT_ID`
8. Copy **Client Secret** → Add to Vercel as `GOOGLE_CLIENT_SECRET`

---

### 5️⃣ Test Database Connection

#### Using Supabase:

```bash
# Test connection
curl -X POST https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health \
  -H "Content-Type: application/json"

# Expected response (after protection is disabled):
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "healthy",
      "latency": 45
    }
  }
}
```

#### Database Schema Setup:

```bash
# If using Supabase, run the schema
cd dealershipai-enterprise
cat supabase-schema.sql | pbcopy
# Paste into Supabase SQL Editor and run
```

---

### 6️⃣ Configure Custom Domain (Optional)

1. Go to [Project Settings → Domains](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/domains)
2. Click **"Add Domain"**
3. Enter your domain (e.g., `dashboard.dealershipai.com`)
4. Follow DNS configuration instructions
5. Update environment variables:
   - `NEXTAUTH_URL=https://dashboard.dealershipai.com`
   - Update OAuth callback URLs

---

### 7️⃣ Verify Cron Jobs

**Configured Cron Jobs:**

```json
{
  "crons": [
    {
      "path": "/api/cron/update-scores",
      "schedule": "0 */6 * * *"  // Every 6 hours
    },
    {
      "path": "/api/cron/sync-reviews",
      "schedule": "0 */2 * * *"  // Every 2 hours
    }
  ]
}
```

**Monitor Cron Execution:**
- View in [Vercel Dashboard → Cron Jobs](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/crons)

---

## 🧪 Testing Checklist

After configuration, test each component:

### ✅ Authentication
```bash
# Visit and test sign-in
open https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/auth/signin
```

### ✅ API Endpoints
```bash
# Health check
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health

# Scoring API
curl -X GET https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/scores

# AI test
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/ai/test
```

### ✅ Dashboard Access
```bash
# Open dashboard
open https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/dashboard
```

### ✅ Billing Flow
1. Navigate to billing page
2. Test checkout flow (use Stripe test mode)
3. Verify webhook reception in Stripe dashboard

---

## 📊 Monitoring & Maintenance

### View Logs:
```bash
cd dealershipai-enterprise
vercel logs https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
```

### View Analytics:
- [Vercel Analytics Dashboard](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/analytics)

### Monitor Performance:
- [Vercel Speed Insights](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/speed-insights)

---

## 🚨 Troubleshooting

### Issue: API returns 401 Unauthorized
**Solution:** Disable Vercel Deployment Protection or add bypass token

### Issue: Database connection fails
**Solution:** Verify `DATABASE_URL` or Supabase credentials in environment variables

### Issue: OAuth not working
**Solution:**
1. Check callback URLs match exactly
2. Verify OAuth app is not in testing mode
3. Ensure redirect URIs are whitelisted

### Issue: Stripe webhooks not received
**Solution:**
1. Verify webhook endpoint URL
2. Check webhook signing secret
3. Review Stripe dashboard for failed attempts

---

## 📞 Support

- **Vercel Support:** https://vercel.com/support
- **Documentation:** https://vercel.com/docs
- **Project Logs:** `vercel logs`

---

## ✨ Summary

Your DealershipAI Enterprise dashboard is deployed! Complete the configuration steps above to enable all features:

1. ✅ Add environment variables
2. ✅ Disable deployment protection (or add bypass)
3. ✅ Configure Stripe webhooks
4. ✅ Set up OAuth providers
5. ✅ Test all endpoints

**Need help?** Run through each section systematically and verify with the testing commands provided.
