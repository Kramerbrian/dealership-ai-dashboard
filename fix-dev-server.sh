#!/bin/bash

echo "🔧 Fixing Next.js Development Server"
echo "=================================="

# Stop any running Next.js processes
echo "1. Stopping Next.js server..."
pkill -f "next dev" || true
sleep 2

# Clear Next.js cache
echo "2. Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Install missing dependencies
echo "3. Installing @swc/helpers..."
npm install @swc/helpers

# Reinstall Next.js dependencies if needed
echo "4. Verifying Next.js installation..."
npm install next@latest

# Start the dev server
echo "5. Starting dev server..."
echo ""
echo "✅ Server should start shortly..."
echo "📱 Access: http://localhost:3000/landing/plg"
echo ""
npm run dev

