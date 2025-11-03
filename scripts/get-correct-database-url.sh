#!/bin/bash

# Get Correct Database URL Format for Vercel
# This script converts direct connection to transaction pooler format

echo "🔧 Database URL Converter"
echo "========================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env.local"
  exit 1
fi

echo "Current DATABASE_URL:"
echo "$DATABASE_URL"
echo ""

# Extract components from current URL
# Format: postgresql://postgres:password@db.project.supabase.co:5432/postgres

PROJECT_REF="gzlgfghpkbqlhgfozjkb"
REGION="us-east-2"  # Update this if your region is different
PASSWORD="Autonation2077$"

# Construct transaction pooler URL
POOLER_URL="postgresql://postgres.${PROJECT_REF}:${PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?sslmode=require"

echo "✅ Correct Transaction Pooler Format (for Vercel):"
echo ""
echo "$POOLER_URL"
echo ""
echo "📝 Key Differences:"
echo "   - Username: postgres.PROJECT_REF (not just postgres)"
echo "   - Host: aws-0-REGION.pooler.supabase.com (not db.PROJECT.supabase.co)"
echo "   - Port: 6543 (not 5432)"
echo ""
echo "Copy the URL above and add it to Vercel as DATABASE_URL"
echo ""

