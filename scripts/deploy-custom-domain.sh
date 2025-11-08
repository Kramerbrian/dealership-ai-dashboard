#!/bin/bash

###############################################################################
# Custom Domain Deployment Script for DealershipAI
# Domain: dealershipai.com
# Purpose: Deploy application with custom domain configuration
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dealershipai.com"
WWW_DOMAIN="www.dealershipai.com"
VERCEL_IP="76.76.21.21"

# Helper functions
print_header() {
    echo -e "\n${BLUE}${BOLD}========================================${NC}"
    echo -e "${BLUE}${BOLD}$1${NC}"
    echo -e "${BLUE}${BOLD}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Main deployment flow
main() {
    clear
    print_header "DealershipAI Custom Domain Deployment"
    echo "Domain: ${BOLD}${DOMAIN}${NC}"
    echo "Target: Vercel Production"
    echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # Step 1: Prerequisites check
    print_header "1/10 - Checking Prerequisites"

    local missing_deps=0

    echo "Checking required tools..."
    if check_command "node"; then
        print_success "Node.js $(node -v) is installed"
    else
        print_error "Node.js is not installed"
        missing_deps=1
    fi

    if check_command "npm"; then
        print_success "npm $(npm -v) is installed"
    else
        print_error "npm is not installed"
        missing_deps=1
    fi

    if check_command "vercel"; then
        print_success "Vercel CLI is installed"
    else
        print_warning "Vercel CLI not installed. Run: npm i -g vercel"
        missing_deps=1
    fi

    if check_command "dig"; then
        print_success "dig (DNS tool) is available"
    else
        print_warning "dig not found (optional for DNS checks)"
    fi

    if check_command "curl"; then
        print_success "curl is available"
    else
        print_error "curl is not installed"
        missing_deps=1
    fi

    if [ $missing_deps -eq 1 ]; then
        print_error "Missing required dependencies. Please install them first."
        exit 1
    fi

    # Step 2: Environment variables check
    print_header "2/10 - Checking Environment Variables"

    echo "Verifying Vercel environment variables..."

    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not available. Cannot check environment variables."
        exit 1
    fi

    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Running: vercel login"
        vercel login
    fi

    print_success "Logged in to Vercel as $(vercel whoami)"

    # List of required production environment variables
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "NEXT_PUBLIC_BASE_URL"
    )

    local recommended_vars=(
        "RESEND_API_KEY"
        "FROM_EMAIL"
        "UPSTASH_REDIS_REST_URL"
        "UPSTASH_REDIS_REST_TOKEN"
        "OPENAI_API_KEY"
        "ANTHROPIC_API_KEY"
    )

    echo ""
    echo "Required variables (must be set):"
    for var in "${required_vars[@]}"; do
        echo "  - $var"
    done

    echo ""
    echo "Recommended variables (optional but improve functionality):"
    for var in "${recommended_vars[@]}"; do
        echo "  - $var"
    done

    echo ""
    read -p "Have you set all required environment variables in Vercel? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please set environment variables first:"
        echo "  vercel env add VARIABLE_NAME production"
        echo "Or use the Vercel dashboard: https://vercel.com/dashboard"
        exit 1
    fi

    print_success "Environment variables confirmed"

    # Step 3: DNS configuration check
    print_header "3/10 - Checking DNS Configuration"

    if check_command "dig"; then
        echo "Checking DNS for ${DOMAIN}..."

        local apex_ip=$(dig +short ${DOMAIN} | head -1)
        if [ -z "$apex_ip" ]; then
            print_warning "No DNS record found for ${DOMAIN}"
            print_info "Expected A record: ${VERCEL_IP}"
        elif echo "$apex_ip" | grep -q "${VERCEL_IP}"; then
            print_success "${DOMAIN} → ${VERCEL_IP} (correct)"
        else
            print_warning "${DOMAIN} → ${apex_ip} (expected ${VERCEL_IP})"
        fi

        echo ""
        echo "Checking DNS for ${WWW_DOMAIN}..."
        local www_cname=$(dig +short ${WWW_DOMAIN} CNAME | head -1)
        if [ -z "$www_cname" ]; then
            print_warning "No CNAME record found for ${WWW_DOMAIN}"
            print_info "Expected CNAME: cname.vercel-dns.com"
        elif echo "$www_cname" | grep -q "vercel"; then
            print_success "${WWW_DOMAIN} → ${www_cname} (correct)"
        else
            print_warning "${WWW_DOMAIN} → ${www_cname} (expected cname.vercel-dns.com)"
        fi

        echo ""
        echo "Checking email DNS (SPF/DKIM)..."
        if dig TXT ${DOMAIN} | grep -q "spf"; then
            print_success "SPF record found"
        else
            print_warning "SPF record not found (needed for email)"
        fi

        if dig CNAME resend._domainkey.${DOMAIN} | grep -q "resend"; then
            print_success "DKIM records found"
        else
            print_warning "DKIM records not found (needed for email)"
        fi
    else
        print_warning "dig not available, skipping DNS checks"
    fi

    echo ""
    read -p "Are DNS records configured correctly? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please configure DNS records first. See: docs/DNS_RECORDS.txt"
        exit 1
    fi

    # Step 4: Database migrations
    print_header "4/10 - Database Migrations"

    echo "Production database migrations must be applied before deployment."
    echo ""
    echo "Required migrations:"
    echo "  1. supabase/migrations/20250101000001_origins_and_fleet.sql"
    echo "  2. supabase/migrations/20250101000002_leads_and_email.sql"
    echo ""
    echo "To apply migrations:"
    echo "  npx supabase db push --project-ref YOUR_PROJECT_REF"
    echo ""

    read -p "Have you applied all database migrations to production? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please apply migrations first."
        echo ""
        echo "Connect to your Supabase project:"
        echo "  npx supabase link --project-ref YOUR_PROJECT_REF"
        echo ""
        echo "Apply migrations:"
        echo "  npx supabase db push"
        exit 1
    fi

    print_success "Database migrations confirmed"

    # Step 5: Dependencies installation
    print_header "5/10 - Installing Dependencies"

    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    else
        echo "Updating dependencies..."
        npm install
    fi

    print_success "Dependencies installed"

    # Step 6: Build verification
    print_header "6/10 - Build Verification"

    echo "Building application locally to verify..."
    if npm run build; then
        print_success "Local build completed successfully"
    else
        print_error "Build failed. Please fix errors before deploying."
        exit 1
    fi

    # Step 7: Domain configuration in Vercel
    print_header "7/10 - Vercel Domain Configuration"

    echo "Checking if domain is added to Vercel project..."

    if vercel domains ls 2>/dev/null | grep -q "${DOMAIN}"; then
        print_success "Domain ${DOMAIN} is configured in Vercel"
    else
        print_warning "Domain ${DOMAIN} not found in Vercel project"
        echo ""
        read -p "Add domain to Vercel now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Adding domain..."
            vercel domains add ${DOMAIN}
            vercel domains add ${WWW_DOMAIN}
            print_success "Domains added to Vercel"
        else
            print_warning "Please add domains manually in Vercel dashboard"
        fi
    fi

    # Step 8: Deploy to production
    print_header "8/10 - Deploying to Production"

    echo "This will deploy to:"
    echo "  • https://${DOMAIN}"
    echo "  • https://${WWW_DOMAIN}"
    echo ""
    echo "The deployment will:"
    echo "  1. Build the application"
    echo "  2. Deploy to Vercel production"
    echo "  3. Automatically provision SSL certificate"
    echo "  4. Set up cron jobs for email automation"
    echo ""

    read -p "Continue with production deployment? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        print_info "Deploying to Vercel production..."

        if vercel --prod --yes; then
            print_success "Deployment completed successfully!"
        else
            print_error "Deployment failed"
            exit 1
        fi
    else
        print_warning "Deployment cancelled by user"
        exit 0
    fi

    # Step 9: Post-deployment verification
    print_header "9/10 - Post-Deployment Verification"

    echo "Waiting 15 seconds for deployment to propagate..."
    sleep 15

    echo ""
    echo "Running health checks..."

    # Test homepage
    local homepage_status=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN} || echo "000")
    if [ "$homepage_status" == "200" ]; then
        print_success "Homepage (/) returns 200 OK"
    else
        print_warning "Homepage returned status: $homepage_status"
    fi

    # Test instant analyzer
    local instant_status=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/instant || echo "000")
    if [ "$instant_status" == "200" ]; then
        print_success "Instant analyzer (/instant) returns 200 OK"
    else
        print_warning "Instant analyzer returned status: $instant_status"
    fi

    # Test API health
    local api_status=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/api/health || echo "000")
    if [ "$api_status" == "200" ]; then
        print_success "API health endpoint returns 200 OK"
    else
        print_warning "API health returned status: $api_status"
    fi

    # Test SSL
    echo ""
    echo "Checking SSL certificate..."
    if curl -vI https://${DOMAIN} 2>&1 | grep -q "SSL certificate verify ok"; then
        print_success "SSL certificate is valid"
    else
        print_warning "SSL certificate may still be provisioning (can take up to 24 hours)"
        print_info "Check status in Vercel dashboard"
    fi

    # Step 10: Final setup tasks
    print_header "10/10 - Final Setup Tasks"

    echo "Checking Resend domain verification..."
    if check_command "dig"; then
        if dig TXT ${DOMAIN} | grep -q "spf" && dig CNAME resend._domainkey.${DOMAIN} | grep -q "resend"; then
            print_success "Email DNS records appear configured"
            print_info "Verify domain in Resend dashboard: https://resend.com/domains"
        else
            print_warning "Email DNS records may not be fully configured"
        fi
    fi

    # Summary
    print_header "Deployment Complete! 🎉"

    echo "🚀 Your application is now live at:"
    echo "   ${BOLD}https://${DOMAIN}${NC}"
    echo ""
    echo "📊 Deployment Status:"
    echo "   • Homepage: $homepage_status"
    echo "   • Instant Analyzer: $instant_status"
    echo "   • API Health: $api_status"
    echo ""
    echo "🔗 Key URLs:"
    echo "   • Homepage: https://${DOMAIN}"
    echo "   • Instant Analyzer: https://${DOMAIN}/instant"
    echo "   • Fleet Dashboard: https://${DOMAIN}/fleet"
    echo "   • API Health: https://${DOMAIN}/api/health"
    echo ""
    echo "📋 Post-Deployment Checklist:"
    echo "   [ ] Verify domain in Resend dashboard"
    echo "   [ ] Test email sending from noreply@${DOMAIN}"
    echo "   [ ] Set up uptime monitoring (UptimeRobot, Pingdom)"
    echo "   [ ] Submit sitemap to Google Search Console"
    echo "   [ ] Add Google Analytics property"
    echo "   [ ] Configure error tracking (Sentry)"
    echo "   [ ] Test all user flows"
    echo "   [ ] Review Vercel analytics"
    echo ""
    echo "📚 Documentation:"
    echo "   • Domain Setup Guide: docs/DOMAIN_SETUP.md"
    echo "   • DNS Configuration: docs/DNS_RECORDS.txt"
    echo "   • Production Deploy: PRODUCTION_DEPLOY.md"
    echo "   • Real Data Integration: REAL_DATA_INTEGRATION.md"
    echo ""
    echo "🔍 Monitoring Dashboards:"
    echo "   • Vercel: https://vercel.com/dashboard"
    echo "   • Supabase: https://supabase.com/dashboard/project/_/settings/api"
    echo "   • Resend: https://resend.com/emails"
    echo ""
    echo "⚠️  Important Notes:"
    echo "   • SSL certificates may take up to 24 hours to fully provision"
    echo "   • Email sending requires Resend domain verification"
    echo "   • Cron jobs are configured and will run hourly"
    echo "   • Monitor logs in Vercel dashboard for any issues"
    echo ""

    print_success "All deployment steps completed! 🎉"
    echo ""
}

# Run main function
main "$@"
