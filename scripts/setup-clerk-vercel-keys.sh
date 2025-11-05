#!/bin/bash
# Setup Clerk and Vercel API Keys
# This script uses Clerk CLI to pull keys and Vercel CLI to set them

set -e

echo "🔐 Setting up Clerk and Vercel API Keys..."
echo ""

# Check if Clerk CLI is installed
if ! command -v clerk &> /dev/null; then
    echo "❌ Clerk CLI not found. Installing..."
    npm install -g @clerk/clerk-sdk-node
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Step 1: Pull Clerk environment variables
echo "📥 Step 1: Pulling Clerk environment variables..."
if clerk pull --yes 2>/dev/null; then
    echo "✅ Clerk keys pulled successfully"
else
    echo "⚠️  Clerk pull failed or not linked. You may need to:"
    echo "   1. Run: clerk login"
    echo "   2. Run: clerk link"
    echo "   3. Then run this script again"
    exit 1
fi

# Step 2: Read keys from .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Clerk pull may have failed."
    exit 1
fi

echo ""
echo "📤 Step 2: Adding keys to Vercel..."

# Extract keys from .env.local
CLERK_PUBLISHABLE_KEY=$(grep "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2- | tr -d '"')
CLERK_SECRET_KEY=$(grep "^CLERK_SECRET_KEY=" .env.local | cut -d '=' -f2- | tr -d '"')

if [ -z "$CLERK_PUBLISHABLE_KEY" ] || [ -z "$CLERK_SECRET_KEY" ]; then
    echo "❌ Could not extract Clerk keys from .env.local"
    echo "Please check your .env.local file"
    exit 1
fi

# Add to Vercel (all environments)
echo "Adding NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to Vercel..."
echo "$CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production preview development --yes 2>/dev/null || \
echo "$CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --yes && \
echo "$CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY preview --yes && \
echo "$CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY development --yes

echo "Adding CLERK_SECRET_KEY to Vercel..."
echo "$CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY production preview development --yes 2>/dev/null || \
echo "$CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY production --yes && \
echo "$CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY preview --yes && \
echo "$CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY development --yes

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   - Clerk keys pulled from Clerk dashboard"
echo "   - Keys added to Vercel (production, preview, development)"
echo ""
echo "🔍 Verify by running: vercel env ls"


