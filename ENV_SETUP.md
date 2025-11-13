# Environment Variables Setup Guide

This document provides a comprehensive guide for configuring all required environment variables for the DealershipAI Trust OS platform.

## Quick Setup with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Set environment variables for production
vercel env add VARIABLE_NAME production
```

## Required Environment Variables

### 1. Database Configuration

#### `DATABASE_URL`
**Required**: Yes
**Description**: PostgreSQL connection string for Prisma
**Format**: `postgresql://user:password@host:port/database?schema=public`
**Example**: `postgresql://user:pass@db.supabase.co:5432/postgres`
**How to get**:
1. Create a Supabase project at https://supabase.com
2. Go to Project Settings > Database
3. Copy the connection string (use transaction pooling for production)

```bash
vercel env add DATABASE_URL production
# Paste your connection string when prompted
```

---

### 2. Authentication (Clerk)

#### `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
**Required**: Yes
**Description**: Public key for Clerk authentication (client-side)
**Format**: `pk_test_...` or `pk_live_...`
**How to get**:
1. Create account at https://clerk.com
2. Create a new application
3. Go to API Keys
4. Copy "Publishable key"

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
```

#### `CLERK_SECRET_KEY`
**Required**: Yes
**Description**: Secret key for Clerk authentication (server-side)
**Format**: `sk_test_...` or `sk_live_...`
**How to get**:
1. In Clerk dashboard, go to API Keys
2. Copy "Secret key"

```bash
vercel env add CLERK_SECRET_KEY production
```

---

### 3. AI Services

#### `ANTHROPIC_API_KEY`
**Required**: Yes (for Trust OS AI analysis)
**Description**: API key for Claude AI integration
**Format**: `sk-ant-api03-...`
**How to get**:
1. Create account at https://console.anthropic.com
2. Go to API Keys
3. Create a new API key
4. Add billing information (required for production use)

```bash
vercel env add ANTHROPIC_API_KEY production
```

**Pricing**: Pay-per-use, ~$3 per 1M input tokens, ~$15 per 1M output tokens for Claude 3.5 Sonnet

---

### 4. Email Services (SendGrid)

#### `SENDGRID_API_KEY`
**Required**: Yes (for email notifications and lead capture)
**Description**: API key for SendGrid email service
**Format**: `SG.xxxxxxxx...`
**How to get**:
1. Create account at https://sendgrid.com
2. Go to Settings > API Keys
3. Create a new API key with "Full Access"

```bash
vercel env add SENDGRID_API_KEY production
```

#### `SENDGRID_FROM_EMAIL`
**Required**: Yes (if using SendGrid)
**Description**: Verified sender email address
**Format**: `noreply@yourdomain.com`
**How to get**:
1. In SendGrid, go to Settings > Sender Authentication
2. Verify your domain or single sender email
3. Use the verified email address

```bash
vercel env add SENDGRID_FROM_EMAIL production
```

---

### 5. Rate Limiting (Upstash Redis)

#### `UPSTASH_REDIS_REST_URL`
**Required**: Yes (for rate limiting)
**Description**: REST API URL for Upstash Redis
**Format**: `https://your-redis.upstash.io`
**How to get**:
1. Create account at https://upstash.com
2. Create a new Redis database
3. Go to Details tab
4. Copy "REST URL"

```bash
vercel env add UPSTASH_REDIS_REST_URL production
```

#### `UPSTASH_REDIS_REST_TOKEN`
**Required**: Yes (for rate limiting)
**Description**: REST API token for Upstash Redis
**Format**: `AXXXXXxxxxx...`
**How to get**:
1. In Upstash Redis database details
2. Copy "REST Token"

```bash
vercel env add UPSTASH_REDIS_REST_TOKEN production
```

**Pricing**: Free tier includes 10,000 commands/day

---

### 6. Error Tracking (Sentry)

#### `NEXT_PUBLIC_SENTRY_DSN`
**Required**: Recommended (for error tracking)
**Description**: Sentry Data Source Name for error reporting
**Format**: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
**How to get**:
1. Create account at https://sentry.io
2. Create a new project (select Next.js)
3. Copy the DSN from project settings

```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
```

#### `SENTRY_AUTH_TOKEN`
**Required**: Optional (for source maps upload)
**Description**: Authentication token for Sentry CLI
**How to get**:
1. In Sentry, go to Settings > Auth Tokens
2. Create a new token with "project:releases" scope

```bash
vercel env add SENTRY_AUTH_TOKEN production
```

---

### 7. Application Configuration

#### `NEXT_PUBLIC_APP_URL`
**Required**: Yes
**Description**: Public URL of your application
**Format**: `https://yourdomain.com`
**Example**: `https://dealershipai.com`

