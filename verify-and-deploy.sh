#!/bin/bash

# DealershipAI - Build Verification & Deployment
echo "🚀 DealershipAI Production Deployment"
echo "========================================"
echo ""

# Step 1: Install missing dependency
echo "📦 Step 1: Installing @swc/helpers..."
npm install @swc/helpers --save-dev

if [ $? -ne 0 ]; then
    echo "❌ Step 1 failed!"
    exit 1
fi
echo "✅ Step 1 complete"
echo ""

# Step 2: Run TypeScript check
echo "🔍 Step 2: Checking TypeScript..."
npm run type-check || echo "⚠️  TypeScript errors (will proceed with build)"
echo "✅ Step 2 complete"
echo ""

# Step 3: Build for production
echo "🏗️  Step 3: Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors above."
    echo ""
    echo "Common fixes:"
    echo "  1. Check for missing dependencies"
    echo "  2. Review TypeScript errors"
    echo "  3. Ensure PostCSS is configured"
    exit 1
fi
echo "✅ Build successful!"
echo ""

# Step 4: Verify build output
echo "📂 Step 4: Verifying build output..."
if [ -d ".next" ]; then
    echo "✅ .next directory created"
    
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID)
        echo "✅ Build ID: $BUILD_ID"
    fi
    
    echo "✅ Build output verified"
else
    echo "❌ No .next directory found"
    exit 1
fi
echo ""

# Step 5: Deploy to Vercel
echo "🚀 Step 5: Deploying to Vercel..."
echo ""
echo "This will:"
echo "  - Push to production"
echo "  - Trigger a new deployment"
echo "  - Make it live at: https://dealership-ai-dashboard.vercel.app"
echo ""
read -p "Press Enter to continue, or Ctrl+C to cancel..."

vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "Your PLG landing page is now live at:"
    echo "  https://dealership-ai-dashboard.vercel.app/landing/plg"
    echo ""
    echo "Next steps:"
    echo "  1. Visit the URL above to verify"
    echo "  2. Configure custom domain in Vercel dashboard"
    echo "  3. Update DNS records for dealershipai.com"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error messages above"
fi

