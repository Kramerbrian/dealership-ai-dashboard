# Stripe + Clerk Integration Setup Guide

**Date**: November 3, 2025
**Status**: Setup Required
**Integration**: Clerk Authentication + Stripe Billing

---

## Overview

This guide walks you through setting up the complete Clerk + Stripe integration for DealershipAI, including:

1. Stripe API configuration
2. Stripe product and pricing setup
3. Clerk webhook configuration
4. Testing the integration

---

## Part 1: Stripe Configuration

### Step 1: Get Stripe API Keys

1. Open Stripe API Keys page: https://dashboard.stripe.com/apikeys
2. Copy the following keys:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)

### Step 2: Add Stripe Keys to Environment

Add these to `.env.local`:

```bash
# Stripe Billing Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=  # We'll get this in Step 5
```

### Step 3: Add to Vercel Production

```bash
# Add Stripe secret key (server-side only)
echo "YOUR_SK_KEY" | vercel env add STRIPE_SECRET_KEY production --scope brian-kramers-projects

# Add Stripe publishable key (client-side)
echo "YOUR_PK_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production --scope brian-kramers-projects
```

---

## Part 2: Create Stripe Products

### Step 1: Create Professional Plan

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name**: DealershipAI Professional
   - **Description**: Professional plan with advanced features
   - **Pricing**: $299/month (recurring)
   - **Billing period**: Monthly
4. Click **"Save product"**
5. **Copy the Product ID** (starts with `prod_`)
6. **Copy the Price ID** (starts with `price_`)

### Step 2: Create Enterprise Plan

1. Click **"+ Add product"** again
2. Fill in:
   - **Name**: DealershipAI Enterprise
   - **Description**: Enterprise plan with white-label and API access
   - **Pricing**: $999/month (recurring)
   - **Billing period**: Monthly
3. Click **"Save product"**
4. **Copy the Product ID** (starts with `prod_`)
5. **Copy the Price ID** (starts with `price_`)

### Step 3: Update Product IDs in Code

Open [lib/stripe-billing.ts](lib/stripe-billing.ts:36-45) and update:

```typescript
export const STRIPE_PRODUCTS = {
  professional: {
    productId: 'prod_YOUR_PROFESSIONAL_PRODUCT_ID',
    priceId: 'price_YOUR_PROFESSIONAL_PRICE_ID',
  },
  enterprise: {
    productId: 'prod_YOUR_ENTERPRISE_PRODUCT_ID',
    priceId: 'price_YOUR_ENTERPRISE_PRICE_ID',
  },
};
```

---

## Part 3: Configure Stripe Webhook

### Step 1: Create Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter:
   - **Endpoint URL**: `https://dealershipai.com/api/stripe/webhook`
   - **Description**: DealershipAI Billing Events
4. Click **"Select events"** and add:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click **"Add endpoint"**

### Step 2: Get Webhook Secret

1. Click on the webhook you just created
2. Click **"Reveal"** next to "Signing secret"
3. Copy the secret (starts with `whsec_`)

### Step 3: Add Webhook Secret to Environment

Add to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

Add to Vercel:

```bash
echo "whsec_YOUR_SECRET_HERE" | vercel env add STRIPE_WEBHOOK_SECRET production --scope brian-kramers-projects
```

---

## Part 4: Configure Clerk Webhook

### Step 1: Create Clerk Webhook

1. Go to https://dashboard.clerk.com/
2. Navigate to **Webhooks** in the sidebar
3. Click **"+ Add Endpoint"**
4. Enter:
   - **Endpoint URL**: `https://dealershipai.com/api/webhooks/clerk`
   - **Description**: User sync for Stripe
5. Subscribe to these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Click **"Create"**

### Step 2: Get Webhook Secret

1. Click on the webhook you just created
2. Copy the **Signing Secret** (starts with `whsec_`)

### Step 3: Add Webhook Secret to Environment

Add to `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_SECRET_HERE
```

Add to Vercel:

```bash
echo "whsec_YOUR_CLERK_SECRET_HERE" | vercel env add CLERK_WEBHOOK_SECRET production --scope brian-kramers-projects
```

---

## Part 5: Test the Integration

### Test 1: Verify Environment Variables

```bash
# Local check
grep -E "STRIPE|CLERK_WEBHOOK" .env.local

# Vercel check
vercel env ls --scope brian-kramers-projects | grep -E "STRIPE|CLERK_WEBHOOK"
```

