#!/bin/bash

echo "🚀 Deploying DealershipAI Dashboard to dash.dealershipai.com..."
echo "=============================================================="

# Set environment variables for dashboard domain
export NEXT_PUBLIC_APP_URL="https://dash.dealershipai.com"
export NEXTAUTH_URL="https://dash.dealershipai.com"
export NEXT_PUBLIC_DASHBOARD_URL="https://dash.dealershipai.com"

echo "📋 Deployment Configuration:"
echo "Domain: dash.dealershipai.com"
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

# Deploy to Vercel with dashboard domain
echo "🚀 Deploying to Vercel with domain dash.dealershipai.com..."
vercel --prod --confirm

if [ $? -ne 0 ]; then
  echo "❌ Vercel deployment failed. Exiting."
  exit 1
fi

echo "✅ Deployment to dash.dealershipai.com initiated."

# Add custom domain (if not already added)
echo "🌐 Adding custom domain..."
vercel domains add dash.dealershipai.com

echo "🎉 Dashboard deployment complete!"
echo "🌐 URL: https://dash.dealershipai.com"
echo "📊 Console API: https://dash.dealershipai.com/api/console/query"
echo "📈 TSM API: https://dash.dealershipai.com/api/econ/tsm"
