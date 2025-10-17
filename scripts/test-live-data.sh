#!/bin/bash

echo "🔍 Testing Live Data Integration for Dealer Accounts"
echo "===================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="${1:-http://localhost:3000}"

echo "Using base URL: $BASE_URL"
echo ""

# Test dealer IDs
DEALERS=("lou-grubbs-motors" "default" "test-dealer")

for dealer in "${DEALERS[@]}"; do
  echo -e "${BLUE}Testing dealer: $dealer${NC}"
  echo "-------------------------------"

  # Test live data endpoint
  echo -n "Fetching data... "
  response=$(curl -s "$BASE_URL/api/dashboard/overview-live?dealerId=$dealer&timeRange=30d")

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"

    # Check data source
    data_source=$(echo "$response" | jq -r '.dataSource // "unknown"' 2>/dev/null)

    if [ "$data_source" = "live" ]; then
      echo -e "  Data Source: ${GREEN}LIVE${NC} ✓"
      echo "  Using real dealership data from database"
    elif [ "$data_source" = "demo" ]; then
      echo -e "  Data Source: ${YELLOW}DEMO${NC}"
      echo "  No live data available - using demo data"
    else
      echo -e "  Data Source: ${YELLOW}UNKNOWN${NC}"
      echo "  Could not determine data source"
    fi

    # Extract key metrics
    dealer_name=$(echo "$response" | jq -r '.dealershipName // "N/A"' 2>/dev/null)
    domain=$(echo "$response" | jq -r '.domain // "N/A"' 2>/dev/null)
    ai_score=$(echo "$response" | jq -r '.aiVisibility.score // 0' 2>/dev/null)

    echo "  Dealership: $dealer_name"
    echo "  Domain: $domain"
    echo "  AI Visibility Score: $ai_score"
  else
    echo -e "${YELLOW}✗ Failed${NC}"
  fi

  echo ""
done

echo ""
echo "🔍 Data Source Summary"
echo "====================="
echo ""
echo "LIVE = Real data from database"
echo "DEMO = Demo data (no database records found)"
echo ""
echo "To add live data for a dealer:"
echo "1. Create dealership account in database"
echo "2. Crawl the website"
echo "3. Calculate AI scores"
echo "4. Verify data appears as 'LIVE'"
echo ""

# Test health endpoint
echo "Testing system health..."
health=$(curl -s "$BASE_URL/api/health" | jq -r '.status // "unknown"' 2>/dev/null)
if [ "$health" = "healthy" ]; then
  echo -e "${GREEN}✓ System healthy${NC}"
else
  echo -e "${YELLOW}⚠ System health: $health${NC}"
fi

echo ""
echo "Testing complete!"
