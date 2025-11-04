#!/bin/bash

# Execute SQL queries using Supabase CLI
# Since Supabase CLI doesn't support direct SQL execution,
# this script provides the best available alternatives

set -e

echo "🔧 Supabase CLI SQL Execution Helper"
echo "===================================="
echo ""

# Check which query to run
QUERY_TYPE="${1:-both}"

if [ "$QUERY_TYPE" = "policy" ] || [ "$QUERY_TYPE" = "both" ]; then
    echo "📋 Query 1: RLS Policy Optimization Check"
    echo "----------------------------------------"
    cat scripts/run-policy-check.sql
    echo ""
    echo "🔗 Copy above query and run in: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"
    echo ""
fi

if [ "$QUERY_TYPE" = "index" ] || [ "$QUERY_TYPE" = "both" ]; then
    echo "📋 Query 2: Index Count Check"
    echo "----------------------------"
    cat scripts/run-index-check.sql
    echo ""
    echo "🔗 Copy above query and run in: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new"
    echo ""
fi

echo "⚠️  Note: Supabase CLI doesn't support direct SQL execution"
echo "✅ Recommended: Use Supabase SQL Editor (link above)"
echo ""
echo "Alternative: Try using psql with connection pooler:"
echo "  psql \"postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres\" -f scripts/run-policy-check.sql"

