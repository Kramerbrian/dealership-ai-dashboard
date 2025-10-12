#!/bin/bash

# DealershipAI v2.0 - Security Events Setup Script
# Sets up security_events table with RLS policies

set -e

echo "🔒 Setting up Security Events table..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable not set"
    echo "Please set your database connection string:"
    echo "export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Run the migration
echo "📝 Running security_events migration..."
psql "$DATABASE_URL" -f prisma/migrations/001_security_events.sql

# Run diagnostic to verify setup
echo "🔍 Running diagnostic check..."
psql "$DATABASE_URL" -f scripts/check-security-events.sql

echo "✅ Security Events setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify the diagnostic output above"
echo "2. Test RLS policies with your application"
echo "3. Monitor security_events table for logging"
