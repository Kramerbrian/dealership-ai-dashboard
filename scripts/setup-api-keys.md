# API Keys Setup Guide

## Quick Setup

### Option 1: Automated Script (Recommended)

```bash
# Make script executable
chmod +x scripts/connect-api-keys.sh

# Run the script
./scripts/connect-api-keys.sh
```

### Option 2: MCP Script (TypeScript)

```bash
# Install dependencies if needed
npm install tsx

# Run MCP script
npx tsx scripts/connect-api-keys-mcp.ts
```

### Option 3: Manual Setup

Follow the steps below to configure each service.

---

## Required API Keys

### 1. Slack Webhook (Telemetry)

**Purpose**: Send alerts for milestones and critical events

**Setup**:
1. Go to https://api.slack.com/apps
2. Create a new app or select existing
3. Go to "Incoming Webhooks" → Enable
4. Create webhook → Copy URL

**Add to .env.local**:
```bash
TELEMETRY_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Set in Vercel**:
```bash
vercel env add TELEMETRY_WEBHOOK production
# Paste the webhook URL when prompted
```

---

### 2. Stripe (Billing)

**Purpose**: Handle subscriptions and payments

**Setup**:
1. Go to https://dashboard.stripe.com
2. Get API keys from Developers → API keys
3. Get webhook secret from Developers → Webhooks

**Add to .env.local**:
```bash
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Set in Vercel**:
```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
```

---

### 3. Cron Secret

**Purpose**: Secure cron job authentication

**Generate**:
```bash
openssl rand -hex 32
```

**Add to .env.local**:
```bash
CRON_SECRET=your-generated-secret-here
```

**Set in Vercel**:
```bash
vercel env add CRON_SECRET production
```

---

### 4. Sentry (Error Tracking)

**Purpose**: Monitor errors and performance

**Setup**:
1. Go to https://sentry.io
2. Create project → Get DSN

**Add to .env.local**:
```bash
SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

**Set in Vercel**:
```bash
vercel env add SENTRY_DSN production
```

---

### 5. Model Registry Version

**Purpose**: Track model versions for learning loop

**Add to .env.local**:
```bash
MODEL_REGISTRY_VERSION=1.0.0
```

---

### 6. API URL

**Purpose**: Base URL for API calls

**Add to .env.local**:
```bash
NEXT_PUBLIC_API_URL=https://dash.dealershipai.com
```

---

## Vercel Environment Variables

### Set All at Once

```bash
# Production
vercel env add TELEMETRY_WEBHOOK production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add CRON_SECRET production
vercel env add SENTRY_DSN production
vercel env add MODEL_REGISTRY_VERSION production
vercel env add NEXT_PUBLIC_API_URL production

# Preview (use test keys)
vercel env add STRIPE_SECRET_KEY preview
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
# ... repeat for other vars
```

### Verify

```bash
vercel env ls
```

---

## Supabase Configuration

If using Supabase MCP:

```bash
# Get Supabase URL and keys
supabase status

# Or from Supabase dashboard:
# Settings → API → Copy URL and keys
```

Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Testing

### Test Slack Webhook

```bash
curl -X POST $TELEMETRY_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test message from DealershipAI"}'
```

### Test Stripe

```bash
# Use Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test Health Endpoint

```bash
curl https://dash.dealershipai.com/api/health
```

---

## Security Checklist

- ✅ Never commit `.env.local` to git
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate secrets periodically
- ✅ Use Vercel environment variables for production
- ✅ Enable 2FA on all service accounts
- ✅ Review access logs regularly

---

## Troubleshooting

### Vercel CLI Not Found
```bash
npm i -g vercel
```

### Permission Denied
```bash
chmod +x scripts/connect-api-keys.sh
```

### Environment Variables Not Loading
- Check `.env.local` exists
- Restart dev server
- Clear Next.js cache: `rm -rf .next`

---

## Next Steps

1. ✅ Configure all API keys
2. ✅ Test connections
3. ✅ Deploy to Vercel
4. ✅ Verify in production
5. ✅ Set up monitoring

