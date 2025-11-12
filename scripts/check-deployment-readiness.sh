#!/bin/bash

###############################################################################
# Deployment Readiness Check for dealershipai.com
# Non-interactive validation script
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
DOMAIN="dealershipai.com"
WWW_DOMAIN="www.dealershipai.com"
VERCEL_IP="76.76.21.21"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

print_header() {
    echo -e "\n${BLUE}${BOLD}========================================${NC}"
    echo -e "${BLUE}${BOLD}$1${NC}"
    echo -e "${BLUE}${BOLD}========================================${NC}\n"
}

print_check() {
    echo -e "${BLUE}Checking:${NC} $1"
}

print_pass() {
    echo -e "${GREEN}  ✓ PASS:${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}  ✗ FAIL:${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}  ⚠ WARN:${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}  ℹ INFO:${NC} $1"
}

# Main checks
main() {
    clear
    print_header "DealershipAI Deployment Readiness Check"
    echo "Domain: ${BOLD}${DOMAIN}${NC}"
    echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""

    # 1. Prerequisites
    print_header "1. Prerequisites"

    print_check "Node.js"
    if command -v node &> /dev/null; then
        print_pass "Node.js $(node -v) installed"
    else
        print_fail "Node.js not installed"
    fi

    print_check "npm"
    if command -v npm &> /dev/null; then
        print_pass "npm $(npm -v) installed"
    else
        print_fail "npm not installed"
    fi

    print_check "Vercel CLI"
    if command -v vercel &> /dev/null; then
        print_pass "Vercel CLI installed"
        if vercel whoami &> /dev/null; then
            print_pass "Logged in as: $(vercel whoami 2>/dev/null)"
        else
            print_fail "Not logged in to Vercel (run: vercel login)"
        fi
    else
        print_fail "Vercel CLI not installed (run: npm i -g vercel)"
    fi

    print_check "dig (DNS tool)"
    if command -v dig &> /dev/null; then
        print_pass "dig installed"
    else
        print_warn "dig not installed (optional, but useful for DNS checks)"
    fi

    print_check "curl"
    if command -v curl &> /dev/null; then
        print_pass "curl installed"
    else
        print_fail "curl not installed"
    fi

    # 2. DNS Configuration
    print_header "2. DNS Configuration"

    if command -v dig &> /dev/null; then
        print_check "Apex domain (${DOMAIN})"
        APEX_IP=$(dig +short ${DOMAIN} @8.8.8.8 | head -1)
        if [ -z "$APEX_IP" ]; then
            print_fail "No A record found for ${DOMAIN}"
            print_info "Add: @ A ${VERCEL_IP}"
        elif echo "$APEX_IP" | grep -q "${VERCEL_IP}"; then
            print_pass "${DOMAIN} → ${VERCEL_IP}"
        else
            print_fail "${DOMAIN} → ${APEX_IP} (expected ${VERCEL_IP})"
        fi

        print_check "WWW subdomain (${WWW_DOMAIN})"
        WWW_CNAME=$(dig +short ${WWW_DOMAIN} CNAME @8.8.8.8 | head -1)
        if [ -z "$WWW_CNAME" ]; then
            print_fail "No CNAME record found for ${WWW_DOMAIN}"
            print_info "Add: www CNAME cname.vercel-dns.com"
        elif echo "$WWW_CNAME" | grep -q "vercel"; then
            print_pass "${WWW_DOMAIN} → ${WWW_CNAME}"
        else
            print_warn "${WWW_DOMAIN} → ${WWW_CNAME} (expected vercel CNAME)"
        fi

        print_check "SPF record (email)"
        if dig TXT ${DOMAIN} @8.8.8.8 | grep -q "spf"; then
            print_pass "SPF record found"
        else
            print_warn "SPF record not found (needed for email)"
            print_info "Add: @ TXT \"v=spf1 include:_spf.resend.com ~all\""
        fi

        print_check "DKIM record (email)"
        if dig CNAME resend._domainkey.${DOMAIN} @8.8.8.8 | grep -q "resend"; then
            print_pass "DKIM records found"
        else
            print_warn "DKIM records not found (needed for email)"
            print_info "Add: resend._domainkey CNAME resend._domainkey.resend.com"
        fi
    else
        print_warn "dig not available, skipping DNS checks"
        print_info "Install dig to verify DNS configuration"
    fi

    # 3. Project Structure
    print_header "3. Project Structure"

    print_check "package.json"
    if [ -f "package.json" ]; then
        print_pass "package.json found"
    else
        print_fail "package.json not found"
    fi

    print_check "vercel.json"
    if [ -f "vercel.json" ]; then
        print_pass "vercel.json found"
        if grep -q "cron/nurture" vercel.json; then
            print_pass "Nurture cron job configured"
        else
            print_warn "Nurture cron job not found in vercel.json"
        fi
    else
        print_warn "vercel.json not found"
    fi

    print_check "Database migrations"
    if [ -d "supabase/migrations" ]; then
        MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
        print_pass "Found $MIGRATION_COUNT migration files"
    else
        print_warn "supabase/migrations directory not found"
    fi

    print_check "Email service"
    if [ -f "lib/email.ts" ]; then
        print_pass "Email service (lib/email.ts) found"
    else
        print_fail "lib/email.ts not found"
    fi

    print_check "Rate limiting"
    if [ -f "lib/rate-limit.ts" ]; then
        print_pass "Rate limiting (lib/rate-limit.ts) found"
    else
        print_warn "lib/rate-limit.ts not found"
    fi

    print_check "Analytics"
    if [ -f "lib/analytics.ts" ]; then
        print_pass "Analytics (lib/analytics.ts) found"
    else
        print_warn "lib/analytics.ts not found"
    fi

    # 4. Environment Files
    print_header "4. Environment Configuration"

    print_check "Local environment"
    if [ -f ".env.local" ]; then
        print_pass ".env.local found"

        # Check for required variables
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
            print_pass "NEXT_PUBLIC_SUPABASE_URL defined"
        else
            print_fail "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
        fi

        if grep -q "RESEND_API_KEY" .env.local; then
            print_pass "RESEND_API_KEY defined"
        else
            print_warn "RESEND_API_KEY not found in .env.local"
        fi
    else
        print_warn ".env.local not found (not required for deployment)"
    fi

    print_check "Vercel environment variables"
    print_info "Required variables for production:"
    print_info "  - NEXT_PUBLIC_SUPABASE_URL"
    print_info "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    print_info "  - SUPABASE_SERVICE_ROLE_KEY"
    print_info "  - NEXT_PUBLIC_BASE_URL (should be https://dealershipai.com)"
    print_info "  - RESEND_API_KEY"
    print_info "  - FROM_EMAIL (should be noreply@dealershipai.com)"

    # 5. Build Test
    print_header "5. Build Test"

    print_check "Dependencies"
    if [ -d "node_modules" ]; then
        print_pass "node_modules exists"
    else
        print_warn "node_modules not found (run: npm install)"
    fi

    print_check "TypeScript compilation"
    if npm run build > /tmp/build.log 2>&1; then
        print_pass "Build succeeded"
    else
        print_fail "Build failed (check /tmp/build.log)"
        print_info "Run: npm run build"
    fi

    # 6. Production Endpoints Check (if deployed)
    print_header "6. Production Endpoints (if already deployed)"

    if command -v curl &> /dev/null; then
        print_check "Homepage"
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN} 2>/dev/null || echo "000")
        if [ "$STATUS" == "200" ]; then
            print_pass "https://${DOMAIN} returns 200"
        elif [ "$STATUS" == "000" ]; then
            print_info "Domain not yet deployed or DNS not propagated"
        else
            print_warn "https://${DOMAIN} returns $STATUS"
        fi

        print_check "Instant analyzer"
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/instant 2>/dev/null || echo "000")
        if [ "$STATUS" == "200" ]; then
            print_pass "https://${DOMAIN}/instant returns 200"
        elif [ "$STATUS" == "000" ]; then
            print_info "Domain not yet deployed"
        else
            print_warn "https://${DOMAIN}/instant returns $STATUS"
        fi

        print_check "API health"
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://${DOMAIN}/api/health 2>/dev/null || echo "000")
        if [ "$STATUS" == "200" ]; then
            print_pass "https://${DOMAIN}/api/health returns 200"
        elif [ "$STATUS" == "000" ]; then
            print_info "Domain not yet deployed"
        else
            print_warn "https://${DOMAIN}/api/health returns $STATUS"
        fi
    fi

    # Summary
    print_header "Summary"

    echo -e "${GREEN}Passed:${NC}   $PASSED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo -e "${RED}Failed:${NC}   $FAILED"
    echo ""

    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}${BOLD}✓ Ready for deployment!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Ensure environment variables are set in Vercel"
        echo "  2. Apply database migrations: npx supabase db push"
        echo "  3. Add domain in Vercel: vercel domains add dealershipai.com"
        echo "  4. Deploy: vercel --prod"
        echo ""
        echo "Or run the interactive deployment script:"
        echo "  ./scripts/deploy-custom-domain.sh"
    else
        echo -e "${RED}${BOLD}✗ Not ready for deployment${NC}"
        echo ""
        echo "Please fix the failed checks above before deploying."
    fi

    echo ""
    echo "Documentation:"
    echo "  - Quick Start: CUSTOM_DOMAIN_QUICKSTART.md"
    echo "  - Full Guide: docs/DOMAIN_SETUP.md"
    echo "  - DNS Records: docs/DNS_RECORDS.txt"
}

main "$@"
