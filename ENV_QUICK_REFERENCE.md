# 🚀 DealershipAI Environment Variables - Quick Reference

## 🔥 Critical Variables (Must Have)

### Database
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"
```

### Authentication
```bash
NEXTAUTH_SECRET="[32-CHAR-SECRET]"
NEXTAUTH_URL="https://your-app.vercel.app"
JWT_SECRET="[32-CHAR-SECRET]"
```

### AI Services
```bash
OPENAI_API_KEY="sk-[YOUR-KEY]"
```

## 🎯 Essential Variables (Recommended)

### App Configuration
```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NEXT_PUBLIC_ENABLE_AI_INSIGHTS="true"
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES="true"
```

### Performance
```bash
CACHE_TTL_SECONDS="3600"
CACHE_COMPRESSION_ENABLED="true"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"
```

## 🔧 Optional Variables (Nice to Have)

### Monitoring & Analytics
```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN="https://[DSN]@[ORG].ingest.sentry.io/[PROJECT]"

# PostHog Product Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_[YOUR-POSTHOG-KEY]"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"  # Optional, defaults to app.posthog.com

# Google Analytics 4
NEXT_PUBLIC_GA="G-[MEASUREMENT-ID]"

# Vercel Analytics & Speed Insights (automatically enabled when deployed to Vercel)
# No environment variables needed
```

### Payments
```bash
STRIPE_SECRET_KEY="sk_live_[KEY]"
STRIPE_PUBLISHABLE_KEY="pk_live_[KEY]"
```

### Caching
```bash
UPSTASH_REDIS_REST_URL="https://[URL].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[TOKEN]"
```

## 🚀 Quick Setup Commands

```bash
# Run the setup script
./scripts/setup-vercel-env.sh

# Add database URL
vercel env add DATABASE_URL production

# Add Supabase keys
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Add OpenAI key
vercel env add OPENAI_API_KEY production

# Add auth secrets
vercel env add NEXTAUTH_SECRET production
vercel env add JWT_SECRET production

# Redeploy
vercel --prod
```

## 📋 Setup Checklist

- [ ] Database URL configured
- [ ] Supabase keys added
- [ ] OpenAI API key added
- [ ] Authentication secrets generated
- [ ] App URL set correctly
- [ ] Feature flags enabled
- [ ] Application redeployed
- [ ] Health check passing (`/api/health`)
- [ ] Monitoring configured (Sentry, PostHog, Vercel Analytics)
- [ ] Dashboard accessible
- [ ] API endpoints working

## 🆘 Troubleshooting

### Common Issues:
- **Database connection failed**: Check DATABASE_URL format
- **Authentication errors**: Verify NEXTAUTH_SECRET and URL
- **API key invalid**: Ensure OpenAI key is correct and has credits
- **CORS errors**: Check NEXT_PUBLIC_APP_URL matches deployment URL

### Debug Commands:
```bash
# Check deployment status
vercel ls

# View logs
vercel logs [DEPLOYMENT-URL]

# Test health endpoint
curl https://your-app.vercel.app/api/health
```

---

**💡 Tip**: Start with the Critical Variables, then add Essential and Optional as needed!
