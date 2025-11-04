#!/bin/bash

# Sync Environment Variables from .env to Vercel
# Uses Vercel CLI to add environment variables

set -e

echo "🔄 Syncing Environment Variables to Vercel"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not installed"
  echo "   Install: npm install -g vercel"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel"
  echo "   Run: vercel login"
  exit 1
fi

# Load .env file
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

echo "📋 Variables to sync from .env:"
echo ""

# List of variables to sync (excluding secrets that should be added manually)
VARS_TO_SYNC=(
  "NODE_ENV"
  "NEXT_PUBLIC_APP_URL"
  "DATABASE_URL"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "NEXT_PUBLIC_SENTRY_DSN"
  "SENTRY_DSN"
  "SENTRY_ORG"
  "SENTRY_PROJECT"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
)

# Source .env
set -a
source .env
set +a

echo "Available variables in .env:"
for var in "${VARS_TO_SYNC[@]}"; do
  if [ ! -z "${!var}" ] && [[ ! "${!var}" =~ ^(your_|placeholder|YOUR_) ]]; then
    echo "  ✅ $var"
  else
    echo "  ⚠️  $var (placeholder or empty)"
  fi
done

echo ""
echo "==========================================="
echo ""
echo "⚠️  Manual Sync Required"
echo ""
echo "Vercel CLI doesn't support bulk adding env vars."
echo "Use one of these methods:"
echo ""
echo "📋 Method 1: Export and Copy-Paste"
echo "   Run: npm run export:vercel-env"
echo "   Then add each variable manually in Vercel dashboard"
echo ""
echo "📋 Method 2: Add Variables One by One"
echo "   For each variable, run:"
echo "   vercel env add VARIABLE_NAME"
echo ""
echo "📋 Method 3: Use Vercel Dashboard"
echo "   Go to: https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo "   Add variables from the export above"
echo ""
echo "🔗 Quick Link:"
echo "   https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo ""

