#!/bin/bash
# Setup Environment Variables for Orchestrator Testing
# This script helps you add the required env vars to .env.local

set -e

ENV_FILE=".env.local"
EXAMPLE_FILE=".env.local.example"

echo "🔧 Setting up orchestrator environment variables..."
echo ""

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$EXAMPLE_FILE" ]; then
    echo "📋 Creating .env.local from example..."
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo "✅ Created $ENV_FILE"
  else
    echo "📝 Creating new .env.local..."
    touch "$ENV_FILE"
  fi
fi

echo ""
echo "Required environment variables for orchestrator:"
echo "================================================"
echo ""

# Check and prompt for OPENAI_API_KEY
if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
  echo "✅ OPENAI_API_KEY already set"
else
  echo "❌ OPENAI_API_KEY not set"
  echo "   Get it from: https://platform.openai.com/api-keys"
  read -p "   Enter OPENAI_API_KEY (or press Enter to skip): " openai_key
  if [ -n "$openai_key" ]; then
    echo "OPENAI_API_KEY=$openai_key" >> "$ENV_FILE"
    echo "   ✅ Added OPENAI_API_KEY"
  fi
fi

# Check and prompt for SLACK_WEBHOOK_URL
if grep -q "^SLACK_WEBHOOK_URL=" "$ENV_FILE"; then
  echo "✅ SLACK_WEBHOOK_URL already set"
else
  echo "⚠️  SLACK_WEBHOOK_URL not set (optional for testing)"
  echo "   Get it from: https://api.slack.com/apps → Incoming Webhooks"
  read -p "   Enter SLACK_WEBHOOK_URL (or press Enter to skip): " slack_webhook
  if [ -n "$slack_webhook" ]; then
    echo "SLACK_WEBHOOK_URL=$slack_webhook" >> "$ENV_FILE"
    echo "   ✅ Added SLACK_WEBHOOK_URL"
  fi
fi

# Check and prompt for VERCEL_TOKEN
if grep -q "^VERCEL_TOKEN=" "$ENV_FILE"; then
  echo "✅ VERCEL_TOKEN already set"
else
  echo "⚠️  VERCEL_TOKEN not set (optional for local testing)"
  echo "   Get it from: https://vercel.com/account/tokens"
  read -p "   Enter VERCEL_TOKEN (or press Enter to skip): " vercel_token
  if [ -n "$vercel_token" ]; then
    echo "VERCEL_TOKEN=$vercel_token" >> "$ENV_FILE"
    echo "   ✅ Added VERCEL_TOKEN"
  fi
fi

# Check and prompt for SUPABASE_SERVICE_ROLE_KEY
if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" "$ENV_FILE"; then
  echo "✅ SUPABASE_SERVICE_ROLE_KEY already set"
else
  echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set (optional for local testing)"
  echo "   Get it from: Supabase Dashboard → Settings → API → Service Role Key"
  read -p "   Enter SUPABASE_SERVICE_ROLE_KEY (or press Enter to skip): " supabase_key
  if [ -n "$supabase_key" ]; then
    echo "SUPABASE_SERVICE_ROLE_KEY=$supabase_key" >> "$ENV_FILE"
    echo "   ✅ Added SUPABASE_SERVICE_ROLE_KEY"
  fi
fi

echo ""
echo "================================================"
echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review $ENV_FILE"
echo "  2. Start dev server: npm run dev"
echo "  3. Run tests: ./scripts/test-orchestrator.sh"
echo ""

