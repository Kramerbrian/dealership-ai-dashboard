#!/bin/bash
# Interactive environment variable setup for Vercel CLI

set -e

echo "🔐 Environment Variables Setup"
echo "=============================="
echo ""
echo "This script will help you set environment variables in Vercel."
echo "You'll need accounts for:"
echo "  - Clerk (https://dashboard.clerk.com)"
echo "  - Supabase (https://supabase.com/dashboard)"
echo "  - Upstash (https://console.upstash.com)"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "⚠️  Not logged into Vercel. Logging in..."
  vercel login
fi

echo "📋 Required Environment Variables:"
echo ""
echo "1. Clerk Authentication:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo ""
echo "2. Supabase:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE"
echo ""
echo "3. Upstash Redis:"
echo "   - UPSTASH_REDIS_REST_URL"
echo "   - UPSTASH_REDIS_REST_TOKEN"
echo ""
echo "4. Public URL:"
echo "   - PUBLIC_BASE_URL (or NEXT_PUBLIC_APP_URL)"
echo ""
read -p "Press Enter to start setting variables, or Ctrl+C to exit..."

# Function to set env var
set_env_var() {
  local var_name=$1
  local description=$2
  local is_secret=${3:-false}
  
  echo ""
  echo "📝 $description"
  read -p "Enter $var_name: " value
  
  if [ -z "$value" ]; then
    echo "⚠️  Skipping $var_name (empty value)"
    return
  fi
  
  if [ "$is_secret" = "true" ]; then
    vercel env add "$var_name" production --force <<< "$value"
  else
    vercel env add "$var_name" production --force <<< "$value"
  fi
  
  echo "✅ Set $var_name"
}

# Clerk
echo ""
echo "🔑 Clerk Setup"
echo "Get keys from: https://dashboard.clerk.com → Your App → API Keys"
set_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk Publishable Key"
set_env_var "CLERK_SECRET_KEY" "Clerk Secret Key" true

# Clerk URLs (defaults)
echo ""
echo "📝 Clerk URLs (using defaults, press Enter to accept)"
read -p "Sign In URL [/sign-in]: " sign_in_url
sign_in_url=${sign_in_url:-/sign-in}
vercel env add "NEXT_PUBLIC_CLERK_SIGN_IN_URL" production --force <<< "$sign_in_url"

read -p "Sign Up URL [/sign-up]: " sign_up_url
sign_up_url=${sign_up_url:-/sign-up}
vercel env add "NEXT_PUBLIC_CLERK_SIGN_UP_URL" production --force <<< "$sign_up_url"

read -p "After Sign In URL [/dashboard]: " after_sign_in
after_sign_in=${after_sign_in:-/dashboard}
vercel env add "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" production --force <<< "$after_sign_in"

read -p "After Sign Up URL [/dashboard]: " after_sign_up
after_sign_up=${after_sign_up:-/dashboard}
vercel env add "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" production --force <<< "$after_sign_up"

# Supabase
echo ""
echo "🗄️  Supabase Setup"
echo "Get keys from: https://supabase.com/dashboard → Your Project → Settings → API"
set_env_var "SUPABASE_URL" "Supabase Project URL" 
set_env_var "SUPABASE_SERVICE_ROLE" "Supabase Service Role Key" true

# Upstash Redis
echo ""
echo "💾 Upstash Redis Setup"
echo "Get keys from: https://console.upstash.com → Your Database → REST API"
set_env_var "UPSTASH_REDIS_REST_URL" "Upstash Redis REST URL"
set_env_var "UPSTASH_REDIS_REST_TOKEN" "Upstash Redis REST Token" true

# Public URL
echo ""
echo "🌐 Public URL"
read -p "Enter your production domain (e.g., https://dash.dealershipai.com): " public_url
if [ -n "$public_url" ]; then
  vercel env add "PUBLIC_BASE_URL" production --force <<< "$public_url"
  echo "✅ Set PUBLIC_BASE_URL"
fi

# Optional: QStash
echo ""
read -p "Set up QStash for async fixes? (y/n): " setup_qstash
if [ "$setup_qstash" = "y" ]; then
  echo "Get keys from: https://console.upstash.com → QStash"
  set_env_var "QSTASH_TOKEN" "QStash Token" true
  set_env_var "QSTASH_CURRENT_SIGNING_KEY" "QStash Current Signing Key" true
  set_env_var "QSTASH_NEXT_SIGNING_KEY" "QStash Next Signing Key" true
fi

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run: ./scripts/setup-supabase.sh"
echo "  2. Configure Clerk dashboard"
echo "  3. Run: ./scripts/deploy.sh"

