#!/bin/bash

# DealershipAI Deployment Testing Script
# This script tests all the key functionality after deployment

echo "🧪 DealershipAI Deployment Testing"
echo "=================================="
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

# Test URLs
BASE_URL="http://localhost:3000"
PROD_URL="https://dash.dealershipai.com"

# Function to test URL
test_url() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    print_info "Testing: $description"
    echo "  URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        print_status "$description - OK ($response)"
        return 0
    else
        print_error "$description - FAILED ($response)"
        return 1
    fi
}

# Function to test OAuth providers
test_oauth_providers() {
    print_info "Testing OAuth providers configuration..."
    
    response=$(curl -s "$BASE_URL/api/auth/providers")
    
    if echo "$response" | grep -q "google"; then
        print_status "Google OAuth provider configured"
    else
        print_error "Google OAuth provider missing"
    fi
    
    if echo "$response" | grep -q "github"; then
        print_status "GitHub OAuth provider configured"
    else
        print_error "GitHub OAuth provider missing"
    fi
    
    if echo "$response" | grep -q "azure-ad"; then
        print_status "Azure AD OAuth provider configured"
    else
        print_warning "Azure AD OAuth provider not configured (optional)"
    fi
    
    if echo "$response" | grep -q "facebook"; then
        print_status "Facebook OAuth provider configured"
    else
        print_warning "Facebook OAuth provider not configured (optional)"
    fi
}

echo "🔍 Testing Local Development Server"
echo "=================================="
echo ""

# Test if development server is running
if ! curl -s "$BASE_URL" > /dev/null; then
    print_error "Development server not running. Start with: npm run dev"
    exit 1
fi

print_status "Development server is running"

# Test main pages
test_url "$BASE_URL" "Landing page"
test_url "$BASE_URL/auth/signin" "Sign-in page"
test_url "$BASE_URL/signup" "Sign-up page"
test_url "$BASE_URL/test-auth" "Test authentication page"

# Test OAuth providers
test_oauth_providers

echo ""
echo "🎯 Testing Key Features"
echo "======================"
echo ""

# Test API endpoints
test_url "$BASE_URL/api/auth/providers" "OAuth providers API"
test_url "$BASE_URL/api/auth/session" "Session API"

echo ""
echo "📱 Testing CTA Functionality"
echo "============================"
echo ""

# Test that CTAs are present on landing page
landing_content=$(curl -s "$BASE_URL")
if echo "$landing_content" | grep -q "Sign In"; then
    print_status "Sign In button present on landing page"
else
    print_error "Sign In button missing from landing page"
fi

if echo "$landing_content" | grep -q "Run Free Scan"; then
    print_status "Free scan CTA present on landing page"
else
    print_error "Free scan CTA missing from landing page"
fi

if echo "$landing_content" | grep -q "Calculate My Opportunity"; then
    print_status "Calculator CTA present on landing page"
else
    print_error "Calculator CTA missing from landing page"
fi

echo ""
echo "🔧 Environment Variables Check"
echo "============================="
echo ""

# Check environment variables
if [ -f ".env.local" ]; then
    print_status ".env.local file exists"
    
    if grep -q "NEXTAUTH_SECRET" .env.local && ! grep -q "your-" .env.local; then
        print_status "NextAuth secret configured"
    else
        print_warning "NextAuth secret may need configuration"
    fi
    
    if grep -q "GOOGLE_CLIENT_ID" .env.local && ! grep -q "your-google-client-id" .env.local; then
        print_status "Google OAuth configured"
    else
        print_warning "Google OAuth needs configuration"
    fi
    
    if grep -q "GITHUB_CLIENT_ID" .env.local && ! grep -q "your-github-client-id" .env.local; then
        print_status "GitHub OAuth configured"
    else
        print_warning "GitHub OAuth needs configuration"
    fi
else
    print_error ".env.local file not found"
fi

echo ""
echo "🚀 Production Readiness Check"
echo "============================"
echo ""

# Check if production URLs are accessible (if deployed)
if curl -s "$PROD_URL" > /dev/null 2>&1; then
    print_status "Production site is accessible"
    test_url "$PROD_URL" "Production landing page"
    test_url "$PROD_URL/auth/signin" "Production sign-in page"
else
    print_warning "Production site not accessible (may not be deployed yet)"
fi

echo ""
echo "📋 Testing Summary"
echo "================="
echo ""

print_info "Manual testing required:"
echo "1. Visit http://localhost:3000/test-auth"
echo "2. Test Google OAuth sign-in"
echo "3. Test GitHub OAuth sign-in"
echo "4. Verify redirects work properly"
echo "5. Test landing page CTAs"

echo ""
print_info "Next steps:"
echo "1. Configure OAuth providers with actual credentials"
echo "2. Test OAuth flow manually"
echo "3. Deploy to production"
echo "4. Update OAuth provider redirect URIs"

echo ""
print_status "Testing completed! 🎯"
