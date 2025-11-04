#!/bin/bash

# Extract Upstash Redis REST API Credentials
# Uses the database info from Upstash CLI

echo "🔍 Extracting Upstash Redis Credentials"
echo "========================================"
echo ""

# Get database info
DB_INFO=$(upstash redis get dealershipAI 2>/dev/null)

if [ -z "$DB_INFO" ]; then
  echo "❌ Could not get database info"
  echo "   Make sure you're logged in: upstash auth login"
  exit 1
fi

# Extract endpoint (handle different formats)
ENDPOINT=$(echo "$DB_INFO" | grep -i "endpoint" | awk '{print $NF}' | tr -d '[:space:]')
PASSWORD=$(echo "$DB_INFO" | grep -i "password" | awk '{print $NF}' | tr -d '[:space:]')

# Try alternative parsing if first attempt failed
if [ -z "$ENDPOINT" ]; then
  ENDPOINT=$(echo "$DB_INFO" | grep -E "endpoint|Endpoint" | sed 's/.*endpoint[[:space:]]*//' | awk '{print $1}' | tr -d '[:space:]')
fi

if [ -z "$ENDPOINT" ]; then
  echo "⚠️  Could not extract endpoint from CLI output"
  echo ""
  echo "📋 Database found: dealershipAI"
  echo ""
  echo "🔑 Get REST API credentials from console:"
  echo "   1. Go to: https://console.upstash.com/redis/detail/dealershipAI"
  echo "   2. Click 'REST API' tab"
  echo "   3. Copy REST URL and REST Token"
  echo ""
  exit 0
fi

echo "✅ Found database: dealershipAI"
echo ""
echo "📋 Database Info:"
echo "   Endpoint: $ENDPOINT"
echo "   Port: 6379 (Redis protocol)"
echo ""
echo "🔑 REST API Credentials:"
echo ""
echo "   The Upstash CLI shows the regular Redis endpoint, but for"
echo "   background jobs (BullMQ), you need the REST API credentials."
echo ""
echo "📝 Get REST API credentials from console:"
echo ""
echo "   1. Go to: https://console.upstash.com/"
echo "   2. Select database: dealershipAI"
echo "   3. Click 'REST API' tab"
echo "   4. Copy:"
echo "      REST URL: https://$ENDPOINT"
echo "      REST Token: (click 'Show' to reveal)"
echo ""
echo "   OR use the REST API endpoint directly:"
echo "   REST URL: https://$ENDPOINT"
echo ""
echo "💡 Add to Vercel:"
echo ""
echo "   UPSTASH_REDIS_REST_URL=https://$ENDPOINT"
echo "   UPSTASH_REDIS_REST_TOKEN=<get-from-console>"
echo ""
echo "========================================"
echo ""
echo "🔗 Quick Links:"
echo "   Console: https://console.upstash.com/redis/detail/dealershipAI"
echo "   Vercel: https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo ""

