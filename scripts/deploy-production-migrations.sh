#!/bin/bash
# Production Database Migration Script
# Run this AFTER configuring DATABASE_URL in Vercel

set -e

echo "🚀 Production Migration Deployment"
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo ""
  echo "Please set your production Supabase credentials:"
  echo "export DATABASE_URL='postgresql://postgres.[PROJECT]:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1'"
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL configured"
echo ""

# Deploy migrations
echo "📦 Deploying Prisma migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Migration deployment complete!"
echo ""

# Verify tables
echo "🔍 Verifying Pulse tables..."
npx prisma db execute --stdin <<SQL
SELECT
  table_name
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
  AND table_name LIKE 'Pulse%'
ORDER BY
  table_name;
SQL

echo ""
echo "✅ Production deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test API endpoints: https://[your-domain]/api/pulse/score?dealerId=demo-123"
echo "2. Verify Clerk authentication is working"
echo "3. Monitor logs for any errors"
