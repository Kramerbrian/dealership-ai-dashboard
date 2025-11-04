#!/bin/bash

# Apply Phase 1 Database Optimization Migration
# This script helps you apply the migration via Supabase SQL Editor

echo "🚀 Phase 1 Database Optimization Migration"
echo "=========================================="
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/20250115000002_phase1_db_optimization.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Migration File: $MIGRATION_FILE"
echo "📊 File Size: $(wc -l < "$MIGRATION_FILE") lines"
echo ""

# Method 1: SQL Editor (Recommended)
echo "🎯 RECOMMENDED: Apply via Supabase SQL Editor"
echo "=============================================="
echo ""
echo "1. Open SQL Editor:"
echo "   https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"
echo ""
echo "2. Copy the migration SQL below:"
echo ""
echo "---"
echo ""
cat "$MIGRATION_FILE"
echo ""
echo "---"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""

# Method 2: Try CLI (if possible)
echo ""
echo "🎯 ALTERNATIVE: Try Supabase CLI"
echo "================================="
echo ""

# Check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo "Supabase CLI found. Attempting to apply migration..."
    echo ""
    
    # Try to apply via CLI
    if supabase db push --linked 2>&1 | grep -q "20250115000002"; then
        echo "✅ Migration applied via CLI!"
    else
        echo "⚠️  CLI method may have issues. Use SQL Editor method above."
        echo ""
        echo "To sync migration history first:"
        echo "  supabase db pull"
        echo "  supabase db push --linked"
    fi
else
    echo "Supabase CLI not found. Use SQL Editor method above."
fi

echo ""
echo "✅ After applying, verify with:"
echo "   SELECT * FROM check_rls_performance();"
echo ""

