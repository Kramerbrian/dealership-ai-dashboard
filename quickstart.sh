#!/bin/bash

# DealershipAI Dashboard - One-Command Setup
# Auto-configures everything for immediate deployment

set -e  # Exit on any error

echo "🚀 DealershipAI Dashboard - Quick Start Setup"
echo "=============================================="
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

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js $(node --version) detected"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "npm $(npm --version) detected"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Install all required packages
    npm install --legacy-peer-deps
    
    print_status "Dependencies installed successfully"
}

# Set up environment variables
setup_environment() {
    print_info "Setting up environment variables..."
    
    # Create .env.local if it doesn't exist
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# DealershipAI Environment Configuration
# =====================================

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Platforms
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# AWS Bedrock (for Llama 3.1)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# Facebook Page Integration (Compliant)
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_PAGE_ACCESS_TOKEN=your-page-access-token
FACEBOOK_VERIFY_TOKEN=your-verify-token

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key
CLERK_SECRET_KEY=sk_test_your-clerk-secret
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret

# Queue Management
QSTASH_TOKEN=qst_your-qstash-token
QSTASH_URL=https://qstash.upstash.io/v2/publish

# Security
CRON_SECRET=your-secure-cron-secret-$(openssl rand -hex 16)

# Application
NEXT_PUBLIC_URL=http://localhost:3000
NODE_ENV=development
EOF
        print_status "Created .env.local template"
        print_warning "Please update .env.local with your actual API keys"
    else
        print_info ".env.local already exists"
    fi
}

# Set up database schema
setup_database() {
    print_info "Setting up database schema..."
    
    # Check if Supabase URL is configured
    if grep -q "your-project.supabase.co" .env.local; then
        print_warning "Please configure your Supabase URL in .env.local first"
        print_info "Run: ./setup-supabase.sh after configuring .env.local"
    else
        # Run database setup if Supabase is configured
        if [ -f setup-supabase.sh ]; then
            chmod +x setup-supabase.sh
            ./setup-supabase.sh
        else
            print_warning "Database setup script not found"
        fi
    fi
}

# Build the application
build_application() {
    print_info "Building application..."
    
    # Run Next.js build
    npm run build
    
    print_status "Application built successfully"
}

# Set up Vercel deployment
setup_vercel() {
    print_info "Setting up Vercel deployment..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel@latest
    fi
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_info "Please log in to Vercel:"
        vercel login
    fi
    
    print_status "Vercel CLI ready"
    print_info "Run 'vercel --prod' to deploy to production"
}

# Create sample data
create_sample_data() {
    print_info "Creating sample data..."
    
    if [ -f test-sample-data.js ]; then
        node test-sample-data.js
        print_status "Sample data created"
    else
        print_warning "Sample data script not found"
    fi
}

# Run development server
start_dev_server() {
    print_info "Starting development server..."
    
    print_status "DealershipAI Dashboard is ready!"
    echo ""
    echo "🌐 Access your dashboard at: http://localhost:3000"
    echo "📊 Dashboard: http://localhost:3000/dashboard"
    echo "📈 Leaderboard: http://localhost:3000/leaderboard"
    echo "🔧 API Health: http://localhost:3000/api/health"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update .env.local with your API keys"
    echo "2. Run ./setup-supabase.sh to set up database"
    echo "3. Run ./deploy-production.sh to deploy to Vercel"
    echo ""
    echo "🚀 Starting development server..."
    
    npm run dev
}

# Main execution
main() {
    echo "Starting DealershipAI Dashboard setup..."
    echo ""
    
    # Pre-flight checks
    check_node
    check_npm
    
    # Setup steps
    install_dependencies
    setup_environment
    setup_database
    build_application
    setup_vercel
    create_sample_data
    
    # Start development server
    start_dev_server
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "DealershipAI Dashboard Quick Start"
        echo ""
        echo "Usage: $0 [option]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --build-only   Only build the application (no dev server)"
        echo "  --deploy       Deploy to Vercel after setup"
        echo "  --no-dev       Skip starting development server"
        echo ""
        echo "Examples:"
        echo "  $0                    # Full setup with dev server"
        echo "  $0 --build-only       # Just build the app"
        echo "  $0 --deploy           # Setup and deploy to Vercel"
        echo "  $0 --no-dev           # Setup without starting dev server"
        exit 0
        ;;
    --build-only)
        check_node
        check_npm
        install_dependencies
        setup_environment
        build_application
        print_status "Build complete! Run 'npm run dev' to start development server."
        exit 0
        ;;
    --deploy)
        check_node
        check_npm
        install_dependencies
        setup_environment
        build_application
        setup_vercel
        print_info "Deploying to Vercel..."
        vercel --prod
        exit 0
        ;;
    --no-dev)
        check_node
        check_npm
        install_dependencies
        setup_environment
        setup_database
        build_application
        setup_vercel
        create_sample_data
        print_status "Setup complete! Run 'npm run dev' when ready."
        exit 0
        ;;
    *)
        main
        ;;
esac
