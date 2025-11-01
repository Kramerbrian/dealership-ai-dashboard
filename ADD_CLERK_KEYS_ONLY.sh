#!/bin/bash

# DealershipAI - Add Clerk Keys Only
# Quick script to add just the essential Clerk authentication keys

echo "🔑 DealershipAI - Add Clerk Keys"
echo "================================="
echo ""
echo "This script will add the essential Clerk authentication keys to Vercel."
echo ""
echo "📋 Production URL:"
echo "https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo ""
echo "🌐 Vercel Environment Variables:"
echo "https://vercel.com/brian-kramer-dealershipai/dealership-ai-dashboard/settings/environment-variables"
echo ""

# Check if user has Clerk keys
echo "📝 STEP 1: Get Your Clerk Keys"
echo "-------------------------------"
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Sign in to your account"
echo "3. Select your app: 'dealership-ai-dashboard'"
echo "4. Go to 'API Keys' section"
echo "5. Copy these two keys:"
echo "   - Publishable Key (starts with pk_test_)"
echo "   - Secret Key (starts with sk_test_)"
echo ""

read -p "Do you have your Clerk keys ready? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏭️ Please get your Clerk keys first, then run this script again."
    echo ""
    echo "Quick setup:"
    echo "1. Go to: https://clerk.com"
    echo "2. Click 'Start Building for Free'"
    echo "3. Sign up with GitHub"
    echo "4. Create application: 'DealershipAI'"
    echo "5. Go to API Keys → Copy both keys"
    exit 1
fi

echo ""
echo "📝 STEP 2: Adding Clerk Keys to Vercel"
echo "---------------------------------------"
echo ""

# Add publishable key
echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY..."
echo "Enter your Clerk publishable key (starts with pk_test_):"
npx vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production

if [ $? -eq 0 ]; then
    echo "✅ Added NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
else
    echo "❌ Failed to add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
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
    exit 1
fi

echo ""
echo "📝 STEP 3: Redeploy"
echo "--------------------"
echo "Redeploying with new environment variables..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Redeploy successful!"
else
    echo "❌ Redeploy failed"
    exit 1
fi

echo ""
echo "📝 STEP 4: Configure Clerk Redirects"
echo "-------------------------------------"
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Select your app"
echo "3. Go to: Configure → URLs"
echo "4. Add to Allowed Origins:"
echo "   - https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo "5. Set redirect URLs:"
echo "   - After sign in: /dashboard"
echo "   - After sign up: /dashboard"
echo ""

echo "📝 STEP 5: Test Authentication"
echo "-------------------------------"
echo "1. Visit: https://dealership-ai-dashboard-brian-kramer-dealershipai.vercel.app"
echo "2. Click 'Sign Up'"
echo "3. Complete registration"
echo "4. Should redirect to /dashboard"
echo ""

echo "🎉 Clerk Setup Complete!"
echo "========================"
echo ""
echo "✅ Clerk keys added to Vercel"
echo "✅ Application redeployed"
echo "⏳ Next: Configure redirects and test"
echo ""
echo "📚 Next steps:"
echo "- Follow QUICK_START_SETUP.md for detailed instructions"
echo "- Add Supabase for database (FULL_SAAS_SETUP_GUIDE.md)"
echo "- Add Stripe for payments"
echo ""

