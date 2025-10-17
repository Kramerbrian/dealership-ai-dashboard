# 🚀 DealershipAI Production Environment Variables Setup Guide

## Overview
This guide will help you set up all necessary environment variables for your DealershipAI production deployment on Vercel.

## 📋 Prerequisites
- Vercel account with your project deployed
- Access to your Vercel dashboard
- Required API keys and service accounts

## 🔧 Step-by-Step Setup

### 1. Access Vercel Environment Variables
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `dealershipai-landing` project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### 2. Essential Environment Variables

#### 🗄️ Database Configuration
```bash
# Supabase Database (Primary)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase API Keys
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-SUPABASE-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SUPABASE-SERVICE-ROLE-KEY]"
```

#### 🔐 Authentication & Security
```bash
# NextAuth Configuration
NEXTAUTH_SECRET="[GENERATE-A-32-CHARACTER-SECRET]"
NEXTAUTH_URL="https://dealershipai-landing-[YOUR-DEPLOYMENT].vercel.app"

# JWT Secret
JWT_SECRET="[GENERATE-ANOTHER-32-CHARACTER-SECRET]"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="[YOUR-GOOGLE-CLIENT-ID]"
GOOGLE_CLIENT_SECRET="[YOUR-GOOGLE-CLIENT-SECRET]"
```

#### 🤖 AI Services
```bash
# OpenAI API
OPENAI_API_KEY="sk-[YOUR-OPENAI-API-KEY]"

# Anthropic Claude (Optional)
ANTHROPIC_API_KEY="sk-ant-[YOUR-ANTHROPIC-KEY]"
```

#### 💳 Payment Processing
```bash
# Stripe (Production Keys)
STRIPE_SECRET_KEY="sk_live_[YOUR-STRIPE-LIVE-SECRET-KEY]"
STRIPE_PUBLISHABLE_KEY="pk_live_[YOUR-STRIPE-LIVE-PUBLISHABLE-KEY]"
STRIPE_WEBHOOK_SECRET="whsec_[YOUR-STRIPE-WEBHOOK-SECRET]"
```

#### 📊 Analytics & Monitoring
```bash
# Google Analytics
NEXT_PUBLIC_GA_ID="G-[YOUR-GA4-MEASUREMENT-ID]"

# Sentry (Error Tracking)
SENTRY_DSN="https://[YOUR-SENTRY-DSN]@[YOUR-ORG].ingest.sentry.io/[PROJECT-ID]"

# Logtail (Logging)
LOGTAIL_SOURCE_TOKEN="[YOUR-LOGTAIL-TOKEN]"
```

#### 🚀 Performance & Caching
```bash
# Upstash Redis (Free Tier)
UPSTASH_REDIS_REST_URL="https://[YOUR-REDIS-URL].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[YOUR-REDIS-TOKEN]"

# Cache Configuration
CACHE_TTL_SECONDS="3600"
CACHE_COMPRESSION_ENABLED="true"
```

#### 🎯 Feature Flags
```bash
# Enable/Disable Features
NEXT_PUBLIC_ENABLE_AI_INSIGHTS="true"
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES="true"
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING="true"
NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES="true"
```

#### 🌐 Domain Configuration
```bash
# App URLs
NEXT_PUBLIC_APP_URL="https://dealershipai-landing-[YOUR-DEPLOYMENT].vercel.app"
NEXT_PUBLIC_DASHBOARD_URL="https://dealershipai-landing-[YOUR-DEPLOYMENT].vercel.app/dashboard"
NEXT_PUBLIC_API_URL="https://dealershipai-landing-[YOUR-DEPLOYMENT].vercel.app/api"
```

#### 🔒 Security & Rate Limiting
```bash
# Rate Limiting
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION_MINUTES="15"
```

### 3. How to Add Variables in Vercel

For each environment variable:
1. Click **Add New** in the Environment Variables section
2. Enter the **Name** (e.g., `DATABASE_URL`)
3. Enter the **Value** (your actual value)
4. Select **Environment**: 
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)
5. Click **Save**

### 4. Required Services Setup

#### 🗄️ Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing
3. Go to **Settings** → **API**
4. Copy your Project URL and API keys
5. Go to **Settings** → **Database** for connection string

#### 🤖 OpenAI Setup
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key in **API Keys** section
3. Add billing information for usage

#### 💳 Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live mode** (toggle in top left)
3. Get your live API keys from **Developers** → **API Keys**
4. Set up webhooks for payment events

#### 📊 Google Analytics Setup
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a GA4 property
3. Get your Measurement ID (starts with G-)

#### 🚀 Upstash Redis Setup
1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database (free tier available)
3. Copy the REST URL and token

### 5. Environment-Specific Configuration

#### Production Environment
- Use **live** API keys for all services
- Set `NODE_ENV="production"`
- Use production database URLs
- Enable all monitoring and analytics

#### Preview Environment
- Use **test** API keys where available
- Set `NODE_ENV="development"`
- Can use same database as production (with caution)

### 6. Security Best Practices

#### ✅ Do:
- Use strong, unique secrets (32+ characters)
- Rotate secrets regularly
- Use different keys for different environments
- Enable 2FA on all service accounts
- Monitor API usage and costs

#### ❌ Don't:
- Commit secrets to version control
- Use the same secrets across environments
- Share secrets in plain text
- Use weak or predictable secrets

### 7. Verification Steps

After setting up all variables:

1. **Redeploy your application**:
   ```bash
   vercel --prod
   ```

2. **Test key endpoints**:
   - Health check: `https://your-app.vercel.app/api/health`
   - Dashboard: `https://your-app.vercel.app/dashboard`
   - API endpoints: `https://your-app.vercel.app/api/dashboard/overview`

3. **Check logs** in Vercel dashboard for any errors

4. **Monitor performance** and error rates

### 8. Troubleshooting

#### Common Issues:
- **Database connection errors**: Check DATABASE_URL format
- **Authentication failures**: Verify NEXTAUTH_SECRET and URL
- **API key errors**: Ensure keys are valid and have proper permissions
- **CORS issues**: Check NEXT_PUBLIC_APP_URL configuration

#### Debug Steps:
1. Check Vercel function logs
2. Verify environment variables are set correctly
3. Test API endpoints individually
4. Check service account permissions

### 9. Cost Optimization

#### Free Tier Services:
- **Supabase**: 500MB database, 50MB file storage
- **Upstash Redis**: 10,000 requests/day
- **Vercel**: 100GB bandwidth, 100 serverless function executions
- **Google Analytics**: Free for most use cases

#### Paid Services (when needed):
- **OpenAI API**: Pay per token usage
- **Stripe**: 2.9% + 30¢ per transaction
- **Sentry**: Free tier available, paid for advanced features

## 🎯 Quick Start Checklist

- [ ] Set up Supabase project and get database URL
- [ ] Create OpenAI API key
- [ ] Set up Stripe account (if using payments)
- [ ] Configure Google Analytics (optional)
- [ ] Set up Upstash Redis (optional)
- [ ] Add all environment variables to Vercel
- [ ] Redeploy application
- [ ] Test all functionality
- [ ] Monitor logs and performance

## 📞 Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Test individual API endpoints
4. Review service account permissions

---

**🎉 Once completed, your DealershipAI application will be fully configured for production use!**
