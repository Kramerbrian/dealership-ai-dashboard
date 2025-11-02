#!/bin/bash

# Add Environment Variables to Vercel via CLI
# Usage: ./scripts/add-vercel-env.sh

set -e

echo "🚀 Adding Environment Variables to Vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel. Please run: vercel login"
  exit 1
fi

echo "✅ Vercel CLI ready"
echo ""

# Required variables (from .env.local or user input)
ENV_VARS=(
  # Authentication
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  
  # Database
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  
  # AI Services
  "ANTHROPIC_API_KEY"
  
  # Monitoring (Optional)
  "NEXT_PUBLIC_SENTRY_DSN"
  "SENTRY_DSN"
  
  # Rate Limiting (Optional)
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  
  # Analytics (Optional)
  "NEXT_PUBLIC_GA"
)

# Load from .env.local if it exists
if [ -f .env.local ]; then
  echo "📄 Loading variables from .env.local..."
  set -a
  source .env.local
  set +a
fi

# Function to add a single variable
add_var() {
  local var_name=$1
  local var_value=$2
  local environments=${3:-"production,preview,development"}
  
  if [ -z "$var_value" ]; then
    echo "⚠️  $var_name is not set, skipping..."
    return
  fi
  
  echo "➕ Adding $var_name..."
  vercel env add "$var_name" "$environments" <<< "$var_value" || {
    echo "⚠️  Failed to add $var_name (may already exist)"
  }
}

echo "📝 Adding environment variables..."
echo ""

# Add required variables
for var in "${ENV_VARS[@]}"; do
  var_value="${!var}"
  if [ -n "$var_value" ]; then
    add_var "$var" "$var_value"
  else
    echo "⚠️  $var not found in .env.local"
    echo "   Run: vercel env add $var"
  fi
done

echo ""
echo "✅ Done!"
echo ""
echo "📋 To manually add missing variables:"
echo "   vercel env add VARIABLE_NAME production preview development"
echo ""
echo "📋 To list all variables:"
echo "   vercel env ls"
echo ""
echo "📋 To remove a variable:"
echo "   vercel env rm VARIABLE_NAME"
echo ""

