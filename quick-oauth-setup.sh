#!/bin/bash

# DealershipAI Quick OAuth Setup Script
# This script opens the OAuth provider setup pages for you

echo "🚀 DealershipAI Quick OAuth Setup"
echo "================================="
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

echo "📋 OAuth Provider Setup"
echo "======================"
echo ""

print_info "Opening OAuth provider setup pages..."

# Open Google Cloud Console
echo "1. 🔵 Opening Google Cloud Console..."
open "https://console.cloud.google.com/"
print_info "   - Create/select project: 'DealershipAI'"
print_info "   - Enable Google+ API"
print_info "   - Create OAuth 2.0 Client ID"
print_info "   - Add redirect URIs:"
print_info "     • http://localhost:3000/api/auth/callback/google"
print_info "     • https://dash.dealershipai.com/api/auth/callback/google"

echo ""
read -p "Press Enter when you have your Google Client ID and Secret..."

# Open GitHub Developer Settings
echo "2. 🐙 Opening GitHub Developer Settings..."
open "https://github.com/settings/developers"
print_info "   - Create New OAuth App"
print_info "   - Name: 'DealershipAI'"
print_info "   - Homepage: 'https://dealershipai.com'"
print_info "   - Callback: 'https://dash.dealershipai.com/api/auth/callback/github'"

echo ""
read -p "Press Enter when you have your GitHub Client ID and Secret..."

echo ""
echo "🔧 Updating Environment Variables"
echo "================================"
echo ""

# Run the credential update script
if [ -f "./update-oauth-credentials.sh" ]; then
    print_info "Running credential update script..."
    ./update-oauth-credentials.sh
else
    print_warning "Credential update script not found. Please update .env.local manually:"
    echo ""
    echo "Edit .env.local and replace:"
    echo "GOOGLE_CLIENT_ID=your-actual-google-client-id"
    echo "GOOGLE_CLIENT_SECRET=your-actual-google-client-secret"
    echo "GITHUB_CLIENT_ID=your-actual-github-client-id"
    echo "GITHUB_CLIENT_SECRET=your-actual-github-client-secret"
fi

echo ""
echo "🧪 Testing OAuth Setup"
echo "====================="
echo ""

print_info "Restarting development server..."
# Kill existing dev server if running
pkill -f "next dev" 2>/dev/null || true

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

print_info "Testing OAuth configuration..."
./verify-oauth-setup.sh

echo ""
echo "🚀 Deploy to Production"
echo "======================"
echo ""

read -p "Ready to deploy to production? (y/n): " deploy_choice

if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
    if [ -f "./deploy-to-production.sh" ]; then
        print_info "Deploying to production..."
        ./deploy-to-production.sh
    else
        print_warning "Deployment script not found. Deploy manually with:"
        echo "vercel --prod"
    fi
else
    print_info "Skipping production deployment. You can deploy later with:"
    echo "./deploy-to-production.sh"
fi

echo ""
echo "🎯 Setup Complete!"
echo "================="
echo ""

print_status "OAuth setup completed!"
print_info "Test your OAuth flow at: http://localhost:3000/test-auth"
print_info "Test sign-in at: http://localhost:3000/auth/signin"
print_info "Production site: https://dash.dealershipai.com"

echo ""
print_status "Ready to close $499/month deals! 🎯💰"
