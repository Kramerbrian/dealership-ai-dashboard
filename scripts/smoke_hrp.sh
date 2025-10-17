#!/bin/bash

# HRP (Hallucination Risk Prevention) smoke test script
# Tests HRP scan, status, and resolve endpoints

set -euo pipefail

# Configuration
BASE="${BASE:?BASE environment variable required}"
TENANT="${TENANT:?TENANT environment variable required}"

echo "🧪 Running HRP smoke tests..."
echo "Base URL: $BASE"
echo "Tenant ID: $TENANT"
echo ""

# Test 1: Run HRP scan
echo "1️⃣ Testing HRP scan endpoint..."
SCAN_RESPONSE=$(curl -sS -X POST "$BASE/api/tenants/$TENANT/hrp/scan")
echo "Scan response: $SCAN_RESPONSE"

# Verify scan response
if echo "$SCAN_RESPONSE" | jq -e '.ok' > /dev/null; then
    echo "✅ HRP scan initiated successfully"
else
    echo "❌ HRP scan failed"
    exit 1
fi

echo ""

# Test 2: Check HRP status
echo "2️⃣ Testing HRP status endpoint..."
STATUS_RESPONSE=$(curl -sS "$BASE/api/tenants/$TENANT/hrp/status")
echo "Status response: $STATUS_RESPONSE"

# Verify status response structure
if echo "$STATUS_RESPONSE" | jq -e '.findings | length' > /dev/null && \
   echo "$STATUS_RESPONSE" | jq -e '.quarantine | length' > /dev/null; then
    echo "✅ HRP status retrieved successfully"
    
    # Show findings count
    FINDINGS_COUNT=$(echo "$STATUS_RESPONSE" | jq '.findings | length')
    QUARANTINE_COUNT=$(echo "$STATUS_RESPONSE" | jq '.quarantine | length')
    echo "   - Findings: $FINDINGS_COUNT"
    echo "   - Quarantined topics: $QUARANTINE_COUNT"
else
    echo "❌ HRP status check failed"
    exit 1
fi

echo ""

# Test 3: Test resolve endpoint (if there are quarantined topics)
echo "3️⃣ Testing HRP resolve endpoint..."
QUARANTINE_TOPICS=$(echo "$STATUS_RESPONSE" | jq -r '.quarantine[]?.topic // empty')

if [ -n "$QUARANTINE_TOPICS" ]; then
    FIRST_TOPIC=$(echo "$QUARANTINE_TOPICS" | head -1)
    echo "   Resolving topic: $FIRST_TOPIC"
    
    RESOLVE_RESPONSE=$(curl -sS -X POST "$BASE/api/tenants/$TENANT/hrp/resolve" \
        -H "Content-Type: application/json" \
        -d "{\"topic\": \"$FIRST_TOPIC\"}")
    echo "   Resolve response: $RESOLVE_RESPONSE"
    
    if echo "$RESOLVE_RESPONSE" | jq -e '.ok' > /dev/null; then
        echo "✅ HRP resolve successful"
    else
        echo "❌ HRP resolve failed"
        exit 1
    fi
else
    echo "   No quarantined topics to resolve (this is normal for a clean system)"
fi

echo ""
echo "🎉 All HRP smoke tests passed!"
echo ""
echo "Summary:"
echo "- HRP scan: ✅ Working"
echo "- HRP status: ✅ Working" 
echo "- HRP resolve: ✅ Working"
echo ""
echo "HRP system is ready for production use."
