#!/bin/bash

# VDP-TOP + AEMD Production Deployment Script
# This script deploys the complete AI visibility optimization system

set -e  # Exit on any error

echo "🚀 Starting VDP-TOP + AEMD Production Deployment"
echo "================================================="

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_success "All dependencies are available"
}

# Validate environment variables
validate_environment() {
    print_status "Validating environment variables..."
    
    required_vars=(
        "OPENAI_API_KEY"
        "ANTHROPIC_API_KEY"
        "GEMINI_API_KEY"
        "DATABASE_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_error "Please set these variables and try again."
        exit 1
    fi
    
    print_success "All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        npm ci --production
    else
        npm install
    fi
    
    print_success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    print_status "Running test suites..."
    
    # VDP-TOP tests
    print_status "Running VDP-TOP system tests..."
    if npm run test:vdp-top; then
        print_success "VDP-TOP tests passed"
    else
        print_error "VDP-TOP tests failed"
        exit 1
    fi
    
    # AEMD tests
    print_status "Running AEMD integration tests..."
    if npm run test:aemd; then
        print_success "AEMD tests passed"
    else
        print_error "AEMD tests failed"
        exit 1
    fi
    
    # Content audit tests
    print_status "Running content audit tests..."
    if npm run test:content-audit; then
        print_success "Content audit tests passed"
    else
        print_error "Content audit tests failed"
        exit 1
    fi
    
    # Integration tests
    print_status "Running integration tests..."
    if npm run test:integration; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        exit 1
    fi
    
    print_success "All tests passed successfully"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Clean previous build
    rm -rf .next dist
    
    # Build Next.js application
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Login to Vercel (if not already logged in)
    if ! vercel whoami &> /dev/null; then
        print_status "Logging in to Vercel..."
        vercel login
    fi
    
    # Deploy to production
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        print_success "Deployed to Vercel successfully"
    else
        print_error "Vercel deployment failed"
        exit 1
    fi
}

# Set up environment variables in Vercel
setup_vercel_env() {
    print_status "Setting up Vercel environment variables..."
    
    # Get the project URL
    PROJECT_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -z "$PROJECT_URL" ]; then
        print_error "Could not determine project URL"
        exit 1
    fi
    
    print_status "Project URL: $PROJECT_URL"
    
    # Set environment variables
    vercel env add OPENAI_API_KEY production
    vercel env add ANTHROPIC_API_KEY production
    vercel env add GEMINI_API_KEY production
    vercel env add DATABASE_URL production
    vercel env add SUPABASE_URL production
    vercel env add SUPABASE_ANON_KEY production
    vercel env add SUPABASE_SERVICE_ROLE_KEY production
    vercel env add REDIS_URL production
    vercel env add NEXTAUTH_SECRET production
    vercel env add NEXTAUTH_URL production
    vercel env add CRON_SECRET production
    
    print_success "Environment variables configured"
}

# Set up database
setup_database() {
    print_status "Setting up database..."
    
    # Run database migrations
    if [ -f "scripts/migrate-database.sh" ]; then
        chmod +x scripts/migrate-database.sh
        ./scripts/migrate-database.sh
    else
        print_warning "Database migration script not found. Please run migrations manually."
    fi
    
    print_success "Database setup completed"
}

# Set up monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create monitoring configuration
    cat > monitoring-config.json << EOF
{
  "alerts": {
    "errorRate": {
      "threshold": 5,
      "enabled": true
    },
    "responseTime": {
      "threshold": 5000,
      "enabled": true
    },
    "aemdScore": {
      "threshold": 50,
      "enabled": true
    }
  },
  "dashboards": [
    {
      "name": "VDP Management",
      "url": "/dashboard/vdp-management"
    },
    {
      "name": "AEMD Analytics",
      "url": "/dashboard/aemd"
    },
    {
      "name": "Content Audit",
      "url": "/dashboard/content-audit"
    }
  ]
}
EOF
    
    print_success "Monitoring configuration created"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get the project URL
    PROJECT_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -z "$PROJECT_URL" ]; then
        print_error "Could not determine project URL"
        exit 1
    fi
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    # Test VDP generation endpoint
    if curl -s -f "$PROJECT_URL/api/vdp-generate" > /dev/null; then
        print_success "VDP generation endpoint is accessible"
    else
        print_warning "VDP generation endpoint test failed"
    fi
    
    # Test AEMD analysis endpoint
    if curl -s -f "$PROJECT_URL/api/aemd-analyze" > /dev/null; then
        print_success "AEMD analysis endpoint is accessible"
    else
        print_warning "AEMD analysis endpoint test failed"
    fi
    
    # Test content audit endpoint
    if curl -s -f "$PROJECT_URL/api/content-audit" > /dev/null; then
        print_success "Content audit endpoint is accessible"
    else
        print_warning "Content audit endpoint test failed"
    fi
    
    print_success "Deployment verification completed"
}

# Generate deployment report
generate_report() {
    print_status "Generating deployment report..."
    
    PROJECT_URL=$(vercel ls | grep -o 'https://[^[:space:]]*' | head -1)
    
    cat > deployment-report.md << EOF
# VDP-TOP + AEMD Deployment Report

## Deployment Summary
- **Date**: $(date)
- **Status**: ✅ Successfully Deployed
- **Project URL**: $PROJECT_URL

## System Components
- ✅ VDP-TOP Protocol (Triple-Optimization Content Protocol)
- ✅ AEMD Calculator (Answer Engine Market Dominance Optimizer)
- ✅ Content Audit System
- ✅ Batch Processing APIs
- ✅ Cron Jobs for Automated Processing
- ✅ Dashboard Interfaces

## API Endpoints
- **VDP Generation**: $PROJECT_URL/api/vdp-generate
- **AEMD Analysis**: $PROJECT_URL/api/aemd-analyze
- **Content Audit**: $PROJECT_URL/api/content-audit
- **Batch VDP**: $PROJECT_URL/api/batch/vdp-generate
- **Batch AEMD**: $PROJECT_URL/api/batch/aemd-analyze
- **Batch Audit**: $PROJECT_URL/api/batch/content-audit

## Dashboard URLs
- **VDP Management**: $PROJECT_URL/dashboard/vdp-management
- **AEMD Analytics**: $PROJECT_URL/dashboard/aemd
- **Content Audit**: $PROJECT_URL/dashboard/content-audit

## Next Steps
1. Configure AI provider API keys
2. Set up monitoring and alerts
3. Train your team on the new system
4. Run initial batch processing
5. Monitor performance and optimize

## Support
- Technical Issues: development@dealershipai.com
- Content Issues: content@dealershipai.com
- Performance Issues: monitoring@dealershipai.com
EOF
    
    print_success "Deployment report generated: deployment-report.md"
}

# Main deployment function
main() {
    echo "Starting deployment process..."
    echo ""
    
    check_dependencies
    validate_environment
    install_dependencies
    run_tests
    build_application
    deploy_vercel
    setup_vercel_env
    setup_database
    setup_monitoring
    verify_deployment
    generate_report
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "================================================="
    echo ""
    echo "Your VDP-TOP + AEMD system is now live and ready for production use."
    echo ""
    echo "Next steps:"
    echo "1. Review the deployment report: deployment-report.md"
    echo "2. Configure your AI provider API keys"
    echo "3. Set up monitoring and alerts"
    echo "4. Train your team on the new dashboard interfaces"
    echo "5. Run the test suites to validate everything works correctly"
    echo ""
    echo "For support, contact: development@dealershipai.com"
}

# Run main function
main "$@"
