#!/bin/bash

# Complete npm Fix Script
# This script fixes both npm permissions and corrupted node_modules

set -e

echo "🔧 DealershipAI npm Fix Script"
echo "================================"
echo ""

# Step 1: Fix npm cache permissions
echo "Step 1: Fixing npm cache permissions..."
echo "⚠️  This requires your sudo password"
echo ""
read -p "Press Enter to continue (or Ctrl+C to cancel)..."
sudo chown -R $(whoami):$(id -g) ~/.npm

if [ $? -eq 0 ]; then
    echo "✅ npm cache permissions fixed!"
else
    echo "❌ Failed to fix permissions. Please run manually:"
    echo "   sudo chown -R $(whoami):$(id -g) ~/.npm"
    exit 1
fi

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
echo "================================"
echo "✅ npm Fix Complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run: npm run dev"
echo "3. Test: ./scripts/test-systems.sh"

