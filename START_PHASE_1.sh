#!/bin/bash

# DealershipAI - Phase 1: Clerk Authentication Setup
# Quick script to guide you through the first 5 minutes

echo "🔑 DealershipAI - Phase 1: Clerk Authentication (5 minutes)"
echo "============================================================"
echo ""
echo "📋 Current Production URL:"
echo "https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo ""
echo "🌐 Vercel Environment Variables:"
echo "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
echo ""

echo "📝 STEP 1: Get Your Clerk Keys (2 minutes)"
echo "-------------------------------------------"
echo "1. Open: https://dashboard.clerk.com"
echo "2. Sign in to your account (or create one)"
echo "3. Select your app: 'dealership-ai-dashboard'"
echo "4. Go to 'API Keys' section"
echo "5. Copy these two keys:"
echo "   - Publishable Key (starts with pk_test_)"
echo "   - Secret Key (starts with sk_test_)"
echo ""

read -p "Do you have your Clerk keys ready? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏭️ Please get your Clerk keys first:"
    echo ""
    echo "Quick setup if you don't have Clerk:"
    echo "1. Go to: https://clerk.com"
    echo "2. Click 'Start Building for Free'"
    echo "3. Sign up with GitHub"
    echo "4. Create application: 'DealershipAI'"
    echo "5. Go to API Keys → Copy both keys"
    echo ""
    echo "Then run this script again: ./START_PHASE_1.sh"
    exit 1
fi

echo ""
echo "📝 STEP 2: Add Keys to Vercel (2 minutes)"
echo "-------------------------------------------"
echo ""

# Add publishable key
echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
echo "Enter your Clerk publishable key (starts with pk_test_):"
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

if [ $? -eq 0 ]; then
    echo "✅ Added NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
else
    echo "❌ Failed to add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "Try adding manually via web dashboard:"
    echo "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
    exit 1
fi

echo ""
echo "Adding CLERK_SECRET_KEY..."
echo "Enter your Clerk secret key (starts with sk_test_):"
npx vercel env add CLERK_SECRET_KEY production

if [ $? -eq 0 ]; then
    echo "✅ Added CLERK_SECRET_KEY"
else
    echo "❌ Failed to add CLERK_SECRET_KEY"
    echo "Try adding manually via web dashboard:"
    echo "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
    exit 1
fi

echo ""
echo "📝 STEP 3: Configure Clerk Redirects (1 minute)"
echo "------------------------------------------------"
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Select your app"
echo "3. Go to: Configure → URLs"
echo "4. Add to Allowed Origins:"
echo "   - https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo "5. Set redirect URLs:"
echo "   - After sign in: /dashboard"
echo "   - After sign up: /dashboard"
echo ""

read -p "Have you configured the redirect URLs in Clerk? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏭️ Please configure redirect URLs first, then continue."
    echo "The redirect URLs are important for proper authentication flow."
    exit 1
fi

echo ""
echo "📝 STEP 4: Redeploy (1 minute)"
echo "-------------------------------"
echo "Redeploying with new environment variables..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Redeploy successful!"
else
    echo "❌ Redeploy failed"
    echo "Check logs with: npx vercel logs"
    exit 1
fi

echo ""
echo "📝 STEP 5: Test Authentication"
echo "------------------------------"
echo "1. Visit: https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo "2. Click 'Sign Up'"
echo "3. Complete registration"
echo "4. Should redirect to /dashboard"
echo ""

echo "🎉 Phase 1 Complete!"
echo "===================="
echo ""
echo "✅ Clerk keys added to Vercel"
echo "✅ Redirect URLs configured"
echo "✅ Application redeployed"
echo "⏳ Next: Test authentication"
echo ""
echo "📚 Next Phase:"
echo "- Phase 2: Supabase Database (10 min)"
echo "- Follow: COMPLETE_45_MINUTE_SETUP.md"
echo ""
echo "🚀 Ready for Phase 2? Run:"
echo "./START_PHASE_2.sh"
echo ""

