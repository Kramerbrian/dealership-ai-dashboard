#!/bin/bash
# Production Environment Setup Script
# Helps verify and prepare environment variables for Vercel deployment

echo "🚀 DealershipAI Production Environment Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
fi

# Check required variables
echo "📋 Checking Required Variables:"
echo ""

REQUIRED_VARS=(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env.local 2>/dev/null; then
        value=$(grep "^${var}=" .env.local | cut -d '=' -f2)
        if [ -n "$value" ] && [ "$value" != "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ] && [ "$value" != "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ]; then
            echo "✅ $var is set"
        else
            echo "❌ $var is set but contains placeholder value"
            MISSING_VARS+=("$var")
        fi
    else
        echo "❌ $var is missing"
        MISSING_VARS+=("$var")
    fi
done

echo ""

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ All required variables are set!"
    echo ""
    echo "📝 Next Steps for Vercel:"
    echo "1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables"
    echo "2. Add the following variables:"
    for var in "${REQUIRED_VARS[@]}"; do
        value=$(grep "^${var}=" .env.local | cut -d '=' -f2)
        echo "   - $var = $value"
    done
    echo "3. Select environments: Production, Preview, Development"
    echo "4. Click Save"
    echo "5. Redeploy your project"
    echo ""
    echo "🔍 To verify after deployment:"
    echo "   curl https://your-vercel-domain.vercel.app/api/health | jq"
else
    echo "❌ Missing required variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "📝 To fix:"
    echo "1. Edit .env.local"
    echo "2. Get keys from https://dashboard.clerk.com → Your App → API Keys"
    echo "3. Replace placeholder values"
    echo "4. Run this script again"
    exit 1
fi

