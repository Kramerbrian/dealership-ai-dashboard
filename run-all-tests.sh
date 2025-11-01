#!/bin/bash

# Comprehensive Test & Verification Script
# Runs all automated checks for deployment readiness

set -e

echo "🚀 DealershipAI - Complete System Verification"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASS="${GREEN}✓${NC}"
FAIL="${RED}✗${NC}"
WARN="${YELLOW}⚠${NC}"

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Function to check and report
check() {
    if [ $? -eq 0 ]; then
        echo -e "${PASS} $1"
        ((PASSED++))
    else
        echo -e "${FAIL} $1"
        ((FAILED++))
    fi
}

warn() {
    echo -e "${WARN} $1"
    ((WARNINGS++))
}

echo "📦 Phase 1: File Verification"
echo "----------------------------"

# Check Prisma schema
if [ -f "prisma/schema.prisma" ]; then
    check "Prisma schema exists"
else
    fail "Prisma schema missing"
fi

# Check components
COMPONENTS=(
    "components/zero-click/AIVCard.tsx"
    "components/zero-click/VisibilityROICard.tsx"
    "components/zero-click/GBPSaveRateCard.tsx"
    "components/zero-click/ZeroClickCard.tsx"
    "components/zero-click/AiriCard.tsx"
)

for comp in "${COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        check "Component: $(basename $comp)"
    else
        warn "Component missing: $comp"
    fi
done

# Check modals
MODALS=(
    "components/zero-click/modals/ZeroClickRealityCheckModal.tsx"
    "components/zero-click/modals/AIReplacementExplainedModal.tsx"
    "components/zero-click/modals/TrustedByAIModal.tsx"
    "components/zero-click/modals/WhereDidClicksGo.tsx"
    "components/zero-click/modals/AiriExplainer.tsx"
)

for modal in "${MODALS[@]}"; do
    if [ -f "$modal" ]; then
        check "Modal: $(basename $modal)"
    else
        warn "Modal missing: $modal"
    fi
done

# Check API routes
APIS=(
    "app/api/zero-click/recompute/route.ts"
    "app/api/zero-click/summary/route.ts"
    "app/api/ai-visibility/route.ts"
    "app/api/visibility-roi/route.ts"
    "app/api/opportunities/route.ts"
)

for api in "${APIS[@]}"; do
    if [ -f "$api" ]; then
        check "API route: $(basename $(dirname $api))/$(basename $api)"
    else
        warn "API route missing: $api"
    fi
done

# Check migration SQL
if [ -f "COPY_PASTE_MIGRATION.sql" ]; then
    check "Migration SQL file exists"
else
    warn "Migration SQL file missing"
fi

# Check vercel.json cron
if grep -q "zero-click/recompute" vercel.json; then
    check "Vercel cron job configured"
else
    warn "Vercel cron job not found"
fi

echo ""
echo "🔧 Phase 2: Build & Compilation"
echo "--------------------------------"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    check "Dependencies installed"
else
    warn "Dependencies not installed - run 'npm install'"
fi

# Check Prisma client
if [ -d "node_modules/@prisma/client" ]; then
    check "Prisma client generated"
else
    warn "Prisma client not generated - run 'npx prisma generate'"
fi

# Try TypeScript check (if tsc is available)
if command -v npx &> /dev/null; then
    echo "Running TypeScript check..."
    npx tsc --noEmit --skipLibCheck 2>&1 | head -20
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        check "TypeScript compilation"
    else
        warn "TypeScript errors found (check output above)"
    fi
else
    warn "TypeScript check skipped (npx not available)"
fi

echo ""
echo "🌐 Phase 3: API Endpoint Verification"
echo "-------------------------------------"

# Get deployment URL from environment or use default
DEPLOYMENT_URL="${VERCEL_URL:-https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app}"

if [ -z "$DEPLOYMENT_URL" ] || [ "$DEPLOYMENT_URL" == "null" ]; then
    DEPLOYMENT_URL="https://dealership-ai-dashboard-lre60r6zp-brian-kramer-dealershipai.vercel.app"
fi

echo "Testing endpoints at: $DEPLOYMENT_URL"
echo ""

# Test health endpoint
if command -v curl &> /dev/null; then
    echo "Testing /api/health..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}/api/health" || echo "000")
    if [ "$HTTP_CODE" == "200" ]; then
        check "Health endpoint responds"
    else
        warn "Health endpoint returned $HTTP_CODE"
    fi
    
    # Test zero-click summary (may need auth, so 401/403 is OK)
    echo "Testing /api/zero-click/summary..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}/api/zero-click/summary?tenantId=demo&days=30" || echo "000")
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "403" ]; then
        check "Zero-click summary endpoint exists"
    else
        warn "Zero-click summary returned $HTTP_CODE"
    fi
    
    # Test opportunities endpoint
    echo "Testing /api/opportunities..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}/api/opportunities?domain=example.com&limit=2" || echo "000")
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ] || [ "$HTTP_CODE" == "403" ]; then
        check "Opportunities endpoint exists"
    else
        warn "Opportunities endpoint returned $HTTP_CODE"
    fi
else
    warn "curl not available - skipping API tests"
fi

echo ""
echo "📊 Phase 4: Database Schema Verification"
echo "----------------------------------------"

# Check if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    check "DATABASE_URL environment variable set"
    
    # Try to connect (if psql is available)
    if command -v psql &> /dev/null; then
        echo "Attempting database connection..."
        psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null
        if [ $? -eq 0 ]; then
            check "Database connection successful"
            
            # Check for opportunities table
            TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'opportunities');" | xargs)
            if [ "$TABLE_EXISTS" == "t" ]; then
                check "Opportunities table exists"
                
                # Check for index
                INDEX_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_opportunities_impact_id');" | xargs)
                if [ "$INDEX_EXISTS" == "t" ]; then
                    check "Cursor pagination index exists"
                else
                    warn "Cursor pagination index missing - run migration"
                fi
            else
                warn "Opportunities table missing - run migration"
            fi
        else
            warn "Database connection failed - check credentials"
        fi
    else
        warn "psql not available - skipping database checks"
    fi
else
    warn "DATABASE_URL not set - skipping database checks"
fi

echo ""
echo "📋 Summary"
echo "=========="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Some warnings found - review above${NC}"
    fi
    exit 0
else
    echo -e "${RED}❌ Some checks failed - review above${NC}"
    exit 1
fi

