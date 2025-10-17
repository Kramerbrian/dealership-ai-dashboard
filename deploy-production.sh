#!/bin/bash

# DealershipAI v2.0 - Production Deployment Script
# Complete system deployment with all high-leverage upgrades

set -e

echo "🚀 DealershipAI v2.0 - Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting production deployment..."

# 1. Install dependencies
print_status "Installing dependencies..."
npm install

# 2. Run type check
print_status "Running TypeScript type check..."
npm run type-check

# 3. Run linting
print_status "Running ESLint..."
npm run lint

# 4. Build the application
print_status "Building application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed. Please fix errors before deploying."
    exit 1
fi

# 5. Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    print_success "Deployment completed successfully!"
else
    print_error "Deployment failed. Please check the logs above."
    exit 1
fi

# 6. Run smoke tests
print_status "Running smoke tests..."
if [ -f "scripts/test-avi-endpoints.sh" ]; then
    chmod +x scripts/test-avi-endpoints.sh
    ./scripts/test-avi-endpoints.sh
fi

# 7. Display deployment summary
print_success "🎉 DealershipAI v2.0 Deployment Complete!"
echo ""
echo "✅ Features Deployed:"
echo "   • AVI Dashboard with real-time data"
echo "   • Multi-tenant architecture"
echo "   • AI engine credibility tracking"
echo "   • Security & privacy compliance"
echo "   • Mobile-optimized UI"
echo "   • Exit-intent modal"
echo "   • Live activity ticker"
echo "   • URL validation & GBP integration"
echo "   • City personalization"
echo "   • JSON-LD structured data"
echo "   • Accessibility compliance"
echo "   • Performance optimizations"
echo ""
echo "🔗 Next Steps:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure Stripe products for billing"
echo "   3. Set up database migrations"
echo "   4. Configure cron jobs"
echo "   5. Test all functionality"
echo ""
echo "📊 Monitor your deployment at: https://vercel.com/dashboard"
echo ""

print_success "Deployment script completed successfully!"