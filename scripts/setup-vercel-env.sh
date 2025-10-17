#!/bin/bash

# DealershipAI Vercel Environment Variables Setup Script
# This script helps you add essential environment variables to your Vercel project

echo "🚀 DealershipAI Vercel Environment Setup"
echo "========================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Please log in to Vercel first:"
    echo "   vercel login"
    exit 1
fi

echo "✅ Vercel CLI is installed and you're logged in"
echo ""

# Essential environment variables
declare -A env_vars=(
    ["NODE_ENV"]="production"
    ["NEXT_PUBLIC_APP_URL"]="https://your-deployment-url.vercel.app"
    ["NEXT_PUBLIC_ENABLE_AI_INSIGHTS"]="true"
    ["NEXT_PUBLIC_ENABLE_ENTERPRISE_FEATURES"]="true"
    ["NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING"]="true"
    ["NEXT_PUBLIC_ENABLE_REAL_TIME_UPDATES"]="true"
    ["CACHE_TTL_SECONDS"]="3600"
    ["CACHE_COMPRESSION_ENABLED"]="true"
    ["RATE_LIMIT_MAX_REQUESTS"]="100"
    ["RATE_LIMIT_WINDOW_MS"]="60000"
    ["MAX_LOGIN_ATTEMPTS"]="5"
    ["LOCKOUT_DURATION_MINUTES"]="15"
)

echo "📝 Adding essential environment variables..."
echo ""

for key in "${!env_vars[@]}"; do
    value="${env_vars[$key]}"
    echo "Adding $key=$value"
    
    # Add to production environment
    vercel env add "$key" production <<< "$value" 2>/dev/null || echo "  ⚠️  Variable may already exist"
done

echo ""
echo "✅ Essential environment variables added!"
echo ""
echo "🔧 Next steps:"
echo "1. Add your database URL:"
echo "   vercel env add DATABASE_URL production"
echo ""
echo "2. Add your Supabase keys:"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_URL production"
echo "   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
echo ""
echo "3. Add your OpenAI API key:"
echo "   vercel env add OPENAI_API_KEY production"
echo ""
echo "4. Add authentication secrets:"
echo "   vercel env add NEXTAUTH_SECRET production"
echo "   vercel env add JWT_SECRET production"
echo ""
echo "5. Redeploy your application:"
echo "   vercel --prod"
echo ""
echo "📖 For complete setup instructions, see:"
echo "   PRODUCTION_ENV_SETUP_GUIDE.md"
echo ""
echo "🎉 Setup complete!"
