#!/bin/bash

# DealershipAI Production Environment Variables Setup
# This script sets up all required environment variables in Vercel

echo "🚀 Setting up DealershipAI Production Environment Variables..."

# Production URL
PRODUCTION_URL="https://dealershipai-dashboard-4obbenwbh-brian-kramers-projects.vercel.app"

echo "📝 Adding environment variables to Vercel..."

# Core NextAuth Configuration
echo "Setting NEXTAUTH_URL..."
vercel env add NEXTAUTH_URL production <<< "$PRODUCTION_URL"

echo "Setting NEXTAUTH_SECRET..."
vercel env add NEXTAUTH_SECRET production <<< "05f03a2f7fda845af4786826bfd3c8ef7d9ff44c31ed9b50cd7031590bc658a8"

# Google OAuth
echo "Setting GOOGLE_CLIENT_ID..."
vercel env add GOOGLE_CLIENT_ID production <<< "1039185326912-150t42hacgra02kljg4sj59gq8shb42b.apps.googleusercontent.com"

echo "Setting GOOGLE_CLIENT_SECRET..."
vercel env add GOOGLE_CLIENT_SECRET production <<< "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"

# API Configuration
echo "Setting NEXT_PUBLIC_API_URL..."
vercel env add NEXT_PUBLIC_API_URL production <<< "$PRODUCTION_URL"

echo "Setting NEXT_PUBLIC_APP_URL..."
vercel env add NEXT_PUBLIC_APP_URL production <<< "https://dealershipai.com"

echo "Setting NEXT_PUBLIC_DASHBOARD_URL..."
vercel env add NEXT_PUBLIC_DASHBOARD_URL production <<< "$PRODUCTION_URL"

# Encryption
echo "Setting ENCRYPTION_KEY..."
vercel env add ENCRYPTION_KEY production <<< "b254bd5dd27e502cf33b2b8f3b6256b2f9b4a4a1f9ebd83d62de2ed9b9024a10"

# Database (if using Supabase)
echo "Setting DATABASE_URL..."
vercel env add DATABASE_URL production <<< "postgres://postgres:Autonation2077$@db.vxrdvkhkombwlhjvtsmw.supabase.co:6543/postgres"

echo "✅ Environment variables setup complete!"
echo "🔄 Redeploying with new environment variables..."

# Redeploy to apply the new environment variables
vercel --prod

echo "🎉 DealershipAI is now live at: $PRODUCTION_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Test the OAuth flow"
echo "2. Verify all modals are working"
echo "3. Check caching is operational"
echo "4. Monitor with Sentry (if configured)"
echo ""
echo "🔗 Production URL: $PRODUCTION_URL"