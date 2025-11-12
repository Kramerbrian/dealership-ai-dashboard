#!/bin/bash

# DealershipAI - Setup Clerk Environment Variables
# Interactive script to add Clerk API keys to .env.local

echo "🔑 DealershipAI - Clerk Environment Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating it..."
    touch .env.local
fi

# Backup existing .env.local
if [ -f ".env.local" ]; then
    cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up existing .env.local"
    echo ""
fi

echo "📝 Getting Clerk API Keys"
echo "------------------------"
echo "1. Go to: https://dashboard.clerk.com"
echo "2. Sign in to your account"
echo "3. Select your application"
echo "4. Go to: Configure → API Keys"
echo "5. Copy your keys"
echo ""

# Check if keys already exist
if grep -q "^CLERK_SECRET_KEY=" .env.local; then
    CURRENT_SECRET=$(grep "^CLERK_SECRET_KEY=" .env.local | cut -d '=' -f2)
    echo "✅ Found existing CLERK_SECRET_KEY: ${CURRENT_SECRET:0:20}..."
    read -p "Keep existing secret key? (y/n): " keep_secret
    if [ "$keep_secret" != "y" ]; then
        read -p "Enter new Clerk Secret Key (sk_...): " clerk_secret
        if [ ! -z "$clerk_secret" ]; then
            sed -i '' '/^CLERK_SECRET_KEY=/d' .env.local
            echo "CLERK_SECRET_KEY=$clerk_secret" >> .env.local
            echo "✅ Updated CLERK_SECRET_KEY"
        fi
    fi
else
    read -p "Enter Clerk Secret Key (sk_...): " clerk_secret
    if [ ! -z "$clerk_secret" ]; then
        echo "CLERK_SECRET_KEY=$clerk_secret" >> .env.local
        echo "✅ Added CLERK_SECRET_KEY"
    fi
fi

echo ""

# Check for publishable key
if grep -q "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local; then
    CURRENT_PUB=$(grep "^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2)
    echo "✅ Found existing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${CURRENT_PUB:0:20}..."
    read -p "Keep existing publishable key? (y/n): " keep_pub
    if [ "$keep_pub" != "y" ]; then
        read -p "Enter new Clerk Publishable Key (pk_...): " clerk_publishable
        if [ ! -z "$clerk_publishable" ]; then
            sed -i '' '/^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/d' .env.local
            echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$clerk_publishable" >> .env.local
            echo "✅ Updated NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        fi
    fi
else
    read -p "Enter Clerk Publishable Key (pk_...): " clerk_publishable
    if [ ! -z "$clerk_publishable" ]; then
        echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$clerk_publishable" >> .env.local
        echo "✅ Added NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    fi
fi

echo ""
echo "📋 Verification:"
echo "----------------"
echo "Current Clerk configuration:"
grep -E "^CLERK|^NEXT_PUBLIC_CLERK" .env.local | sed 's/=.*/=***hidden***/'
echo ""
echo "✅ Setup complete!"
echo ""
echo "🔄 Next step: Restart your dev server"
echo "   npm run dev"

