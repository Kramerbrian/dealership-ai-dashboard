#!/bin/bash

# Interactive script to add environment variables to Vercel
# Usage: ./scripts/add-vercel-env-interactive.sh

set -e

echo "🚀 Interactive Vercel Environment Variable Setup"
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

# Define variables with descriptions
declare -A VAR_DESCRIPTIONS=(
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"]="Clerk publishable key (pk_live_... or pk_test_...)"
  ["CLERK_SECRET_KEY"]="Clerk secret key (sk_live_... or sk_test_...)"
  ["SUPABASE_URL"]="Supabase project URL (https://xxx.supabase.co)"
  ["SUPABASE_SERVICE_ROLE_KEY"]="Supabase service role key"
  ["NEXT_PUBLIC_SUPABASE_URL"]="Supabase project URL (same as SUPABASE_URL)"
  ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="Supabase anonymous key"
  ["ANTHROPIC_API_KEY"]="Anthropic API key (sk-ant-api03-...)"
  ["NEXT_PUBLIC_SENTRY_DSN"]="Sentry DSN (https://xxx@sentry.io/xxx) - Optional"
  ["SENTRY_DSN"]="Sentry DSN (server-side) - Optional"
  ["UPSTASH_REDIS_REST_URL"]="Upstash Redis REST URL - Optional"
  ["UPSTASH_REDIS_REST_TOKEN"]="Upstash Redis REST token - Optional"
  ["NEXT_PUBLIC_GA"]="Google Analytics ID (G-XXX) - Optional"
)

# Required variables
REQUIRED_VARS=(
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  "CLERK_SECRET_KEY"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "ANTHROPIC_API_KEY"
)

# Optional variables
OPTIONAL_VARS=(
  "NEXT_PUBLIC_SENTRY_DSN"
  "SENTRY_DSN"
  "UPSTASH_REDIS_REST_URL"
  "UPSTASH_REDIS_REST_TOKEN"
  "NEXT_PUBLIC_GA"
)

# Check existing variables
echo "📋 Checking existing environment variables..."
vercel env ls > /tmp/vercel-env-list.txt 2>&1 || true
EXISTING_VARS=$(vercel env ls 2>/dev/null | grep -v "^$" | awk '{print $1}' || echo "")

# Function to check if variable exists
var_exists() {
  local var_name=$1
  echo "$EXISTING_VARS" | grep -q "^$var_name$" && return 0 || return 1
}

# Function to add variable
add_var() {
  local var_name=$1
  local description=$2
  local is_required=$3
  
  if var_exists "$var_name"; then
    echo "✅ $var_name already exists, skipping..."
    return
  fi
  
  echo ""
  if [ "$is_required" = "true" ]; then
    echo "🔴 REQUIRED: $var_name"
  else
    echo "🟡 OPTIONAL: $var_name"
  fi
  echo "   Description: $description"
  
  # Try to get from .env.local
  if [ -f .env.local ]; then
    value=$(grep "^${var_name}=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'" || echo "")
    if [ -n "$value" ]; then
      echo "   Found in .env.local"
      read -p "   Use this value? (Y/n): " use_existing
      if [[ ! "$use_existing" =~ ^[Nn]$ ]]; then
        echo "   Adding from .env.local..."
        echo "$value" | vercel env add "$var_name" production preview development
        return
      fi
    fi
  fi
  
  read -p "   Enter value (or press Enter to skip): " value
  
  if [ -z "$value" ]; then
    if [ "$is_required" = "true" ]; then
      echo "   ⚠️  Warning: This is a required variable!"
      read -p "   Continue anyway? (y/N): " continue_anyway
      if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
        echo "   ❌ Skipping required variable. Please add manually."
        return
      fi
    else
      echo "   ⏭️  Skipping optional variable..."
      return
    fi
  fi
  
  echo "   ➕ Adding to Vercel..."
  echo "$value" | vercel env add "$var_name" production preview development && echo "   ✅ Added!" || echo "   ❌ Failed to add"
}

echo ""
echo "📦 Adding Required Variables..."
echo ""

# Add required variables
for var in "${REQUIRED_VARS[@]}"; do
  add_var "$var" "${VAR_DESCRIPTIONS[$var]}" "true"
done

echo ""
echo "📦 Adding Optional Variables..."
echo ""

# Add optional variables
for var in "${OPTIONAL_VARS[@]}"; do
  add_var "$var" "${VAR_DESCRIPTIONS[$var]}" "false"
done

echo ""
echo "✅ Environment Variable Setup Complete!"
echo ""
echo "📋 To verify, run:"
echo "   vercel env ls"
echo ""
echo "📋 To view a specific variable:"
echo "   vercel env pull .env.vercel"
echo ""

