#!/bin/bash

echo "🚀 DealershipAI - Production Deployment"
echo "======================================="
echo ""

# Step 1: Check if logged in to Vercel
echo "Step 1: Checking Vercel authentication..."
if ! vercel whoami &>/dev/null; then
    echo "❌ Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi
echo "✅ Logged in to Vercel"
echo ""

# Step 2: Build for production
echo "Step 2: Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
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
echo "✅ Deployment successful!"
echo ""
echo "📱 Your PLG landing page is now live:"
echo "   https://dealershipai.com/landing/plg"
echo ""
echo "🎯 Next steps:"
echo "   1. Test the landing page"
echo "   2. Check analytics"
echo "   3. Monitor conversion rates"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
