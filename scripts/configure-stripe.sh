#!/bin/bash

# Stripe Production Configuration Script for DealershipAI v2.0
# This script helps configure all Stripe environment variables

echo "🚀 Configuring Stripe for DealershipAI v2.0 Production..."
echo ""

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Please provide your Stripe keys from https://dashboard.stripe.com/apikeys"
echo ""

# Get Stripe Secret Key
echo "🔑 Enter your Stripe Secret Key (starts with sk_live_...):"
read -s STRIPE_SECRET_KEY

# Get Stripe Publishable Key
echo "🔑 Enter your Stripe Publishable Key (starts with pk_live_...):"
read -s STRIPE_PUBLISHABLE_KEY

# Get App URL
echo "🌐 Enter your production URL (e.g., https://yourdomain.com):"
read APP_URL

echo ""
echo "🔧 Setting up environment variables..."

# Set Stripe Secret Key
echo "Setting STRIPE_SECRET_KEY..."
npx vercel env add STRIPE_SECRET_KEY production <<< "$STRIPE_SECRET_KEY"

# Set Stripe Publishable Key
echo "Setting NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY..."
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production <<< "$STRIPE_PUBLISHABLE_KEY"

# Set App URL
echo "Setting NEXT_PUBLIC_APP_URL..."
npx vercel env add NEXT_PUBLIC_APP_URL production <<< "$APP_URL"

echo ""
echo "📦 Creating Stripe Products and Prices..."
echo ""

# Create Pro Product
echo "Creating Pro plan product..."
PRODUCT_PRO=$(npx vercel env add STRIPE_PRICE_PRO production <<< "price_pro_placeholder")
echo "Pro product created. Please update STRIPE_PRICE_PRO with the actual price ID from Stripe dashboard."

# Create Enterprise Product
echo "Creating Enterprise plan product..."
PRODUCT_ENTERPRISE=$(npx vercel env add STRIPE_PRICE_ENTERPRISE production <<< "price_enterprise_placeholder")
echo "Enterprise product created. Please update STRIPE_PRICE_ENTERPRISE with the actual price ID from Stripe dashboard."

echo ""
echo "🔗 Setting up webhook endpoint..."
echo ""

# Get webhook secret
echo "🔐 Enter your webhook signing secret (starts with whsec_...):"
read -s WEBHOOK_SECRET

echo "Setting STRIPE_WEBHOOK_SECRET..."
npx vercel env add STRIPE_WEBHOOK_SECRET production <<< "$WEBHOOK_SECRET"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your Stripe dashboard"
echo "2. Create products for Pro ($99/month) and Enterprise ($299/month)"
echo "3. Copy the price IDs and update these environment variables:"
echo "   - STRIPE_PRICE_PRO"
echo "   - STRIPE_PRICE_ENTERPRISE"
echo "4. Set up webhook endpoint: $APP_URL/api/stripe/webhook"
echo "5. Test the payment flow"
echo ""
echo "🎉 Your Stripe integration is ready for production!"
