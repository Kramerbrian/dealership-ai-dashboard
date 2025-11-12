#!/bin/bash

# Test both domains for functionality

set -e

echo "🌐 Testing DealershipAI Domains"
echo "================================"
echo ""

# Test dealershipai.com
echo "📋 Testing dealershipai.com"
echo "----------------------------"
status=$(curl -s -o /dev/null -w "%{http_code}" https://dealershipai.com)
if [ "$status" = "200" ]; then
    echo "✅ HTTP Status: $status (OK)"
else
    echo "❌ HTTP Status: $status (ERROR)"
fi

# Test dash.dealershipai.com
echo ""
echo "📋 Testing dash.dealershipai.com"
echo "--------------------------------"
status=$(curl -s -o /dev/null -w "%{http_code}" https://dash.dealershipai.com)
if [ "$status" = "200" ]; then
    echo "✅ HTTP Status: $status (OK)"
else
    echo "❌ HTTP Status: $status (ERROR)"
fi

# Test health endpoints
echo ""
echo "📋 Testing Health Endpoints"
echo "---------------------------"
health1=$(curl -s https://dealershipai.com/api/health | jq -r '.status' 2>&1 || echo "error")
health2=$(curl -s https://dash.dealershipai.com/api/health | jq -r '.status' 2>&1 || echo "error")

if [ "$health1" = "healthy" ] || [ "$health1" = "unhealthy" ]; then
    echo "✅ dealershipai.com/api/health: $health1"
else
    echo "❌ dealershipai.com/api/health: $health1"
fi

if [ "$health2" = "healthy" ] || [ "$health2" = "unhealthy" ]; then
    echo "✅ dash.dealershipai.com/api/health: $health2"
else
    echo "❌ dash.dealershipai.com/api/health: $health2"
fi

# Check for HTML content
echo ""
echo "📋 Checking HTML Content"
echo "------------------------"
title1=$(curl -s https://dealershipai.com | grep -o "<title>.*</title>" | head -1 || echo "not found")
title2=$(curl -s https://dash.dealershipai.com | grep -o "<title>.*</title>" | head -1 || echo "not found")

if echo "$title1" | grep -q "DealershipAI"; then
    echo "✅ dealershipai.com: $title1"
else
    echo "⚠️  dealershipai.com: $title1"
fi

if echo "$title2" | grep -q "DealershipAI"; then
    echo "✅ dash.dealershipai.com: $title2"
else
    echo "⚠️  dash.dealershipai.com: $title2"
fi

echo ""
echo "📊 Summary"
echo "----------"
echo "If all tests pass but pages don't load in browser:"
echo "1. Check browser console (F12) for JavaScript errors"
echo "2. Try incognito/private mode"
echo "3. Clear browser cache"
echo "4. Check Vercel logs: npx vercel logs --follow"

