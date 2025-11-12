#!/bin/bash

# Automated script to add Vercel environment variables
# Requires: Project to be linked first (npx vercel link)

set -e

PASSWORD="Autonation2077$"

echo "🔐 Adding Supabase Database Password to Vercel"
echo ""

# Check if project is linked
if [ ! -f .vercel/project.json ]; then
  echo "❌ Project not linked to Vercel"
  echo "   Run: npx vercel link"
  echo "   Then run this script again"
  exit 1
fi

echo "✅ Project linked"
echo ""

# Add SUPABASE_DB_PASSWORD for all environments
echo "Adding SUPABASE_DB_PASSWORD..."
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD production 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD preview 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add SUPABASE_DB_PASSWORD development 2>&1 | grep -v "Vercel CLI" || true

# Add DATABASE_PASSWORD for all environments
echo ""
echo "Adding DATABASE_PASSWORD..."
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD production 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD preview 2>&1 | grep -v "Vercel CLI" || true
echo "$PASSWORD" | npx vercel env add DATABASE_PASSWORD development 2>&1 | grep -v "Vercel CLI" || true

echo ""
echo "✅ Environment variables added!"
echo ""
echo "🔍 Verifying..."
npx vercel env ls 2>&1 | grep -E "SUPABASE_DB_PASSWORD|DATABASE_PASSWORD" | head -6

echo ""
echo "🚀 To redeploy:"
echo "   npx vercel --prod"

