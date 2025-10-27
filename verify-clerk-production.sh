#!/bin/bash

# Clerk Production Verification Script

echo "🔍 Verifying Clerk production setup..."

# Check if running in keyless mode
echo "Checking for keyless mode warnings..."

# Test the production URL
PROD_URL="https://dealershipai.com"

echo "Testing production URL: $PROD_URL"

# Check for Clerk warnings in the response
response=$(curl -s "$PROD_URL" | grep -i "keyless\|development\|test")

if [ -n "$response" ]; then
  echo "❌ Still seeing keyless/development warnings"
  echo "Response: $response"
else
  echo "✅ No keyless mode warnings detected"
fi

echo "✅ Verification complete!"
