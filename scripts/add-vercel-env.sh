#!/bin/bash

# Script to add Supabase database password to Vercel environment variables
# Requires: vercel CLI (npm i -g vercel)

set -e

PASSWORD="Autonation2077$"
PROJECT="dealership-ai-dashboard"

echo "🔐 Adding Supabase Database Password to Vercel"
echo "Project: $PROJECT"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found"
  echo "   Install with: npm i -g vercel"
  echo ""
  echo "📋 Manual Steps:"
  echo "   1. Visit: https://vercel.com/$PROJECT/settings/environment-variables"
  echo "   2. Add SUPABASE_DB_PASSWORD = $PASSWORD"
  echo "   3. Add DATABASE_PASSWORD = $PASSWORD"
  echo "   4. Select: Production, Preview, Development"
  echo "   5. Save"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "⚠️  Not logged in to Vercel"
  echo "   Run: vercel login"
  exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Add SUPABASE_DB_PASSWORD for all environments
echo "Adding SUPABASE_DB_PASSWORD..."
echo "$PASSWORD" | vercel env add SUPABASE_DB_PASSWORD production
echo "$PASSWORD" | vercel env add SUPABASE_DB_PASSWORD preview
echo "$PASSWORD" | vercel env add SUPABASE_DB_PASSWORD development

# Add DATABASE_PASSWORD for all environments
echo ""
echo "Adding DATABASE_PASSWORD..."
echo "$PASSWORD" | vercel env add DATABASE_PASSWORD production
echo "$PASSWORD" | vercel env add DATABASE_PASSWORD preview
echo "$PASSWORD" | vercel env add DATABASE_PASSWORD development

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "🚀 Next steps:"
echo "   1. Verify in dashboard: https://vercel.com/$PROJECT/settings/environment-variables"
echo "   2. Redeploy: vercel --prod"
echo ""

