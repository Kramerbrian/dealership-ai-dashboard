#!/bin/bash
# Deploy Orchestrator 3.0 to api.dealershipai.com
# Usage: ./scripts/deploy-orchestrator.sh

set -e

echo "🚀 Orchestrator 3.0 Deployment Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${RED}❌ OPENAI_API_KEY not set${NC}"
  echo "   Set it with: export OPENAI_API_KEY=sk-..."
  exit 1
fi
echo -e "${GREEN}✅ OpenAI API key configured${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
  echo "   Installing Vercel CLI..."
  npm install -g vercel
fi
echo -e "${GREEN}✅ Vercel CLI installed${NC}"

# Check if logged into Vercel
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}⚠️  Not logged into Vercel${NC}"
  echo "   Logging in..."
  vercel login
fi
echo -e "${GREEN}✅ Vercel authentication verified${NC}"

echo ""
echo "🔧 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed${NC}"
  echo "   Fix build errors before deploying"
  exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

echo ""
echo "📦 Deploying to Vercel..."

# Deploy to production
vercel --prod --yes

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Deployment failed${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Deployed to Vercel${NC}"

echo ""
echo "🌐 Configuring api.dealershipai.com domain..."

# Get current deployment URL
DEPLOYMENT_URL=$(vercel --prod inspect --token "$VERCEL_TOKEN" 2>/dev/null | grep -oP 'https://.*\.vercel\.app' | head -1)

if [ -z "$DEPLOYMENT_URL" ]; then
  echo -e "${YELLOW}⚠️  Could not auto-detect deployment URL${NC}"
  echo "   Please manually configure domain at https://vercel.com"
else
  echo -e "${BLUE}ℹ️  Deployment URL: $DEPLOYMENT_URL${NC}"
fi

echo ""
echo "🧪 Testing orchestrator endpoints..."

# Wait for deployment to be live
sleep 10

# Test main API endpoint
echo "   Testing /api/orchestrator/v3/deploy..."
RESPONSE=$(curl -s -w "%{http_code}" https://api.dealershipai.com/api/orchestrator/v3/deploy -o /tmp/orch_test.json)

if [ "$RESPONSE" = "200" ]; then
  echo -e "${GREEN}✅ Orchestrator API is live${NC}"
  cat /tmp/orch_test.json | jq '.'
else
  echo -e "${YELLOW}⚠️  API returned status $RESPONSE${NC}"
  echo "   Domain may still be propagating..."
  echo "   You can test at: $DEPLOYMENT_URL/api/orchestrator/v3/deploy"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📡 Orchestrator 3.0 Endpoints:"
echo "   Deploy:  https://api.dealershipai.com/api/orchestrator/v3/deploy"
echo "   Status:  https://api.dealershipai.com/api/orchestrator/v3/status"
echo ""
echo "🚀 Start autonomous execution:"
echo "   curl -X POST https://api.dealershipai.com/api/orchestrator/v3/deploy \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"autoStart\": true}'"
echo ""
echo "📊 Monitor progress:"
echo "   watch -n 10 'curl -s https://api.dealershipai.com/api/orchestrator/v3/status | jq'"
echo ""
echo "✅ Done!"
