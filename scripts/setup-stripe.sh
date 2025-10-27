#!/bin/bash

# Stripe CLI Setup Script for DealershipAI v2.0
# This script sets up Stripe CLI and webhooks for local development

echo "🚀 Setting up Stripe CLI for DealershipAI v2.0..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Please install it first:"
    echo "   https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "✅ Stripe CLI found"

# Login to Stripe (if not already logged in)
echo "🔐 Logging into Stripe..."
stripe login

# Set up webhook forwarding
echo "🔗 Setting up webhook forwarding..."
echo "This will forward Stripe webhooks to your local development server."
echo "Make sure your Next.js app is running on http://localhost:3000"

# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

echo "✅ Stripe webhook forwarding started!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the webhook signing secret from the output above"
echo "2. Add it to your .env.local file as STRIPE_WEBHOOK_SECRET"
echo "3. Add your Stripe publishable key as NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "4. Add your Stripe secret key as STRIPE_SECRET_KEY"
echo ""
echo "🔧 Environment variables needed:"
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..."
echo "STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "🎉 Stripe integration is ready for testing!"
