# Environment Variables Setup

## Required for Production

### Stripe Billing
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**How to get:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products for "Pro" ($499/mo) and "Enterprise" ($999/mo)
3. Copy the Price IDs → `STRIPE_PRICE_PRO` and `STRIPE_PRICE_ENTERPRISE`
4. Get API key → `STRIPE_SECRET_KEY`
5. Create webhook endpoint → `STRIPE_WEBHOOK_SECRET`

### Slack Alerts (Optional)
```env
TELEMETRY_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

**How to get:**
1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create new app → Incoming Webhooks
3. Copy webhook URL

### Upstash Redis
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**How to get:**
1. Go to [Upstash Console](https://console.upstash.com)
2. Create Redis database
3. Copy REST URL and token

### Cron Secret
```env
CRON_SECRET=your-secret-here
```

**Generate:**
```bash
openssl rand -base64 32
```

## Testing Locally

For local testing, create `.env.local`:

```env
# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_PRO=price_test_...
STRIPE_PRICE_ENTERPRISE=price_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Use ngrok for webhook testing
# ngrok http 3000
# Then set webhook URL in Stripe Dashboard to: https://your-ngrok-url.ngrok.io/api/billing/webhook
```

## Vercel Deployment

Add all env vars in Vercel Dashboard → Settings → Environment Variables.

**Important:** Set `CRON_SECRET` in Vercel for cron jobs to work.

