#!/bin/bash

# DealershipAI OAuth Setup Script
# This script will guide you through setting up OAuth providers

echo "🚀 DealershipAI OAuth Provider Setup"
echo "======================================"
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

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    echo "Creating .env.local from template..."
    cp .env.example .env.local
fi

echo "📋 OAuth Provider Setup Checklist"
echo "================================="
echo ""

# Google OAuth Setup
echo "1. 🔵 Google OAuth Setup"
echo "------------------------"
echo "   a) Go to: https://console.cloud.google.com/"
echo "   b) Create a new project or select existing one"
echo "   c) Enable Google+ API"
echo "   d) Go to 'Credentials' → 'Create Credentials' → 'OAuth 2.0 Client IDs'"
echo "   e) Set application type to 'Web application'"
echo "   f) Add authorized redirect URIs:"
echo "      - http://localhost:3000/api/auth/callback/google (development)"
echo "      - https://dash.dealershipai.com/api/auth/callback/google (production)"
echo "   g) Copy Client ID and Client Secret"
echo ""

# GitHub OAuth Setup
echo "2. 🐙 GitHub OAuth Setup"
echo "------------------------"
echo "   a) Go to: https://github.com/settings/developers"
echo "   b) Click 'New OAuth App'"
echo "   c) Fill in:"
echo "      - Application name: 'DealershipAI'"
echo "      - Homepage URL: 'https://dealershipai.com'"
echo "      - Authorization callback URL: 'https://dash.dealershipai.com/api/auth/callback/github'"
echo "   d) Copy Client ID and Client Secret"
echo ""

# Microsoft Azure AD Setup (Optional)
echo "3. 🏢 Microsoft Azure AD Setup (Optional)"
echo "----------------------------------------"
echo "   a) Go to: https://portal.azure.com/"
echo "   b) Navigate to 'Azure Active Directory' → 'App registrations'"
echo "   c) Click 'New registration'"
echo "   d) Fill in:"
echo "      - Name: 'DealershipAI'"
echo "      - Supported account types: 'Accounts in any organizational directory and personal Microsoft accounts'"
echo "      - Redirect URI: 'https://dash.dealershipai.com/api/auth/callback/azure-ad'"
echo "   e) Go to 'Certificates & secrets' → 'New client secret'"
echo "   f) Copy Application (client) ID, Directory (tenant) ID, and Client secret"
echo ""

# Facebook OAuth Setup (Optional)
echo "4. 📘 Facebook OAuth Setup (Optional)"
echo "------------------------------------"
echo "   a) Go to: https://developers.facebook.com/"
echo "   b) Create a new app"
echo "   c) Add 'Facebook Login' product"
echo "   d) Go to 'Facebook Login' → 'Settings'"
echo "   e) Add Valid OAuth Redirect URIs:"
echo "      - https://dash.dealershipai.com/api/auth/callback/facebook"
echo "   f) Copy App ID and App Secret"
echo ""

echo "🔧 Environment Variables Configuration"
echo "====================================="
echo ""

# Update .env.local with OAuth variables
print_info "Updating .env.local with OAuth configuration..."

# Backup existing .env.local
cp .env.local .env.local.backup

# Add OAuth variables to .env.local if they don't exist
if ! grep -q "GOOGLE_CLIENT_ID" .env.local; then
    echo "" >> .env.local
    echo "# OAuth Providers" >> .env.local
    echo "GOOGLE_CLIENT_ID=your-google-client-id" >> .env.local
    echo "GOOGLE_CLIENT_SECRET=your-google-client-secret" >> .env.local
fi

if ! grep -q "GITHUB_CLIENT_ID" .env.local; then
    echo "GITHUB_CLIENT_ID=your-github-client-id" >> .env.local
    echo "GITHUB_CLIENT_SECRET=your-github-client-secret" >> .env.local
fi

if ! grep -q "AZURE_AD_CLIENT_ID" .env.local; then
    echo "" >> .env.local
    echo "# Optional OAuth Providers" >> .env.local
    echo "AZURE_AD_CLIENT_ID=your-azure-client-id" >> .env.local
    echo "AZURE_AD_CLIENT_SECRET=your-azure-client-secret" >> .env.local
    echo "AZURE_AD_TENANT_ID=your-azure-tenant-id" >> .env.local
fi

if ! grep -q "FACEBOOK_CLIENT_ID" .env.local; then
    echo "FACEBOOK_CLIENT_ID=your-facebook-client-id" >> .env.local
    echo "FACEBOOK_CLIENT_SECRET=your-facebook-client-secret" >> .env.local
fi

print_status ".env.local updated with OAuth variables"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Edit .env.local and replace the placeholder values with your actual OAuth credentials"
echo "2. Run: npm run dev"
echo "3. Test OAuth at: http://localhost:3000/test-auth"
echo "4. Test sign-in at: http://localhost:3000/auth/signin"
echo ""

echo "🧪 Testing Commands:"
echo "==================="
echo "npm run dev                    # Start development server"
echo "curl http://localhost:3000/api/auth/providers  # Check available providers"
echo ""

echo "🚀 Production Deployment:"
echo "========================"
echo "1. Add all OAuth credentials to Vercel environment variables"
echo "2. Update OAuth provider redirect URIs to production domain"
echo "3. Deploy: vercel --prod"
echo ""

print_status "OAuth setup script completed!"
print_warning "Remember to replace placeholder values in .env.local with your actual OAuth credentials"