Expected output:
```
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
CLERK_WEBHOOK_SECRET
```

### Test 2: Test User Creation → Stripe Customer

1. Deploy to production:
   ```bash
   vercel --prod --scope brian-kramers-projects
   ```

2. Create a test user via Clerk:
   - Go to https://dealershipai.com/sign-up
   - Sign up with a test email

3. Verify in Stripe:
   - Go to https://dashboard.stripe.com/customers
   - Look for the customer with the test email
   - Should be created automatically via webhook

### Test 3: Test Subscription Flow

1. Go to https://dealershipai.com/pricing
2. Click **"Upgrade to Professional"**
3. Complete checkout with Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
4. Verify:
   - Redirected to `/dashboard?payment=success`
   - User's plan upgraded in database
   - Subscription visible in Stripe dashboard

### Test 4: Test Webhook Delivery

**Clerk Webhook:**
1. Go to https://dashboard.clerk.com/ → Webhooks
2. Click on your webhook
3. Check **"Recent Deliveries"**
4. Should see `user.created` events with 200 responses

**Stripe Webhook:**
1. Go to https://dashboard.stripe.com/webhooks
2. Click on your webhook
3. Check **"Recent events"**
4. Should see `checkout.session.completed` with 200 responses

---

## Part 6: Monitoring & Troubleshooting

### Check Webhook Logs

**Clerk Webhook Logs:**
```bash
# In Vercel dashboard
vercel logs --scope brian-kramers-projects | grep "Clerk Webhook"
```

**Stripe Webhook Logs:**
```bash
vercel logs --scope brian-kramers-projects | grep "Stripe Webhook"
```

### Common Issues

#### Issue: Webhook signature verification fails

**Solution**:
- Verify webhook secret is correct in environment variables
- Check that webhook endpoint URL matches exactly
- Ensure no trailing slashes in URL

#### Issue: Stripe customer not created

**Solution**:
- Check [app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts) logs
- Verify `STRIPE_SECRET_KEY` is set
- Check user-management implementation

#### Issue: Subscription not updating user plan

**Solution**:
- Verify [app/api/stripe/webhook/route.ts](app/api/stripe/webhook/route.ts) is handling events
- Check that `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Look for errors in webhook event handler

### Test Webhook Locally

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

---

## Implementation Files

### Created/Modified Files:

1. **[app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts)** - Clerk webhook handler
   - Handles `user.created`, `user.updated`, `user.deleted`
   - Automatically creates Stripe customers
   - Syncs user data to database

2. **[lib/stripe-billing.ts](lib/stripe-billing.ts)** - Stripe billing manager
   - Customer creation
   - Checkout session creation
   - Subscription management
   - Webhook event processing

3. **[.env.local](.env.local)** - Environment variables
   - Added Stripe configuration section
   - Added Clerk webhook secret

### Package Added:

- `svix` - Webhook signature verification library

---

## Quick Command Reference

```bash
# View environment variables
cat .env.local | grep -E "STRIPE|CLERK_WEBHOOK"

# Test Clerk webhook locally
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created", "data": {...}}'

# Deploy to production
vercel --prod --scope brian-kramers-projects

# Check logs
vercel logs --scope brian-kramers-projects --follow

# Open dashboards
open "https://dashboard.stripe.com"
open "https://dashboard.clerk.com"
```

---

## Summary Checklist

- [ ] Stripe API keys configured in `.env.local` and Vercel
- [ ] Professional product created in Stripe dashboard
- [ ] Enterprise product created in Stripe dashboard
- [ ] Product IDs updated in [lib/stripe-billing.ts](lib/stripe-billing.ts)
- [ ] Stripe webhook endpoint created and secret configured
- [ ] Clerk webhook endpoint created and secret configured
- [ ] Deployed to production
- [ ] Tested user signup → Stripe customer creation
- [ ] Tested subscription checkout flow
- [ ] Verified webhook delivery in both dashboards

---

## Next Steps

1. **Enable Billing Portal**: Configure Stripe Customer Portal for users to manage subscriptions
2. **Add Usage Tracking**: Implement metered billing for API usage
3. **Configure Tax**: Set up Stripe Tax for automatic tax calculation
4. **Add Invoicing**: Configure automatic invoice generation

---

**Status**: Ready to configure
**Time to Complete**: ~30 minutes
**Last Updated**: November 3, 2025
