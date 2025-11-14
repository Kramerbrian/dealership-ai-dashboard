#!/bin/bash
# Setup script for Reddit Devvit Project ID

PROJECT_ID="Ch5hdXhZdUdXMUdDNk9XTkRGR0JEd2JvT09jVG45ZGcSDGRlYWxlcnNoaXBhaRoFcmVhY3Q="
PROJECT_NAME="dealershipai"

echo "🔴 Reddit Devvit Setup"
echo "======================"
echo ""
echo "Project Name: $PROJECT_NAME"
echo "Project ID: $PROJECT_ID"
echo ""

# 1. Add to .env.local
if [ -f .env.local ]; then
  if grep -q "REDDIT_DEVVIT_PROJECT_ID" .env.local; then
    echo "✅ REDDIT_DEVVIT_PROJECT_ID already in .env.local"
  else
    echo "" >> .env.local
    echo "# Reddit Devvit Project ID" >> .env.local
    echo "REDDIT_DEVVIT_PROJECT_ID=$PROJECT_ID" >> .env.local
    echo "✅ Added to .env.local"
  fi
else
  echo "# Reddit Devvit Project ID" > .env.local
  echo "REDDIT_DEVVIT_PROJECT_ID=$PROJECT_ID" >> .env.local
  echo "✅ Created .env.local with Reddit Devvit Project ID"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Supabase:"
echo "   • Go to Supabase Dashboard → Settings → API → Environment Variables"
echo "   • Add: REDDIT_DEVVIT_PROJECT_ID = $PROJECT_ID"
echo ""
echo "2. Vercel:"
echo "   • Go to Vercel Dashboard → Settings → Environment Variables"
echo "   • Add: REDDIT_DEVVIT_PROJECT_ID = $PROJECT_ID"
echo "   • Select: Production, Preview, Development"
echo "   • Click Save and redeploy"
echo ""
echo "3. Verify:"
echo "   • Check .env.local: grep REDDIT_DEVVIT_PROJECT_ID .env.local"
echo "   • Run: npm run dev"
echo ""
echo "✅ Setup complete!"

