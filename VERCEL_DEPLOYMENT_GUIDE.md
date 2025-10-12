# 🚀 Vercel Deployment Guide for DealershipAI v2.0

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Set up the required environment variables

## Step 1: Environment Variables

Go to Vercel Dashboard > Your Project > Settings > Environment Variables and add:

### Required Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
```

### Optional Variables
```
SERPER_API_KEY=your-serper-key
SERPAPI_KEY=your-serpapi-key
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: GitHub Integration
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy on every push to main branch

## Step 3: Configure Stripe

1. **Create Stripe Products**:
   - FREE Plan: $0/month
   - PRO Plan: $99/month (50 sessions)
   - ENTERPRISE Plan: $299/month (200 sessions)

2. **Set up Webhooks**:
   - Endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`

## Step 4: Test Deployment

1. **Health Check**: Visit `https://your-domain.vercel.app/api/health`
2. **Dashboard**: Visit `https://your-domain.vercel.app/dashboard`
3. **API Test**: Test the analyze endpoint

## Step 5: Monitor Performance

1. **Vercel Analytics**: Monitor performance in Vercel dashboard
2. **Error Tracking**: Check function logs for any issues
3. **Database**: Monitor Supabase usage and performance

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables are set
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors

2. **Runtime Errors**:
   - Verify database connection
   - Check Redis connection
   - Validate API keys

3. **Performance Issues**:
   - Enable Vercel Edge Functions
   - Optimize database queries
   - Use Redis caching effectively

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe products created
- [ ] Webhooks configured
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured

## Support

For deployment issues:
1. Check Vercel function logs
2. Review environment variables
3. Test API endpoints individually
4. Check database connectivity

---

**DealershipAI v2.0** - World-class automotive intelligence platform 🚗💨
