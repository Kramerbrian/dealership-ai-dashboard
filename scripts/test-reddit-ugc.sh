#!/bin/bash
# Test Reddit UGC API endpoint

echo "Testing Reddit UGC API..."
echo ""

# Test with a sample dealership
DEALERSHIP="Germain Toyota"
LOCATION="Naples FL"

echo "Testing: $DEALERSHIP in $LOCATION"
echo ""

curl -X GET "http://localhost:3000/api/ugc/reddit?dealershipName=$(echo -n "$DEALERSHIP" | jq -sRr @uri)&location=$(echo -n "$LOCATION" | jq -sRr @uri)&limit=10" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ Test complete"

