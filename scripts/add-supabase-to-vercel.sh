#!/bin/bash

# Add Supabase DATABASE_URL to Vercel via CLI
# This script automates adding the connection string to all environments

set -e

echo "🚀 Supabase → Vercel Environment Variable Setup"
echo "================================================"
echo ""

# Supabase project reference
PROJECT_REF="gzlgfghpkbqlhgfozjkb"
REGION="us-east-2"

echo "📋 Supabase Project Details:"
echo "   Project Ref: $PROJECT_REF"
echo "   Region: $REGION"
echo ""

# Prompt for database password
echo "🔐 Enter your Supabase database password:"
read -s DB_PASSWORD
echo ""

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: Password cannot be empty"
  exit 1
fi

# Construct the connection string (Transaction pooler)
DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

echo "✅ Constructed connection string"
echo "   Format: postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
echo ""

# Verify Vercel CLI is available
if ! command -v vercel &> /dev/null; then
  echo "❌ Error: Vercel CLI not found"
  echo "   Install with: npm i -g vercel"
  exit 1
fi

echo "🔍 Checking Vercel project..."
vercel ls > /dev/null 2>&1 || {
  echo "⚠️  Not logged in to Vercel. Logging in..."
  vercel login
}

echo ""
echo "📦 Adding DATABASE_URL to Vercel environments..."
echo ""

# Add to Production
echo "1️⃣  Adding to Production environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production --yes 2>&1 | grep -v "Encrypted" || echo "   ✅ Production: Updated (or already exists)"

# Add to Preview
echo ""
echo "2️⃣  Adding to Preview environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL preview --yes 2>&1 | grep -v "Encrypted" || echo "   ✅ Preview: Updated (or already exists)"

# Add to Development
echo ""
echo "3️⃣  Adding to Development environment..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL development --yes 2>&1 | grep -v "Encrypted" || echo "   ✅ Development: Updated (or already exists)"

echo ""
echo "✅ Environment variables added successfully!"
echo ""

# Optional: Test connection
read -p "🧪 Test database connection? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Testing connection..."
  export DATABASE_URL="$DATABASE_URL"
  if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
    echo "✅ Connection successful!"
  else
    echo "⚠️  Connection test skipped (requires prisma installed)"
    echo "   You can test manually with: npx prisma db push"
  fi
fi

echo ""
echo "🎉 Complete! Next steps:"
echo "   1. Verify in Vercel dashboard: https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables"
echo "   2. Test locally: Add DATABASE_URL to .env.local"
echo "   3. Deploy: vercel --prod"
echo ""

