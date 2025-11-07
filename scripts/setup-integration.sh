#!/bin/bash

# Integration Setup Script
# This script helps set up the integration environment

set -e

echo "🚀 DealershipAI Integration Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example.integration..."
    if [ -f .env.example.integration ]; then
        cp .env.example.integration .env.local
        echo "✅ Created .env.local"
        echo "⚠️  Please edit .env.local and fill in your values"
    else
        echo "❌ .env.example.integration not found"
        exit 1
    fi
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Environment Variables Checklist:"
echo "===================================="
echo ""

# Check Redis
if grep -q "UPSTASH_REDIS_REST_URL=https://" .env.local 2>/dev/null; then
    echo "✅ Redis URL configured"
else
    echo "⚠️  Redis URL not configured (required for BullMQ)"
    echo "   Get from: https://console.upstash.com/"
fi

if grep -q "UPSTASH_REDIS_REST_TOKEN=" .env.local 2>/dev/null && ! grep -q "UPSTASH_REDIS_REST_TOKEN=your-token" .env.local 2>/dev/null; then
    echo "✅ Redis Token configured"
else
    echo "⚠️  Redis Token not configured"
fi

# Check Data Sources (optional)
echo ""
echo "📊 Data Sources (Optional - will use mocks if not set):"
if grep -q "PULSE_API_KEY=your-key" .env.local 2>/dev/null; then
    echo "⚠️  Pulse API not configured"
else
    echo "✅ Pulse API configured"
fi

if grep -q "ATI_API_KEY=your-key" .env.local 2>/dev/null; then
    echo "⚠️  ATI API not configured"
else
    echo "✅ ATI API configured"
fi

# Check Slack (optional)
echo ""
echo "🔔 Slack (Optional):"
if grep -q "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR" .env.local 2>/dev/null; then
    echo "⚠️  Slack webhook not configured"
else
    echo "✅ Slack webhook configured"
fi

echo ""
echo "📦 Next Steps:"
echo "=============="
echo "1. Edit .env.local and fill in your values"
echo "2. Run database migration: npx prisma migrate dev -n 'add_telemetry_and_jobs'"
echo "3. Or create tables manually (see docs/SETUP_INTEGRATION.md)"
echo "4. Start dev server: npm run dev"
echo "5. Test integration: npm run test:integration"
echo ""

