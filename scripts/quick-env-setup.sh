#!/bin/bash
# Quick script to set the 4 missing environment variables

echo "🔐 Quick Environment Variables Setup"
echo "====================================="
echo ""
echo "You need to set 4 missing variables:"
echo ""
echo "1. SUPABASE_SERVICE_ROLE"
echo "   Get from: https://supabase.com/dashboard → Your Project → Settings → API → service_role key"
echo ""
echo "2. UPSTASH_REDIS_REST_URL"
echo "   Get from: https://console.upstash.com → Your Database → REST API → REST URL"
echo ""
echo "3. UPSTASH_REDIS_REST_TOKEN"
echo "   Get from: https://console.upstash.com → Your Database → REST API → REST Token"
echo ""
echo "4. PUBLIC_BASE_URL"
echo "   Your production domain, e.g., https://dash.dealershipai.com"
echo ""

read -p "Ready to set these? (y/n): " ready
if [ "$ready" != "y" ]; then
  echo "Cancelled. Run this script when ready."
  exit 0
fi

echo ""
echo "Setting environment variables..."
echo ""

# SUPABASE_SERVICE_ROLE
read -p "Enter SUPABASE_SERVICE_ROLE: " supabase_role
if [ -n "$supabase_role" ]; then
  echo "$supabase_role" | vercel env add SUPABASE_SERVICE_ROLE production
  echo "✅ Set SUPABASE_SERVICE_ROLE"
fi

# UPSTASH_REDIS_REST_URL
read -p "Enter UPSTASH_REDIS_REST_URL: " redis_url
if [ -n "$redis_url" ]; then
  echo "$redis_url" | vercel env add UPSTASH_REDIS_REST_URL production
  echo "✅ Set UPSTASH_REDIS_REST_URL"
fi

# UPSTASH_REDIS_REST_TOKEN
read -p "Enter UPSTASH_REDIS_REST_TOKEN: " redis_token
if [ -n "$redis_token" ]; then
  echo "$redis_token" | vercel env add UPSTASH_REDIS_REST_TOKEN production
  echo "✅ Set UPSTASH_REDIS_REST_TOKEN"
fi

# PUBLIC_BASE_URL
read -p "Enter PUBLIC_BASE_URL (e.g., https://dash.dealershipai.com): " public_url
if [ -n "$public_url" ]; then
  echo "$public_url" | vercel env add PUBLIC_BASE_URL production
  echo "✅ Set PUBLIC_BASE_URL"
fi

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Run Supabase migrations: ./scripts/setup-supabase.sh"
echo "  2. Configure Clerk dashboard (add domain)"
echo "  3. Deploy: ./scripts/deploy.sh"

