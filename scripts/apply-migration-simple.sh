#!/bin/bash

# Simple Migration Script for AEMD & Accuracy Monitoring
# This script applies the database migration via Supabase SQL Editor

echo "================================================"
echo "AEMD Migration - Simple Setup"
echo "================================================"
echo ""
echo "Since you're using the Supabase SQL Editor, here's what to do:"
echo ""
echo "1. Open your browser and go to:"
echo "   https://supabase.com/dashboard"
echo ""
echo "2. Select your project"
echo ""
echo "3. Click 'SQL Editor' in the left sidebar"
echo ""
echo "4. Click 'New Query'"
echo ""
echo "5. Copy the migration file content:"
echo "   Location: supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql"
echo ""
echo "6. Paste into the SQL Editor and click 'Run'"
echo ""
echo "================================================"
echo ""

# Option to copy migration to clipboard (macOS)
if command -v pbcopy &> /dev/null; then
    read -p "Copy migration SQL to clipboard? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat "$(dirname "$0")/../supabase/migrations/20250111000001_add_aemd_accuracy_monitoring.sql" | pbcopy
        echo "✅ Migration SQL copied to clipboard!"
        echo "   Now paste it into Supabase SQL Editor and click Run"
        echo ""
    fi
fi

echo "After running the migration, verify tables were created:"
echo ""
echo "Run this in SQL Editor:"
echo "  SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND (tablename LIKE '%aemd%' OR tablename LIKE '%accuracy%');"
echo ""
echo "Expected result: 4 tables"
echo "  - aemd_metrics"
echo "  - accuracy_monitoring"
echo "  - accuracy_thresholds"
echo "  - accuracy_alerts"
echo ""
