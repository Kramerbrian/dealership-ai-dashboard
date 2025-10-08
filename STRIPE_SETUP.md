# 🚀 Stripe Integration Setup Guide

This guide will help you set up the complete Stripe payment integration for DealershipAI.

## 📋 Prerequisites

- Stripe account (create at https://stripe.com)
- Supabase account (create at https://supabase.com)
- Vercel account (for deployment)

## 🔧 Step 1: Install Dependencies

```bash
npm install
```

## 🗄️ Step 2: Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Run the SQL to create the required tables

## 💳 Step 3: Configure Stripe

### 3.1 Create Products and Prices

1. Go to Stripe Dashboard → Products
2. Create products and prices:
   - **Pro Plan**: $599/month (recurring) - copy price ID
   - **Pro Plan**: $5990/year (recurring) - copy price ID  
   - **Premium+ Plan**: $999/month (recurring) - copy price ID
   - **Premium+ Plan**: $9990/year (recurring) - copy price ID
3. Copy all price IDs (start with `price_`)

### 3.2 Set Up Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret (starts with `whsec_`)

### 3.3 Enable Customer Portal

1. Go to Stripe Dashboard → Settings → Billing
2. Enable Customer Portal
3. Configure the portal settings

## 🔐 Step 4: Environment Variables

Create a `.env` file in your project root:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_ANNUAL=price_...

# Supabase Configuration
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# App Configuration
NEXT_PUBLIC_URL=https://your-domain.com
NODE_ENV=production
```

## 🚀 Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

## 🧪 Step 6: Test the Integration

### 6.1 Test Cards

Use these test card numbers:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Authentication**: 4000 0025 0000 3155

### 6.2 Test Flow

1. Visit your site
2. Enter a dealership URL
3. Click "Start 7-Day Free Trial"
4. Complete checkout with test card
5. Verify webhook processed
6. Check database for subscription

## 📊 Step 7: Monitor and Optimize

### 7.1 Stripe Dashboard

- Monitor payments and subscriptions
- Set up alerts for failed payments
- Track conversion metrics

### 7.2 Supabase Dashboard

- Monitor user signups
- Track subscription status
- Analyze usage patterns

## 🔧 Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check server logs for errors

2. **Checkout not working**
   - Verify Stripe keys are correct
   - Check CORS settings
   - Ensure price ID is valid

3. **Database errors**
   - Verify Supabase connection
   - Check RLS policies
   - Ensure service key has proper permissions

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

## 📈 Analytics and Monitoring

### Key Metrics to Track

- Conversion rate (free → paid)
- Trial-to-paid conversion
- Churn rate
- Monthly recurring revenue (MRR)
- Customer lifetime value (CLV)

### Recommended Tools

- Stripe Dashboard for payment analytics
- Supabase Analytics for user behavior
- Google Analytics for website metrics
- Mixpanel for user journey tracking

## 🎯 Optimization Tips

1. **A/B Test Pricing**
   - Try different price points
   - Test annual vs monthly
   - Experiment with trial length

2. **Improve Conversion**
   - Optimize checkout flow
   - Add social proof
   - Improve value proposition

3. **Reduce Churn**
   - Send onboarding emails
   - Provide value early
   - Monitor usage patterns

## 🆘 Support

If you need help:

1. Check the troubleshooting section above
2. Review Stripe documentation
3. Check Supabase documentation
4. Contact support

## 🎉 You're Ready!

Your Stripe integration is now complete! Users can:

- ✅ Get free analysis
- ✅ Upgrade to Pro with 7-day trial
- ✅ Manage their subscription
- ✅ Access premium features

Happy selling! 🚀

