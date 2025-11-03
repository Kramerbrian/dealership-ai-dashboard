#!/bin/bash

# Environment Variables Setup Script
# This script helps you add required environment variables to Vercel

set -e

echo "================================================"
echo "  DealershipAI Environment Variables Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed.${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✓ Vercel CLI found${NC}"
echo ""

# Function to add environment variable
add_env_var() {
    local var_name=$1
    local var_description=$2
    local var_example=$3

    echo -e "${YELLOW}Setting up: ${var_name}${NC}"
    echo "Description: $var_description"
    echo "Example: $var_example"
    echo ""

    read -p "Enter value for $var_name (or press Enter to skip): " var_value

    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}Skipped $var_name${NC}"
        echo ""
        return 0
    fi

    echo "Adding $var_name to Vercel..."
    echo "$var_value" | vercel env add "$var_name" production preview development

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully added $var_name${NC}"
    else
        echo -e "${RED}✗ Failed to add $var_name${NC}"
    fi
    echo ""
}

echo "This script will help you add the following environment variables:"
echo "  1. NEXT_PUBLIC_GA (Google Analytics)"
echo "  2. NEXT_PUBLIC_SENTRY_DSN (Sentry Error Tracking)"
echo "  3. SENTRY_ORG (Sentry Organization)"
echo "  4. SENTRY_PROJECT (Sentry Project Name)"
echo ""
echo "You can skip any variable by pressing Enter without typing a value."
echo ""
read -p "Press Enter to continue..."
echo ""

# Google Analytics
echo "================================================"
echo "  1. Google Analytics"
echo "================================================"
echo ""
add_env_var "NEXT_PUBLIC_GA" \
    "Google Analytics 4 Measurement ID" \
    "G-XXXXXXXXXX"

# Sentry DSN
echo "================================================"
echo "  2. Sentry Error Tracking - DSN"
echo "================================================"
echo ""
add_env_var "NEXT_PUBLIC_SENTRY_DSN" \
    "Sentry Data Source Name (DSN) from your Sentry project" \
    "https://xxxxx@xxxxx.ingest.sentry.io/xxxxx"

# Sentry Organization
echo "================================================"
echo "  3. Sentry Organization"
echo "================================================"
echo ""
add_env_var "SENTRY_ORG" \
    "Your Sentry organization slug (from URL)" \
    "brian-kramers-projects"

# Sentry Project
echo "================================================"
echo "  4. Sentry Project"
echo "================================================"
echo ""
add_env_var "SENTRY_PROJECT" \
    "Your Sentry project name" \
    "dealership-ai-dashboard"

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo -e "${GREEN}Environment variables have been added to Vercel.${NC}"
echo ""
echo "Next steps:"
echo "  1. Trigger a new deployment:"
echo "     git commit --allow-empty -m 'chore: trigger deployment for env vars'"
echo "     git push origin main"
echo ""
echo "  2. Or redeploy from Vercel dashboard:"
echo "     https://vercel.com/brian-kramers-projects/dealership-ai-dashboard"
echo ""
echo "  3. Verify the environment variables in Vercel:"
echo "     https://vercel.com/brian-kramers-projects/dealership-ai-dashboard/settings/environment-variables"
echo ""
echo -e "${YELLOW}Note: Variables will only take effect after a new deployment.${NC}"
echo ""
