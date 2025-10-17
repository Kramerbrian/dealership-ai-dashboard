#!/bin/bash

# DealershipAI OAuth Setup Verification Script
# This script verifies that OAuth is properly configured

echo "🔍 DealershipAI OAuth Setup Verification"
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

# Check if development server is running
if ! curl -s "http://localhost:3000" > /dev/null; then
    print_error "Development server not running. Start with: npm run dev"
    exit 1
fi

print_status "Development server is running"

echo ""
echo "🔧 Environment Variables Check"
echo "============================="
echo ""

# Check environment variables
if [ -f ".env.local" ]; then
    print_status ".env.local file exists"
    
    # Check Google OAuth
    if grep -q "GOOGLE_CLIENT_ID" .env.local && ! grep -q "your-google-client-id" .env.local; then
        print_status "Google OAuth configured"
    else
        print_warning "Google OAuth needs configuration (placeholder values found)"
    fi
    
    # Check GitHub OAuth
    if grep -q "GITHUB_CLIENT_ID" .env.local && ! grep -q "your-github-client-id" .env.local; then
        print_status "GitHub OAuth configured"
    else
        print_warning "GitHub OAuth needs configuration (placeholder values found)"
    fi
    
    # Check NextAuth secret
    if grep -q "NEXTAUTH_SECRET" .env.local && ! grep -q "your-" .env.local; then
        print_status "NextAuth secret configured"
    else
        print_warning "NextAuth secret may need configuration"
    fi
else
    print_error ".env.local file not found"
fi

echo ""
echo "🧪 OAuth API Testing"
echo "==================="
echo ""

# Test OAuth providers API
print_info "Testing OAuth providers API..."
response=$(curl -s "http://localhost:3000/api/auth/providers")

if echo "$response" | grep -q "google"; then
    print_status "Google OAuth provider available"
else
    print_error "Google OAuth provider not available"
fi

if echo "$response" | grep -q "github"; then
    print_status "GitHub OAuth provider available"
else
    print_error "GitHub OAuth provider not available"
fi

echo ""
echo "📱 Page Testing"
echo "=============="
echo ""

# Test key pages
test_url() {
    local url=$1
    local description=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200"; then
        print_status "$description - OK"
        return 0
    else
        print_error "$description - FAILED"
        return 1
    fi
}

test_url "http://localhost:3000" "Landing page"
test_url "http://localhost:3000/auth/signin" "Sign-in page"
test_url "http://localhost:3000/signup" "Sign-up page"
test_url "http://localhost:3000/test-auth" "Test authentication page"

echo ""
echo "🎯 OAuth Flow Testing"
echo "===================="
echo ""

# Test OAuth sign-in URLs
print_info "Testing OAuth sign-in URLs..."

# Test Google OAuth
google_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/auth/signin/google")
if [ "$google_response" = "302" ] || [ "$google_response" = "200" ]; then
    print_status "Google OAuth sign-in URL accessible"
else
    print_warning "Google OAuth sign-in URL returned: $google_response"
fi

# Test GitHub OAuth
github_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/auth/signin/github")
if [ "$github_response" = "302" ] || [ "$github_response" = "200" ]; then
    print_status "GitHub OAuth sign-in URL accessible"
else
    print_warning "GitHub OAuth sign-in URL returned: $github_response"
fi

echo ""
echo "📋 Manual Testing Required"
echo "========================="
echo ""

print_info "To complete OAuth verification, manually test:"
echo "1. Visit: http://localhost:3000/test-auth"
echo "2. Click 'Test Google OAuth' button"
echo "3. Click 'Test GitHub OAuth' button"
echo "4. Verify OAuth buttons redirect to provider login pages"
echo "5. Test sign-in at: http://localhost:3000/auth/signin"

echo ""
echo "🚀 Production Readiness"
echo "======================"
echo ""

# Check if production site is accessible
if curl -s "https://dash.dealershipai.com" > /dev/null; then
    print_status "Production site is accessible"
    test_url "https://dash.dealershipai.com" "Production landing page"
    test_url "https://dash.dealershipai.com/auth/signin" "Production sign-in page"
else
    print_warning "Production site not accessible (may not be deployed yet)"
fi

echo ""
echo "📊 Verification Summary"
echo "====================="
echo ""

print_info "OAuth setup verification completed!"
print_info "If you see any warnings above, follow the setup guide to configure OAuth providers."
print_info "Once configured, run this script again to verify everything is working."

echo ""
print_status "Ready to close $499/month deals! 🎯"
