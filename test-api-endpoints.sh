#!/bin/bash

# API Endpoint Testing Script
# Tests all the new API endpoints to verify they're working correctly

echo "╔═══════════════════════════════════════════╗"
echo "║  API Endpoint Testing Script              ║"
echo "║  DealershipAI Platform                    ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Configuration
API_BASE_URL="http://localhost:3001"
AUTH_TOKEN="${CLERK_AUTH_TOKEN}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s "$API_BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running at $API_BASE_URL${NC}"
    echo "Please start the development server with: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Check if auth token is provided
if [ -z "$AUTH_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  No CLERK_AUTH_TOKEN environment variable found${NC}"
    echo "To test authenticated endpoints, set CLERK_AUTH_TOKEN:"
    echo "export CLERK_AUTH_TOKEN='your_clerk_session_token'"
    echo ""
    echo "You can get this token from:"
    echo "1. Open your browser's Developer Tools"
    echo "2. Go to Application > Cookies"
    echo "3. Find the __session cookie"
    echo ""
    USE_AUTH="false"
else
    echo -e "${GREEN}✅ Auth token found${NC}"
    USE_AUTH="true"
fi
echo ""

# Function to make API request
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧪 Testing: $description"
    echo "   Method: $method"
    echo "   Endpoint: $endpoint"
    echo ""

    if [ "$USE_AUTH" = "true" ]; then
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" \
                -X "$method" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                "$API_BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" \
                -X "$method" \
                -H "Authorization: Bearer $AUTH_TOKEN" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_BASE_URL$endpoint")
        fi
    else
        if [ -z "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" \
                -X "$method" \
                -H "Content-Type: application/json" \
                "$API_BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" \
                -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_BASE_URL$endpoint")
        fi
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    elif [ "$http_code" -eq 401 ]; then
        echo -e "${YELLOW}⚠️  Unauthorized (HTTP $http_code)${NC}"
        echo "This endpoint requires authentication"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Test Dealerships Endpoints
echo "═══════════════════════════════════════════"
echo "  Testing Dealerships API"
echo "═══════════════════════════════════════════"
echo ""

make_request "GET" "/api/dealerships" "" "Get all dealerships"

make_request "GET" "/api/dealerships?limit=5" "" "Get dealerships with limit"

# Test Audits Endpoints
echo ""
echo "═══════════════════════════════════════════"
echo "  Testing Audits API"
echo "═══════════════════════════════════════════"
echo ""

make_request "GET" "/api/audits" "" "Get all audits"

make_request "GET" "/api/audits?limit=5" "" "Get audits with limit"

# Test Recommendations Endpoints
echo ""
echo "═══════════════════════════════════════════"
echo "  Testing Recommendations API"
echo "═══════════════════════════════════════════"
echo ""

make_request "GET" "/api/recommendations" "" "Get all recommendations"

make_request "GET" "/api/recommendations?status=pending" "" "Get pending recommendations"

make_request "GET" "/api/recommendations?priority=high" "" "Get high priority recommendations"

# Summary
echo ""
echo "═══════════════════════════════════════════"
echo "  Test Summary"
echo "═══════════════════════════════════════════"
echo ""

if [ "$USE_AUTH" = "false" ]; then
    echo -e "${YELLOW}⚠️  Tests ran without authentication${NC}"
    echo "For full testing, export your Clerk auth token:"
    echo "export CLERK_AUTH_TOKEN='your_token_here'"
    echo ""
fi

echo "✅ Testing complete!"
echo ""
echo "Next steps:"
echo "1. Check the responses above for any errors"
echo "2. Verify that data is being returned correctly"
echo "3. Test POST/PATCH/DELETE operations manually"
echo "4. Run the RLS test suite: npx ts-node test-rls-policies.ts"
echo ""
