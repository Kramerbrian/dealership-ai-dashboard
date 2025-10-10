#!/bin/bash

# Quick Deployment Script for Governance System
# This script automates the deployment process

set -e

echo "🚀 Quick Deployment Script for Governance System"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    if [ -f "env.example" ]; then
        cp env.example .env.local
        print_warning "Please edit .env.local with your actual values before continuing"
        print_warning "Required: Supabase URL, API keys, and other secrets"
        exit 1
    else
        print_error "env.example not found. Please create .env.local manually"
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
else
    print_warning "pnpm not found. Using npm instead..."
    npm install
fi

# Run type checking
print_status "Running type checking..."
if command -v pnpm &> /dev/null; then
    pnpm ts:check || print_warning "Type checking failed, continuing..."
else
    npx tsc --noEmit || print_warning "Type checking failed, continuing..."
fi

# Run linting
print_status "Running linting..."
if command -v pnpm &> /dev/null; then
    pnpm lint || print_warning "Linting failed, continuing..."
else
    npm run lint || print_warning "Linting failed, continuing..."
fi

# Build the project
print_status "Building project..."
if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi

# Test governance system
print_status "Testing governance system..."
if [ -f "scripts/test-day3-governance-thresholds.js" ]; then
    node scripts/test-day3-governance-thresholds.js
    if [ $? -eq 0 ]; then
        print_success "Governance tests passed"
    else
        print_error "Governance tests failed"
        exit 1
    fi
fi

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    print_status "Deploying to Vercel..."
    vercel --prod --yes
    print_success "Deployment to Vercel completed"
else
    print_warning "Vercel CLI not found. Please deploy manually:"
    print_warning "1. Push changes to your Git repository"
    print_warning "2. Vercel will automatically deploy from your main branch"
fi

print_success "🎉 Quick deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "  1. Verify deployment in Vercel dashboard"
echo "  2. Test governance API endpoints"
echo "  3. Check Model Health Tiles in dashboard"
echo "  4. Monitor governance violations"
echo ""
echo "🔗 Useful Commands:"
echo "  - Test governance: node scripts/test-day3-governance-thresholds.js"
echo "  - Check model audit: node scripts/check-model-audit.js"
echo "  - Run dev server: pnpm dev"
echo ""
echo "🎯 Your governance system is now protecting your AI models!"
