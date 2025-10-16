#!/bin/bash

echo "🚀 Deploying DealershipAI to marketing.dealershipai.com..."
echo "=========================================================="

# Set environment variables for marketing domain
export NEXT_PUBLIC_APP_URL="https://marketing.dealershipai.com"
export NEXTAUTH_URL="https://marketing.dealershipai.com"
export NEXT_PUBLIC_DASHBOARD_URL="https://dash.dealershipai.com"

echo "📋 Deployment Configuration:"
echo "Domain: marketing.dealershipai.com"
echo "Environment: Production"
echo ""

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Exiting."
  exit 1
fi

echo "✅ Build successful."

# Deploy to Vercel with marketing domain
echo "🚀 Deploying to Vercel with domain marketing.dealershipai.com..."
vercel --prod --confirm

if [ $? -ne 0 ]; then
  echo "❌ Vercel deployment failed. Exiting."
  exit 1
fi

echo "✅ Deployment to marketing.dealershipai.com initiated."

# Add custom domain (if not already added)
echo "🌐 Adding custom domain..."
vercel domains add marketing.dealershipai.com

echo "🎉 Marketing deployment complete!"
echo "🌐 URL: https://marketing.dealershipai.com"
echo "📊 Dashboard: https://dash.dealershipai.com"
