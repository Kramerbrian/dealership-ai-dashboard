#!/bin/bash

# verify-domains.sh
# Script to verify all three domains are properly configured

echo "🔍 Verifying DealershipAI Domain Configuration"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check domain
check_domain() {
    local domain=$1
    local path=$2
    local full_url="https://${domain}${path}"

    echo -e "${BLUE}Checking: ${full_url}${NC}"

    # Check DNS resolution
    echo -n "  DNS: "
    if dig +short $domain | grep -q .; then
        echo -e "${GREEN}✓ Resolving${NC}"
    else
        echo -e "${RED}✗ Not resolving${NC}"
    fi

    # Check HTTPS response
    echo -n "  HTTPS: "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$full_url" 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        echo -e "${GREEN}✓ ${response}${NC}"
    elif [ "$response" = "401" ]; then
        echo -e "${YELLOW}⚠ ${response} (Auth required)${NC}"
    else
        echo -e "${RED}✗ ${response}${NC}"
    fi

    # Check SSL certificate
    echo -n "  SSL: "
    if echo | openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✓ Valid${NC}"
    else
        echo -e "${RED}✗ Invalid or pending${NC}"
    fi

    echo ""
}

# Check Vercel domains list
echo -e "${BLUE}Vercel Domain Status:${NC}"
vercel domains ls
echo ""

# Check each domain
echo -e "${BLUE}Domain Health Checks:${NC}"
echo ""

check_domain "main.dealershipai.com" "/"
check_domain "marketing.dealershipai.com" "/"
check_domain "dash.dealershipai.com" "/dash"

# DNS propagation check
echo -e "${BLUE}DNS Propagation Check:${NC}"
echo ""
echo "main.dealershipai.com:"
dig +short main.dealershipai.com
echo ""
echo "marketing.dealershipai.com:"
dig +short marketing.dealershipai.com
echo ""
echo "dash.dealershipai.com:"
dig +short dash.dealershipai.com
echo ""

# Summary
echo "=============================================="
echo -e "${BLUE}Next Steps:${NC}"
echo "1. If DNS is not resolving, wait a few more minutes"
echo "2. If SSL is invalid, wait for Vercel to provision certificates (5-15 min)"
echo "3. Test in browser: https://dash.dealershipai.com/dash"
echo "4. Check full status: https://dnschecker.org"
echo ""
echo -e "${GREEN}✓ Verification complete!${NC}"
