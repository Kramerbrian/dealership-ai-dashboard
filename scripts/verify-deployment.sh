#!/bin/bash

# Deployment Verification Script
# Tests all newly deployed endpoints and features

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-https://dash.dealershipai.com}"
TEST_DOMAIN="test.com"

echo -e "${BLUE}🔍 Deployment Verification${NC}"
echo "=========================="
echo ""
echo "Base URL: ${BASE_URL}"
echo "Test Domain: ${TEST_DOMAIN}"
echo ""

# Test 1: Health Check
echo -e "${BLUE}📋 Test 1: Health Check${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed (HTTP ${HTTP_CODE})${NC}"
else
    echo -e "${YELLOW}⚠ Health check returned HTTP ${HTTP_CODE}${NC}"
fi
echo ""

# Test 2: Clarity Stack (Scoring Integration)
echo -e "${BLUE}📋 Test 2: Clarity Stack - Scoring Integration${NC}"
RESPONSE=$(curl -s "${BASE_URL}/api/clarity/stack?domain=${TEST_DOMAIN}" 2>/dev/null || echo "{}")

# Check if response contains scores
if echo "$RESPONSE" | grep -q '"seo"'; then
    echo -e "${GREEN}✓ Endpoint accessible${NC}"
    
    # Extract scores
    SEO=$(echo "$RESPONSE" | jq -r '.scores.seo // "N/A"' 2>/dev/null || echo "N/A")
    AEO=$(echo "$RESPONSE" | jq -r '.scores.aeo // "N/A"' 2>/dev/null || echo "N/A")
    GEO=$(echo "$RESPONSE" | jq -r '.scores.geo // "N/A"' 2>/dev/null || echo "N/A")
    AVI=$(echo "$RESPONSE" | jq -r '.scores.avi // "N/A"' 2>/dev/null || echo "N/A")
    
    echo "  SEO: ${SEO}"
    echo "  AEO: ${AEO}"
    echo "  GEO: ${GEO}"
    echo "  AVI: ${AVI}"
    
    # Check for alert bands
    if echo "$RESPONSE" | grep -q '"alert_bands"'; then
        echo -e "${GREEN}✓ Alert bands present${NC}"
        ALERT_SEO=$(echo "$RESPONSE" | jq -r '.alert_bands.seo // "N/A"' 2>/dev/null || echo "N/A")
        echo "  SEO Alert: ${ALERT_SEO}"
    else
        echo -e "${YELLOW}⚠ Alert bands missing${NC}"
    fi
else
    echo -e "${RED}✗ Endpoint not accessible or invalid response${NC}"
    echo "Response: $(echo "$RESPONSE" | head -5)"
fi
echo ""

# Test 3: Market Pulse (AI Visibility Scoring)
echo -e "${BLUE}📋 Test 3: Market Pulse - AI Visibility Scoring${NC}"
RESPONSE=$(curl -s "${BASE_URL}/api/marketpulse/compute?domain=${TEST_DOMAIN}" 2>/dev/null || echo "{}")

if echo "$RESPONSE" | grep -q '"aiv"'; then
    echo -e "${GREEN}✓ Endpoint accessible${NC}"
    AIV=$(echo "$RESPONSE" | jq -r '.aiv // "N/A"' 2>/dev/null || echo "N/A")
    AIV_ALERT=$(echo "$RESPONSE" | jq -r '.aivAlert // "N/A"' 2>/dev/null || echo "N/A")
    echo "  AIV: ${AIV}"
    echo "  AIV Alert: ${AIV_ALERT}"
    
    if [ "$AIV_ALERT" != "N/A" ]; then
        echo -e "${GREEN}✓ Alert band present${NC}"
    else
        echo -e "${YELLOW}⚠ Alert band missing${NC}"
    fi
else
    echo -e "${RED}✗ Endpoint not accessible or invalid response${NC}"
fi
echo ""

# Test 4: Tile Access Control
echo -e "${BLUE}📋 Test 4: Tile Access Control${NC}"
RESPONSE=$(curl -s "${BASE_URL}/api/test/tile-access?tier=3&role=marketing_director" 2>/dev/null || echo "{}")

if echo "$RESPONSE" | grep -q '"availableTiles"'; then
    echo -e "${GREEN}✓ Endpoint accessible${NC}"
    
    TOTAL=$(echo "$RESPONSE" | jq -r '.summary.total // "N/A"' 2>/dev/null || echo "N/A")
    ACCESSIBLE=$(echo "$RESPONSE" | jq -r '.summary.accessible // "N/A"' 2>/dev/null || echo "N/A")
    BLOCKED=$(echo "$RESPONSE" | jq -r '.summary.blocked // "N/A"' 2>/dev/null || echo "N/A")
    
    echo "  Total Tiles: ${TOTAL}"
    echo "  Accessible: ${ACCESSIBLE}"
    echo "  Blocked: ${BLOCKED}"
    
    # Check specific tiles
    HAS_APIS=$(echo "$RESPONSE" | jq -r '.allTiles[] | select(.tile=="apis") | .hasAccess' 2>/dev/null || echo "false")
    HAS_AGENTS=$(echo "$RESPONSE" | jq -r '.allTiles[] | select(.tile=="agents") | .hasAccess' 2>/dev/null || echo "false")
    
    if [ "$HAS_APIS" = "true" ] && [ "$HAS_AGENTS" = "true" ]; then
        echo -e "${GREEN}✓ Marketing director has access to APIs & Agents${NC}"
    else
        echo -e "${YELLOW}⚠ Marketing director access check failed${NC}"
    fi
else
    echo -e "${RED}✗ Endpoint not accessible or invalid response${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}📊 Verification Summary${NC}"
echo "===================="
echo ""
echo "✅ All endpoints tested"
echo "📝 Check results above for any issues"
echo ""
echo "Next steps:"
echo "1. Review any warnings or errors above"
echo "2. Check Vercel deployment logs if issues found"
echo "3. Verify scoring calculations match expected values"
echo "4. Test tile access in dashboard UI"
echo ""
