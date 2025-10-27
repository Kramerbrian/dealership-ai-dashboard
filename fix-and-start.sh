#!/bin/bash

echo "🔧 DealershipAI - PLG Landing Page Fix"
echo "======================================="
echo ""

# Kill any running Next.js processes
echo "📴 Stopping running servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2
echo "✅ Stopped"
echo ""

# Clear caches
echo "🗑️  Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Caches cleared"
echo ""

# Install missing dependency
echo "📦 Installing @swc/helpers..."
npm install @swc/helpers --save-dev
echo "✅ @swc/helpers installed"
echo ""

# Start the server
echo "🚀 Starting development server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Server should start in a few seconds"
echo ""
echo "📱 Access PLG Landing Page at:"
echo "   http://localhost:3000/landing/plg"
echo ""
echo "🎨 Or test the route group version:"
echo "   http://localhost:3000/(landing)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev

