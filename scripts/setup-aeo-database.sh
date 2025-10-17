#!/bin/bash

# AEO Database Setup Script
# Runs all AEO-related migrations in order

echo "🚀 Setting up AEO database tables and views..."

# Check if we have database connection
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable not set"
    echo "Please set your database connection string:"
    echo "export DATABASE_URL='postgresql://user:pass@host:port/dbname'"
    exit 1
fi

# Run migrations in order
echo "📋 Step 1: Creating base AEO tables..."
psql "$DATABASE_URL" -f db/migrations/001_aeo_base_tables.sql

echo "📋 Step 2: Creating AEO views..."
psql "$DATABASE_URL" -f db/migrations/002_aeo_views.sql

echo "📋 Step 3: Populating sample data..."
psql "$DATABASE_URL" -f db/migrations/003_aeo_sample_data.sql

echo "✅ AEO database setup complete!"
echo ""
echo "📊 You can now:"
echo "  - Visit /dashboard/aeo to see the panel"
echo "  - Test API endpoints: /api/aeo/leaderboard and /api/aeo/breakdown"
echo "  - View sample data in your database"
echo ""
echo "🔍 To verify the setup, run:"
echo "  psql \"$DATABASE_URL\" -c \"SELECT COUNT(*) FROM aeo_runs;\""
echo "  psql \"$DATABASE_URL\" -c \"SELECT COUNT(*) FROM aeo_queries;\""
