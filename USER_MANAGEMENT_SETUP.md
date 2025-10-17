# 🚀 User Management & Billing Setup Guide

## 📋 **Overview**

Your DealershipAI dashboard now includes:
- ✅ **User Management** - Complete user profiles and authentication
- ✅ **Subscription Tiers** - Free, Professional ($499), Enterprise ($999)
- ✅ **Stripe Billing** - Secure payment processing
- ✅ **Usage Tracking** - Feature usage monitoring and limits
- ✅ **Analytics** - User behavior and engagement tracking

## 🔒 **Step 1: Fix Database Security Issues**

### **Run Security Fixes in Supabase**

1. **Go to**: https://supabase.com/dashboard
2. **Navigate to**: SQL Editor
3. **Run the security fixes**:
   ```sql
   -- Copy and paste the contents of supabase-security-fixes.sql
   ```

**This will**:
- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Create proper access policies
- ✅ Fix function search_path issues
- ✅ Move pg_trgm extension to proper schema
- ✅ Create subscription and usage tracking tables

## 💳 **Step 2: Set Up Stripe Billing**

### **Create Stripe Account**

1. **Go to**: https://stripe.com
2. **Create account** or sign in
3. **Get your API keys**:
   - Publishable key (starts with `pk_test_` or `pk_live_`)
   - Secret key (starts with `sk_test_` or `sk_live_`)

### **Create Products and Prices**

1. **Go to**: Stripe Dashboard → Products
2. **Create Professional Plan**:
   - Name: "DealershipAI Professional"
   - Price: $499/month
   - Copy the Price ID (starts with `price_`)

3. **Create Enterprise Plan**:
   - Name: "DealershipAI Enterprise"
   - Price: $999/month
   - Copy the Price ID (starts with `price_`)

### **Set Up Webhooks**

1. **Go to**: Stripe Dashboard → Webhooks
2. **Add endpoint**: `https://your-domain.vercel.app/api/stripe/webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. **Copy webhook secret** (starts with `whsec_`)

### **Add Environment Variables**

```bash
# Add to Vercel environment variables
vercel env add STRIPE_SECRET_KEY production
# Enter your Stripe secret key

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter your Stripe publishable key

vercel env add STRIPE_WEBHOOK_SECRET production
# Enter your webhook secret

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter your Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter your Supabase anon key
```

## 🗄️ **Step 3: Update Stripe Product IDs**

### **Update Configuration**

Edit `lib/stripe-billing.ts` and replace the placeholder IDs:

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

## 🚀 **Step 4: Deploy and Test**

### **Deploy to Production**

```bash
vercel --prod
```

### **Test the System**

1. **Test user registration**:
   - Sign up with OAuth
   - Check if user is created in Supabase

2. **Test subscription flow**:
   - Go to pricing page
   - Click "Start Trial"
   - Complete Stripe checkout

3. **Test usage tracking**:
   - Use dashboard features
   - Check usage limits

## 📊 **Subscription Tiers**

### **Free Plan**
- ✅ Basic SEO, AEO, GEO Analysis
- ✅ 5 reports per month
- ✅ 1 domain per user
- ✅ Email support

### **Professional Plan ($499/month)**
- ✅ Everything in Free
- ✅ Advanced Analytics
- ✅ Custom Reports
- ✅ Unlimited reports
- ✅ 5 domains per user
- ✅ Priority support

### **Enterprise Plan ($999/month)**
- ✅ Everything in Professional
- ✅ API Access
- ✅ White-label solution
- ✅ Unlimited domains
- ✅ Custom integrations
- ✅ Dedicated support

## 🔧 **API Endpoints**

### **User Management**
- `GET /api/user/subscription` - Get user subscription
- `POST /api/user/subscription` - Create checkout session
- `GET /api/user/usage` - Get usage statistics
- `POST /api/user/usage` - Track feature usage

### **Stripe Webhooks**
- `POST /api/stripe/webhook` - Handle Stripe events

## 🧪 **Testing Checklist**

### **Database Security**
- [ ] RLS enabled on all tables
- [ ] Proper access policies created
- [ ] Function search_path fixed
- [ ] Extension moved to proper schema

### **User Management**
- [ ] User registration works
- [ ] Subscription creation works
- [ ] Usage tracking works
- [ ] Feature access control works

### **Billing**
- [ ] Stripe checkout works
- [ ] Webhook events processed
- [ ] Subscription updates work
- [ ] Payment failures handled

## 💰 **Revenue Projections**

### **Conservative Estimates**
- **Month 1**: 10 customers × $499 = $4,990
- **Month 3**: 50 customers × $499 = $24,950
- **Month 6**: 100 customers × $499 = $49,900
- **Month 12**: 200 customers × $499 = $99,800

### **Growth Targets**
- **Year 1**: $500K ARR
- **Year 2**: $2M ARR
- **Year 3**: $5M ARR

## 🎯 **Next Steps**

1. **Set up Stripe products** (5 minutes)
2. **Configure webhooks** (3 minutes)
3. **Add environment variables** (2 minutes)
4. **Deploy and test** (5 minutes)
5. **Start acquiring customers** (immediately!)

## 🚨 **Important Notes**

1. **Test in Stripe test mode** first
2. **Verify webhook endpoints** are working
3. **Monitor usage limits** to prevent abuse
4. **Set up monitoring** for failed payments
5. **Create customer support** processes

---

**Your DealershipAI dashboard now has enterprise-grade user management and billing! 🚀**
