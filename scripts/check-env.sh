#!/bin/bash
# Quick environment variable checker
# Checks which required env vars are set

echo "🔐 Environment Variables Check"
echo "=============================="
echo ""

required_vars=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "PUBLIC_BASE_URL"
)

optional_vars=(
  "NEXT_PUBLIC_APP_URL"
  "QSTASH_TOKEN"
  "QSTASH_CURRENT_SIGNING_KEY"
  "QSTASH_NEXT_SIGNING_KEY"
  "TELEMETRY_WEBHOOK"
)

echo "Required variables:"
for var in "${required_vars[@]}"; do
  if [ -n "${!var}" ]; then
    echo "  ✅ $var"
  else
    echo "  ❌ $var (missing)"
  fi
done

echo ""
echo "Optional variables:"
for var in "${optional_vars[@]}"; do
  if [ -n "${!var}" ]; then
    echo "  ✅ $var"
  else
    echo "  ⚠️  $var (optional)"
  fi
done

echo ""
echo "💡 Tip: Set these in Vercel Dashboard → Project Settings → Environment Variables"

