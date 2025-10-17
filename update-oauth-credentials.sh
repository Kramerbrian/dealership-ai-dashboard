#!/bin/bash

# DealershipAI OAuth Credentials Update Script
# This script helps you update OAuth credentials in .env.local

echo "🔧 DealershipAI OAuth Credentials Update"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    exit 1
fi

# Backup existing file
cp .env.local .env.local.backup
print_status "Backed up .env.local to .env.local.backup"

echo ""
echo "📝 OAuth Credentials Update"
echo "=========================="
echo ""

# Google OAuth
echo "🔵 Google OAuth Setup"
echo "--------------------"
read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID
read -p "Enter your Google Client Secret: " GOOGLE_CLIENT_SECRET

if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ]; then
    # Update Google credentials
    sed -i.bak "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID/" .env.local
    sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET/" .env.local
    print_status "Google OAuth credentials updated"
else
    print_warning "Google OAuth credentials not provided"
fi

echo ""

# GitHub OAuth
echo "🐙 GitHub OAuth Setup"
echo "--------------------"
read -p "Enter your GitHub Client ID: " GITHUB_CLIENT_ID
read -p "Enter your GitHub Client Secret: " GITHUB_CLIENT_SECRET

if [ -n "$GITHUB_CLIENT_ID" ] && [ -n "$GITHUB_CLIENT_SECRET" ]; then
    # Update GitHub credentials
    sed -i.bak "s/GITHUB_CLIENT_ID=.*/GITHUB_CLIENT_ID=$GITHUB_CLIENT_ID/" .env.local
    sed -i.bak "s/GITHUB_CLIENT_SECRET=.*/GITHUB_CLIENT_SECRET=$GITHUB_CLIENT_SECRET/" .env.local
    print_status "GitHub OAuth credentials updated"
else
    print_warning "GitHub OAuth credentials not provided"
fi

echo ""

# Optional: Azure AD
echo "🏢 Azure AD OAuth Setup (Optional)"
echo "---------------------------------"
read -p "Enter your Azure AD Client ID (or press Enter to skip): " AZURE_CLIENT_ID

if [ -n "$AZURE_CLIENT_ID" ]; then
    read -p "Enter your Azure AD Client Secret: " AZURE_CLIENT_SECRET
    read -p "Enter your Azure AD Tenant ID: " AZURE_TENANT_ID
    
    if [ -n "$AZURE_CLIENT_SECRET" ] && [ -n "$AZURE_TENANT_ID" ]; then
        sed -i.bak "s/AZURE_AD_CLIENT_ID=.*/AZURE_AD_CLIENT_ID=$AZURE_CLIENT_ID/" .env.local
        sed -i.bak "s/AZURE_AD_CLIENT_SECRET=.*/AZURE_AD_CLIENT_SECRET=$AZURE_CLIENT_SECRET/" .env.local
        sed -i.bak "s/AZURE_AD_TENANT_ID=.*/AZURE_AD_TENANT_ID=$AZURE_TENANT_ID/" .env.local
        print_status "Azure AD OAuth credentials updated"
    fi
else
    print_info "Skipping Azure AD setup"
fi

echo ""

# Optional: Facebook
echo "📘 Facebook OAuth Setup (Optional)"
echo "--------------------------------"
read -p "Enter your Facebook Client ID (or press Enter to skip): " FACEBOOK_CLIENT_ID

if [ -n "$FACEBOOK_CLIENT_ID" ]; then
    read -p "Enter your Facebook Client Secret: " FACEBOOK_CLIENT_SECRET
    
    if [ -n "$FACEBOOK_CLIENT_SECRET" ]; then
        sed -i.bak "s/FACEBOOK_CLIENT_ID=.*/FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID/" .env.local
        sed -i.bak "s/FACEBOOK_CLIENT_SECRET=.*/FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET/" .env.local
        print_status "Facebook OAuth credentials updated"
    fi
else
    print_info "Skipping Facebook setup"
fi

# Clean up backup files
rm -f .env.local.bak

echo ""
echo "🧪 Testing OAuth Configuration"
echo "============================="
echo ""

print_info "Restarting development server to load new credentials..."

# Check if dev server is running and restart it
if pgrep -f "next dev" > /dev/null; then
    print_info "Development server is running. Please restart it manually:"
    echo "1. Press Ctrl+C to stop the current server"
    echo "2. Run: npm run dev"
else
    print_info "Starting development server..."
    npm run dev &
    sleep 3
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Restart your development server: npm run dev"
echo "2. Test OAuth at: http://localhost:3000/test-auth"
echo "3. Test sign-in at: http://localhost:3000/auth/signin"
echo "4. Deploy to production: ./deploy-to-production.sh"
echo ""

print_status "OAuth credentials updated successfully!"
print_warning "Remember to restart your development server to load the new credentials"
