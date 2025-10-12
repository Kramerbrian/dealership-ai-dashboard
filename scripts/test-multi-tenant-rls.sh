#!/bin/bash

# Multi-Tenant RLS Testing Script
# DealershipAI Command Center

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🧪 Multi-Tenant RLS Testing Suite"
echo "==================================="
echo ""

# Check if dev server is running
check_server() {
  echo -e "${YELLOW}Checking if dev server is running...${NC}"
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Dev server is running${NC}"
    return 0
  else
    echo -e "${RED}❌ Dev server is not running${NC}"
    echo ""
    echo "Start dev server in another terminal:"
    echo "  npm run dev"
    echo ""
    return 1
  fi
}

# Test 1: Multi-Tenant Middleware
test_middleware() {
  echo ""
  echo -e "${BLUE}Test 1: Multi-Tenant Middleware${NC}"
  echo "=================================="
  echo ""

  if ! check_server; then
    return 1
  fi

  echo -e "${YELLOW}Testing middleware tenant detection...${NC}"
  echo ""

  # Test 1a: Default tenant
  echo "1a. Testing default tenant (no subdomain, no path):"
  RESPONSE=$(curl -sI http://localhost:3000/dashboard 2>&1)
  TENANT=$(echo "$RESPONSE" | grep -i "x-tenant:" | cut -d: -f2 | tr -d ' \r\n')

  if [ -z "$TENANT" ]; then
    echo -e "${RED}❌ x-tenant header not found${NC}"
  else
    echo -e "${GREEN}✅ x-tenant: $TENANT${NC}"
    if [ "$TENANT" = "demo-lou-grubbs" ]; then
      echo -e "${GREEN}✅ Default tenant detected correctly${NC}"
    else
      echo -e "${YELLOW}⚠️  Expected 'demo-lou-grubbs', got '$TENANT'${NC}"
    fi
  fi
  echo ""

  # Test 1b: Path-based tenant
  echo "1b. Testing path-based tenant detection:"
  RESPONSE=$(curl -sI http://localhost:3000/acme-motors/dashboard 2>&1)
  TENANT=$(echo "$RESPONSE" | grep -i "x-tenant:" | cut -d: -f2 | tr -d ' \r\n')

  if [ -z "$TENANT" ]; then
    echo -e "${RED}❌ x-tenant header not found${NC}"
  else
    echo -e "${GREEN}✅ x-tenant: $TENANT${NC}"
    if [ "$TENANT" = "acme-motors" ]; then
      echo -e "${GREEN}✅ Path-based tenant detected correctly${NC}"
    else
      echo -e "${YELLOW}⚠️  Expected 'acme-motors', got '$TENANT'${NC}"
    fi
  fi
  echo ""

  # Test 1c: Session header override
  echo "1c. Testing session header override:"
  RESPONSE=$(curl -sI -H "x-tenant: custom-tenant" http://localhost:3000/dashboard 2>&1)
  TENANT=$(echo "$RESPONSE" | grep -i "x-tenant:" | cut -d: -f2 | tr -d ' \r\n')

  if [ -z "$TENANT" ]; then
    echo -e "${RED}❌ x-tenant header not found${NC}"
  else
    echo -e "${GREEN}✅ x-tenant: $TENANT${NC}"
  fi
  echo ""

  echo -e "${GREEN}✅ Middleware tests complete${NC}"
}

# Test 2: RLS Enforcement
test_rls() {
  echo ""
  echo -e "${BLUE}Test 2: RLS Enforcement${NC}"
  echo "========================"
  echo ""

  # Get Supabase URL
  if [ -f .env.local ]; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'"' -f2)
    PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
  elif [ -f .env ]; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | cut -d'"' -f2)
    PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
  else
    echo -e "${RED}❌ .env.local or .env not found${NC}"
    return 1
  fi

  if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Could not extract Supabase project ID${NC}"
    return 1
  fi

  echo -e "${GREEN}✅ Supabase Project ID: $PROJECT_ID${NC}"
  echo ""

  echo "To test RLS enforcement, run these SQL queries in Supabase:"
  echo ""
  echo -e "${YELLOW}1. Open SQL Editor:${NC}"
  echo "   https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
  echo ""
  echo -e "${YELLOW}2. Test RLS with a tenant UUID:${NC}"
  echo ""
  echo "   -- Set tenant context"
  echo "   SELECT set_config('app.tenant', 'YOUR-TENANT-UUID-HERE', true);"
  echo ""
  echo "   -- Query should only return rows for this tenant"
  echo "   SELECT * FROM ati_signals;"
  echo ""
  echo "   -- Try different tenant (should return empty or different rows)"
  echo "   SELECT set_config('app.tenant', 'DIFFERENT-TENANT-UUID', true);"
  echo "   SELECT * FROM ati_signals;"
  echo ""
  echo -e "${YELLOW}3. Verify RLS policies exist:${NC}"
  echo ""
  echo "   SELECT * FROM pg_policies WHERE tablename = 'ati_signals';"
  echo ""

  read -p "Press Enter to continue..."
}

# Test 3: VLI Penalty
test_vli() {
  echo ""
  echo -e "${BLUE}Test 3: VLI Penalty Calculations${NC}"
  echo "=================================="
  echo ""

  if ! check_server; then
    return 1
  fi

  echo -e "${YELLOW}Creating VLI test endpoint...${NC}"

  # Create temporary test endpoint
  cat > app/api/test-vli/route.ts << 'EOF'
import { NextResponse } from 'next/server';
import { vliMultiplier, applyVLIPenalty, calculatePenalizedATI, getPenaltyPercentage } from '@/lib/scoring';

export async function GET() {
  // Test Case 1: No issues
  const test1 = {
    name: 'No issues',
    baseATI: 85,
    issues: [],
    multiplier: vliMultiplier([]),
    penalizedATI: applyVLIPenalty(85, []),
  };

  // Test Case 2: One high severity issue
  const test2Issues = [{ severity: 3 as const }];
  const test2 = {
    name: 'One high severity issue (3)',
    baseATI: 85,
    issues: test2Issues,
    multiplier: vliMultiplier(test2Issues),
    penalizedATI: applyVLIPenalty(85, test2Issues),
    penalty: getPenaltyPercentage(vliMultiplier(test2Issues)),
  };

  // Test Case 3: Multiple issues (like in example)
  const test3Issues = [
    { severity: 3 as const, description: 'Phone number mismatch across 5+ platforms' },
    { severity: 2 as const, description: 'Business hours outdated (6 months old)' },
    { severity: 1 as const, description: 'Minor address formatting difference' },
  ];
  const test3Multiplier = vliMultiplier(test3Issues);
  const test3 = {
    name: 'Multiple issues (3 + 2 + 1)',
    baseATI: 85,
    issues: test3Issues,
    multiplier: test3Multiplier,
    penalizedATI: applyVLIPenalty(85, test3Issues),
    penalty: getPenaltyPercentage(test3Multiplier),
    impactPoints: 85 - applyVLIPenalty(85, test3Issues),
  };

  return NextResponse.json({
    tests: [test1, test2, test3],
    formula: 'VLI Multiplier = 1 + Σ(severity × 0.04)',
    severityWeights: {
      low: '4% penalty',
      medium: '8% penalty',
      high: '12% penalty',
    },
  }, { status: 200 });
}
EOF

  echo -e "${GREEN}✅ Test endpoint created${NC}"
  echo ""
  echo "Waiting 2 seconds for Next.js hot reload..."
  sleep 2
  echo ""

  echo -e "${YELLOW}Testing VLI calculations...${NC}"
  echo ""

  curl -s http://localhost:3000/api/test-vli | jq . || curl -s http://localhost:3000/api/test-vli

  echo ""
  echo ""
  echo -e "${GREEN}✅ VLI penalty tests complete${NC}"
  echo ""
  echo "Cleaning up test endpoint..."
  rm -f app/api/test-vli/route.ts
  echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Test 4: Theme Toggle
test_theme() {
  echo ""
  echo -e "${BLUE}Test 4: Theme Toggle${NC}"
  echo "====================="
  echo ""

  echo -e "${YELLOW}Theme toggle requires browser testing.${NC}"
  echo ""
  echo "Manual test steps:"
  echo ""
  echo "1. Open dashboard:"
  echo "   http://localhost:3000/dashboard"
  echo ""
  echo "2. Look for theme toggle button (Moon/Sun icon)"
  echo ""
  echo "3. Click toggle:"
  echo "   - Should switch between light/dark mode"
  echo "   - No flash or flicker"
  echo ""
  echo "4. Refresh page:"
  echo "   - Theme should persist"
  echo "   - Check localStorage.theme in DevTools"
  echo ""
  echo "5. Clear localStorage:"
  echo "   - localStorage.removeItem('theme')"
  echo "   - Refresh page"
  echo "   - Should use system preference"
  echo ""

  if check_server; then
    echo -e "${YELLOW}Opening dashboard in browser...${NC}"
    open http://localhost:3000/dashboard 2>/dev/null || \
      echo "Navigate to: http://localhost:3000/dashboard"
  fi

  echo ""
  read -p "Press Enter when theme testing is complete..."
}

# Main test runner
main() {
  echo "Which tests would you like to run?"
  echo ""
  echo "  1) Test middleware (tenant detection)"
  echo "  2) Test RLS enforcement (Supabase SQL)"
  echo "  3) Test VLI penalty calculations"
  echo "  4) Test theme toggle"
  echo "  5) Run all tests"
  echo "  6) Exit"
  echo ""
  read -p "Choose option (1-6): " choice

  case $choice in
    1)
      test_middleware
      ;;
    2)
      test_rls
      ;;
    3)
      test_vli
      ;;
    4)
      test_theme
      ;;
    5)
      test_middleware
      test_rls
      test_vli
      test_theme
      ;;
    6)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo -e "${RED}Invalid option${NC}"
      exit 1
      ;;
  esac

  echo ""
  echo "================================================"
  echo -e "${GREEN}✅ Testing Complete!${NC}"
  echo "================================================"
  echo ""
  echo "Next steps:"
  echo "  - Review test results above"
  echo "  - Fix any failing tests"
  echo "  - Run 'npm run build' to verify production build"
  echo "  - Deploy with './scripts/deploy-ati.sh'"
  echo ""
}

main
