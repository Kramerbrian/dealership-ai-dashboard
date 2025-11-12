#!/bin/bash

# Verify Clerk Setup Script
# Checks if Clerk is properly configured

echo "🔐 Clerk Setup Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check .env.local
echo "1. Checking .env.local..."
if [ ! -f .env.local ]; then
    echo "   ❌ .env.local not found"
    exit 1
fi

PUB_KEY=$(grep -E "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)
SEC_KEY=$(grep -E "^CLERK_SECRET_KEY=" .env.local | cut -d'=' -f2- | tr -d '"' | tr -d "'" | xargs)

if [ -z "$PUB_KEY" ] || [ "$PUB_KEY" == "" ]; then
    echo "   ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found or empty"
else
    echo "   ✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${PUB_KEY:0:30}..."
fi

if [ -z "$SEC_KEY" ] || [ "$SEC_KEY" == "" ]; then
    echo "   ❌ CLERK_SECRET_KEY not found or empty"
else
    echo "   ✅ CLERK_SECRET_KEY: ${SEC_KEY:0:30}..."
fi

echo ""
echo "2. Checking server status..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ "$STATUS" == "200" ]; then
        echo "   ✅ Server returning 200 OK"
    else
        echo "   ⚠️  Server returning $STATUS (expected 200)"
    fi
else
    echo "   ⚠️  Server not responding (may still be starting)"
fi

echo ""
echo "3. Checking ClerkProviderWrapper..."
if grep -q "ClerkProviderWrapper" app/layout.tsx; then
    echo "   ✅ ClerkProviderWrapper found in layout"
else
    echo "   ❌ ClerkProviderWrapper not found in layout"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Next Steps:"
echo ""
echo "If keys are set but server still has errors:"
echo "1. Restart server: pkill -f 'next dev' && npm run dev"
echo "2. Check logs: tail -f /tmp/nextjs-fresh.log"
echo "3. Configure redirects: ./scripts/configure-clerk-redirects.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

