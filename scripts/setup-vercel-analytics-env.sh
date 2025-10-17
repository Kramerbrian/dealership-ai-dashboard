#!/bin/bash

# Setup Vercel Environment Variables for Google Analytics
# Usage: ./scripts/setup-vercel-analytics-env.sh

set -e

echo "🔧 Google Analytics - Vercel Environment Setup"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with your Google Analytics credentials"
    echo "See GOOGLE_ANALYTICS_SETUP.md for instructions"
    exit 1
fi

# Source the environment variables
set -a
source .env.local
set +a

# Verify required variables are set
if [ -z "$GA_PROPERTY_ID" ]; then
    echo "❌ Error: GA_PROPERTY_ID not set in .env.local"
    exit 1
fi

if [ -z "$GA_SERVICE_ACCOUNT_EMAIL" ]; then
    echo "❌ Error: GA_SERVICE_ACCOUNT_EMAIL not set in .env.local"
    exit 1
fi

if [ -z "$GA_PRIVATE_KEY" ]; then
    echo "❌ Error: GA_PRIVATE_KEY not set in .env.local"
    exit 1
fi

if [ -z "$GA_PROJECT_ID" ]; then
    echo "❌ Error: GA_PROJECT_ID not set in .env.local"
    exit 1
fi

echo "✅ All required environment variables found in .env.local"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo "📋 Variables to be added:"
echo "  - GA_PROPERTY_ID"
echo "  - GA_SERVICE_ACCOUNT_EMAIL"
echo "  - GA_PRIVATE_KEY"
echo "  - GA_PROJECT_ID"
echo ""

read -p "Deploy to which environments? (production/preview/development/all) [all]: " ENVIRONMENTS
ENVIRONMENTS=${ENVIRONMENTS:-all}

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_value=$2
    local env_type=$3

    echo "Adding $var_name to $env_type..."
    echo "$var_value" | vercel env add "$var_name" "$env_type" --force || true
}

# Add variables based on selected environment
if [ "$ENVIRONMENTS" == "all" ]; then
    echo ""
    echo "🚀 Adding variables to all environments..."

    for ENV in production preview development; do
        echo ""
        echo "Environment: $ENV"
        add_env_var "GA_PROPERTY_ID" "$GA_PROPERTY_ID" "$ENV"
        add_env_var "GA_SERVICE_ACCOUNT_EMAIL" "$GA_SERVICE_ACCOUNT_EMAIL" "$ENV"
        add_env_var "GA_PRIVATE_KEY" "$GA_PRIVATE_KEY" "$ENV"
        add_env_var "GA_PROJECT_ID" "$GA_PROJECT_ID" "$ENV"
    done
else
    echo ""
    echo "🚀 Adding variables to $ENVIRONMENTS environment..."
    add_env_var "GA_PROPERTY_ID" "$GA_PROPERTY_ID" "$ENVIRONMENTS"
    add_env_var "GA_SERVICE_ACCOUNT_EMAIL" "$GA_SERVICE_ACCOUNT_EMAIL" "$ENVIRONMENTS"
    add_env_var "GA_PRIVATE_KEY" "$GA_PRIVATE_KEY" "$ENVIRONMENTS"
    add_env_var "GA_PROJECT_ID" "$GA_PROJECT_ID" "$ENVIRONMENTS"
fi

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Verify variables in Vercel dashboard:"
echo "     https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
echo "  2. Redeploy your application:"
echo "     git push origin main"
echo "     # or"
echo "     vercel --prod"
echo ""
echo "  3. Test the production endpoint:"
echo "     curl https://your-domain.vercel.app/api/test-analytics"
echo ""
echo "🎉 Setup complete!"
