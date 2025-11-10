#!/bin/bash

# Check if telemetry_events table exists using Supabase CLI

cd /Users/stephaniekramer/dealership-ai-dashboard

echo "Checking telemetry_events table..."
echo ""

# Method 1: Check via Supabase Dashboard API (if we have the connection)
if [ -f .supabase/config.toml ]; then
    echo "✅ Project is linked"
    echo ""
    echo "To verify the table, use one of these methods:"
    echo ""
    echo "1. Supabase Dashboard (Easiest):"
    echo "   https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/editor"
    echo "   → Look for 'telemetry_events' in the table list"
    echo ""
    echo "2. SQL Editor:"
    echo "   https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw/sql/new"
    echo "   → Run: SELECT * FROM telemetry_events LIMIT 1;"
    echo ""
    echo "3. Using psql (if installed):"
    echo "   psql \"postgresql://postgres:Autonation2077\$@db.vxrdvkhkombwlhjvtsmw.supabase.co:5432/postgres?sslmode=require\" -c \"SELECT * FROM telemetry_events LIMIT 1;\""
    echo ""
else
    echo "⚠️  Project not linked"
    echo "Run: supabase link --project-ref vxrdvkhkombwlhjvtsmw"
fi

