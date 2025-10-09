# DealershipAI Enterprise Setup Guide

## 🚀 Quick Start

This guide will help you set up the DealershipAI Enterprise platform with multi-tenant architecture, RBAC, and Stripe billing.

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Stripe account
- Clerk account
- OpenAI API key

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
git clone https://github.com/Kramerbrian/dealership-ai-dashboard.git
cd dealership-ai-dashboard
npm install
```

2. **Set up environment variables:**
```bash
cp env.template .env.local
# Edit .env.local with your actual values
```

3. **Set up the database:**
```bash
# Run the enterprise schema
psql -d your_database -f database/enterprise-schema.sql
```

4. **Start the development server:**
```bash
npm run dev
```

## 🔧 Configuration

### 1. Database Setup (Supabase)

1. Create a new Supabase project
2. Run the enterprise schema SQL
3. Enable Row Level Security (RLS)
4. Set up the service role key

### 2. Authentication (Clerk)

1. Create a Clerk account
2. Set up your application
3. Configure organization settings for multi-tenancy
4. Add your Clerk keys to `.env.local`

### 3. Stripe Billing

1. Create products in Stripe Dashboard:
   - **Intelligence**: $499/month
   - **Boss Mode**: $999/month
   - **Enterprise**: Custom pricing

2. Set up webhooks:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

3. Add your Stripe keys to `.env.local`

### 4. AI Services

1. Get OpenAI API key
2. (Optional) Get Anthropic API key
3. (Optional) Get Google AI API key

## 🏗️ Architecture Overview

### Multi-Tenant Structure

```
Tenants (Root)
├── Enterprise Groups (up to 350 rooftops)
│   ├── Dealership 1
│   ├── Dealership 2
│   └── ...
└── Single Dealerships
    ├── Dealership A
    └── Dealership B
```

### RBAC System

- **SuperAdmin**: Full system access
- **Enterprise Admin**: Manage enterprise group
- **Dealership Admin**: Manage single dealership
- **User**: View-only access

### Billing Tiers

- **Tier 1 (Test Drive)**: Free, 1 dealership, 2 users
- **Tier 2 (Intelligence)**: $499/mo, 5 dealerships, 10 users
- **Tier 3 (Boss Mode)**: $999/mo, 25 dealerships, 50 users
- **Tier 4 (Enterprise)**: Custom, up to 350 dealerships

## 📊 Features by Tier

### Test Drive (Free)
- Basic AI Visibility Score
- 1 Dealership
- 2 Users
- 30-day Analytics Retention
- 1,000 API Calls/Month

### Intelligence ($499/mo)
- Everything in Test Drive
- AOER Analytics
- Competitor Analysis
- 5 Dealerships
- 10 Users
- 90-day Analytics Retention
- 10,000 API Calls/Month
- Email Support

### Boss Mode ($999/mo)
- Everything in Intelligence
- Algorithmic Visibility Index
- Predictive Analytics
- 25 Dealerships
- 50 Users
- 365-day Analytics Retention
- 50,000 API Calls/Month
- Priority Support
- API Access

### Enterprise (Custom)
- Everything in Boss Mode
- Custom Integrations
- Dedicated Support
- SSO/SAML
- White Label
- Custom Reporting
- Up to 350 Dealerships
- Unlimited Users
- Unlimited API Calls

## 🔐 Security Features

- Row Level Security (RLS) for tenant isolation
- 4-tier RBAC system
- Audit logging
- Input validation with Zod
- Stripe webhook verification
- Clerk authentication

## 📈 Monitoring & Analytics

- Built-in usage tracking
- Stripe billing events
- Audit logs for compliance
- Performance monitoring
- Error tracking (Sentry ready)

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
```bash
npm i -g vercel
vercel login
vercel
```

2. **Set environment variables in Vercel dashboard**

3. **Deploy:**
```bash
vercel --prod
```

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_TIER_2_PRICE_ID=price_...
STRIPE_TIER_3_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📚 API Documentation

### Authentication
All API routes require authentication via Clerk.

### RBAC
Use the `requirePermission` and `requireFeature` helpers:

```typescript
import { requirePermission, requireFeature } from '@/lib/rbac';

// Check permission
const canRead = requirePermission('dealership_data:read')(user, tenantId);

// Check feature access
const hasAOER = requireFeature('aoer_analytics')(user);
```

### Billing
- `POST /api/billing/checkout` - Create checkout session
- `POST /api/billing/portal` - Create billing portal session
- `POST /api/webhooks/stripe` - Stripe webhook handler

## 🔧 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check your DATABASE_URL
   - Ensure Supabase is running
   - Verify RLS policies

2. **Authentication issues**
   - Check Clerk configuration
   - Verify webhook secrets
   - Check organization setup

3. **Billing issues**
   - Verify Stripe keys
   - Check webhook configuration
   - Ensure price IDs are correct

4. **Build errors**
   - Run `npm run typecheck`
   - Check for missing dependencies
   - Verify environment variables

### Getting Help

- Check the logs in Vercel dashboard
- Review the audit logs in database
- Check Stripe dashboard for billing events
- Contact support: support@dealershipai.com

## 📈 Scaling

### Performance Optimization

- Use Redis for caching (optional)
- Implement database connection pooling
- Use CDN for static assets
- Monitor API response times

### Cost Management

- Monitor Stripe usage
- Set up billing alerts
- Optimize database queries
- Use caching strategies

## 🎯 Next Steps

1. **Set up monitoring** (Sentry, analytics)
2. **Configure email notifications**
3. **Set up backup strategies**
4. **Implement custom integrations**
5. **Plan for compliance** (SOC 2, GDPR)

## 📞 Support

- **Documentation**: This guide
- **Issues**: GitHub Issues
- **Email**: support@dealershipai.com
- **Discord**: [Join our community](https://discord.gg/dealershipai)

---

**You're now ready to build a $20M+ ARR SaaS business! 🚀**