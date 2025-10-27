#!/bin/bash

# DealershipAI - Production Deployment Script
# Run this script to deploy the PLG landing page

echo "🚀 DealershipAI - Production Deployment"
echo "========================================"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo "✅ npm found: $(npm -v)"
echo ""

# Step 1: Install missing dependency
echo "📦 Step 1: Installing @swc/helpers..."
npm install @swc/helpers --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Failed to install @swc/helpers"
    exit 1
fi
echo "✅ @swc/helpers installed"
echo ""

# Step 2: Build for production
echo "🏗️  Step 2: Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "📋 Common issues:"
    echo "  1. Fix TypeScript errors in API routes"
    echo "  2. Check for missing dependencies"
    echo "  3. Ensure all environment variables are set"
    echo ""
    echo "💡 Since next.config.js has ignoreBuildErrors: true"
    echo "   The build should continue anyway."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 3: Check if logged in to Vercel
echo "🔐 Step 3: Checking Vercel authentication..."
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found"
    echo "Installing..."
    npm install -g vercel
fi

if ! vercel whoami &>/dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Step 4: Deploy to production
echo "🚀 Step 4: Deploying to Vercel production..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "📱 Your PLG landing page is now live at:"
    echo "   https://dealership-ai-dashboard.vercel.app/landing/plg"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Visit the URL above to test"
    echo "   2. Configure custom domain in Vercel dashboard"
    echo "   3. Add dealershipai.com as custom domain"
    echo "   4. Update DNS records"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above"
fi

