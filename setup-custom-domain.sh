#!/bin/bash

# DealershipAI - Custom Domain Setup Script
echo "🚀 Setting up custom domain for DealershipAI..."

# Current deployment URL
DEPLOYMENT_URL="https://dealershipai-dashboard-bkyuxcvwc-brian-kramers-projects.vercel.app"

echo "📋 Current deployment: $DEPLOYMENT_URL"

# Step 1: Add custom domain to Vercel
echo ""
echo "1️⃣ Adding custom domain to Vercel..."
echo "   Go to: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains"
echo "   Add domain: dealershipai.com"
echo "   Follow DNS instructions provided by Vercel"

# Step 2: Update Google Cloud Console
echo ""
echo "2️⃣ Update Google Cloud Console OAuth settings..."
echo "   Go to: https://console.cloud.google.com/apis/credentials"
echo "   Update redirect URI to: https://dealershipai.com/api/auth/callback/google"
echo "   Update JavaScript origin to: https://dealershipai.com"

# Step 3: Update Vercel environment variables
echo ""
echo "3️⃣ Update NEXTAUTH_URL environment variable..."
echo "   Run: vercel env rm NEXTAUTH_URL production"
echo "   Run: echo 'https://dealershipai.com' | vercel env add NEXTAUTH_URL production"

# Step 4: Test the setup
echo ""
echo "4️⃣ Test commands after domain setup:"
echo "   curl -I 'https://dealershipai.com/api/auth/signin/google'"
echo "   curl -s 'https://dealershipai.com/api/auth/providers' | jq ."

echo ""
echo "✅ Custom domain setup instructions complete!"
echo "   After completing these steps, your OAuth will work with the custom domain."
