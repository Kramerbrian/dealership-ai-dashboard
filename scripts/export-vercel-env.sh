#!/bin/bash

# Export Environment Variables for Vercel
# This script extracts current .env values and formats them for easy copy-paste to Vercel

echo "📋 Environment Variables to Add to Vercel"
echo "========================================"
echo ""
echo "⚠️  IMPORTANT: Update NEXT_PUBLIC_APP_URL to your production domain!"
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "🔴 REQUIRED Variables (Production, Preview, Development):"
echo ""

# Required variables
echo "NODE_ENV=production"
echo "NEXT_PUBLIC_APP_URL=https://dealershipai.com  # ⚠️ UPDATE THIS to your production URL"
echo ""
echo "DATABASE_URL=${DATABASE_URL}"
echo ""
echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}"
echo "CLERK_SECRET_KEY=${CLERK_SECRET_KEY}"
echo ""
echo "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in"
echo "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up"
echo "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard"
echo "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding"
echo ""

echo "🟡 OPTIONAL but RECOMMENDED Variables:"
echo ""

# Optional but recommended
if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
  echo "SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}"
  echo ""
fi

if [ ! -z "$SENTRY_ORG" ]; then
  echo "SENTRY_DSN=${SENTRY_DSN:-YOUR_SENTRY_DSN_HERE}"
  echo "NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}"
  echo "SENTRY_ORG=${SENTRY_ORG}"
  echo "SENTRY_PROJECT=${SENTRY_PROJECT}"
  echo ""
fi

if [ ! -z "$OPENAI_API_KEY" ]; then
  echo "OPENAI_API_KEY=${OPENAI_API_KEY}"
fi

if [ ! -z "$ANTHROPIC_API_KEY" ]; then
  echo "ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}"
fi

echo ""
if [ ! -z "$UPSTASH_REDIS_REST_URL" ]; then
  echo "UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}"
  echo "UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}"
  echo ""
else
  echo "UPSTASH_REDIS_REST_URL=YOUR_UPSTASH_URL_HERE  # Get from https://console.upstash.com"
  echo "UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_TOKEN_HERE"
  echo ""
fi
echo "LOGTAIL_TOKEN=YOUR_LOGTAIL_TOKEN_HERE  # Get from https://logtail.com"
echo ""

echo "🟢 OTHER OPTIONAL Variables (if using):"
echo ""
echo "# Google Analytics"
echo "NEXT_PUBLIC_GA=G-XXXXXXXXXX"
echo ""
echo "# Stripe (if using payments)"
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_..."
echo "STRIPE_SECRET_KEY=sk_live_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "# Google Gemini (if using)"
echo "GEMINI_API_KEY=your-gemini-key"
echo ""

echo "========================================"
echo ""
echo "📝 Instructions:"
echo "1. Go to: https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo "2. For each variable above:"
echo "   - Click 'Add New'"
echo "   - Paste the variable name and value"
echo "   - Select environments (Production, Preview, Development)"
echo "   - Click 'Save'"
echo ""
echo "⚠️  Remember to:"
echo "   - Update NEXT_PUBLIC_APP_URL to your production domain"
echo "   - Add SENTRY_DSN (server-side, different from NEXT_PUBLIC_SENTRY_DSN)"
echo "   - Set up Upstash Redis for rate limiting (optional)"
echo "   - Set up LogTail for structured logging (optional)"
echo ""

