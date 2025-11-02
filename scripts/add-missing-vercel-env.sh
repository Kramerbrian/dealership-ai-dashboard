#!/bin/bash

# Add missing environment variables to Vercel
# Checks what exists and only adds what's missing

set -e

echo "🚀 Adding Missing Environment Variables to Vercel"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in. Run: vercel login"
  exit 1
fi

echo "✅ Logged in as: $(vercel whoami)"
echo ""

# Get existing variables
EXISTING=$(vercel env ls 2>/dev/null | awk '{print $1}' | grep -v "^name$" | sort -u)

# Function to check if variable exists
var_exists() {
  echo "$EXISTING" | grep -q "^$1$"
}

# Function to add variable
add_var() {
  local var_name=$1
  local description=$2
  
  if var_exists "$var_name"; then
    echo "✅ $var_name already exists"
    return 0
  fi
  
  echo "➕ Adding $var_name..."
  echo "   $description"
  
  # Try to get from .env.local
  if [ -f .env.local ]; then
    value=$(grep "^${var_name}=" .env.local 2>/dev/null | cut -d '=' -f2- | sed "s/^['\"]//;s/['\"]$//" || echo "")
    if [ -n "$value" ]; then
      echo "   Found in .env.local, adding..."
      echo "$value" | vercel env add "$var_name" production preview development <<< "$value" && echo "   ✅ Added!" || echo "   ❌ Failed"
      return
    fi
  fi
  
  echo "   ⚠️  Not found in .env.local"
  echo "   Run manually: vercel env add $var_name production preview development"
  return 1
}

echo "📝 Checking Required Variables..."
echo ""

add_var "ANTHROPIC_API_KEY" "Anthropic API key (sk-ant-api03-...)"
add_var "CLERK_SECRET_KEY" "Clerk secret key (sk_live_...)"
add_var "SUPABASE_URL" "Supabase project URL"
add_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key"
add_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL (public)"
add_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key"

echo ""
echo "📝 Checking Optional Variables..."
echo ""

add_var "NEXT_PUBLIC_SENTRY_DSN" "Sentry DSN (client-side)"
add_var "SENTRY_DSN" "Sentry DSN (server-side)"
add_var "UPSTASH_REDIS_REST_URL" "Upstash Redis REST URL"
add_var "UPSTASH_REDIS_REST_TOKEN" "Upstash Redis REST token"
add_var "NEXT_PUBLIC_GA" "Google Analytics ID"

echo ""
echo "✅ Done!"
echo ""
echo "📋 To verify:"
echo "   vercel env ls"
echo ""

