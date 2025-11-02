#!/bin/bash

# Quick version: Reads password from environment or prompts
# Usage: SUPABASE_DB_PASSWORD=xxx ./scripts/add-supabase-to-vercel-quick.sh

set -e

PROJECT_REF="gzlgfghpkbqlhgfozjkb"
REGION="us-east-2"

# Get password from env or prompt
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
  echo "🔐 Enter Supabase database password:"
  read -s SUPABASE_DB_PASSWORD
  echo ""
fi

DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${SUPABASE_DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

echo "📦 Adding to Vercel..."

for env in production preview development; do
  echo "$DATABASE_URL" | vercel env add DATABASE_URL "$env" --yes 2>&1 | grep -v "Encrypted" || echo "✅ $env: Done"
done

echo ""
echo "✅ Complete! Run: npx prisma db push"

