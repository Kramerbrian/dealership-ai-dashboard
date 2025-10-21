#!/bin/bash

# Setup Google Policy Compliance Environment Variables
# Usage: ./scripts/setup-google-policy-env.sh

set -e

echo "🔧 Google Policy Compliance - Environment Setup"
echo "=============================================="
echo ""

# Generate CRON_SECRET
CRON_SECRET=$(openssl rand -hex 32)
echo "✅ Generated CRON_SECRET: $CRON_SECRET"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "⚠️  Vercel CLI not found. Install with: npm i -g vercel"
  echo ""
  echo "Manual setup required. Add these to Vercel dashboard:"
  echo "https://vercel.com/settings/environment-variables"
  echo ""
  echo "CRON_SECRET=$CRON_SECRET"
  echo ""
  exit 0
fi

echo "📝 Interactive Setup"
echo ""

# CRON_SECRET (auto-generated)
echo "Setting CRON_SECRET..."
echo "$CRON_SECRET" | vercel env add CRON_SECRET production

# RESEND_API_KEY
echo ""
echo "Get your Resend API key from: https://resend.com/api-keys"
read -p "Enter RESEND_API_KEY (or press Enter to skip): " RESEND_KEY
if [ -n "$RESEND_KEY" ]; then
  echo "$RESEND_KEY" | vercel env add RESEND_API_KEY production

  read -p "Enter RESEND_FROM_EMAIL (e.g., alerts@yourdomain.com): " FROM_EMAIL
  echo "$FROM_EMAIL" | vercel env add RESEND_FROM_EMAIL production

  read -p "Enter COMPLIANCE_EMAIL_RECIPIENTS (comma-separated): " COMPLIANCE_EMAILS
  echo "$COMPLIANCE_EMAILS" | vercel env add COMPLIANCE_EMAIL_RECIPIENTS production
fi

# SLACK_WEBHOOK_URL
echo ""
echo "Get your Slack webhook from: https://api.slack.com/messaging/webhooks"
read -p "Enter SLACK_WEBHOOK_URL (or press Enter to skip): " SLACK_URL
if [ -n "$SLACK_URL" ]; then
  echo "$SLACK_URL" | vercel env add SLACK_WEBHOOK_URL production
fi

# REDIS_URL (optional)
echo ""
read -p "Enter REDIS_URL (or press Enter to use mock storage): " REDIS
if [ -n "$REDIS" ]; then
  echo "$REDIS" | vercel env add REDIS_URL production
fi

# ANTHROPIC_API_KEY (optional)
echo ""
read -p "Enter ANTHROPIC_API_KEY for Claude analysis (or press Enter to skip): " ANTHROPIC
if [ -n "$ANTHROPIC" ]; then
  echo "$ANTHROPIC" | vercel env add ANTHROPIC_API_KEY production
fi

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Next steps:"
echo "  1. Add CRON job to vercel.json"
echo "  2. Deploy: vercel --prod"
echo "  3. Test: curl https://yourdomain.com/api/compliance/google-pricing/summary"
