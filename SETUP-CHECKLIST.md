# ✅ DealershipAI Enterprise - Setup Checklist

**Production URL:** https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app

Complete these steps in order to make your dashboard fully functional.

---

## 🔴 CRITICAL - Must Complete First

### ✅ Step 1: Disable Vercel Deployment Protection

**Current Status:** 🔴 ENABLED (blocking access)

**Action Required:**
1. Click here: [Disable Protection](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection)
2. Toggle "Deployment Protection" to **OFF**
3. Click "Save"

**Why:** Currently requires authentication to access any page

**Test:** After disabling, run:
```bash
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health
```

Expected: JSON response (not authentication page)

---

### ✅ Step 2: Add Core Environment Variables

**Current Status:** 🔴 NO VARIABLES SET

**Action Required:**
1. Go to: [Environment Variables](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/environment-variables)
2. Add these **minimum required** variables:

```bash
# 1. Authentication (REQUIRED)
NEXTAUTH_URL=https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
NEXTAUTH_SECRET=YOUR_SECRET_HERE

# Generate secret with:
# openssl rand -base64 32
```

**How to add:**
- Click "Add New"
- Enter variable name (e.g., `NEXTAUTH_URL`)
- Enter value
- Select: ✅ Production, ✅ Preview, ✅ Development
- Click "Save"
- Repeat for each variable

---

### ✅ Step 3: Add Database Credentials

**Choose ONE option:**

#### Option A: PostgreSQL Direct
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
```

#### Option B: Supabase (Recommended)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-key-here
```

**Get Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy "Project URL" → Add as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy "service_role secret" → Add as `SUPABASE_SERVICE_ROLE_KEY`

---

### ✅ Step 4: Redeploy with New Variables

After adding environment variables:

**Option 1: Via Dashboard**
1. Go to: [Deployments](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/deployments)
2. Click "..." on latest deployment
3. Click "Redeploy"

**Option 2: Via CLI**
```bash
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise
vercel --prod
```

**Wait for:** Build completes (~3-5 minutes)

---

## 🟡 HIGH PRIORITY - Complete Next

### ✅ Step 5: Configure Stripe (for billing)

**If you want billing features:**

1. Add Stripe keys to environment variables:
```bash
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

2. Configure webhook in [Stripe Dashboard](https://dashboard.stripe.com/webhooks):
   - Click "Add endpoint"
   - URL: `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/webhooks/stripe`
   - Events: Select all `checkout.*` and `customer.subscription.*`
   - Copy signing secret → Add as `STRIPE_WEBHOOK_SECRET`

3. Test with Stripe CLI:
```bash
stripe listen --forward-to https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/webhooks/stripe
stripe trigger checkout.session.completed
```

---

### ✅ Step 6: Set Up OAuth Providers (Optional)

**For GitHub/Google login:**

#### GitHub OAuth:
1. Go to: [GitHub OAuth Apps](https://github.com/settings/developers)
2. New OAuth App
3. Settings:
   - **Homepage URL:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app`
   - **Callback URL:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/auth/callback/github`
4. Copy Client ID → Add as `GITHUB_ID`
5. Generate Client Secret → Add as `GITHUB_SECRET`

#### Google OAuth:
1. Go to: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Settings:
   - **Authorized redirect URIs:** `https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/auth/callback/google`
4. Copy Client ID → Add as `GOOGLE_CLIENT_ID`
5. Copy Client Secret → Add as `GOOGLE_CLIENT_SECRET`

---

## 🟢 OPTIONAL - Nice to Have

### ✅ Step 7: Add AI Provider Keys

**For AI-powered features:**

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

Get keys from:
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Anthropic Console](https://console.anthropic.com/)
- [Google AI Studio](https://makersuite.google.com/app/apikey)

---

### ✅ Step 8: Custom Domain (Optional)

1. Go to: [Domains](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/domains)
2. Add your domain (e.g., `dashboard.dealershipai.com`)
3. Update DNS as instructed
4. Update environment variables:
   ```bash
   NEXTAUTH_URL=https://dashboard.dealershipai.com
   ```
5. Update OAuth callback URLs in GitHub/Google

---

## 🧪 Verification Steps

After completing setup, test everything:

### Test 1: Health Check
```bash
curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health
```
Expected: `{"status":"healthy",...}`

### Test 2: Dashboard Access
```bash
open https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/dashboard
```
Expected: Dashboard loads (may require sign-in)

### Test 3: Authentication
```bash
open https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/auth/signin
```
Expected: Sign-in page with OAuth options

### Test 4: Run Verification Script
```bash
cd /Users/briankramer/dealership-ai-dashboard
./verify-deployment.sh
```
Expected: All endpoints show ✓ or ⚠

---

## 📊 Progress Tracker

Track your completion:

- [ ] Step 1: Disabled deployment protection
- [ ] Step 2: Added NEXTAUTH_URL and NEXTAUTH_SECRET
- [ ] Step 3: Added database credentials
- [ ] Step 4: Redeployed application
- [ ] Step 5: Configured Stripe (if using billing)
- [ ] Step 6: Set up OAuth providers (if using social login)
- [ ] Step 7: Added AI provider keys (if using AI features)
- [ ] Step 8: Configured custom domain (optional)

---

## 🆘 Troubleshooting

### Issue: Still seeing authentication page
**Solution:** Make sure deployment protection is OFF and you've cleared browser cache

### Issue: Environment variables not working
**Solution:** After adding variables, you MUST redeploy (Step 4)

### Issue: OAuth not working
**Solution:** Verify callback URLs match EXACTLY (including https://)

### Issue: Database connection failed
**Solution:** Double-check credentials and ensure database allows connections from Vercel IPs

### Issue: Stripe webhooks not received
**Solution:** Check webhook signing secret and ensure endpoint URL is correct

---

## ✨ Quick Reference Commands

```bash
# Check environment variables
cd /Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Redeploy
vercel --prod

# View logs
vercel logs

# Test endpoints
./verify-deployment.sh

# View full guide
cat DEPLOYMENT-SETUP-GUIDE.md
```

---

## 🎯 Minimum to Go Live (5 Minutes)

**Just want it working ASAP? Complete these 4 steps:**

1. ✅ [Disable deployment protection](https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection)

2. ✅ Add these two variables:
   ```bash
   NEXTAUTH_URL=https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   ```

3. ✅ Redeploy: `vercel --prod`

4. ✅ Test: `curl https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app/api/health`

**That's it!** Basic functionality will work. Add other services as needed.

---

**Current Time:** Run `date` to see when you completed setup
**Deployment URL:** https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app
**Status Dashboard:** https://vercel.com/brian-kramers-projects/dealershipai-enterprise
