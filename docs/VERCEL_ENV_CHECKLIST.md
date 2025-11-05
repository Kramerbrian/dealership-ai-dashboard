# Vercel Environment Variables Checklist

## Required Variables

### Core Infrastructure
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_KEY` - Supabase service role key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Alternative key name (if used)
- [ ] `NEXT_PUBLIC_APP_URL` - Production app URL (e.g., https://dealershipai.com)

### Authentication
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key

### Stripe (for Pricing)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_TIER2` - Pro tier price ID (optional)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_TIER3` - Enterprise tier price ID (optional)

## Optional Variables

### Analytics
- [ ] `GOOGLE_PAGESPEED_API_KEY` - For performance audits
- [ ] `GA_PROPERTY_ID` - Google Analytics 4 property ID
- [ ] `GOOGLE_ANALYTICS_CREDENTIALS` - GA service account JSON
- [ ] `NEXT_PUBLIC_MIXPANEL_TOKEN` - Mixpanel token
- [ ] `NEXT_PUBLIC_SEGMENT_KEY` - Segment write key

### AI Services
- [ ] `OPENAI_API_KEY` - OpenAI API key (if used)
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key (if used)

### Redis (if used)
- [ ] `REDIS_URL` - Redis connection URL
- [ ] `KV_URL` - Vercel KV write endpoint
- [ ] `KV_READ_URL` - Vercel KV read endpoint

### Other Services
- [ ] `MAUTOMATE_URL` - Automation service URL
- [ ] `MAUTOMATE_KEY` - Automation service key

## Verification Steps

### 1. Check Vercel Dashboard
1. Go to your project in Vercel
2. Navigate to Settings → Environment Variables
3. Verify all required variables are set
4. Check that production environment is selected

### 2. Verify Variable Names
```bash
# Check for common naming issues
# Some variables might be named differently:
- SUPABASE_SERVICE_KEY vs SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_BASE_URL vs NEXT_PUBLIC_APP_URL
```

### 3. Test in Production
```bash
# After deployment, test endpoints
curl https://dealershipai.com/api/health
curl https://dealershipai.com/api/telemetry
```

### 4. Check Build Logs
- Review Vercel deployment logs
- Look for "Missing environment variable" warnings
- Verify all variables are accessible during build

## Common Issues

### Variable Not Found
- **Issue**: Variable exists but not accessible
- **Fix**: Ensure variable is set for correct environment (Production/Preview/Development)
- **Check**: Variable name matches exactly (case-sensitive)

### Wrong Environment
- **Issue**: Variable set for wrong environment
- **Fix**: Set variable for all environments or specific environment needed

### Build-time vs Runtime
- **NEXT_PUBLIC_*** variables: Available at build and runtime (client-side)
- **Regular variables**: Server-side only (not exposed to client)

## Quick Verification Script

```bash
# Run verification script
npm run verify:production

# Or manually check
node scripts/verify-production.ts
```

## Production Deployment Checklist

- [ ] All required variables set in Vercel
- [ ] Variables set for Production environment
- [ ] No sensitive variables exposed to client (missing NEXT_PUBLIC_ prefix)
- [ ] Test deployment works with all variables
- [ ] Check build logs for warnings
- [ ] Verify API endpoints work in production
- [ ] Test pricing page features
- [ ] Verify telemetry tracking

## Security Notes

- ✅ Never commit `.env.local` to git
- ✅ Use Vercel's encrypted environment variables
- ✅ Rotate keys regularly
- ✅ Use service role keys (not anon keys) for server-side operations
- ✅ Restrict API keys to necessary permissions only

