# 🚀 Vercel Environment Variables Setup Guide

## Critical Environment Variables (Required)

### Database Configuration
```bash
# Primary Database (Required)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

### Authentication (Required)
```bash
# NextAuth Configuration
NEXTAUTH_SECRET="[32-CHAR-SECRET]"
NEXTAUTH_URL="https://dash.dealershipai.com"

# JWT Secret
JWT_SECRET="[32-CHAR-SECRET]"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="[GOOGLE-OAUTH-CLIENT-ID]"
GOOGLE_CLIENT_SECRET="[GOOGLE-OAUTH-CLIENT-SECRET]"
GITHUB_CLIENT_ID="[GITHUB-OAUTH-CLIENT-ID]"
GITHUB_CLIENT_SECRET="[GITHUB-OAUTH-CLIENT-SECRET]"
```

### AI Services (Required)
```bash
# OpenAI Configuration
OPENAI_API_KEY="sk-[YOUR-OPENAI-KEY]"
OPENAI_ORGANIZATION="[ORG-ID]" # Optional

# Anthropic (if using Claude)
ANTHROPIC_API_KEY="sk-ant-[YOUR-ANTHROPIC-KEY]" # Optional
```

### Redis/Caching (Required)
```bash
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://[REDIS-URL].upstash.io"
UPSTASH_REDIS_REST_TOKEN="[REDIS-TOKEN]"

# Alternative Redis URL
REDIS_URL="redis://[REDIS-URL]" # Fallback
KV_URL="redis://[REDIS-URL]" # Alternative
```

### Session Limits by Tier
```bash
FREE_SESSION_LIMIT="0"
PRO_SESSION_LIMIT="50"
ENTERPRISE_SESSION_LIMIT="200"
```

## Essential Variables (Recommended)

### App Configuration
```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://main.dealershipai.com"
NEXT_PUBLIC_DASHBOARD_URL="https://dash.dealershipai.com"
NEXT_PUBLIC_MARKETING_URL="https://marketing.dealershipai.com"
```

### Feature Flags
```bash
NEXT_PUBLIC_ENABLE_AI_INSIGHTS="true"
NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES="true"
ENABLE_ANALYTICS="true"
ENABLE_AI_OPTIMIZATION="true"
ENABLE_TRUST_SCORING="true"
ENABLE_FINE_TUNING="true"
```

### Performance & Rate Limiting
```bash
CACHE_TTL_SECONDS="3600"
CACHE_COMPRESSION_ENABLED="true"
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_REQUESTS_PER_MINUTE="100"
RATE_LIMIT_REQUESTS_PER_HOUR="1000"
```

## Optional Variables (Nice to Have)

### Analytics & Monitoring
```bash
# Google Analytics
NEXT_PUBLIC_GA="G-[MEASUREMENT-ID]"
GOOGLE_ANALYTICS_ID="G-[MEASUREMENT-ID]"
GOOGLE_TAG_MANAGER_ID="GTM-XXXXXXX"

# Sentry Error Monitoring
SENTRY_DSN="https://[DSN]@[ORG].ingest.sentry.io/[PROJECT]"
LOG_LEVEL="info"
```

### Payments (Stripe)
```bash
STRIPE_SECRET_KEY="sk_live_[KEY]"
STRIPE_PUBLISHABLE_KEY="pk_live_[KEY]"
STRIPE_WEBHOOK_SECRET="whsec_[WEBHOOK-SECRET]"

# Stripe Price IDs for each tier
STRIPE_TIER_2_PRICE_ID="price_[PRO-TIER-ID]"
STRIPE_TIER_3_PRICE_ID="price_[ENTERPRISE-TIER-ID]"
STRIPE_TIER_4_PRICE_ID="price_[CUSTOM-ENTERPRISE-ID]"
```

### Email Services
```bash
# Resend
RESEND_API_KEY="re_[YOUR-RESEND-KEY]"
FROM_EMAIL="noreply@dealershipai.com"

# Alternative SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### External APIs
```bash
# Google Services
GOOGLE_MAPS_API_KEY="AIza[YOUR-MAPS-KEY]"
GOOGLE_MY_BUSINESS_API_KEY="AIza[YOUR-GMB-KEY]"
GOOGLE_SEARCH_CONSOLE_API_KEY="[GSC-API-KEY]"

# Other Services
NCM_BENCHMARK_URL="https://api.ncm20group.com/benchmarks/latest"
ADA_ENGINE_URL="https://dealershipai-dtri-ada.fly.dev/analyze"
```

### Security
```bash
# Encryption
ENCRYPTION_KEY="[64-CHAR-HEX-KEY]"
API_SECRET="[API-SECRET-FOR-SIGNATURES]"
HMAC_SECRET="[HMAC-SECRET]"
WEBHOOK_SECRET="[WEBHOOK-SECRET]"

# Algorithm Storage (Encrypted)
ALGORITHM_VAI="[ENCRYPTED-VAI-ALGORITHM]"
ALGORITHM_DTRI="[ENCRYPTED-DTRI-ALGORITHM]"
ALGORITHM_QAI="[ENCRYPTED-QAI-ALGORITHM]"
ALGORITHM_PIQR="[ENCRYPTED-PIQR-ALGORITHM]"
ALGORITHM_HRP="[ENCRYPTED-HRP-ALGORITHM]"
ALGORITHM_EEAT="[ENCRYPTED-EEAT-ALGORITHM]"
```

### DTRI Job Configuration
```bash
DTRI_CONCURRENCY="3"
DTRI_RETRY_ATTEMPTS="2"
DTRI_BACKOFF_DELAY="10000"
DTRI_NIGHTLY_CRON="0 3 * * *"
DTRI_WEEKLY_CRON="0 2 * * 0"
```

## Environment Variable Scoping

### Production Environment
- All critical and essential variables
- Use production API keys and URLs
- Enable all security features

### Preview Environment
- Same as production but with test API keys
- Use staging database if available
- Enable debug logging

### Development Environment
- Local database and Redis
- Development API keys
- Enable all debug features

## Quick Setup Commands

```bash
# Add critical variables to Vercel
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add JWT_SECRET production
vercel env add OPENAI_API_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production

# Add app configuration
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_DASHBOARD_URL production
vercel env add NEXTAUTH_URL production

# Redeploy with new environment variables
vercel --prod
```

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` for documentation
2. **Use different secrets for each environment** - Don't reuse production secrets in development
3. **Rotate secrets regularly** - Especially for production environments
4. **Use Vercel's environment variable encryption** - All variables are encrypted at rest
5. **Limit access to production variables** - Only add team members who need access
6. **Use descriptive names** - Make it clear what each variable is for
7. **Document required vs optional** - Mark which variables are critical for the app to function

## Validation Checklist

- [ ] Database connection working
- [ ] Authentication flow working
- [ ] AI services responding
- [ ] Redis caching working
- [ ] Email sending working (if configured)
- [ ] Analytics tracking working (if configured)
- [ ] All API routes responding
- [ ] No console errors in browser
- [ ] Health check endpoint returning 200