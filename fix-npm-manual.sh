#!/bin/bash

# Manual npm Fix Script (no sudo prompt)
# Run the sudo command separately first:
#   sudo chown -R $(whoami):$(id -g) ~/.npm

set -e

echo "🔧 DealershipAI npm Fix Script (Manual)"
echo "========================================"
echo ""

# Check if permissions are already fixed
if [ -d ~/.npm ] && [ ! -w ~/.npm ]; then
    echo "❌ npm cache permissions still need fixing"
    echo ""
    echo "Run this command FIRST (requires your password):"
    echo "   sudo chown -R $(whoami):$(id -g) ~/.npm"
    echo ""
    exit 1
fi

echo "✅ npm cache permissions OK"
echo ""

echo "Step 2: Cleaning npm cache..."
npm cache clean --force
echo "✅ Cache cleaned"

echo ""
echo "Step 3: Setting temporary cache location..."
npm config set cache /tmp/npm-cache-$(whoami)
echo "✅ Cache location set"

echo ""
echo "Step 4: Removing corrupted node_modules..."
if [ -d "node_modules" ]; then
    echo "   Removing node_modules (this may take a minute)..."
    rm -rf node_modules
    echo "✅ node_modules removed"
else
    echo "   No node_modules to remove"
fi

echo ""
echo "Step 5: Removing package-lock.json..."
if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo "✅ package-lock.json removed"
fi

echo ""
echo "Step 6: Installing dependencies..."
npm install
echo "✅ Dependencies installed"

echo ""
echo "Step 7: Installing new packages..."
npm install @react-email/components @react-email/render mixpanel-browser
echo "✅ New packages installed"

echo ""
echo "Step 8: Verifying installation..."
npm list @react-email/components @react-email/render mixpanel-browser

echo ""
echo "========================================"
echo "✅ npm Fix Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run: npm run dev"
echo "3. Test: ./scripts/test-systems.sh"

