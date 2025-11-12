#!/bin/bash

# Verify Supabase Database Connection

set -e

echo "🔍 Verifying Supabase Connection"
echo "=================================="
echo ""

# Check if linked
echo "📋 Supabase Project Status:"
supabase status 2>&1 | grep -E "API URL|DB URL|Studio URL" || echo "⚠️  Local Supabase not running (this is OK for production)"

echo ""
echo "📋 Remote Database Status:"
supabase migration list --linked 2>&1 | head -10

echo ""
echo "📋 Connection Test:"
# Try to list tables via Supabase CLI
if supabase db remote list 2>&1 | head -5; then
    echo "✅ Supabase connection successful"
else
    echo "⚠️  Connection test failed (may need credentials)"
fi

echo ""
echo "🔗 Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb"
echo ""
echo "📋 Next Steps:"
echo "   1. Verify tables exist in Supabase Table Editor"
echo "   2. Check database connection string in Vercel"
echo "   3. Run migrations if needed: supabase db push"

