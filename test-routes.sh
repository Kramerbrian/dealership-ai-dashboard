#!/bin/bash

# Quick test script for migrated routes
# Usage: ./test-routes.sh [TOKEN]

TOKEN="${1:-test-token}"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🧪 Testing Migrated API Routes"
echo "================================"
echo ""

# Test 1: Public Health Endpoint
echo "1. Testing GET /api/health (Public)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/health")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ PASS (Status: $HTTP_CODE)"
else
  echo "   ❌ FAIL (Status: $HTTP_CODE)"
fi
echo ""

# Test 2: Validation Error (should return 400)
echo "2. Testing POST /api/analyze with invalid data (should return 400)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"revenue":-100,"marketSize":"invalid"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ PASS (Validation working - Status: $HTTP_CODE)"
else
  echo "   ⚠️  Status: $HTTP_CODE (Expected 400)"
fi
echo ""

# Test 3: Valid Request (should return 200)
echo "3. Testing POST /api/analyze with valid data"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"revenue":100000,"marketSize":"medium","competition":"moderate","visibility":75}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ PASS (Status: $HTTP_CODE)"
else
  echo "   ❌ FAIL (Status: $HTTP_CODE)"
fi
echo ""

# Test 4: Authenticated Route (should return 401 without auth)
echo "4. Testing GET /api/user/profile without auth (should return 401)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/user/profile")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "401" ]; then
  echo "   ✅ PASS (Auth check working - Status: $HTTP_CODE)"
else
  echo "   ⚠️  Status: $HTTP_CODE (Expected 401)"
fi
echo ""

# Test 5: Query Parameter Validation
echo "5. Testing GET /api/ai/visibility-index with invalid query (should return 400)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/ai/visibility-index")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ PASS (Query validation working - Status: $HTTP_CODE)"
else
  echo "   ⚠️  Status: $HTTP_CODE (Expected 400)"
fi
echo ""

# Test 6: Valid Query Parameter
echo "6. Testing GET /api/ai/visibility-index with valid query"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/ai/visibility-index?domain=test.com")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ PASS (Status: $HTTP_CODE)"
else
  echo "   ⚠️  Status: $HTTP_CODE"
fi
echo ""

echo "================================"
echo "✅ Basic tests complete!"
echo ""
echo "Note: For full testing with authentication, provide a valid token:"
echo "  ./test-routes.sh YOUR_AUTH_TOKEN"
