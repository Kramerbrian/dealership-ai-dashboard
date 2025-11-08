#!/bin/bash

# Deploy Supabase schema using psql
# This script uses the DATABASE_URL from .env.local

set -e

echo "🚀 Deploying Supabase schema..."

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in .env.local"
    echo "   Please ensure DATABASE_URL is set in .env.local"
    exit 1
fi

# Get the migration file
MIGRATION_FILE="supabase/migrations/20251105110958_telemetry_and_pulse_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Running migration: $MIGRATION_FILE"
echo ""

# Deploy using psql
psql "$DATABASE_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema deployed successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Test telemetry endpoint:"
    echo "     curl -X POST http://localhost:3000/api/telemetry \\"
    echo "       -H 'Content-Type: application/json' \\"
    echo "       -d '{\"type\":\"test\",\"payload\":{\"test\":true}}'"
    echo ""
    echo "  2. Seed demo data:"
    echo "     Visit: http://localhost:3000/api/admin/seed"
    echo ""
    echo "  3. View admin dashboard:"
    echo "     Visit: http://localhost:3000/admin"
else
    echo ""
    echo "❌ Deployment failed. Check the error above."
    exit 1
fi

