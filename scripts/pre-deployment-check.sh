#!/bin/bash

###############################################################################
# Pre-Deployment Verification Check
# Run this before deploying to ensure everything is ready
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Pre-Deployment Verification Check"
echo "====================================="
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Dependencies
echo -e "${YELLOW}[1/6] Checking dependencies...${NC}"
if grep -q '"@supabase/supabase-js"' package.json && \
   grep -q '"stripe"' package.json && \
   grep -q '"@clerk/nextjs"' package.json; then
  echo -e "${GREEN}✓ All required dependencies installed${NC}"
else
  echo -e "${RED}✗ Missing required dependencies${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 2: Migration file exists
echo -e "${YELLOW}[2/6] Checking migration file...${NC}"
if [ -f "supabase/migrations/20251101000000_acp_plg_integration.sql" ]; then
  echo -e "${GREEN}✓ Migration file exists${NC}"

  # Check migration has required tables
  if grep -q "CREATE TABLE IF NOT EXISTS tenants" supabase/migrations/20251101000000_acp_plg_integration.sql && \
     grep -q "CREATE TABLE IF NOT EXISTS orders" supabase/migrations/20251101000000_acp_plg_integration.sql && \
     grep -q "sync_account_status" supabase/migrations/20251101000000_acp_plg_integration.sql; then
    echo -e "${GREEN}✓ Migration contains required tables and functions${NC}"
  else
    echo -e "${RED}✗ Migration missing required tables or functions${NC}"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo -e "${RED}✗ Migration file not found${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 3: API routes exist
echo -e "${YELLOW}[3/6] Checking API routes...${NC}"
if [ -f "app/api/webhooks/acp/route.ts" ] && \
   [ -f "app/api/checkout/session/route.ts" ] && \
   [ -f "app/api/plg/metrics/route.ts" ] && \
   [ -f "app/api/plg/events/route.ts" ]; then
  echo -e "${GREEN}✓ All required API routes exist${NC}"
else
  echo -e "${RED}✗ Missing required API routes${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# Check 4: Documentation exists
echo -e "${YELLOW}[4/6] Checking documentation...${NC}"
if [ -f "docs/ACP_PLG_INTEGRATION.md" ] && \
   [ -f "ACP_PLG_IMPLEMENTATION_SUMMARY.md" ] && \
   [ -f "ACP_PLG_DEPLOYMENT_CHECKLIST.md" ] && \
   [ -f "IMMEDIATE_DEPLOYMENT_STEPS.md" ]; then
  echo -e "${GREEN}✓ All documentation files exist${NC}"
else
  echo -e "${YELLOW}⚠ Some documentation files missing${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 5: Test script exists
echo -e "${YELLOW}[5/6] Checking test script...${NC}"
if [ -f "scripts/test-acp-plg-integration.sh" ] && [ -x "scripts/test-acp-plg-integration.sh" ]; then
  echo -e "${GREEN}✓ Test script exists and is executable${NC}"
else
  echo -e "${YELLOW}⚠ Test script missing or not executable${NC}"
  WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check 6: Environment variable template
echo -e "${YELLOW}[6/6] Checking environment variables...${NC}"
REQUIRED_VARS=(
  "NEXT_PUBLIC_URL"
  "NEXT_PUBLIC_APP_URL"
  "STRIPE_SECRET_KEY"
  "NEXT_PUBLIC_SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "CLERK_SECRET_KEY"
  "CLERK_PUBLISHABLE_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  echo -e "${GREEN}✓ All core environment variables are set${NC}"
else
  echo -e "${YELLOW}⚠ Missing environment variables (expected for local):${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "These should be set in Vercel for production deployment"
fi
echo ""

# Summary
echo "====================================="
echo "📊 Summary"
echo "====================================="
echo ""

if [ $ERRORS -gt 0 ]; then
  echo -e "${RED}❌ $ERRORS critical error(s) found${NC}"
  echo ""
  echo "Please fix errors before deploying!"
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
  echo ""
  echo "Warnings should be addressed but won't block deployment"
  echo ""
  echo -e "${GREEN}✅ Ready for deployment${NC}"
  exit 0
else
  echo -e "${GREEN}✅ All checks passed!${NC}"
  echo ""
  echo "Ready for deployment! 🚀"
  echo ""
  echo "Next steps:"
  echo "1. Create PR: https://github.com/Kramerbrian/dealership-ai-dashboard/compare/main...feature/orchestrator-diagnostics-ai-scores-clean"
  echo "2. Apply Supabase migration"
  echo "3. Configure webhooks"
  echo "4. Add environment variables to Vercel"
  echo "5. Merge and deploy"
  echo ""
  echo "See: IMMEDIATE_DEPLOYMENT_STEPS.md for detailed instructions"
  exit 0
fi
