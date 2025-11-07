#!/bin/bash

# Add TELEMETRY_WEBHOOK to Vercel
# Usage: ./scripts/add-telemetry-webhook.sh

echo "📤 Adding TELEMETRY_WEBHOOK to Vercel Production"
echo "================================================"
echo ""
echo "Get your Slack webhook URL from:"
echo "  https://api.slack.com/apps → Your App → Incoming Webhooks"
echo ""
read -p "Enter Slack webhook URL (or press Enter to skip): " webhook_url

if [ -z "$webhook_url" ]; then
    echo "⏭️  Skipped. You can add it later with:"
    echo "   vercel env add TELEMETRY_WEBHOOK production"
    exit 0
fi

echo ""
echo "📤 Adding to Vercel..."
echo "$webhook_url" | vercel env add TELEMETRY_WEBHOOK production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully added TELEMETRY_WEBHOOK"
    echo ""
    echo "Test it with:"
    echo "  curl -X POST \$TELEMETRY_WEBHOOK \\"
    echo "    -H 'Content-Type: application/json' \\"
    echo "    -d '{\"text\":\"Test from DealershipAI\"}'"
else
    echo ""
    echo "❌ Failed to add. You may need to:"
    echo "   1. Remove existing: vercel env rm TELEMETRY_WEBHOOK production --yes"
    echo "   2. Add again: vercel env add TELEMETRY_WEBHOOK production"
fi