```bash
vercel env add NEXT_PUBLIC_APP_URL production
```

#### `NEXTAUTH_URL`
**Required**: Yes (for production deployments)
**Description**: Canonical URL of your site (for NextAuth.js)
**Format**: `https://yourdomain.com`

```bash
vercel env add NEXTAUTH_URL production
```

#### `NEXTAUTH_SECRET`
**Required**: Yes
**Description**: Secret key for NextAuth.js session encryption
**Format**: Random 32+ character string
**How to generate**:
```bash
openssl rand -base64 32
```

```bash
vercel env add NEXTAUTH_SECRET production
```

---

### 8. Analytics (Optional)

#### `NEXT_PUBLIC_GA_MEASUREMENT_ID`
**Required**: No
**Description**: Google Analytics 4 measurement ID
**Format**: `G-XXXXXXXXXX`
**How to get**:
1. Create Google Analytics 4 property
2. Copy measurement ID from Admin > Data Streams

```bash
vercel env add NEXT_PUBLIC_GA_MEASUREMENT_ID production
```

---

## Environment Variable Checklist

Copy this checklist to ensure all required variables are set:

### Critical (Required for core functionality)
- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`

### Important (Required for full functionality)
- [ ] `SENDGRID_API_KEY`
- [ ] `SENDGRID_FROM_EMAIL`
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

### Recommended (For production monitoring)
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `SENTRY_AUTH_TOKEN`

### Optional (Enhanced features)
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`

---

## Verification

After setting all environment variables, verify your setup:

### 1. Check health endpoint
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "anthropic": { "status": "configured" },
    "sendgrid": { "status": "configured" },
    "clerk": { "status": "configured" }
  }
}
```

### 2. Test Trust Scan API
```bash
curl -X POST https://your-domain.com/api/trust/scan \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Dealer",
    "location": "Austin, TX",
    "email": "test@example.com"
  }'
```

### 3. View all environment variables
```bash
vercel env ls production
```

---

## Development vs Production

### Development (.env.local)
For local development, create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-api03-..."

# SendGrid
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Upstash
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-local-secret"

# Sentry (optional for dev)
NEXT_PUBLIC_SENTRY_DSN="https://..."
```

### Production (Vercel)
Use the Vercel CLI or dashboard to set production environment variables. **Never commit production secrets to git.**

---

## Security Best Practices

1. **Never commit `.env.local` or `.env` files** - Add them to `.gitignore`
2. **Use different keys for development and production** - Especially for Clerk and Anthropic
3. **Rotate secrets regularly** - At least every 90 days
4. **Use Vercel's environment variable encryption** - All secrets are encrypted at rest
5. **Limit API key permissions** - Only grant necessary scopes
6. **Monitor API usage** - Set up billing alerts for paid services
7. **Use separate databases** - Don't share dev and prod databases

---

## Troubleshooting

### "Module not found" errors
- Ensure all dependencies are installed: `npm install --legacy-peer-deps`
- Regenerate Prisma client: `npx prisma generate`

### Database connection errors
- Verify DATABASE_URL format is correct
- Check if database allows connections from Vercel IPs
- For Supabase, use "transaction" pooling mode for serverless

### Authentication errors
- Verify Clerk keys are for the correct environment (test vs live)
- Check that domain is added to Clerk's allowed origins
- Ensure NEXTAUTH_URL matches your deployment URL

### Rate limiting not working
- Verify both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
- Check Upstash dashboard for connection logs
- Test Redis connection: `curl $UPSTASH_REDIS_REST_URL/ping -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"`

---

## Cost Estimates (Monthly)

### Minimal Production Setup
- Vercel Pro: $20/month
- Supabase Free: $0 (up to 500MB database)
- Clerk Free: $0 (up to 10,000 MAU)
- Upstash Redis Free: $0 (10k commands/day)
- Anthropic API: ~$10-50 (depends on usage)
- SendGrid Free: $0 (up to 100 emails/day)
- **Total: ~$30-70/month**

### Scaled Production Setup
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Clerk Pro: $25/month (up to 1,000 MAU)
- Upstash Redis Pro: $10/month
- Anthropic API: ~$100-500 (higher usage)
- SendGrid Essentials: $20/month (up to 50k emails)
- Sentry Team: $26/month
- **Total: ~$226-626/month**

---

## Support

For issues with:
- **Vercel deployment**: https://vercel.com/support
- **Database**: https://supabase.com/support
- **Authentication**: https://clerk.com/support
- **AI API**: https://support.anthropic.com
- **Email**: https://sendgrid.com/support
- **Rate limiting**: https://upstash.com/support
- **Error tracking**: https://sentry.io/support

For application-specific issues, contact your development team or create an issue in the project repository.
