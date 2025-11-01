# 🎯 DealershipAI - Complete Remaining Tasks

## Current Status
✅ **Most Infrastructure**: Already Configured  
⏳ **Remaining Tasks**: 5 critical items  
**Time**: ~70 minutes to complete

---

## 📋 Task 1: Test Authentication (20 minutes)

### Manual Browser Testing
1. **Visit**: https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app
2. **Test Sign Up**:
   - Click "Sign Up"
   - Enter: `test@dealershipai.com`
   - Password: `TestPassword123!`
   - Verify redirect to `/dashboard`
3. **Test Sign Out**: Sign out and verify redirect
4. **Test Sign In**: Sign in again and verify session
5. **Check Browser Console**: Look for errors (F12)

### Automated Testing (Optional)
```bash
# Open the test URL in your default browser
open https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app

# Or on Linux
xdg-open https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app
```

**Expected Result**: ✅ All authentication flows work correctly

---

## 📋 Task 2: Set Up Database Migrations (10 minutes)

### Step 1: Check Prisma Setup
```bash
# Check if prisma is installed
npx prisma --version

# If not, install it
npm install prisma @prisma/client
```

### Step 2: Copy Production Schema
```bash
# Copy the production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Verify the schema exists
cat prisma/schema.prisma
```

### Step 3: Generate Prisma Client
```bash
# Generate Prisma Client
npx prisma generate
```

### Step 4: Push Schema to Supabase
```bash
# Push the schema to your Supabase database
npx prisma db push

# This will create all tables defined in your schema
```

### Step 5: Seed Database (Optional)
```bash
# If you have a seed script
npx prisma db seed

# Or manually seed via Prisma Studio
npx prisma studio
```

### Step 6: Verify Database
```bash
# Open Prisma Studio to view your database
npx prisma studio

# This opens a browser at http://localhost:5555
```

**Expected Result**: ✅ Database tables created and visible in Prisma Studio

---

## 📋 Task 3: Configure Stripe Webhook (5 minutes)

### Step 1: Get Webhook Endpoint URL
Your webhook endpoint should be:
```
https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app/api/stripe/webhook
```

### Step 2: Configure in Stripe Dashboard
1. **Go to**: https://dashboard.stripe.com
2. **Navigate to**: Developers → Webhooks
3. **Click**: "Add endpoint"
4. **Enter URL**: `https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app/api/stripe/webhook`
5. **Description**: "DealershipAI Production"
6. **Select events to listen for**:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
7. **Click**: "Add endpoint"

### Step 3: Get Signing Secret
1. **After creating webhook**, click on it
2. **Copy**: "Signing secret" (starts with `whsec_`)
3. **Add to Vercel**:
```bash
npx vercel env add STRIPE_WEBHOOK_SECRET production
# Paste the signing secret when prompted
```

### Step 4: Test Webhook
```bash
# Test the webhook locally (if needed)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test with Stripe CLI
stripe trigger checkout.session.completed
```

**Expected Result**: ✅ Webhook receives events successfully

---

## 📋 Task 4: Add Custom Domain (15 minutes)

### Step 1: Add Domain in Vercel
1. **Go to**: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard
2. **Click**: "Settings" → "Domains"
3. **Enter**: `dealershipai.com`
4. **Click**: "Add"

### Step 2: Get DNS Records
Vercel will provide DNS records:
- **A Record**: For root domain
- **CNAME**: For www subdomain

Example:
```
A Record:   @      → 76.76.21.21
CNAME:      www    → cname.vercel-dns.com
```

### Step 3: Update DNS at Your Registrar
1. **Go to**: Your DNS provider (GoDaddy, Namecheap, etc.)
2. **Navigate to**: DNS Settings
3. **Add records** as shown in Vercel
4. **Save changes**

### Step 4: Wait for SSL
- SSL certificate is provisioned automatically
- Takes 1-24 hours (usually 10-30 minutes)
- Check status in Vercel dashboard

### Step 5: Update Clerk Redirects
1. **Go to**: https://dashboard.clerk.com
2. **Select**: Your app
3. **Configure**: URLs
4. **Add**: `https://dealershipai.com` to allowed origins
5. **Update**: Redirect URLs to use new domain

