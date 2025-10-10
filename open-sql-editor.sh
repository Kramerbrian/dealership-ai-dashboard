#!/bin/bash

# Open Supabase SQL Editor and display migration files
# Makes it easy to copy/paste into the SQL editor

echo "🗄️  Database Migration Helper"
echo "================================"
echo ""
echo "Opening Supabase SQL Editor in your browser..."
echo ""

# Open SQL editor
open "https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"

echo "✅ SQL Editor opened!"
echo ""
echo "================================"
echo "📋 Migrations to Apply (in order)"
echo "================================"
echo ""

# Function to display migration info
show_migration() {
    local file=$1
    local description=$2
    local priority=$3

    if [ -f "$file" ]; then
        local lines=$(wc -l < "$file" | tr -d ' ')
        local size=$(du -h "$file" | cut -f1)

        echo "[$priority] $description"
        echo "    File: $file"
        echo "    Size: $size ($lines lines)"
        echo ""
    else
        echo "⚠️  [$priority] $description"
        echo "    File: $file"
        echo "    Status: NOT FOUND"
        echo ""
    fi
}

# Core monitoring (required for cron jobs)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Core Monitoring Tables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

show_migration \
    "supabase/migrations/20250109_add_cron_monitoring_tables.sql" \
    "Cron Job Monitoring Tables" \
    "✅ REQUIRED"

show_migration \
    "supabase/migrations/20250109_add_system_alerts_table.sql" \
    "System Alerts Table" \
    "✅ REQUIRED"

# Security framework
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Security Framework"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

show_migration \
    "database/security-schema.sql" \
    "Security Events, Access Controls, Audit Log" \
    "🔒 HIGH PRIORITY"

# Model & governance
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Model & Governance"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

show_migration \
    "database/model-audit-schema.sql" \
    "Model Audit and Performance Tracking" \
    "📊 MEDIUM"

show_migration \
    "database/governance-schema.sql" \
    "Governance Rules and Compliance" \
    "📊 MEDIUM"

# Optional
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Optional Enhancements"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

show_migration \
    "database/aiv-training-schema.sql" \
    "AIV Training and Reinforcement Learning" \
    "⚪ OPTIONAL"

show_migration \
    "database/aoer-schema.sql" \
    "AOER Queue and Processing" \
    "⚪ OPTIONAL"

echo ""
echo "================================"
echo "📖 Instructions"
echo "================================"
echo ""
echo "1. The SQL editor should now be open in your browser"
echo "2. For each migration file above (in order):"
echo "   • Run: cat supabase/migrations/20250109_add_cron_monitoring_tables.sql"
echo "   • Copy the entire output"
echo "   • Paste into SQL editor"
echo "   • Click 'Run'"
echo "   • Wait for success message"
echo ""
echo "3. After all migrations:"
echo "   • See APPLY_MIGRATIONS_GUIDE.md for verification queries"
echo "   • Check Vercel dashboard for cron jobs"
echo "   • Test API endpoints"
echo ""
echo "Need help? See: APPLY_MIGRATIONS_GUIDE.md"
echo ""
