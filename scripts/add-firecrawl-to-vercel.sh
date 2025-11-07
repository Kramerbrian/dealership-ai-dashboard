#!/bin/bash

# Add Firecrawl API Key to Vercel
# This script helps you add the Firecrawl API key to your Vercel project

set -e

API_KEY="fc-a2bb1140792448de9513a97e60ff43fa"

echo "🔥 Adding Firecrawl API Key to Vercel"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo ""
    echo "Install it with:"
    echo "  npm i -g vercel"
    echo ""
    echo "Or use the Vercel Dashboard method below."
    echo ""
fi

echo "📋 Method 1: Using Vercel CLI"
echo "------------------------------"
echo ""
echo "Run these commands:"
echo ""
echo "  # Login to Vercel (if not already)"
echo "  vercel login"
echo ""
echo "  # Link to your project (if not already)"
echo "  vercel link"
echo ""
echo "  # Add the environment variable"
echo "  vercel env add FIRECRAWL_API_KEY production"
echo "  # When prompted, paste: $API_KEY"
echo ""
echo "  # Also add for preview and development"
echo "  vercel env add FIRECRAWL_API_KEY preview"
echo "  vercel env add FIRECRAWL_API_KEY development"
echo ""
echo ""

echo "📋 Method 2: Using Vercel Dashboard"
echo "------------------------------------"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings > Environment Variables"
echo "4. Click 'Add New'"
echo "5. Enter:"
echo "   Name: FIRECRAWL_API_KEY"
echo "   Value: $API_KEY"
echo "6. Select environments: Production, Preview, Development"
echo "7. Click 'Save'"
echo ""
echo ""

echo "📋 Method 3: Using Vercel API"
echo "------------------------------"
echo ""
echo "If you have a Vercel API token, you can use:"
echo ""
echo "  # Get your project ID first"
echo "  PROJECT_ID=\$(vercel projects ls --json | jq -r '.[0].id')"
echo ""
echo "  # Add the environment variable"
echo "  curl -X POST 'https://api.vercel.com/v10/projects/\$PROJECT_ID/env' \\"
echo "    -H 'Authorization: Bearer YOUR_VERCEL_TOKEN' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{"
echo "      \"key\": \"FIRECRAWL_API_KEY\","
echo "      \"value\": \"$API_KEY\","
echo "      \"type\": \"encrypted\","
echo "      \"target\": [\"production\", \"preview\", \"development\"]"
echo "    }'"
echo ""
echo ""

echo "✅ After adding the environment variable, it will be available as:"
echo "   process.env.FIRECRAWL_API_KEY"
echo ""
echo "💡 Note: You may need to redeploy your project for the changes to take effect."
echo "   Run: vercel --prod"

