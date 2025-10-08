#!/bin/bash

# DealershipAI Production Deployment Script
# This script helps you deploy to Vercel with proper environment variable setup

echo "🚀 DealershipAI Production Deployment"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

echo "📋 Setting up environment variables..."
echo "You'll need to provide the following API keys:"
echo ""

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local var_example=$3
    
    echo "Enter $var_description:"
    echo "Example: $var_example"
    read -p "$var_name: " var_value
    
    if [ ! -z "$var_value" ]; then
        vercel env add $var_name production <<< "$var_value"
        echo "✅ $var_name set successfully"
    else
        echo "⚠️  Skipping $var_name (empty value)"
    fi
    echo ""
}

# Set up environment variables
echo "🔑 Setting up API keys..."
set_env_var "CRON_SECRET" "Secure cron job secret" "your-secure-random-string"
set_env_var "OPENAI_API_KEY" "OpenAI API key" "sk-..."
set_env_var "ANTHROPIC_API_KEY" "Anthropic API key" "sk-ant-..."
set_env_var "GOOGLE_AI_API_KEY" "Google AI API key" "your-google-ai-key"
set_env_var "QSTASH_TOKEN" "QStash token for queue management" "qst-..."
set_env_var "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL" "https://your-project.supabase.co"
set_env_var "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key" "your-service-role-key"

# Clerk authentication (if using)
echo "🔐 Setting up Clerk authentication (optional)..."
set_env_var "CLERK_PUBLISHABLE_KEY" "Clerk publishable key" "pk_test_..."
set_env_var "CLERK_SECRET_KEY" "Clerk secret key" "sk_test_..."
set_env_var "CLERK_WEBHOOK_SECRET" "Clerk webhook secret" "whsec_..."

echo "🏗️  Building and deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "1. Set up your Supabase database with the schema"
echo "2. Configure your AI platform API keys"
echo "3. Test the monthly scan system"
echo "4. Launch beta with 5-10 dealerships"
echo ""
echo "🔗 Your app should be available at: https://your-project.vercel.app"
echo "📈 Leaderboard: https://your-project.vercel.app/leaderboard"
echo "🔧 API Health: https://your-project.vercel.app/api/health"
