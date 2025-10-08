# 🚀 DealershipAI Enterprise - Production Setup Guide

This guide will walk you through setting up your DealershipAI Enterprise platform with full production functionality.

## 📋 **Prerequisites**

Before starting, ensure you have accounts for:
- [ ] Vercel (already done)
- [ ] Supabase (free tier available)
- [ ] Clerk (free tier available)
- [ ] Stripe (free account)
- [ ] Anthropic API (for AI features)
- [ ] OpenAI API (optional, for AI features)

## 🔧 **Step 1: Environment Variables Setup**

### 1.1 Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `dealershipai-enterprise` project
3. Go to **Settings** → **Environment Variables**

### 1.2 Add Required Environment Variables

Add these variables one by one:

#### **Database Configuration**
```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

#### **Authentication (Clerk)**
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

#### **Billing (Stripe)**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### **AI Services**
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-... (optional)
```

#### **Application Configuration**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
REDIS_URL=redis://... (for BullMQ, optional)
GOOGLE_MY_BUSINESS_API_KEY=... (optional)
RESEND_API_KEY=... (for emails, optional)
```

## 🗄️ **Step 2: Supabase Database Setup**

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `dealershipai-enterprise`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users

### 2.2 Get Database Connection String
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI)
3. Replace `[YOUR-PASSWORD]` with your actual password
4. Add this to Vercel as `DATABASE_URL`

### 2.3 Apply Database Schema
1. Go to **SQL Editor** in Supabase
2. Run the schema from `prisma/schema.prisma` (converted to SQL)
3. Or use Prisma to push schema (see Step 2.4)

### 2.4 Push Schema with Prisma
```bash
# Install Prisma CLI globally
npm install -g prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx prisma db seed
```

## 🔐 **Step 3: Clerk Authentication Setup**

### 3.1 Create Clerk Application
1. Go to [clerk.com](https://clerk.com)
2. Click "Add application"
3. Choose "Next.js" as framework
4. Enter application name: `DealershipAI Enterprise`

### 3.2 Configure Organizations
1. Go to **Organizations** in Clerk dashboard
2. Enable "Organizations" feature
3. Configure organization settings:
   - Allow users to create organizations: `false` (admin only)
   - Maximum members per organization: `350`

### 3.3 Get API Keys
1. Go to **API Keys** in Clerk dashboard
2. Copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`

### 3.4 Set Up Webhooks
1. Go to **Webhooks** in Clerk dashboard
2. Click "Add Endpoint"
3. URL: `https://your-app.vercel.app/api/webhooks/clerk`
4. Events to send:
   - `organization.created`
   - `organizationMembership.created`
   - `organizationMembership.updated`
   - `organizationMembership.deleted`
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy webhook secret → `CLERK_WEBHOOK_SECRET`

## 💳 **Step 4: Stripe Billing Setup**

### 4.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Complete account setup

### 4.2 Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4.3 Create Products and Prices
1. Go to **Products** in Stripe dashboard
2. Create products matching your pricing tiers:

#### Test Drive (Free)
- Name: `Test Drive`
- Price: `$0/month`

#### Intelligence Tier
- Name: `Intelligence`
- Price: `$499/month`
- Billing: `Recurring`

#### Boss Mode Tier
- Name: `Boss Mode`
- Price: `$999/month`
- Billing: `Recurring`

#### Enterprise
- Name: `Enterprise`
- Price: `Custom pricing`

### 4.4 Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

## 🤖 **Step 5: AI API Keys Setup**

### 5.1 Anthropic API
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account or sign in
3. Go to **API Keys**
4. Create new key → `ANTHROPIC_API_KEY`

### 5.2 OpenAI API (Optional)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account or sign in
3. Go to **API Keys**
4. Create new key → `OPENAI_API_KEY`

## 🔄 **Step 6: Re-enable tRPC API Routes**

### 6.1 Restore tRPC Functionality
We'll need to restore the tRPC routes and fix the authentication integration.

### 6.2 Update Environment Variables
Make sure all environment variables are properly set in Vercel.

## 🚀 **Step 7: Deploy with Full Functionality**

### 7.1 Test Locally First
```bash
# Install dependencies
npm install

# Set up environment variables locally
cp .env.example .env.local
# Edit .env.local with your actual values

# Test the build
npm run build

# Test locally
npm run dev
```

### 7.2 Deploy to Vercel
```bash
# Deploy with all environment variables
vercel --prod
```

## ✅ **Verification Checklist**

After setup, verify:
- [ ] Landing page loads correctly
- [ ] Authentication works (sign up/sign in)
- [ ] Dashboard loads with real data
- [ ] Review management functions
- [ ] Settings pages work
- [ ] Billing integration works
- [ ] Webhooks are receiving events
- [ ] Database is connected and working

## 🆘 **Troubleshooting**

### Common Issues:
1. **Database connection errors**: Check DATABASE_URL format
2. **Authentication not working**: Verify Clerk keys and webhook URL
3. **Stripe webhooks failing**: Check webhook URL and secret
4. **Build failures**: Check all environment variables are set

### Support:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Supabase: [supabase.com/support](https://supabase.com/support)
- Clerk: [clerk.com/support](https://clerk.com/support)
- Stripe: [stripe.com/support](https://stripe.com/support)

---

**Next Steps**: Follow each step in order, and your DealershipAI Enterprise platform will be fully functional! 🚀
