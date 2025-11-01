# 🚀 DealershipAI - Quick Action Guide

## Current Status
✅ **Database Setup**: Complete (Prisma Studio running at http://localhost:5555)  
✅ **Infrastructure**: Fully Deployed  
⏳ **Remaining**: 4 tasks to complete

---

## 📋 Task 1: Test Authentication (20 minutes)

### Quick Test Steps
1. **Open Browser**: https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app
2. **Test Sign Up**:
   - Click "Sign Up" button
   - Email: `test@dealershipai.com`
   - Password: `TestPassword123!`
   - Verify redirect to `/dashboard`
3. **Test Sign In**: Sign out → Sign in again
4. **Check Console**: Open DevTools (F12) → Look for errors

### Browser Console Check
Press `F12` → Console tab → Look for:
- ✅ "Signed in successfully"
- ❌ Any error messages

**Expected**: ✅ Authentication works end-to-end

---

## 📋 Task 2: Configure Stripe Webhooks (5 minutes)

### Step 1: Add Webhook in Stripe
1. **Go to**: https://dashboard.stripe.com
2. **Click**: "Developers" → "Webhooks"
3. **Click**: "Add endpoint"
4. **URL**: `https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app/api/stripe/webhook`
5. **Events**: Select these:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. **Click**: "Add endpoint"

### Step 2: Get Signing Secret
1. **After creation**, click on the webhook
2. **Copy**: "Signing secret" (starts with `whsec_`)

### Step 3: Add to Vercel
```bash
npx vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the signing secret when prompted
```

### Step 4: Test Webhook
```bash
# Install Stripe CLI if needed
npm install -g stripe

# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

**Expected**: ✅ Webhook receives events

---

## 📋 Task 3: Add Custom Domain (15 minutes)

### Step 1: Add Domain in Vercel
1. **Go to**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. **Click**: "Settings" → "Domains"
3. **Enter**: `dealershipai.com`
4. **Click**: "Add"

### Step 2: Get DNS Records
Vercel will show DNS records like:
```
A Record:   @      → 76.76.21.21
CNAME:      www    → cname.vercel-dns.com
```

### Step 3: Update DNS
1. **Go to**: Your DNS provider (where you bought the domain)
2. **Find**: DNS Settings
3. **Add**: The records shown by Vercel
4. **Save**

### Step 4: Wait for SSL
- Automatic SSL provisioning
- Check status in Vercel
- Usually takes 10-30 minutes

### Step 5: Update Clerk
1. **Go to**: https://dashboard.clerk.com
2. **Select**: Your app
3. **Configure** → URLs
4. **Add**: `https://dealershipai.com`
5. **Save**

**Expected**: ✅ Site accessible at `https://dealershipai.com`

---

## 📋 Task 4: Connect Google APIs (30 minutes)

### Step 1: Create Google Cloud Project
1. **Go to**: https://console.cloud.google.com
2. **Click**: "Select project" → "New Project"
3. **Name**: `DealershipAI`
4. **Create**

### Step 2: Enable APIs
Enable these APIs:
- **Google Search Console API**
- **Google My Business API**
- **Places API**
- **Google Reviews API**

**Steps**:
1. "APIs & Services" → "Library"
2. Search for each API
3. Click "Enable"

### Step 3: Create Service Account
1. **APIs & Services** → "Credentials"
2. **Create** → "Service Account"
3. **Name**: `dealershipai-api`
4. **Create and Continue** → Select "Editor" role
5. **Done**

### Step 4: Download Credentials
1. **Click**: Service account you created
2. **Keys** tab → "Add Key" → "Create new key"
3. **Select**: JSON
4. **Download** JSON file

### Step 5: Add to Vercel
```bash
npx vercel env add GOOGLE_SEARCH_CONSOLE_CREDENTIALS production
# Paste the entire JSON contents when prompted
```

### Step 6: Or Use API Key
```bash
# Generate API key in Console
# Add to Vercel:
npx vercel env add GOOGLE_API_KEY production
```

**Expected**: ✅ APIs connected and working

---

## 🧪 Complete Test Checklist

### Authentication ✅
- [ ] Sign up works
- [ ] Sign in works  
- [ ] Sign out works
- [ ] Session persists
- [ ] Protected routes work

### Payments ✅
- [ ] Webhook receives events
- [ ] Checkout flow works
- [ ] Subscription creates
- [ ] Tier updates correctly

### Domain ✅
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Site loads on domain
- [ ] HTTPS works

### APIs ✅
- [ ] Search Console API works
- [ ] Business Profile API works
- [ ] Places API works
- [ ] Reviews API works

---

## 🚀 Quick Commands

```bash
# Test authentication
open https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app

# Configure Stripe webhook
# Do in Stripe dashboard, then:
npx vercel env add STRIPE_WEBHOOK_SECRET production

# Custom domain
# Add in Vercel dashboard

# Google APIs
npx vercel env add GOOGLE_SEARCH_CONSOLE_CREDENTIALS production

# Redeploy after changes
npx vercel --prod

# View logs
npx vercel logs
```

---

## 📞 Access Links

### Dashboards
- **Vercel**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
- **Clerk**: https://dashboard.clerk.com
- **Supabase**: https://app.supabase.com
- **Stripe**: https://dashboard.stripe.com
- **Google Cloud**: https://console.cloud.google.com

### Live URLs
- **Production**: https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app
- **Custom Domain**: https://dealershipai.com (after DNS configured)
- **Prisma Studio**: http://localhost:5555

---

## ⏱️ Time Estimates

- **Test Authentication**: 20 minutes
- **Stripe Webhook**: 5 minutes
- **Custom Domain**: 15 minutes
- **Google APIs**: 30 minutes

**Total**: ~70 minutes to complete all tasks

---

## ✅ Success Criteria

### Must Have
- ✅ Authentication works
- ✅ Database connected
- ✅ Payments process
- ✅ Domain configured

### Should Have
- ✅ Google APIs connected
- ✅ Analytics tracking
- ✅ Error monitoring
- ✅ Performance optimized

---

**Status**: 🎯 75% Complete  
**Next**: Start with Task 1 (Test Authentication)  
**Total Time**: ~70 minutes remaining

