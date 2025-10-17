#!/bin/bash

# DealershipAI - Deploy with Custom Domain Setup
echo "🚀 Deploying DealershipAI with custom domain setup..."

# Step 1: Deploy to Vercel
echo "1️⃣ Deploying to Vercel..."
vercel --prod

# Get the latest deployment URL
LATEST_URL=$(vercel ls | head -n 2 | tail -n 1 | awk '{print $2}')
echo "📋 Latest deployment: $LATEST_URL"

# Step 2: Update NEXTAUTH_URL
echo ""
echo "2️⃣ Updating NEXTAUTH_URL environment variable..."
vercel env rm NEXTAUTH_URL production --yes
echo "$LATEST_URL" | vercel env add NEXTAUTH_URL production

# Step 3: Instructions for custom domain
echo ""
echo "3️⃣ Custom Domain Setup Instructions:"
echo "   Go to: https://vercel.com/brian-kramers-projects/dealershipai-dashboard/settings/domains"
echo "   Add domain: dealershipai.com"
echo "   Follow DNS instructions"

# Step 4: Update Google Cloud Console
echo ""
echo "4️⃣ Update Google Cloud Console:"
echo "   Go to: https://console.cloud.google.com/apis/credentials"
echo "   Add redirect URI: $LATEST_URL/api/auth/callback/google"
echo "   Add JavaScript origin: $LATEST_URL"

# Step 5: Test deployment
echo ""
echo "5️⃣ Testing deployment..."
echo "   Landing page: $LATEST_URL"
echo "   OAuth test: curl -I '$LATEST_URL/api/auth/signin/google'"

echo ""
echo "✅ Deployment complete!"
echo "   Next: Set up custom domain and update OAuth settings"