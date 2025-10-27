#!/bin/bash

echo "🚀 DealershipAI - Production Deployment"
echo "========================================"
echo ""

# Check if already logged in
if ! vercel whoami &>/dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"
echo ""

# Step 1: Install @swc/helpers
echo "Step 1: Installing @swc/helpers..."
npm install @swc/helpers --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Failed to install @swc/helpers"
    exit 1
fi
echo "✅ @swc/helpers installed"
echo ""

# Step 2: Build for production
echo "Step 2: Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    echo "Please fix build errors and try again"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Step 3: Deploy to Vercel
echo "Step 3: Deploying to Vercel production..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📱 Your PLG landing page is now live:"
echo "   https://dealershipai.com/landing/plg"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the landing page"
echo "   2. Configure custom domain in Vercel"
echo "   3. Set up monitoring"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
