# Stripe + Clerk Integration - Quick Setup Checklist

**Status**: Configuration Required
**Date**: November 3, 2025

---

## What's Already Done ✅

### Code Implementation
- ✅ Stripe billing manager ([lib/stripe-billing.ts](lib/stripe-billing.ts))
- ✅ Stripe configuration ([lib/stripe.ts](lib/stripe.ts))
- ✅ Clerk webhook handler ([app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts))
- ✅ Stripe webhook handler ([app/api/stripe/webhook/route.ts](app/api/stripe/webhook/route.ts))
- ✅ Checkout session API ([app/api/stripe/create-checkout/route.ts](app/api/stripe/create-checkout/route.ts))
- ✅ Session verification API ([app/api/stripe/verify-session/route.ts](app/api/stripe/verify-session/route.ts))

### Stripe Products
- ✅ Free Plan: $0/month
- ✅ Professional Plan: $499/month
- ✅ Enterprise Plan: $999/month

---

## Configuration Needed

### 1. Add Stripe API Keys to `.env.local`

```bash
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

### 2. Add Stripe Product/Price IDs to `.env.local`

From Stripe Dashboard (https://dashboard.stripe.com/products), get the IDs and add:

```bash
# Professional Plan ($499/month)
STRIPE_TIER_2_PRODUCT_ID=prod_YOUR_PROFESSIONAL_PRODUCT_ID
STRIPE_TIER_2_PRICE_ID=price_YOUR_PROFESSIONAL_PRICE_ID

# Enterprise Plan ($999/month)
STRIPE_TIER_3_PRODUCT_ID=prod_YOUR_ENTERPRISE_PRODUCT_ID
STRIPE_TIER_3_PRICE_ID=price_YOUR_ENTERPRISE_PRICE_ID
```

### 3. Configure Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Endpoint URL: `https://dealershipai.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Copy the **Signing secret** (whsec_...)
6. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### 4. Configure Clerk Webhook

1. Go to: https://dashboard.clerk.com/ → Webhooks
2. Click **"+ Add Endpoint"**
3. Endpoint URL: `https://dealershipai.com/api/webhooks/clerk`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** (whsec_...)
6. Add to `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_SECRET_HERE
   ```

### 5. Add to Vercel Production

After updating `.env.local`, add all variables to Vercel:

```bash
# Stripe API Keys
echo "YOUR_SK_KEY" | vercel env add STRIPE_SECRET_KEY production --scope brian-kramers-projects
echo "YOUR_PK_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production --scope brian-kramers-projects

# Stripe Product/Price IDs
echo "YOUR_PROD_ID" | vercel env add STRIPE_TIER_2_PRODUCT_ID production --scope brian-kramers-projects
echo "YOUR_PRICE_ID" | vercel env add STRIPE_TIER_2_PRICE_ID production --scope brian-kramers-projects
echo "YOUR_PROD_ID" | vercel env add STRIPE_TIER_3_PRODUCT_ID production --scope brian-kramers-projects
echo "YOUR_PRICE_ID" | vercel env add STRIPE_TIER_3_PRICE_ID production --scope brian-kramers-projects

# Webhook Secrets
echo "YOUR_STRIPE_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production --scope brian-kramers-projects
echo "YOUR_CLERK_WEBHOOK_SECRET" | vercel env add CLERK_WEBHOOK_SECRET production --scope brian-kramers-projects
```

---

## How It Works

### User Signup Flow

1. User signs up via Clerk → `user.created` event fires
2. Clerk webhook handler (`/api/webhooks/clerk`) receives event
3. Automatically creates Stripe customer
4. Saves user to database with Stripe customer ID
5. User assigned to Free plan by default

### Subscription Flow

1. User clicks "Upgrade" button → Redirects to checkout
2. Checkout API (`/api/stripe/create-checkout`) creates Stripe session
3. User completes payment in Stripe
4. Stripe webhook fires → `checkout.session.completed`
5. Stripe webhook handler (`/api/stripe/webhook`) processes event
6. User's subscription updated in database
7. User redirected to `/onboarding?session_id=...`

### Architecture

```
┌─────────────┐
│    Clerk    │ ──user.created──> ┌──────────────────┐
│ (Auth)      │                    │ Clerk Webhook    │
└─────────────┘                    │ /api/webhooks/   │
                                   │    clerk         │
                                   └────────┬─────────┘
                                           │
                                           ├─> Create Stripe Customer
                                           └─> Save to Database

┌─────────────┐
│   Stripe    │ ──subscription──> ┌──────────────────┐
│ (Billing)   │                    │ Stripe Webhook   │
└─────────────┘                    │ /api/stripe/     │
                                   │    webhook       │
                                   └────────┬─────────┘
                                           │
                                           └─> Update User Plan
```

---

## Testing

### Test Locally

```bash
# 1. Start local dev server
npm run dev

# 2. Test Clerk webhook (in another terminal)
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{"type": "user.created", "data": {"id": "test123", "email_addresses": [{"email_address": "test@example.com"}]}}'

# 3. Forward Stripe webhooks (install Stripe CLI first)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 4. Trigger test payment
stripe trigger checkout.session.completed
```

### Test Production

1. Deploy with environment variables:
   ```bash
   vercel --prod --scope brian-kramers-projects
   ```

2. Create test user:
   - Go to https://dealershipai.com/sign-up
   - Sign up with test email

3. Verify Stripe customer created:
   - Check https://dashboard.stripe.com/customers
   - Should see new customer with test email

4. Test upgrade flow:
   - Click "Upgrade to Professional"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify subscription created

5. Check webhook logs:
   ```bash
   vercel logs --scope brian-kramers-projects | grep -E "Clerk Webhook|Stripe"
   ```

---

## Quick Reference

### Environment Variables Summary

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Billing
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Products
STRIPE_TIER_2_PRODUCT_ID=prod_...
STRIPE_TIER_2_PRICE_ID=price_...
STRIPE_TIER_3_PRODUCT_ID=prod_...
STRIPE_TIER_3_PRICE_ID=price_...
```

### Useful Commands

```bash
# View current environment
cat .env.local | grep -E "STRIPE|CLERK"

# List Vercel environment variables
vercel env ls --scope brian-kramers-projects | grep -E "STRIPE|CLERK"

# View Stripe products
stripe products list

# View Stripe prices
stripe prices list

# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Dashboard Links

- **Clerk Dashboard**: https://dashboard.clerk.com/
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Stripe API Keys**: https://dashboard.stripe.com/apikeys
- **Stripe Products**: https://dashboard.stripe.com/products
- **Stripe Webhooks**: https://dashboard.stripe.com/webhooks
- **Vercel Project**: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard

---

## Next Steps

1. [ ] Get Stripe API keys from dashboard
2. [ ] Get Stripe Product/Price IDs from dashboard
3. [ ] Add all keys to `.env.local`
4. [ ] Configure Stripe webhook endpoint
5. [ ] Configure Clerk webhook endpoint
6. [ ] Add all environment variables to Vercel
7. [ ] Deploy to production
8. [ ] Test user signup flow
9. [ ] Test subscription upgrade flow
10. [ ] Verify webhook deliveries

---

**Estimated Time**: 15-20 minutes
**Last Updated**: November 3, 2025
