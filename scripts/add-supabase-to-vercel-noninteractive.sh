#!/bin/bash

# Non-interactive version: Pass password as first argument
# Usage: ./scripts/add-supabase-to-vercel-noninteractive.sh YOUR_PASSWORD

set -e

PROJECT_REF="gzlgfghpkbqlhgfozjkb"
REGION="us-east-2"

# Get password from argument or environment
if [ -n "$1" ]; then
  DB_PASSWORD="$1"
elif [ -n "$SUPABASE_DB_PASSWORD" ]; then
  DB_PASSWORD="$SUPABASE_DB_PASSWORD"
else
  echo "❌ Error: Password required"
  echo "Usage: ./scripts/add-supabase-to-vercel-noninteractive.sh YOUR_PASSWORD"
  echo "   Or: SUPABASE_DB_PASSWORD=xxx ./scripts/add-supabase-to-vercel-noninteractive.sh"
  exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: Password cannot be empty"
  exit 1
fi

DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

echo "🚀 Adding Supabase DATABASE_URL to Vercel..."
echo "   Project: $PROJECT_REF"
echo "   Region: $REGION"
echo ""

# Verify Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "❌ Error: Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# Add to all environments
for env in production preview development; do
  echo "📦 Adding to $env..."
  echo "$DATABASE_URL" | vercel env add DATABASE_URL "$env" --yes 2>&1 | grep -E "(Added|Updated|already exists)" || echo "   ✅ $env: Done"
done

echo ""
echo "✅ Complete! DATABASE_URL added to all Vercel environments"
echo ""
echo "🧪 Next steps:"
echo "   1. Verify: vercel env ls | grep DATABASE_URL"
echo "   2. Test: npx prisma db push"
echo "   3. Deploy: vercel --prod"

