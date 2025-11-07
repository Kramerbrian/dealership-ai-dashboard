#!/bin/bash

# Quick Setup Script
# Tests health endpoint and helps add webhook

set -e

echo "🚀 DealershipAI Quick Setup"
echo "============================"
echo ""

# Test health endpoint locally
echo "1️⃣  Testing Health Endpoint Locally..."
if [ -f "package.json" ]; then
    echo "   Starting dev server in background..."
    # Check if already running
    if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        npm run dev > /dev/null 2>&1 &
        DEV_PID=$!
        echo "   Waiting for server to start..."
        sleep 5
    fi
    
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "not_available")
    
    if [ "$HEALTH_RESPONSE" != "not_available" ]; then
        echo "   ✅ Health endpoint responding"
        echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
    else
        echo "   ⚠️  Could not test locally (server may not be running)"
        echo "   Run: npm run dev"
    fi
else
    echo "   ⚠️  Not in project directory"
fi

echo ""
echo "2️⃣  Add TELEMETRY_WEBHOOK"
echo "   Choose an option:"
echo ""
echo "   A) Interactive script"
echo "   B) Vercel CLI"
echo "   C) Skip (add manually later)"
echo ""
read -p "   Your choice (A/B/C): " choice

case $choice in
    A|a)
        ./scripts/add-telemetry-webhook.sh
        ;;
    B|b)
        echo ""
        echo "   Get your Slack webhook from:"
        echo "   https://api.slack.com/apps → Your App → Incoming Webhooks"
        echo ""
        read -p "   Enter webhook URL: " webhook
        if [ -n "$webhook" ]; then
            echo "$webhook" | vercel env add TELEMETRY_WEBHOOK production
            echo "   ✅ Added to Vercel"
        fi
        ;;
    C|c)
        echo "   ⏭️  Skipped. Add later with:"
        echo "      vercel env add TELEMETRY_WEBHOOK production"
        ;;
    *)
        echo "   ⏭️  Invalid choice, skipping"
        ;;
esac

echo ""
echo "3️⃣  Verify Environment Variables"
echo ""
vercel env ls production 2>/dev/null | grep -E "(TELEMETRY|CRON_SECRET|MODEL_REGISTRY|API_URL)" || echo "   Run: vercel env ls production"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo "   - Integrate I2E components: app/components/i2e/README.md"
echo "   - Test endpoints: npm run health:check"
echo "   - Monitor: vercel logs [deployment-url]"
echo ""

