#!/bin/bash

echo "🔧 Fixing Next.js @swc/helpers Error"
echo "====================================="
echo ""

# 1. Stop the server (kill any running Next.js processes)
echo "Step 1: Stopping Next.js server..."
pkill -f "next dev" 2>/dev/null || true
sleep 1
echo "✅ Server stopped"
echo ""

# 2. Clear caches
echo "Step 2: Clearing caches..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Caches cleared"
echo ""

# 3. Install @swc/helpers
echo "Step 3: Installing @swc/helpers..."
npm install @swc/helpers --save-dev
echo "✅ @swc/helpers installed"
echo ""

# 4. Verify Next.js installation
echo "Step 4: Verifying Next.js installation..."
npm list next 2>/dev/null || echo "⚠️  Next.js version check failed"
echo ""

# 5. Start the server
echo "Step 5: Starting development server..."
echo ""
echo "🚀 Server starting..."
echo "📱 Access: http://localhost:3000/landing/plg"
echo ""

npm run dev

