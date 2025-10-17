#!/bin/bash

# DealershipAI Production Deployment Script
# This script prepares and deploys the application to production

echo "🚀 DealershipAI Production Deployment"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login first:"
    echo "vercel login"
    exit 1
fi

print_info "Checking environment variables..."

# Check for required environment variables
REQUIRED_VARS=(
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env.local || grep -q "^${var}=your-" .env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_error "Missing or placeholder environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_warning "Please update .env.local with actual values before deploying"
    exit 1
fi

print_status "Environment variables validated"

echo ""
echo "📋 Pre-deployment Checklist"
echo "=========================="
echo ""

# Check OAuth provider configurations
print_info "Verifying OAuth provider configurations..."

# Check if OAuth providers are properly configured
if grep -q "your-google-client-id" .env.local; then
    print_warning "Google OAuth not configured (placeholder values found)"
else
    print_status "Google OAuth configured"
fi

# GitHub OAuth is optional and has been removed

echo ""
echo "🔧 Vercel Environment Variables Setup"
echo "====================================="
echo ""

print_info "Setting up Vercel environment variables..."

# Add environment variables to Vercel
echo "Adding environment variables to Vercel project..."

# Read .env.local and add variables to Vercel
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    if [[ ! $key =~ ^#.*$ ]] && [[ -n $key ]] && [[ -n $value ]]; then
        # Remove quotes if present
        value=$(echo "$value" | sed 's/^"//;s/"$//')
        
        # Skip placeholder values
        if [[ ! $value =~ ^your- ]]; then
            echo "Adding $key to Vercel..."
            vercel env add "$key" production <<< "$value" 2>/dev/null || echo "  (may already exist)"
        fi
    fi
done < .env.local

print_status "Environment variables added to Vercel"

echo ""
echo "🚀 Deploying to Production"
echo "========================="
echo ""

# Deploy to production
print_info "Deploying to production..."
vercel --prod

if [ $? -eq 0 ]; then
    print_status "Deployment successful!"
    echo ""
    echo "🎯 Post-deployment Steps"
    echo "======================="
    echo ""
    echo "1. Verify OAuth provider redirect URI is set correctly:"
    echo "   - Google: https://dash.dealershipai.com/api/auth/callback/google"
    echo ""
    echo "2. Test the production deployment:"
    echo "   - Landing page: https://dealershipai.com"
    echo "   - Sign-in: https://dash.dealershipai.com/auth/signin"
    echo "   - Test auth: https://dash.dealershipai.com/test-auth"
    echo ""
    echo "3. Verify OAuth providers work in production"
    echo ""
    print_status "Ready to close $499/month deals! 🎯"
else
    print_error "Deployment failed. Check the error messages above."
    exit 1
fi