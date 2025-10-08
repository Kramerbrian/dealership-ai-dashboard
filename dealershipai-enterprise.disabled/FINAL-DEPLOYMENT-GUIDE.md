# 🚀 Final Deployment Guide

This guide will help you deploy your DealershipAI Enterprise application with full functionality.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup
- [ ] Supabase database configured
- [ ] Stripe API keys configured
- [ ] AI API keys configured (Anthropic, OpenAI, Google)
- [ ] NextAuth configuration complete
- [ ] All environment variables set in Vercel

### 2. Database Setup
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Sample data seeded
- [ ] RLS policies active

### 3. External Services
- [ ] Stripe products created
- [ ] Webhook endpoints configured
- [ ] AI API keys tested
- [ ] Domain configured (optional)

## 🔧 Environment Variables

### Required for Production

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key-here"

# OAuth Providers (Optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_TIER_1_PRICE_ID="price_..."
STRIPE_TIER_2_PRICE_ID="price_..."

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
GOOGLE_AI_API_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🚀 Deployment Steps

### 1. Vercel Deployment

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... (add all environment variables)
```

#### Option B: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. Environment Variables in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all required variables
4. Set environment to "Production"
5. Redeploy

### 3. Domain Configuration (Optional)

1. Go to project settings → Domains
2. Add your custom domain
3. Configure DNS records
4. Enable SSL (automatic with Vercel)

## 🗄️ Database Setup

### 1. Supabase Configuration

1. **Create Supabase Project**
   - Go to https://supabase.com/dashboard
   - Create new project
   - Save credentials

2. **Deploy Schema**
   - Go to SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Run the query

3. **Configure RLS**
   - Verify Row Level Security is enabled
   - Test with sample queries

4. **Set up Vault (Optional)**
   - Store sensitive API keys in Supabase Vault
   - Use for additional security

### 2. Database Connection Test

```bash
# Test database connection
npm run db:test

# View database in browser
npm run db:studio
```

## 💳 Stripe Configuration

### 1. Create Stripe Products

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/products

2. **Create Products**
   - **Intelligence Plan**: $499/month
   - **Boss Mode Plan**: $999/month

3. **Get Price IDs**
   - Copy price IDs for environment variables
   - Format: `price_...`

### 2. Configure Webhooks

1. **Go to Webhooks**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: Select all billing events

3. **Get Webhook Secret**
   - Copy webhook signing secret
   - Add to environment variables

### 3. Test Stripe Integration

```bash
# Test Stripe webhook
curl -X POST "https://your-domain.com/api/webhooks/stripe" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 🤖 AI API Configuration

### 1. Get API Keys

- **Anthropic**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/
- **Google AI**: https://aistudio.google.com/

### 2. Test AI APIs

```bash
# Test all AI APIs
npm run test:ai-apis

# Test individual API
curl -X POST "https://your-domain.com/api/ai/test" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test query",
    "engine": "anthropic"
  }'
```

### 3. Monitor Usage

- Set up usage alerts
- Monitor costs daily
- Implement rate limiting

## 🔐 Security Configuration

### 1. Environment Security

- ✅ Use production API keys
- ✅ Enable HTTPS everywhere
- ✅ Set secure cookies
- ✅ Configure CORS properly

### 2. Database Security

- ✅ Enable RLS policies
- ✅ Use connection pooling
- ✅ Regular security updates
- ✅ Monitor access logs

### 3. API Security

- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ Audit logging

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Vercel Analytics
# Enable in project settings

# Custom monitoring
# Add to your app
```

### 2. Database Monitoring

- Supabase dashboard
- Query performance
- Connection monitoring
- Error tracking

### 3. AI API Monitoring

- Usage tracking
- Cost monitoring
- Error rates
- Response times

## 🧪 Testing Production

### 1. Smoke Tests

```bash
# Test main endpoints
curl "https://your-domain.com/api/health"
curl "https://your-domain.com/api/auth/providers"
curl "https://your-domain.com/api/ai/test"

# Test database
curl "https://your-domain.com/api/scores?dealerId=demo&domain=test.com"
```

### 2. User Flow Tests

1. **Authentication**
   - Sign up flow
   - Sign in flow
   - OAuth providers

2. **Dashboard**
   - Load dashboard
   - View analytics
   - Update settings

3. **Billing**
   - Create checkout session
   - Handle webhooks
   - Manage subscription

4. **AI Features**
   - Run AI queries
   - View results
   - Check costs

### 3. Performance Tests

```bash
# Load testing
npm run test:load

# Performance monitoring
npm run test:performance
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
vercel logs

# Local build test
npm run build
```

#### 2. Environment Variables
```bash
# Check environment variables
vercel env ls

# Test locally
npm run dev
```

#### 3. Database Connection
```bash
# Test database
npm run db:test

# Check connection string
echo $DATABASE_URL
```

#### 4. API Errors
```bash
# Check API logs
vercel logs --follow

# Test endpoints
curl "https://your-domain.com/api/health"
```

### Debug Commands

```bash
# Check application status
npm run status

# View logs
npm run logs

# Test all services
npm run test:all

# Reset configuration
npm run reset:config
```

## 📈 Post-Deployment

### 1. Initial Setup

1. **Create SuperAdmin**
   - Use database seed script
   - Set up first admin user

2. **Configure Settings**
   - Set up default settings
   - Configure notifications

3. **Test All Features**
   - Run full test suite
   - Verify all functionality

### 2. Monitoring

1. **Set up Alerts**
   - Error rate alerts
   - Performance alerts
   - Cost alerts

2. **Regular Checks**
   - Daily health checks
   - Weekly performance reviews
   - Monthly cost analysis

### 3. Maintenance

1. **Regular Updates**
   - Dependencies
   - Security patches
   - Feature updates

2. **Backup Strategy**
   - Database backups
   - Code backups
   - Configuration backups

## 🎯 Success Metrics

### Technical Metrics
- ✅ 99.9% uptime
- ✅ <2s page load times
- ✅ <500ms API response times
- ✅ Zero security incidents

### Business Metrics
- ✅ User signups working
- ✅ Billing processing correctly
- ✅ AI queries functioning
- ✅ Analytics tracking

## 📞 Support & Maintenance

### 1. Monitoring Tools
- Vercel Analytics
- Supabase Dashboard
- Stripe Dashboard
- Custom monitoring

### 2. Alert Channels
- Email notifications
- Slack alerts
- PagerDuty (if needed)

### 3. Documentation
- API documentation
- User guides
- Troubleshooting guides
- Runbooks

## 🎉 Deployment Complete!

Once all steps are completed, your DealershipAI Enterprise application will be:

- ✅ **Fully functional** with all features
- ✅ **Secure** with proper authentication
- ✅ **Scalable** with multi-tenant architecture
- ✅ **Monitored** with comprehensive logging
- ✅ **Maintainable** with clear documentation

### Next Steps

1. **User Onboarding**
   - Create user documentation
   - Set up support channels
   - Train team members

2. **Marketing**
   - Launch announcement
   - User acquisition
   - Feature promotion

3. **Growth**
   - Monitor usage patterns
   - Gather user feedback
   - Plan feature roadmap

---

**Congratulations!** Your DealershipAI Enterprise application is now live and ready to serve thousands of dealerships! 🚀