### Step 6: Update Environment Variables (if needed)
```bash
# Update redirect URLs to use custom domain
npx vercel env rm NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL production
# Enter: https://dealershipai.com/dashboard

npx vercel env rm NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
npx vercel env add NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL production
# Enter: https://dealershipai.com/dashboard

# Redeploy
npx vercel --prod
```

**Expected Result**: ✅ Site accessible at `https://dealershipai.com`

---

## 📋 Task 5: Connect Google APIs (30 minutes)

### Step 1: Create Google Cloud Project
1. **Go to**: https://console.cloud.google.com
2. **Click**: "Select a project" → "New Project"
3. **Name**: `DealershipAI`
4. **Click**: "Create"

### Step 2: Enable Required APIs
Enable these APIs in Google Cloud Console:

**Search Console API:**
1. **APIs & Services** → "Library"
2. **Search**: "Google Search Console API"
3. **Click**: "Enable"

**Business Profile API:**
1. **Search**: "Google My Business API"
2. **Click**: "Enable"

**Places API:**
1. **Search**: "Places API"
2. **Click**: "Enable"

**Reviews API:**
1. **Search**: "Google Reviews API"
2. **Click**: "Enable"

### Step 3: Create Service Account
1. **APIs & Services** → "Credentials"
2. **Click**: "Create Credentials" → "Service Account"
3. **Name**: `dealershipai-api`
4. **Click**: "Create and Continue"
5. **Select role**: "Editor"
6. **Click**: "Done"

### Step 4: Download Credentials
1. **Click**: On the service account you created
2. **Click**: "Keys" tab
3. **Click**: "Add Key" → "Create new key"
4. **Select**: JSON
5. **Click**: "Create"
6. **Download**: JSON file

### Step 5: Add to Vercel
```bash
# Add the entire JSON as an environment variable
npx vercel env add GOOGLE_SEARCH_CONSOLE_CREDENTIALS production

# Paste the entire JSON file contents when prompted
# It should look like:
# {"type":"service_account","project_id":"dealershipai",...}
```

### Step 6: Generate API Key (Alternative)
If using API keys instead:

```bash
# Generate API key in Google Cloud Console
# Go to: APIs & Services → Credentials → "Create Credentials" → "API Key"
# Restrict to your required APIs
# Add to Vercel:
npx vercel env add GOOGLE_API_KEY production
# Paste your API key
```

**Expected Result**: ✅ APIs connected and returning data

---

## 🧪 Complete Testing Checklist

### After All Tasks Complete
- [ ] Authentication works end-to-end
- [ ] Database migrations applied
- [ ] Prisma Studio shows tables
- [ ] Stripe webhooks receive events
- [ ] Custom domain resolves correctly
- [ ] SSL certificate active
- [ ] Google APIs returning data
- [ ] All tests pass

---

## 🚀 Quick Commands Summary

```bash
# 1. Test Authentication
open https://dealership-ai-dashboard-1a1p3lww4-brian-kramer-dealershipai.vercel.app

# 2. Database Migrations
npx prisma generate
npx prisma db push
npx prisma studio

# 3. Stripe Webhook
# Configure in Stripe dashboard
npx vercel env add STRIPE_WEBHOOK_SECRET production

# 4. Custom Domain
# Add in Vercel dashboard → Settings → Domains
# Update DNS at registrar

# 5. Google APIs
# Enable in Google Cloud Console
npx vercel env add GOOGLE_SEARCH_CONSOLE_CREDENTIALS production

# Redeploy after all changes
npx vercel --prod
```

---

## 📞 Support Resources

### Documentation
- `TEST_AUTHENTICATION_GUIDE.md` - Auth testing
- `REMAINING_TASKS_CHECKLIST.md` - Task overview
- `LIVE_DEPLOYMENT_STATUS.md` - Current status

### Dashboards
- **Vercel**: https://vercel.com/dashboard
- **Clerk**: https://dashboard.clerk.com
- **Supabase**: https://app.supabase.com
- **Stripe**: https://dashboard.stripe.com
- **Google Cloud**: https://console.cloud.google.com

---

**Total Time**: ~70 minutes  
**Status**: 🎯 Ready to Complete  
**Next**: Start with Task 1 (Test Authentication)

