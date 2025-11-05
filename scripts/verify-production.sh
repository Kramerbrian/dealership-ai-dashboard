#!/bin/bash

# Production Deployment Verification Script
# Tests critical endpoints and features

set -e

BASE_URL="https://dealership-ai-dashboard-gm4wob3yq-brian-kramers-projects.vercel.app"

echo "🚀 Production Verification"
echo "Base URL: $BASE_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local url=$2
  local method=${3:-GET}
  local data=${4:-""}
  
  echo -n "Testing $name... "
  
  if [ "$method" = "POST" ]; then
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$url" \
      -H "Content-Type: application/json" \
      -d "$data" 2>&1)
  else
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$url" 2>&1)
  fi
  
  HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
  
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $HTTP_STATUS)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (HTTP $HTTP_STATUS)"
    echo "   Response: ${BODY:0:100}..."
    ((FAILED++))
    return 1
  fi
}

# Run tests
echo -e "${BLUE}📋 Running Production Tests${NC}"
echo ""

# Test 1: Health Check
test_endpoint "Health Check" "$BASE_URL/api/health"

# Test 2: Redis Diagnostics
test_endpoint "Redis Diagnostics" "$BASE_URL/api/diagnostics/redis"

# Test 3: Trial Status (should work without auth)
test_endpoint "Trial Status" "$BASE_URL/api/trial/status"

# Test 4: Pricing Page (should return HTML)
echo -n "Testing Pricing Page... "
PRICING_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/pricing" 2>&1)
PRICING_STATUS=$(echo "$PRICING_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
if [ "$PRICING_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC} (HTTP $PRICING_STATUS)"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC} (HTTP $PRICING_STATUS)"
  ((FAILED++))
fi

# Test 5: Dashboard Page (should return HTML)
echo -n "Testing Dashboard Page... "
DASH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/dashboard" 2>&1)
DASH_STATUS=$(echo "$DASH_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
if [ "$DASH_STATUS" = "200" ] || [ "$DASH_STATUS" = "401" ] || [ "$DASH_STATUS" = "302" ]; then
  echo -e "${GREEN}✅ PASS${NC} (HTTP $DASH_STATUS - auth may be required)"
  ((PASSED++))
else
  echo -e "${RED}❌ FAIL${NC} (HTTP $DASH_STATUS)"
  ((FAILED++))
fi

# Summary
echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Verify environment variables in Vercel"
  echo "  2. Test pricing page feature toggles manually"
  echo "  3. Test dashboard drawer guards manually"
  echo "  4. Check Supabase database for trial records"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed${NC}"
  echo ""
  echo "Common issues:"
  echo "  - Environment variables not set in Vercel"
  echo "  - Supabase migration not applied"
  echo "  - Authentication required for some endpoints"
  exit 1
fi
