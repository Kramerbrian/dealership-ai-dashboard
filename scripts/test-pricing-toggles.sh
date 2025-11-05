#!/bin/bash

# Test Pricing Page Feature Toggles
# Simulates clicking each trial feature button

BASE_URL="${1:-https://dealership-ai-dashboard-gm4wob3yq-brian-kramers-projects.vercel.app}"

echo "🧪 Testing Pricing Page Feature Toggles"
echo "========================================="
echo ""

FEATURES=("schema_fix" "zero_click_drawer" "mystery_shop")
LABELS=("Schema Fix" "Zero-Click Drawer" "Mystery Shop")

for i in "${!FEATURES[@]}"; do
    FEATURE="${FEATURES[$i]}"
    LABEL="${LABELS[$i]}"
    
    echo "Testing: ${LABEL} (${FEATURE})"
    echo "  POST ${BASE_URL}/api/trial/grant"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/trial/grant" \
        -H "Content-Type: application/json" \
        -d "{\"feature_id\": \"${FEATURE}\"}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo "  ✅ Success (${HTTP_CODE})"
        echo "  Response: $(echo "$BODY" | python3 -m json.tool 2>/dev/null | grep -E "(success|feature_id|expires_at)" || echo "$BODY")"
    else
        echo "  ⚠️  Status: ${HTTP_CODE}"
        echo "  Response: $(echo "$BODY" | head -3)"
    fi
    echo ""
done

echo "✅ Feature toggle tests completed"
echo ""
echo "To verify trials are active, check:"
echo "  GET ${BASE_URL}/api/trial/status"

