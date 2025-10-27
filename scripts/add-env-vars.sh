#!/bin/bash

# Add environment variables to Vercel
echo "🔧 Adding environment variables to Vercel..."

# Add database URL (you'll need to replace with your actual database URL)
echo "Adding DATABASE_URL..."
npx vercel env add DATABASE_URL production

# Add Redis URL (you'll need to replace with your actual Redis URL)
echo "Adding UPSTASH_REDIS_REST_URL..."
npx vercel env add UPSTASH_REDIS_REST_URL production

# Add Redis token (you'll need to replace with your actual Redis token)
echo "Adding UPSTASH_REDIS_REST_TOKEN..."
npx vercel env add UPSTASH_REDIS_REST_TOKEN production

# Add Stripe secret key (you'll need to replace with your actual Stripe key)
echo "Adding STRIPE_SECRET_KEY..."
npx vercel env add STRIPE_SECRET_KEY production

# Add Stripe webhook secret (you'll need to replace with your actual webhook secret)
echo "Adding STRIPE_WEBHOOK_SECRET..."
npx vercel env add STRIPE_WEBHOOK_SECRET production

# Add Stripe price IDs (you'll need to replace with your actual price IDs)
echo "Adding STRIPE_PRICE_PRO..."
npx vercel env add STRIPE_PRICE_PRO production

echo "Adding STRIPE_PRICE_ENTERPRISE..."
npx vercel env add STRIPE_PRICE_ENTERPRISE production

echo "✅ Environment variables added!"
echo ""
echo "Note: You'll need to provide the actual values when prompted."
echo "For now, you can use dummy values for testing:"
echo "- DATABASE_URL: postgresql://user:pass@host:5432/db"
echo "- UPSTASH_REDIS_REST_URL: https://dummy.upstash.io"
echo "- UPSTASH_REDIS_REST_TOKEN: dummy-token"
echo "- STRIPE_SECRET_KEY: sk_test_dummy"
echo "- STRIPE_WEBHOOK_SECRET: whsec_dummy"
echo "- STRIPE_PRICE_PRO: price_dummy_pro"
echo "- STRIPE_PRICE_ENTERPRISE: price_dummy_enterprise"
