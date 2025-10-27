# Stripe Production Setup for DealershipAI v2.0

## 🚀 Complete Production Configuration

Now that your Stripe account is set up, follow these steps to configure production payments.

## 📋 Step 1: Get Your Stripe Keys

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to**: Developers → API Keys
3. **Copy these keys**:
   - **Publishable Key** (starts with `pk_live_...`)
   - **Secret Key** (starts with `sk_live_...`)

## 🔧 Step 2: Configure Environment Variables

Run the configuration script:

```bash
./scripts/configure-stripe.sh
```

Or manually add these environment variables in Vercel:

### Required Environment Variables

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Stripe Price IDs (create these in next step)
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Webhook Secret (get this after setting up webhook)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🛍️ Step 3: Create Stripe Products

### Create Professional Plan Product

1. **Go to**: Products → Add Product
2. **Product Details**:
   - **Name**: DealershipAI Professional
   - **Description**: Bi-weekly AI monitoring with advanced analytics and automation
3. **Pricing**:
   - **Price**: $499.00
   - **Billing**: Recurring monthly
   - **Currency**: USD
4. **Save** and copy the **Price ID** (starts with `price_...`)

### Create Enterprise Plan Product

1. **Go to**: Products → Add Product
2. **Product Details**:
   - **Name**: DealershipAI Enterprise
   - **Description**: Unlimited AI monitoring with enterprise features and automation
3. **Pricing**:
   - **Price**: $999.00
   - **Billing**: Recurring monthly
   - **Currency**: USD
4. **Save** and copy the **Price ID** (starts with `price_...`)

## 🔗 Step 4: Set Up Webhook Endpoint

### Create Webhook Endpoint

1. **Go to**: Developers → Webhooks
2. **Click**: Add endpoint
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Click**: Add endpoint
6. **Copy the signing secret** (starts with `whsec_...`)

## 🧪 Step 5: Test the Integration

### Test Cards

Use these Stripe test cards for testing:

```
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155
```

### Test Scenarios

1. **Free User Upgrade to Pro**
   - Sign up with free account
   - Try to access E-E-A-T feature
   - Click upgrade button
   - Complete payment with test card
   - Verify tier update

2. **Pro User Upgrade to Enterprise**
   - Sign up with Pro account
   - Try to access Mystery Shop feature
   - Click upgrade button
   - Complete payment
   - Verify tier update

3. **Billing Portal Access**
   - Sign in with paid account
   - Click "Manage Billing"
   - Verify portal access

## 📊 Step 6: Monitor and Analytics

### Stripe Dashboard Monitoring

Monitor these metrics in your Stripe dashboard:

- **Payment success rate**
- **Failed payments**
- **Subscription churn**
- **Revenue growth**
- **Webhook delivery success**

### Application Logs

Check Vercel function logs for:

- Webhook processing errors
- Tier update failures
- Payment processing issues
- Session limit enforcement

## 🔍 Step 7: Troubleshooting

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

## 🎯 Step 8: Go Live Checklist

### Pre-Launch

- [ ] Stripe keys configured
- [ ] Products created with correct prices
- [ ] Webhook endpoint set up
- [ ] Environment variables added
- [ ] Test payments working
- [ ] Tier updates working
- [ ] Billing portal accessible

### Launch

- [ ] Switch to live mode in Stripe
- [ ] Update environment variables with live keys
- [ ] Test with real payment methods
- [ ] Monitor webhook events
- [ ] Check error logs

### Post-Launch

- [ ] Monitor payment success rate
- [ ] Track subscription metrics
- [ ] Monitor customer support
- [ ] Optimize conversion funnel

## 📈 Success Metrics

### Technical Metrics

- **Webhook delivery rate**: >99%
- **Payment success rate**: >95%
- **Tier update success rate**: >99%
- **API response time**: <200ms

### Business Metrics

- **Free to Pro conversion**: Target 15%
- **Pro to Enterprise upgrade**: Target 20%
- **Monthly churn rate**: Target <5%
- **Customer LTV**: Target >$10K

## 🚀 Production URLs

Your DealershipAI v2.0 is deployed at:

- **Main App**: https://dealership-ai-dashboard-3x0r4wz70-brian-kramer-dealershipai.vercel.app
- **Pricing Page**: https://dealership-ai-dashboard-3x0r4wz70-brian-kramer-dealershipai.vercel.app/pricing
- **Dashboard**: https://dealership-ai-dashboard-3x0r4wz70-brian-kramer-dealershipai.vercel.app/dashboard

## 🎉 Ready for Production!

Your DealershipAI v2.0 SaaS platform is now ready for production with:

- ✅ Complete tier system
- ✅ Stripe payment processing
- ✅ Automatic tier upgrades
- ✅ Billing management
- ✅ Session enforcement
- ✅ Feature gating

**Start accepting payments and growing your SaaS business!** 🚀
