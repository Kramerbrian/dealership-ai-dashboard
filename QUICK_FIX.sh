#!/bin/bash

# Quick fix script for deployment issues

cd /Users/stephaniekramer/dealership-ai-dashboard

echo "🔧 Fixing Deployment Issues"
echo ""

# 1. Kill port 3001 if in use
echo "1. Checking port 3001..."
if lsof -ti:3001 >/dev/null 2>&1; then
    echo "   Killing process on port 3001..."
    lsof -ti:3001 | xargs kill -9
    echo "   ✅ Port 3001 freed"
else
    echo "   ✅ Port 3001 is available"
fi
echo ""

# 2. Fix Supabase migration
echo "2. Fixing Supabase migration..."
echo "   Option A: Pull remote migrations"
echo "   Run: supabase db pull"
echo ""
echo "   Option B: Run migration manually"
echo "   Go to Supabase Dashboard → SQL Editor"
echo "   Copy SQL from: supabase/migrations/20250111000001_create_telemetry_events.sql"
echo "   Paste and click Run"
echo ""

# 3. Build with increased memory
echo "3. Ready to build with increased memory..."
echo "   Run: pnpm run build"
echo "   (Memory limit increased to 4GB)"
echo ""

echo "✅ Quick fixes applied!"
echo ""
echo "Next steps:"
echo "  1. Fix Supabase migration (see above)"
echo "  2. Run: pnpm run build"
echo "  3. Test: pnpm run dev"

