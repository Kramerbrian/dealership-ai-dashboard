#!/bin/bash

# AI Platform API Keys Setup Script for Vercel
# This script helps you add AI platform API keys to Vercel environment variables

echo "🤖 AI Platform API Keys Setup for Monthly Scan"
echo "=============================================="
echo ""
echo "This script will help you add AI platform API keys to Vercel."
echo "These keys are required for the monthly scan feature."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm install -g vercel"
    exit 1
fi

echo "📋 Required API Keys:"
echo "1. OpenAI (ChatGPT) - https://platform.openai.com/api-keys"
echo "2. Anthropic (Claude) - https://console.anthropic.com/"
echo "3. Google (Gemini/SGE) - https://console.cloud.google.com/"
echo "4. Perplexity AI - https://www.perplexity.ai/settings/api"
echo "5. xAI (Grok) - https://console.x.ai/"
echo ""

# Confirm before proceeding
read -p "Do you have all the required API keys ready? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Please get your API keys first, then run this script again."
    echo ""
    echo "🔗 Quick Links:"
    echo "   OpenAI: https://platform.openai.com/api-keys"
    echo "   Anthropic: https://console.anthropic.com/"
    echo "   Google: https://console.cloud.google.com/"
    echo "   Perplexity: https://www.perplexity.ai/settings/api"
    echo "   xAI: https://console.x.ai/"
    exit 1
fi

echo ""
echo "🔐 Adding API keys to Vercel..."
echo ""

# OpenAI API Key
echo "📝 Adding OPENAI_API_KEY..."
echo "Please paste your OpenAI API key (starts with 'sk-'):"
vercel env add OPENAI_API_KEY production

# Anthropic API Key
echo ""
echo "📝 Adding ANTHROPIC_API_KEY..."
echo "Please paste your Anthropic API key (starts with 'sk-ant-'):"
vercel env add ANTHROPIC_API_KEY production

# Google API Key
echo ""
echo "📝 Adding GOOGLE_API_KEY..."
echo "Please paste your Google API key:"
vercel env add GOOGLE_API_KEY production

# Perplexity API Key
echo ""
echo "📝 Adding PERPLEXITY_API_KEY..."
echo "Please paste your Perplexity API key (starts with 'pplx-'):"
vercel env add PERPLEXITY_API_KEY production

# xAI API Key
echo ""
echo "📝 Adding XAI_API_KEY..."
echo "Please paste your xAI API key (starts with 'xai-'):"
vercel env add XAI_API_KEY production

echo ""
echo "✅ All AI platform API keys added successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Redeploy your application: vercel --prod"
echo "2. Test the monthly scan feature in your dashboard"
echo "3. Check the API endpoints are working correctly"
echo ""
echo "🔍 Test endpoints:"
echo "   GET /api/monthly-scan/platforms"
echo "   POST /api/monthly-scan/start"
echo "   GET /api/monthly-scan/leaderboard"
echo ""
echo "⚠️  Important Notes:"
echo "   - Keep your API keys secure and never share them"
echo "   - Monitor your API usage to avoid unexpected charges"
echo "   - Set up usage alerts in each platform's dashboard"
echo ""
