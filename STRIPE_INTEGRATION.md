# Stripe Integration Guide for DealershipAI v2.0

## 🚀 Complete Payment Processing Setup

This guide covers the full Stripe integration for DealershipAI v2.0, including checkout, webhooks, billing management, and tier upgrades.

## 📋 Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Stripe CLI**: Install the Stripe CLI for local development
3. **Environment Variables**: Set up your Stripe keys

## 🔧 Setup Instructions

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
# Download from https://github.com/stripe/stripe-cli/releases

# Linux
# Download from https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe

```bash
stripe login
```

### 3. Set Up Webhook Forwarding

```bash
# Start webhook forwarding for local development
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret from the output.

### 4. Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Price IDs (create these in your Stripe dashboard)
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

### 5. Create Stripe Products and Prices

In your Stripe dashboard, create these products:

#### Pro Plan
- **Product Name**: DealershipAI Pro
- **Price**: $99/month
- **Billing**: Recurring monthly
- **Price ID**: Copy to `STRIPE_PRICE_PRO`

#### Enterprise Plan
- **Product Name**: DealershipAI Enterprise
- **Price**: $299/month
- **Billing**: Recurring monthly
- **Price ID**: Copy to `STRIPE_PRICE_ENTERPRISE`

## 🏗️ Architecture Overview

### Payment Flow

```
User clicks "Upgrade to Pro"
  ↓
POST /api/stripe/checkout
  ↓
Create Stripe checkout session
  ↓
Redirect to Stripe checkout
  ↓
User completes payment
  ↓
Stripe sends webhook → POST /api/stripe/webhook
  ↓
Webhook handler updates user tier
  ↓
User redirected to dashboard with new tier
```

### Webhook Events

The system handles these Stripe webhook events:

- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

## 🔄 Tier Management

### Automatic Tier Updates

When a payment is successful:

1. **Webhook receives event**
2. **Extract user ID and tier from metadata**
3. **Update user tier in database**
4. **Reset session count**
5. **Update subscription record**

### Session Limits

- **FREE**: 0 sessions (immediate upgrade required)
- **PRO**: 50 sessions/month
- **ENTERPRISE**: 200 sessions/month

### Feature Access

Features are gated by tier:

- **FREE**: Basic scores, overview
- **PRO**: + E-E-A-T analysis, competitive intel
- **ENTERPRISE**: + Mystery shop, API access, white-label

## 🧪 Testing

### Test Cards

Use these Stripe test cards:

```
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155
```

### Test Scenarios

1. **Successful Upgrade**
   - Use test card 4242 4242 4242 4242
   - Verify tier update in database
   - Check session limit increase

2. **Failed Payment**
   - Use test card 4000 0000 0000 0002
   - Verify no tier change
   - Check error handling

3. **Subscription Cancellation**
   - Cancel subscription in Stripe dashboard
   - Verify tier downgrade to FREE
   - Check session limit reset

## 🚀 Deployment

### Production Setup

1. **Update environment variables** with live Stripe keys
2. **Set up production webhooks** in Stripe dashboard
3. **Configure webhook endpoint**: `https://yourdomain.com/api/stripe/webhook`
4. **Test with live mode** (use real cards with small amounts)

### Webhook Endpoint Configuration

In your Stripe dashboard:

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy the signing secret** to `STRIPE_WEBHOOK_SECRET`

## 🔍 Monitoring

### Stripe Dashboard

Monitor these metrics:

- **Payment success rate**
- **Failed payments**
- **Subscription churn**
- **Revenue growth**

### Application Logs

Check these logs:

- Webhook processing errors
- Tier update failures
- Session limit enforcement
- Payment processing issues

## 🛠️ Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check endpoint URL is correct
   - Verify webhook secret matches
   - Check server logs for errors

2. **Tier not updating after payment**
   - Check webhook event processing
   - Verify database connection
   - Check user ID in metadata

3. **Session limits not enforced**
   - Check Redis connection
   - Verify tier manager logic
   - Check session counting

### Debug Commands

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# View webhook events
stripe events list

# Test specific event
stripe events resend <event_id>
```

## 📊 Analytics

### Key Metrics to Track

- **Conversion rate**: Free → Pro → Enterprise
- **Churn rate**: Monthly subscription cancellations
- **ARPU**: Average revenue per user
- **LTV**: Customer lifetime value

### Revenue Optimization

- **A/B test pricing pages**
- **Optimize upgrade prompts**
- **Monitor feature usage**
- **Track session utilization**

## 🔐 Security

### Best Practices

- **Never expose secret keys** in client-side code
- **Validate webhook signatures** on all events
- **Use HTTPS** for all webhook endpoints
- **Implement rate limiting** on API routes
- **Log all payment events** for audit trails

### PCI Compliance

- **Never store card details** (Stripe handles this)
- **Use Stripe Elements** for card input
- **Implement proper error handling**
- **Follow OWASP guidelines**

## 🎯 Success Criteria

### Technical

- ✅ Stripe checkout working
- ✅ Webhooks processing correctly
- ✅ Tier updates automatic
- ✅ Session limits enforced
- ✅ Billing portal accessible

### Business

- ✅ Free users can upgrade
- ✅ Pro users can upgrade to Enterprise
- ✅ Failed payments handled gracefully
- ✅ Cancellations processed correctly
- ✅ Revenue tracking accurate

## 🚀 Next Steps

1. **Test the complete flow** with test cards
2. **Deploy to production** with live Stripe keys
3. **Monitor webhook events** in Stripe dashboard
4. **Track conversion metrics** in your analytics
5. **Optimize based on user behavior**

---

**DealershipAI v2.0 is now ready for production with complete Stripe integration!** 🎉
