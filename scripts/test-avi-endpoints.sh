#!/bin/bash

# AVI Endpoints Smoke Test Script
# Tests the AVI API endpoints for functionality

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TENANT_ID="${TENANT_ID:-demo-tenant-123e4567-e89b-12d3-a456-426614174000}"

echo "🧪 AVI Endpoints Smoke Test"
echo "=========================="
echo "Base URL: $BASE_URL"
echo "Tenant ID: $TENANT_ID"
echo ""

# Test 1: Latest AVI Report
echo "1️⃣ Testing latest AVI report..."
LATEST_RESPONSE=$(curl -sS "$BASE_URL/api/tenants/$TENANT_ID/avi/latest" 2>/dev/null || echo '{"error":"Connection failed"}')

if echo "$LATEST_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
    echo "✅ Latest endpoint working"
    echo "   AIV: $(echo "$LATEST_RESPONSE" | jq -r '.data.aiv_pct // "N/A"')"
    echo "   ATI: $(echo "$LATEST_RESPONSE" | jq -r '.data.ati_pct // "N/A"')"
    echo "   CRS: $(echo "$LATEST_RESPONSE" | jq -r '.data.crs_pct // "N/A"')"
    echo "   Elasticity: $(echo "$LATEST_RESPONSE" | jq -r '.data.elasticity_usd_per_point // "N/A"')"
    echo "   R²: $(echo "$LATEST_RESPONSE" | jq -r '.data.r2 // "N/A"')"
    echo "   As of: $(echo "$LATEST_RESPONSE" | jq -r '.data.as_of // "N/A"')"
else
    echo "❌ Latest endpoint failed"
    echo "   Response: $LATEST_RESPONSE"
fi

echo ""

# Test 2: AVI History
echo "2️⃣ Testing AVI history..."
HISTORY_RESPONSE=$(curl -sS "$BASE_URL/api/tenants/$TENANT_ID/avi/history?limit=4" 2>/dev/null || echo '{"error":"Connection failed"}')

if echo "$HISTORY_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
    DATA_LENGTH=$(echo "$HISTORY_RESPONSE" | jq '.data | length')
    NEXT_CURSOR=$(echo "$HISTORY_RESPONSE" | jq -r '.nextCursor // "null"')
    echo "✅ History endpoint working"
    echo "   Records returned: $DATA_LENGTH"
    echo "   Next cursor: $NEXT_CURSOR"
    
    if [ "$DATA_LENGTH" -gt 0 ]; then
        echo "   Sample data:"
        echo "$HISTORY_RESPONSE" | jq -r '.data[0] | "     AIV: \(.aiv_pct), ATI: \(.ati_pct), Date: \(.as_of)"'
    fi
else
    echo "❌ History endpoint failed"
    echo "   Response: $HISTORY_RESPONSE"
fi

echo ""

# Test 3: Cron Job (if accessible)
echo "3️⃣ Testing cron job endpoint..."
CRON_RESPONSE=$(curl -sS "$BASE_URL/api/internal/cron/compute-avi" 2>/dev/null || echo '{"error":"Connection failed"}')

if echo "$CRON_RESPONSE" | jq -e '.ok' > /dev/null 2>&1; then
    echo "✅ Cron endpoint accessible"
    echo "   Status: $(echo "$CRON_RESPONSE" | jq -r '.ok')"
    echo "   Processed: $(echo "$CRON_RESPONSE" | jq -r '.processed // "N/A"')"
else
    echo "⚠️  Cron endpoint not accessible (expected in production)"
    echo "   Response: $CRON_RESPONSE"
fi

echo ""

# Test 4: Data Validation
echo "4️⃣ Validating data structure..."
if echo "$LATEST_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
    REQUIRED_FIELDS=("aiv_pct" "ati_pct" "crs_pct" "elasticity_usd_per_point" "r2" "as_of")
    MISSING_FIELDS=()
    
    for field in "${REQUIRED_FIELDS[@]}"; do
        if ! echo "$LATEST_RESPONSE" | jq -e ".data.$field" > /dev/null 2>&1; then
            MISSING_FIELDS+=("$field")
        fi
    done
    
    if [ ${#MISSING_FIELDS[@]} -eq 0 ]; then
        echo "✅ All required fields present"
    else
        echo "❌ Missing required fields: ${MISSING_FIELDS[*]}"
    fi
else
    echo "⚠️  Cannot validate data structure (no data available)"
fi

echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
if echo "$LATEST_RESPONSE" | jq -e '.data' > /dev/null 2>&1 && echo "$HISTORY_RESPONSE" | jq -e '.data' > /dev/null 2>&1; then
    echo "🎉 All AVI endpoints are working correctly!"
    echo ""
    echo "Next steps:"
    echo "1. Integrate AviHeader component into your dashboard"
    echo "2. Set up the cron job in production"
    echo "3. Configure tenant context middleware"
    echo "4. Add proper error handling and monitoring"
else
    echo "⚠️  Some endpoints are not working properly"
    echo "   Check the error messages above and ensure:"
    echo "   - Database migration has been run"
    echo "   - Environment variables are configured"
    echo "   - Supabase connection is working"
    echo "   - Tenant ID is valid"
fi

echo ""
echo "🔗 Useful commands:"
echo "   Test latest: curl -sS \"$BASE_URL/api/tenants/$TENANT_ID/avi/latest\" | jq"
echo "   Test history: curl -sS \"$BASE_URL/api/tenants/$TENANT_ID/avi/history?limit=4\" | jq"
echo "   Run cron: curl -sS \"$BASE_URL/api/internal/cron/compute-avi\" | jq"
