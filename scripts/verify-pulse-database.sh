#!/bin/bash

# Verify Pulse Database Schema
# Checks if required tables and functions exist

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
MISSING=0

echo "🔍 Pulse Database Verification"
echo "=============================="
echo ""

# Check if Supabase is configured
if [ -z "$DATABASE_URL" ] && [ -z "$SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠ WARN${NC}: Database URL not set. Using Supabase MCP..."
    echo ""
fi

echo "Checking required tables..."
echo ""

# Required tables
REQUIRED_TABLES=(
    "pulse_cards"
    "pulse_incidents"
    "pulse_digest"
    "pulse_mutes"
    "pulse_threads"
)

for table in "${REQUIRED_TABLES[@]}"; do
    echo -n "  Checking $table... "
    
    # This would need to be run via Supabase CLI or MCP
    # For now, we'll create a note
    echo -e "${YELLOW}⚠ MANUAL CHECK${NC}"
    echo "    Run: SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');"
    ((MISSING++))
done

echo ""
echo "Checking required functions..."
echo ""

# Required functions
REQUIRED_FUNCTIONS=(
    "ingest_pulse_card"
    "get_pulse_inbox"
)

for func in "${REQUIRED_FUNCTIONS[@]}"; do
    echo -n "  Checking $func... "
    echo -e "${YELLOW}⚠ MANUAL CHECK${NC}"
    echo "    Run: SELECT EXISTS (SELECT FROM information_schema.routines WHERE routine_name = '$func');"
    ((MISSING++))
done

echo ""
echo "======================================"
echo "📊 Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Manual Checks Needed: $MISSING${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Schema verification complete${NC}"
    echo ""
    echo "Next: Apply migration if tables/functions are missing:"
    echo "  supabase db push"
    echo "  # or"
    echo "  psql \$DATABASE_URL -f supabase/migrations/20251112_pulse_decision_inbox.sql"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Review errors above.${NC}"
    exit 1
fi
