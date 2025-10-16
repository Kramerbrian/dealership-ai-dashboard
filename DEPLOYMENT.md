# 🚀 DealershipAI Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Project**: Create at [supabase.com](https://supabase.com)
3. **Clerk Account**: Sign up at [clerk.com](https://clerk.com)
4. **API Keys**: Get keys for OpenAI, Anthropic, Google AI

## Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy the project
vercel --prod
```

### Option B: Deploy via GitHub
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Import the project in Vercel dashboard

## Step 2: Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables:
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### AI API Keys:
```
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

### Optional Services:
```
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Step 3: Supabase Production Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and anon key

2. **Run Migrations**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Link to your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

3. **Enable RLS**:
   - Go to Supabase Dashboard > Authentication > Policies
   - Enable Row Level Security on all tables

## Step 4: Clerk Authentication Setup

1. **Create Clerk Application**:
   - Go to [clerk.com](https://clerk.com)
   - Create new application
   - Configure sign-in/sign-up URLs

2. **Configure OAuth Providers** (optional):
   - Google, GitHub, etc.

## Step 5: Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` with your custom domain

## Step 6: Test Deployment

1. **Visit your deployed URL**
2. **Test key features**:
   - Landing page loads
   - Dashboard is accessible
   - Authentication works
   - Database connections work

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check environment variables are set
   - Verify all dependencies are in package.json

2. **Database Connection Issues**:
   - Verify Supabase URL and keys
   - Check RLS policies

3. **Authentication Issues**:
   - Verify Clerk keys and URLs
   - Check redirect URLs

### Support:
- Check Vercel deployment logs
- Check Supabase logs
- Check Clerk dashboard for auth issues

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase production database connected
- [ ] Clerk authentication working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] All features tested
- [ ] Error monitoring set up (optional)
- [ ] Analytics configured (optional)

## Next Steps

1. **Monitor Performance**: Use Vercel Analytics
2. **Set up Monitoring**: Consider Sentry for error tracking
3. **Configure Backups**: Set up Supabase backups
4. **Scale as Needed**: Monitor usage and scale resources

---

🎉 **Your DealershipAI dashboard is now live in production!**
