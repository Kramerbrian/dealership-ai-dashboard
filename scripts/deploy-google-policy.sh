#!/bin/bash

# Deploy Google Policy Compliance to Vercel
# Usage: ./scripts/deploy-google-policy.sh

set -e

echo "🚀 Deploying Google Policy Compliance System"
echo "=============================================="
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "📝 Uncommitted changes detected. Committing..."

  git add -A
  git commit -m "feat: add Google Ads Policy Compliance system

- Add production scraping engine (Puppeteer)
- Add Redis + PostgreSQL storage layer
- Add Resend + Slack notifications
- Add compliance summary API endpoint
- Add Google Policy Compliance dashboard card
- Add weekly policy drift monitoring CRON
- Add database migration schema
- Update batch scanning with real scraper
- Add comprehensive documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

  echo "✅ Changes committed"
else
  echo "✅ No uncommitted changes"
fi

echo ""
echo "🔍 Pre-deployment checks..."

# Check if vercel.json has CRON
if grep -q "policy-drift" vercel.json; then
  echo "  ✅ CRON job configured"
else
  echo "  ❌ CRON job missing in vercel.json"
  exit 1
fi

# Check if migration exists
if [ -f "supabase/migrations/20251020_google_policy_compliance.sql" ]; then
  echo "  ✅ Database migration ready"
else
  echo "  ❌ Migration file missing"
  exit 1
fi

# Check if env vars are documented
if [ -f ".env.google-policy" ]; then
  echo "  ✅ Environment variables documented"
else
  echo "  ⚠️  .env.google-policy template not found"
fi

echo ""
echo "📦 Building locally to verify..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before deploying."
  exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy to Vercel
echo "🚢 Deploying to Vercel production..."
echo ""

if command -v vercel &> /dev/null; then
  # Push to git first
  git push origin main

  # Deploy with Vercel CLI
  vercel --prod

  echo ""
  echo "✅ Deployment complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Run database migration (if not done yet)"
  echo "  2. Configure environment variables in Vercel dashboard"
  echo "  3. Test: https://yourdomain.com/api/compliance/google-pricing/summary"
  echo "  4. View dashboard: https://yourdomain.com/intelligence"
else
  echo "⚠️  Vercel CLI not found"
  echo ""
  echo "Option 1: Install Vercel CLI"
  echo "  npm i -g vercel"
  echo "  Then run: vercel --prod"
  echo ""
  echo "Option 2: Deploy via Git"
  git push origin main
  echo "  ✅ Pushed to main branch"
  echo "  Vercel will auto-deploy from GitHub"
fi
