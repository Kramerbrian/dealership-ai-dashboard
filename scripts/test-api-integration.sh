#!/bin/bash

echo "🧪 Testing DealershipAI Dashboard API Integration"
echo "=================================================="
echo ""

# Base URL for API testing
BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local endpoint=$2
  local expected_status=${3:-200}

  echo -n "Testing $name... "

  response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    PASSED=$((PASSED + 1))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $http_code)"
    FAILED=$((FAILED + 1))
    return 1
  fi
}

# Check if server is running
echo "Checking if development server is running..."
if ! curl -s "$BASE_URL/api/health" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Development server is not running!${NC}"
  echo "Please start the server with: npm run dev"
  exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Run API tests
echo "Running API endpoint tests..."
echo "-----------------------------"

test_endpoint "Health Check" "/api/health"
test_endpoint "Dashboard Overview" "/api/dashboard/overview?dealerId=lou-grubbs-motors&timeRange=30d"
test_endpoint "AI Visibility Index" "/api/ai/visibility-index?dealerId=lou-grubbs-motors"
test_endpoint "Website Performance" "/api/dashboard/website?dealerId=lou-grubbs-motors"
test_endpoint "Schema Data" "/api/dashboard/schema?dealerId=lou-grubbs-motors"
test_endpoint "Reviews Data" "/api/dashboard/reviews?dealerId=lou-grubbs-motors"

echo ""
echo "Testing API data structure..."
echo "-----------------------------"

# Test dashboard overview data structure
response=$(curl -s "$BASE_URL/api/dashboard/overview?dealerId=lou-grubbs-motors&timeRange=30d")

if echo "$response" | jq -e '.aiVisibility.score' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PASSED${NC} - Dashboard overview has AI visibility score"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED${NC} - Dashboard overview missing AI visibility score"
  FAILED=$((FAILED + 1))
fi

if echo "$response" | jq -e '.revenue.monthly' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PASSED${NC} - Dashboard overview has revenue data"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED${NC} - Dashboard overview missing revenue data"
  FAILED=$((FAILED + 1))
fi

if echo "$response" | jq -e '.recommendations' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ PASSED${NC} - Dashboard overview has recommendations"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}✗ FAILED${NC} - Dashboard overview missing recommendations"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "Test Summary"
echo "============"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
