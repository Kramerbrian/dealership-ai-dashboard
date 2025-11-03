#!/bin/bash

# Post-Deployment Verification Script
# Run this after deploying to verify everything is working

echo "🔍 Post-Deployment Verification"
echo "=============================="
echo ""

PRODUCTION_URL="${1:-https://dealershipai.com}"

echo "Testing: $PRODUCTION_URL"
echo ""

# Health check
echo "1️⃣  Health Check:"
HEALTH_RESPONSE=$(curl -s "$PRODUCTION_URL/api/health" 2>/dev/null)
if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
  echo "   ✅ Health check passing"
  echo "   Response: $(echo $HEALTH_RESPONSE | jq -r '.message' 2>/dev/null || echo 'OK')"
else
  echo "   ❌ Health check failing"
  echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Check if site is accessible
echo "2️⃣  Site Accessibility:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Site accessible (HTTP $HTTP_CODE)"
else
  echo "   ⚠️  Site returned HTTP $HTTP_CODE"
fi
echo ""

# Check SSL
echo "3️⃣  SSL Certificate:"
SSL_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://$PRODUCTION_URL" 2>/dev/null)
if [ "$SSL_CHECK" = "200" ] || [ "$SSL_CHECK" = "301" ] || [ "$SSL_CHECK" = "302" ]; then
  echo "   ✅ SSL certificate valid"
else
  echo "   ⚠️  SSL check returned HTTP $SSL_CHECK"
fi
echo ""

echo "✅ Verification complete!"
echo ""
echo "Next steps:"
echo "  - Check Vercel deployment logs if any issues"
echo "  - Verify Sentry is receiving errors (if configured)"
echo "  - Test authentication flow"
echo "  - Test dashboard functionality"
echo ""

