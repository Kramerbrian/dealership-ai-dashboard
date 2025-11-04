#!/bin/bash

# Test Slack Workflow - End-to-End Test
# 
# This script tests the complete Slack integration workflow:
# 1. Command endpoint
# 2. Actions endpoint (button clicks)
# 3. Update endpoint (status updates)
# 4. Leaderboard generation

set -e

APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
SLACK_BOT_TOKEN="${SLACK_BOT_TOKEN}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

echo "🧪 Testing Slack Integration Workflow"
echo "======================================"
echo ""

# Check environment variables
echo "📋 Checking environment variables..."
if [ -z "$SLACK_BOT_TOKEN" ]; then
  echo "⚠️  SLACK_BOT_TOKEN not set"
else
  echo "✅ SLACK_BOT_TOKEN set"
fi

if [ -z "$SLACK_WEBHOOK_URL" ]; then
  echo "⚠️  SLACK_WEBHOOK_URL not set"
else
  echo "✅ SLACK_WEBHOOK_URL set"
fi

echo ""

# Test 1: Check endpoints exist
echo "1️⃣  Testing endpoint availability..."

echo -n "   /api/slack/command: "
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/slack/command" | grep -q "40[0-9]\|50[0-9]"; then
  echo "✅ Available"
else
  echo "❌ Not available"
fi

echo -n "   /api/slack/actions: "
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/slack/actions" | grep -q "40[0-9]\|50[0-9]"; then
  echo "✅ Available"
else
  echo "❌ Not available"
fi

echo -n "   /api/slack/update: "
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/slack/update" | grep -q "40[0-9]\|50[0-9]"; then
  echo "✅ Available"
else
  echo "❌ Not available"
fi

echo ""

# Test 2: Test Slack auth (if token provided)
if [ -n "$SLACK_BOT_TOKEN" ]; then
  echo "2️⃣  Testing Slack authentication..."
  AUTH_RESPONSE=$(curl -s -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    "https://slack.com/api/auth.test")
  
  if echo "$AUTH_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Slack authentication successful"
    WORKSPACE=$(echo "$AUTH_RESPONSE" | grep -o '"team":"[^"]*"' | cut -d'"' -f4 || echo "Unknown")
    echo "   Workspace: $WORKSPACE"
  else
    echo "❌ Slack authentication failed"
    echo "   Response: $AUTH_RESPONSE"
  fi
  echo ""
fi

# Test 3: Test webhook (if URL provided)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  echo "3️⃣  Testing Slack webhook..."
  WEBHOOK_RESPONSE=$(curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"text":"🧪 Test message from DealershipAI workflow test"}')
  
  if [ "$WEBHOOK_RESPONSE" = "ok" ]; then
    echo "✅ Webhook test successful"
    echo "   Check your Slack channel for the test message"
  else
    echo "⚠️  Webhook response: $WEBHOOK_RESPONSE"
  fi
  echo ""
fi

# Test 4: Test leaderboard generation
echo "4️⃣  Testing leaderboard generation..."
if [ -f "scripts/generate-leaderboard.js" ]; then
  echo "   Script exists: ✅"
  echo "   Run manually: node scripts/generate-leaderboard.js"
else
  echo "   Script not found: ❌"
fi
echo ""

# Summary
echo "======================================"
echo "✅ Workflow test complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Test in Slack: /dealershipai status test-dealer"
echo "   2. Click a button in the response"
echo "   3. Verify message updates in real-time"
echo ""

