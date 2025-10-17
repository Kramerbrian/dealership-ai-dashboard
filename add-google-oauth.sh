#!/bin/bash

echo "🔧 Google OAuth Credentials Setup for DealershipAI"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}This script will help you add Google OAuth credentials to Vercel.${NC}"
echo -e "${YELLOW}Make sure you have your Google Client ID and Client Secret ready.${NC}"

echo -e "\n${BLUE}Step 1: Add Google Client ID${NC}"
echo "Enter your Google Client ID (starts with numbers and letters):"
read -p "Client ID: " GOOGLE_CLIENT_ID

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo -e "${RED}❌ Client ID cannot be empty. Exiting.${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 2: Add Google Client Secret${NC}"
echo "Enter your Google Client Secret (starts with GOCSPX-):"
read -p "Client Secret: " GOOGLE_CLIENT_SECRET

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo -e "${RED}❌ Client Secret cannot be empty. Exiting.${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 3: Adding credentials to Vercel...${NC}"

# Add Google Client ID
echo "Adding GOOGLE_CLIENT_ID..."
echo "$GOOGLE_CLIENT_ID" | vercel env add GOOGLE_CLIENT_ID production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GOOGLE_CLIENT_ID added successfully${NC}"
else
    echo -e "${RED}❌ Failed to add GOOGLE_CLIENT_ID${NC}"
    exit 1
fi

# Add Google Client Secret
echo "Adding GOOGLE_CLIENT_SECRET..."
echo "$GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GOOGLE_CLIENT_SECRET added successfully${NC}"
else
    echo -e "${RED}❌ Failed to add GOOGLE_CLIENT_SECRET${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 4: Deploying changes...${NC}"
vercel --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 5: Testing OAuth configuration...${NC}"
sleep 5  # Wait for deployment to complete

# Test OAuth status
echo "Testing OAuth configuration..."
curl -s "https://www.dealershipai.com/api/test-oauth" | jq . 2>/dev/null

echo -e "\n${GREEN}🎉 Google OAuth setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Visit: https://www.dealershipai.com/test-oauth"
echo "2. Click 'Sign in with Google'"
echo "3. Complete the OAuth flow"
echo "4. Verify session data is captured"

echo -e "\n${BLUE}Test URLs:${NC}"
echo "• OAuth Test Page: https://www.dealershipai.com/test-oauth"
echo "• Signin Page: https://www.dealershipai.com/auth/signin"
echo "• OAuth Status: https://www.dealershipai.com/api/test-oauth"

echo -e "\n${GREEN}Your DealershipAI platform now has Google OAuth authentication! 🚀${NC}"
