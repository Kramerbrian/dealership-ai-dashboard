#!/bin/bash

# Get Upstash Redis Credentials
# Uses Upstash CLI or prompts for manual setup

echo "🔍 Upstash Redis Configuration Helper"
echo "======================================"
echo ""

# Check if Upstash CLI is installed
if command -v upstash &> /dev/null; then
  echo "✅ Upstash CLI found"
  echo ""
  echo "📋 Listing your Upstash databases..."
  echo ""
  
  # Try to list databases
  if upstash redis list 2>/dev/null; then
    echo ""
    echo "✅ Found your Redis databases!"
    echo ""
    echo "💡 To get REST API credentials for a database:"
    echo "   upstash redis rest-api <database-name>"
    echo ""
    echo "💡 Or get full details:"
    echo "   upstash redis get <database-name>"
  else
    echo "⚠️  Need to login to Upstash CLI first"
    echo ""
    echo "🔐 Login with:"
    echo "   upstash auth login"
    echo ""
    echo "   OR set environment variables:"
    echo "   export UPSTASH_EMAIL=your-email@example.com"
    echo "   export UPSTASH_API_KEY=your-api-key"
    echo ""
    echo "   Get API key from: https://console.upstash.com/account/api-keys"
  fi
else
  echo "⚠️  Upstash CLI not installed"
  echo ""
  echo "📦 Install it with:"
  echo "   npm install -g @upstash/cli"
  echo ""
  echo "   OR"
  echo ""
  echo "   brew install upstash/tap/upstash"
  echo ""
fi

echo "======================================"
echo ""
echo "🌐 Alternative: Get credentials from console"
echo ""
echo "1. Go to: https://console.upstash.com/"
echo "2. Select your database"
echo "3. Go to 'REST API' section"
echo "4. Copy:"
echo "   - REST URL: https://your-db.upstash.io"
echo "   - REST Token: AX... (click 'Show' to reveal)"
echo ""
echo "5. Add to Vercel:"
echo "   UPSTASH_REDIS_REST_URL=<your-rest-url>"
echo "   UPSTASH_REDIS_REST_TOKEN=<your-rest-token>"
echo ""
echo "======================================"
echo ""
echo "🔧 Manual Setup (if you have credentials)"
echo ""
echo "If you already have your REST URL and Token,"
echo "you can add them directly to Vercel:"
echo ""
echo "https://vercel.com/YOUR_PROJECT/settings/environment-variables"
echo ""

