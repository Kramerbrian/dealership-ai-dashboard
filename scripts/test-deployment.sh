#!/bin/bash

# Test Deployment Script
# Tests critical pages after deployment

set -e

echo "🧪 Testing Deployment Pages"
echo ""

# Get the deployment URL
DEPLOYMENT_URL="${1:-https://dealership-ai-dashboard.vercel.app}"

echo "📊 Testing deployment: $DEPLOYMENT_URL"
echo ""

# Test pages
PAGES=(
  "/"
  "/sign-in"
  "/sign-up"
  "/privacy"
  "/terms"
)

PASSED=0
FAILED=0

for page in "${PAGES[@]}"; do
  URL="${DEPLOYMENT_URL}${page}"
  echo -n "Testing ${page}... "
  
  if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200\|301\|302"; then
    echo "✅ OK"
    ((PASSED++))
  else
    echo "❌ FAILED"
    ((FAILED++))
  fi
done

echo ""
echo "📊 Results:"
echo "  ✅ Passed: $PASSED"
echo "  ❌ Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo "🎉 All pages accessible!"
  exit 0
else
  echo ""
  echo "⚠️  Some pages failed. Check deployment logs."
  exit 1
fi

