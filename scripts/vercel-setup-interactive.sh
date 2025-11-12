#!/bin/bash

# Interactive Vercel Setup Script
# Run this in your terminal to set up Vercel environment variables

set -e

PASSWORD="Autonation2077$"

echo "🚀 Vercel Environment Variables Setup"
echo "======================================"
echo ""
echo "This script will:"
echo "  1. Link your project to Vercel"
echo "  2. Add SUPABASE_DB_PASSWORD to all environments"
echo "  3. Add DATABASE_PASSWORD to all environments"
echo "  4. Redeploy to production"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Step 1: Link project
echo ""
echo "📋 Step 1: Linking project to Vercel"
echo "   When prompted, select: dealership-ai-dashboard"
echo ""
npx vercel link

# Verify link
if [ ! -f .vercel/project.json ]; then
  echo "❌ Project linking failed"
  exit 1
fi

echo "✅ Project linked successfully"
echo ""

# Step 2: Add environment variables
echo "📋 Step 2: Adding environment variables"
echo ""

echo "Adding SUPABASE_DB_PASSWORD..."
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD production
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD preview
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD development

echo ""
echo "Adding DATABASE_PASSWORD..."
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD production
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD preview
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD development

echo ""
echo "✅ Environment variables added!"
echo ""

# Step 3: Verify
echo "📋 Step 3: Verifying environment variables"
echo ""
npx vercel env ls | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD" | head -6

echo ""
read -p "Press Enter to redeploy to production or Ctrl+C to cancel..."

# Step 4: Redeploy
echo ""
echo "📋 Step 4: Redeploying to production"
echo ""
npx vercel --prod --yes

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔍 Check deployment status:"
echo "   https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/deployments"

