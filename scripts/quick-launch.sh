#!/bin/bash

# Quick Launch - Start development server
# Simplified version for quick starts

echo "🚀 Quick Launch - DealershipAI"
echo "=============================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  echo "   Create from .env.example"
  exit 1
fi

# Check Node modules
if [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start dev server
echo "🚀 Starting Next.js development server..."
echo ""
echo "📝 Open: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev

