#!/bin/bash

# Deploy to Vercel with environment variables from .env.local
set -e

echo "🚀 DealershipAI - Automated Vercel Deployment"
echo "=============================================="
echo ""

# Extract variables from .env.local
echo "📝 Extracting environment variables from .env.local..."
SUPABASE_URL=$(grep "^SUPABASE_URL=" .env.local | cut -d'=' -f2)
SUPABASE_ANON_KEY=$(grep "^SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2)
SUPABASE_SERVICE_KEY=$(grep "^SUPABASE_SERVICE_KEY=" .env.local | cut -d'=' -f2)
DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'=' -f2)

echo "✅ Found Supabase URL: $SUPABASE_URL"
echo "✅ Found anon key: ${SUPABASE_ANON_KEY:0:50}..."
echo "✅ Found service key: ${SUPABASE_SERVICE_KEY:0:50}..."
echo "✅ Found database URL: ${DATABASE_URL:0:50}..."
echo ""

# Deploy to Vercel production
echo "🚀 Deploying to Vercel production..."
echo ""

# Set environment variables using Vercel API via curl
VERCEL_TOKEN=$(cat ~/.config/vercel/auth.json 2>/dev/null | grep -o '"token":"[^"]*"' | cut -d'"' -f4 || echo "")

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ Vercel token not found"
  echo ""
  echo "Please add environment variables manually via dashboard:"
  echo "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
  echo ""
  echo "Variables to add:"
  echo "1. NEXT_PUBLIC_SUPABASE_URL = $SUPABASE_URL"
  echo "2. NEXT_PUBLIC_SUPABASE_ANON_KEY = $SUPABASE_ANON_KEY"
  echo "3. SUPABASE_SERVICE_ROLE_KEY = $SUPABASE_SERVICE_KEY"
  echo "4. DATABASE_URL = $DATABASE_URL"
  echo ""
  echo "Then run: npx vercel --prod"
  exit 1
fi

echo "✅ Vercel token found"
echo ""
echo "📤 Configuring environment variables..."

# Get project ID
PROJECT_ID="prj_OnlY0LJkWxuHWo5aJk0RaaFndjg5"
TEAM_ID="team_bL2iJEcPCFg7kKTo6T2Ajwi4"

# Function to add environment variable via API
add_env_var() {
  local key=$1
  local value=$2
  local target="production"
  local type="encrypted"

  echo "Adding $key..."

  curl -s -X POST \
    "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"key\": \"$key\",
      \"value\": \"$value\",
      \"type\": \"$type\",
      \"target\": [\"$target\"]
    }" > /dev/null 2>&1 || echo "⚠️  May already exist"
}

# Add all environment variables
add_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
add_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
add_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY"
add_env_var "DATABASE_URL" "$DATABASE_URL"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "🚀 Deploying to production..."
npx vercel --prod --yes || {
  echo ""
  echo "⚠️  Deployment may require manual trigger"
  echo "Visit: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard"
  exit 1
}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Verify at: https://dealershipai.com/api/health"
