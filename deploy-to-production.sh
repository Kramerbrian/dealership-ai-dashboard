#!/bin/bash

echo "🚀 Deploying DealershipAI to Production..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Creating from template..."
    cp env.production.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys before continuing."
    echo "Required keys:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "- CLERK_SECRET_KEY"
    echo "- STRIPE_PUBLISHABLE_KEY"
    echo "- STRIPE_SECRET_KEY"
    echo "- STRIPE_WEBHOOK_SECRET"
    echo "- OPENAI_API_KEY"
    echo "- ANTHROPIC_API_KEY"
    echo ""
    read -p "Press Enter after updating .env.local..."
fi

# Check if all required environment variables are set
echo "🔍 Checking environment variables..."
source .env.local

REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_SECRET_KEY"
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${MISSING_VARS[@]}"
    echo "Please update .env.local and try again."
    exit 1
fi

echo "✅ All required environment variables are set"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set up your Supabase database using setup-database.sh"
    echo "2. Configure Clerk authentication in your dashboard"
    echo "3. Set up Stripe webhooks pointing to your Vercel domain"
    echo "4. Test your deployment"
    echo ""
    echo "🔗 Your app should be live at the URL provided above!"
else
    echo "❌ Deployment failed. Please check the errors and try again."
    exit 1
fi
