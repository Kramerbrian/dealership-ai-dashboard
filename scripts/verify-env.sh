#!/bin/bash

# Environment Variables Verification Script
# Checks that all required environment variables are set for deployment

set -e

echo "============================================"
echo "Environment Variables Verification"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
FOUND=0
MISSING=0
OPTIONAL=0

# Function to check required variable
check_required() {
  local var_name="$1"
  local description="$2"
  TOTAL=$((TOTAL + 1))

  if [ -z "${!var_name}" ]; then
    echo -e "${RED}✗${NC} $var_name - ${RED}MISSING${NC}"
    echo "   Description: $description"
    MISSING=$((MISSING + 1))
  else
    echo -e "${GREEN}✓${NC} $var_name - ${GREEN}SET${NC}"
    FOUND=$((FOUND + 1))
  fi
}

# Function to check optional variable
check_optional() {
  local var_name="$1"
  local description="$2"
  TOTAL=$((TOTAL + 1))

  if [ -z "${!var_name}" ]; then
    echo -e "${YELLOW}○${NC} $var_name - ${YELLOW}NOT SET${NC} (optional)"
    echo "   Description: $description"
    OPTIONAL=$((OPTIONAL + 1))
  else
    echo -e "${GREEN}✓${NC} $var_name - ${GREEN}SET${NC}"
    FOUND=$((FOUND + 1))
  fi
}

echo "=== REQUIRED VARIABLES ==="
echo ""

echo "--- Authentication (Clerk) ---"
check_required "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "Clerk publishable key for client-side auth"
check_required "CLERK_SECRET_KEY" "Clerk secret key for server-side auth"
echo ""

echo "--- Database (Supabase) ---"
check_required "NEXT_PUBLIC_SUPABASE_URL" "Supabase project URL"
check_required "NEXT_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key"
check_required "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (server-side)"
check_required "DATABASE_URL" "PostgreSQL connection string"
echo ""

echo "=== OPTIONAL VARIABLES ==="
echo ""

echo "--- AI Platform APIs ---"
check_optional "OPENAI_API_KEY" "OpenAI API key for GPT features"
check_optional "ANTHROPIC_API_KEY" "Anthropic API key for Claude features"
check_optional "GOOGLE_API_KEY" "Google AI API key for Gemini features"
check_optional "PERPLEXITY_API_KEY" "Perplexity API key for search features"
echo ""

echo "--- Platform APIs ---"
check_optional "GOOGLE_PLACES_API_KEY" "Google Places API for location data"
check_optional "YELP_API_KEY" "Yelp API for review aggregation"
check_optional "GOOGLE_ANALYTICS_PROPERTY_ID" "Google Analytics 4 property ID"
echo ""

echo "--- Monitoring & Analytics ---"
check_optional "SENTRY_DSN" "Sentry DSN for error tracking"
check_optional "NEXT_PUBLIC_VERCEL_ANALYTICS_ID" "Vercel Analytics ID"
check_optional "LOGTAIL_SOURCE_TOKEN" "Logtail token for log aggregation"
echo ""

echo "--- Email & Notifications ---"
check_optional "RESEND_API_KEY" "Resend API key for transactional emails"
check_optional "SENDGRID_API_KEY" "SendGrid API key for email"
echo ""

echo "--- Payment Processing ---"
check_optional "STRIPE_PUBLISHABLE_KEY" "Stripe publishable key"
check_optional "STRIPE_SECRET_KEY" "Stripe secret key"
check_optional "STRIPE_WEBHOOK_SECRET" "Stripe webhook signing secret"
echo ""

echo "--- Rate Limiting ---"
check_optional "UPSTASH_REDIS_REST_URL" "Upstash Redis URL for rate limiting"
check_optional "UPSTASH_REDIS_REST_TOKEN" "Upstash Redis token"
echo ""

echo "============================================"
echo "Summary"
echo "============================================"
echo ""
echo -e "Total variables checked: $TOTAL"
echo -e "${GREEN}✓ Found: $FOUND${NC}"
echo -e "${YELLOW}○ Optional (not set): $OPTIONAL${NC}"
echo -e "${RED}✗ Missing (required): $MISSING${NC}"
echo ""

if [ $MISSING -gt 0 ]; then
  echo -e "${RED}❌ VERIFICATION FAILED${NC}"
  echo ""
  echo "Missing required environment variables. Please set them before deploying."
  echo ""
  echo "To set in Vercel:"
  echo "1. Go to https://vercel.com/your-project/settings/environment-variables"
  echo "2. Add each missing variable"
  echo "3. Set for: Production, Preview, Development"
  echo ""
  exit 1
else
  echo -e "${GREEN}✅ VERIFICATION PASSED${NC}"
  echo ""
  echo "All required environment variables are set."
  if [ $OPTIONAL -gt 0 ]; then
    echo -e "${YELLOW}Note: $OPTIONAL optional variables are not set. Some features may be disabled.${NC}"
  fi
  echo ""
  exit 0
fi
