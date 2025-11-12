#!/bin/bash

# Configure Sentry DSN in Vercel

set -e

echo "🔧 Configuring Sentry Error Tracking"
echo "======================================"
echo ""

echo "📋 Steps to configure Sentry:"
echo ""
echo "1. Create Sentry project:"
echo "   Visit: https://sentry.io/signup/"
echo "   Create a new project (Next.js)"
echo ""
echo "2. Get your DSN:"
echo "   - Go to Project Settings → Client Keys (DSN)"
echo "   - Copy the DSN (starts with https://)"
echo ""
echo "3. Add to Vercel:"
echo "   Option A: Via Vercel Dashboard (Recommended)"
echo "   - Visit: https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
echo "   - Add: NEXT_PUBLIC_SENTRY_DSN"
echo "   - Value: Your Sentry DSN"
echo "   - Environment: Production (and Preview if desired)"
echo ""
echo "   Option B: Via CLI"
echo "   npx vercel env add NEXT_PUBLIC_SENTRY_DSN production"
echo "   (Then paste your DSN when prompted)"
echo ""
echo "4. Redeploy:"
echo "   npx vercel --prod"
echo ""
echo "5. Verify:"
echo "   - Check Sentry dashboard for events"
echo "   - Trigger a test error to verify tracking"
echo ""

# Check if already configured
if npx vercel env ls 2>&1 | grep -q "NEXT_PUBLIC_SENTRY_DSN"; then
    echo "✅ Sentry DSN already configured in Vercel"
    echo "   Current value: $(npx vercel env ls 2>&1 | grep NEXT_PUBLIC_SENTRY_DSN | head -1)"
else
    echo "⚠️  Sentry DSN not yet configured"
    echo "   Follow steps above to add it"
fi

