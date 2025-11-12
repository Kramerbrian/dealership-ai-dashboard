#!/bin/bash

# Monitor Performance and Analytics

set -e

PROD_URL="https://dash.dealershipai.com"

echo "📊 Performance & Analytics Monitoring"
echo "====================================="
echo ""

echo "🌐 Vercel Analytics:"
echo "   Dashboard: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/analytics"
echo "   - Real-time traffic"
echo "   - Performance metrics"
echo "   - Error rates"
echo ""

echo "🔍 Current Performance:"
echo -n "   Health endpoint: "
start_time=$(date +%s%N)
response=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/health" 2>&1 || echo "000")
end_time=$(date +%s%N)
duration=$(( (end_time - start_time) / 1000000 ))

if [ "$response" = "200" ]; then
    echo "✅ HTTP $response (${duration}ms)"
else
    echo "⚠️  HTTP $response (${duration}ms)"
fi

echo ""
echo "📈 Monitoring Tools:"
echo ""
echo "1. Vercel Analytics (Built-in)"
echo "   - Automatic performance tracking"
echo "   - Real-time metrics"
echo "   - No setup required"
echo ""
echo "2. Sentry (Error Tracking)"
echo "   - Configure: ./scripts/configure-sentry.sh"
echo "   - Dashboard: https://sentry.io"
echo ""
echo "3. PostHog (Optional - Advanced Analytics)"
echo "   - User behavior tracking"
echo "   - Feature flags"
echo "   - Session replay"
echo ""

echo "🔗 Quick Links:"
echo "   - Vercel Dashboard: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard"
echo "   - Vercel Analytics: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/analytics"
echo "   - Sentry: https://sentry.io (if configured)"
echo ""

