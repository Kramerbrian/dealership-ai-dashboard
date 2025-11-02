#!/bin/bash

# Simple script to add environment variables to Vercel via CLI
# Usage: ./scripts/add-vercel-env-simple.sh

set -e

echo "🚀 Adding Environment Variables to Vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found."
  echo "📦 Install with: npm install -g vercel"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel."
  echo "🔐 Run: vercel login"
  exit 1
fi

echo "✅ Logged in as: $(vercel whoami)"
echo ""

# Load from .env.local if it exists
if [ -f .env.local ]; then
  echo "📄 Found .env.local, loading variables..."
  set -a
  source .env.local 2>/dev/null || true
  set +a
fi

# Function to add a variable if it exists
add_var_if_set() {
  local var_name=$1
  local var_value="${!var_name}"
  
  if [ -z "$var_value" ]; then
    echo "⚠️  $var_name not set, skipping..."
    echo "   Run: vercel env add $var_name production preview development"
    return
  fi
  
  # Check if already exists
  if vercel env ls 2>/dev/null | grep -q "^$var_name"; then
    echo "✅ $var_name already exists in Vercel, skipping..."
    return
  fi
  
  echo "➕ Adding $var_name..."
  echo "$var_value" | vercel env add "$var_name" production preview development <<< "$var_value" && echo "   ✅ Added!" || echo "   ❌ Failed"
}

echo "📝 Adding Required Variables..."
echo ""

# Required variables
add_var_if_set "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
add_var_if_set "CLERK_SECRET_KEY"
add_var_if_set "SUPABASE_URL"
add_var_if_set "SUPABASE_SERVICE_ROLE_KEY"
add_var_if_set "NEXT_PUBLIC_SUPABASE_URL"
add_var_if_set "NEXT_PUBLIC_SUPABASE_ANON_KEY"
add_var_if_set "ANTHROPIC_API_KEY"

echo ""
echo "📝 Adding Optional Variables..."
echo ""

# Optional variables
add_var_if_set "NEXT_PUBLIC_SENTRY_DSN"
add_var_if_set "SENTRY_DSN"
add_var_if_set "UPSTASH_REDIS_REST_URL"
add_var_if_set "UPSTASH_REDIS_REST_TOKEN"
add_var_if_set "NEXT_PUBLIC_GA"

echo ""
echo "✅ Done!"
echo ""
echo "📋 To list all variables:"
echo "   vercel env ls"
echo ""
echo "📋 To add missing variables manually:"
echo "   vercel env add VARIABLE_NAME production preview development"
echo ""

