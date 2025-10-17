#!/bin/bash

# DealershipAI v2.0 - AOER Tables Migration Script
# Runs the SQL migration to create partitioned AOER tables

echo "🚀 Running AOER tables migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in environment variables"
    echo "Please set DATABASE_URL in your .env.local file"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Run the migration
echo "📦 Creating AOER tables with partitioning..."
psql "$DATABASE_URL" -f prisma/migrations/001_create_aoer_tables.sql

if [ $? -eq 0 ]; then
    echo "✅ AOER tables migration completed successfully!"
    echo ""
    echo "Created tables:"
    echo "  - aoer_queries (partitioned table)"
    echo "  - aoer_queries_2025q4 (Q4 2025 partition)"
    echo "  - aoer_queries_2026q1 (Q1 2026 partition)"
    echo "  - aiv_raw_signals"
    echo "  - aoer_failures"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npx prisma db push' to sync Prisma schema"
    echo "  2. Test the tables with your application"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
