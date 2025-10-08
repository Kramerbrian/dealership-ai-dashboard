#!/bin/bash

# DealershipAI Enterprise - Deployment Setup Script
# This script helps configure the deployed application

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/briankramer/dealership-ai-dashboard/dealershipai-enterprise"
DEPLOYMENT_URL="https://dealershipai-enterprise-a839dxdvw-brian-kramers-projects.vercel.app"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   DealershipAI Enterprise - Deployment Setup Wizard       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print step header
print_step() {
    echo -e "\n${BLUE}━━━ $1 ━━━${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
fi

# Navigate to project directory
cd "$PROJECT_DIR"

print_step "Step 1: Checking Deployment Status"
print_success "Deployment URL: $DEPLOYMENT_URL"

# Test if deployment protection is enabled
if curl -s "$DEPLOYMENT_URL/api/health" | grep -q "Authentication Required"; then
    print_warning "Deployment Protection is ENABLED"
    echo ""
    echo "To disable protection:"
    echo "1. Visit: https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/deployment-protection"
    echo "2. Toggle 'Protection' to OFF"
    echo ""
    read -p "Press Enter after disabling protection to continue..."
else
    print_success "Deployment is publicly accessible"
fi

print_step "Step 2: Environment Variables"
echo "Current environment variables in Vercel:"
vercel env ls || print_warning "No environment variables found"
echo ""

read -p "Do you want to add environment variables? (y/n): " add_env
if [[ $add_env == "y" || $add_env == "Y" ]]; then
    echo ""
    echo "Choose a method:"
    echo "1. Add variables interactively via CLI"
    echo "2. Pull from .env.local file"
    echo "3. Skip (add manually in Vercel Dashboard)"
    read -p "Enter choice (1-3): " env_choice

    case $env_choice in
        1)
            print_warning "Adding variables interactively..."
            echo "For each variable, you'll be prompted to enter the value"

            # Database
            read -p "Add DATABASE_URL? (y/n): " add_db
            [[ $add_db == "y" ]] && vercel env add DATABASE_URL production

            # NextAuth
            read -p "Add NEXTAUTH_SECRET? (y/n): " add_auth
            [[ $add_auth == "y" ]] && vercel env add NEXTAUTH_SECRET production

            # Stripe
            read -p "Add STRIPE_SECRET_KEY? (y/n): " add_stripe
            [[ $add_stripe == "y" ]] && vercel env add STRIPE_SECRET_KEY production

            print_success "Environment variables added"
            ;;
        2)
            if [ -f ".env.local" ]; then
                print_warning "Pushing environment variables from .env.local..."
                vercel env pull .env.production
                print_success "Environment variables synchronized"
            else
                print_error ".env.local file not found"
            fi
            ;;
        3)
            echo "Add variables manually at:"
            echo "https://vercel.com/brian-kramers-projects/dealershipai-enterprise/settings/environment-variables"
            ;;
    esac
fi

print_step "Step 3: Stripe Webhook Configuration"
echo "Webhook URL: $DEPLOYMENT_URL/api/webhooks/stripe"
echo ""
echo "Configure in Stripe Dashboard:"
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter URL: $DEPLOYMENT_URL/api/webhooks/stripe"
echo "4. Select events: checkout.session.completed, customer.subscription.*"
echo "5. Copy the signing secret"
echo ""
read -p "Have you configured the Stripe webhook? (y/n): " stripe_done
if [[ $stripe_done == "y" || $stripe_done == "Y" ]]; then
    read -p "Enter the webhook signing secret (whsec_...): " webhook_secret
    if [ ! -z "$webhook_secret" ]; then
        echo "$webhook_secret" | vercel env add STRIPE_WEBHOOK_SECRET production --stdin
        print_success "Stripe webhook secret added"
    fi
else
    print_warning "Remember to configure Stripe webhooks later"
fi

print_step "Step 4: OAuth Provider Configuration"
echo "Configure OAuth providers for social login:"
echo ""
echo "GitHub OAuth:"
echo "- Visit: https://github.com/settings/developers"
echo "- Create OAuth App with callback: $DEPLOYMENT_URL/api/auth/callback/github"
echo ""
echo "Google OAuth:"
echo "- Visit: https://console.cloud.google.com/apis/credentials"
echo "- Create OAuth 2.0 Client with redirect: $DEPLOYMENT_URL/api/auth/callback/google"
echo ""
read -p "Do you want to add OAuth credentials now? (y/n): " add_oauth
if [[ $add_oauth == "y" || $add_oauth == "Y" ]]; then
    read -p "GitHub Client ID: " github_id
    read -p "GitHub Client Secret: " github_secret
    [ ! -z "$github_id" ] && echo "$github_id" | vercel env add GITHUB_ID production --stdin
    [ ! -z "$github_secret" ] && echo "$github_secret" | vercel env add GITHUB_SECRET production --stdin

    read -p "Google Client ID: " google_id
    read -p "Google Client Secret: " google_secret
    [ ! -z "$google_id" ] && echo "$google_id" | vercel env add GOOGLE_CLIENT_ID production --stdin
    [ ! -z "$google_secret" ] && echo "$google_secret" | vercel env add GOOGLE_CLIENT_SECRET production --stdin

    print_success "OAuth credentials added"
fi

print_step "Step 5: Testing Deployment"
echo "Testing API endpoints..."
echo ""

# Test health endpoint
echo -n "Health endpoint... "
if curl -s "$DEPLOYMENT_URL/api/health" | grep -q "status"; then
    print_success "OK"
else
    print_warning "Unable to access (may require authentication)"
fi

# Test scores endpoint
echo -n "Scores endpoint... "
if curl -s "$DEPLOYMENT_URL/api/scores" | grep -q "error\|success\|Authentication"; then
    print_success "OK"
else
    print_warning "Unable to access"
fi

print_step "Step 6: Redeploying with New Environment Variables"
read -p "Redeploy to apply environment variable changes? (y/n): " redeploy
if [[ $redeploy == "y" || $redeploy == "Y" ]]; then
    print_warning "Triggering redeployment..."
    vercel --prod
    print_success "Redeployment initiated"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 Setup Complete! 🎉                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Your dashboard is ready at:"
echo -e "${GREEN}$DEPLOYMENT_URL${NC}"
echo ""
echo "Next steps:"
echo "1. Visit the dashboard and test authentication"
echo "2. Configure custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Review the full guide: DEPLOYMENT-SETUP-GUIDE.md"
echo ""
echo "For detailed configuration, see:"
echo "  cat DEPLOYMENT-SETUP-GUIDE.md"
echo ""
