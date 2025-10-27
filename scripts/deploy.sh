#!/bin/bash

# DealershipAI Deployment Script
echo "🚀 Deploying DealershipAI to Vercel..."

# Check if we're logged in to Vercel
echo "📋 Checking Vercel authentication..."
npx vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Not logged in to Vercel. Please run: npx vercel login"
  exit 1
fi
echo "✅ Authenticated with Vercel"

# Build the project first
echo "🏗️  Building project..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
npx vercel --prod --yes
if [ $? -ne 0 ]; then
  echo "❌ Deployment failed"
  exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure custom domain (dealershipai.com)"
echo "3. Set up Stripe webhooks"
echo "4. Test the deployed application"