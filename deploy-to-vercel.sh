#!/bin/bash

# 🚀 DealershipAI Vercel Deployment Script
# Run this after fixing Vercel settings

echo "🚀 Starting DealershipAI deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please login:"
    vercel login
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building project..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your dashboard should be available at: https://dash.dealershipai.com"
echo ""
echo "📋 Next steps:"
echo "1. Add environment variables in Vercel dashboard"
echo "2. Configure custom domain: dash.dealershipai.com"
echo "3. Test the deployment"
