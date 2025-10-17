#!/bin/bash
# Test script for Policy Apply SSE system

set -euo pipefail

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TENANT_ID="${TENANT_ID:-00000000-0000-0000-0000-000000000000}"

echo "🧪 Testing Policy Apply SSE System"
echo "Base URL: $BASE_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Test 1: Apply policy
echo "1️⃣ Testing policy apply..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/policy/apply" \
  -H "content-type: application/json" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"dryRun\":false}")

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Test 2: Test SSE stream (run for 10 seconds)
echo "2️⃣ Testing SSE stream (10 seconds)..."
timeout 10s curl -s "$BASE_URL/api/policy/apply/stream?tenantId=$TENANT_ID" || true
echo ""

# Test 3: Test gate summary
echo "3️⃣ Testing gate summary..."
curl -s "$BASE_URL/api/gate/summary?tenantId=$TENANT_ID" | jq '.'
echo ""

echo "✅ Policy Apply tests completed!"
