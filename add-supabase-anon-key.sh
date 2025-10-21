#!/bin/bash

# Quick script to add Supabase anon key to .env.local
# The Supabase API settings page should be open in your browser
# at: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/api

set -e

clear

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║  🔑  ADD SUPABASE ANON KEY                              ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Instructions:"
echo "  1. Go to Supabase API Settings (opening now...)"
echo "  2. Find the 'anon public' key (starts with eyJ...)"
echo "  3. Click the copy icon next to it"
echo "  4. Come back here and paste it"
echo ""
echo "Opening Supabase API settings page..."
sleep 1
open "https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/api" 2>/dev/null || echo "⚠️  Please manually visit: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/settings/api"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Paste the 'anon public' key here: " ANON_KEY

if [ -z "$ANON_KEY" ]; then
  echo "❌ No key provided"
  exit 1
fi

# Validate it looks like a JWT
if [[ ! "$ANON_KEY" =~ ^eyJ ]]; then
  echo "⚠️  Warning: This doesn't look like a valid JWT token"
  read -p "Continue anyway? (y/N): " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Update .env.local
if grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
  # Replace existing line
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=\"${ANON_KEY}\"|" .env.local
  else
    sed -i "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=\"${ANON_KEY}\"|" .env.local
  fi
  echo "✅ Updated NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
else
  # Append new line
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\"${ANON_KEY}\"" >> .env.local
  echo "✅ Added NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Success! Key added to .env.local"
echo ""
echo "📋 Next steps:"
echo ""
echo "  1️⃣  Restart dev server:"
echo "     Press Ctrl+C in the terminal running 'npm run dev'"
echo "     Then run: npm run dev"
echo ""
echo "  2️⃣  Test the system:"
echo "     curl http://localhost:3000/api/compliance/google-pricing/summary"
echo ""
echo "  3️⃣  View dashboard:"
echo "     open http://localhost:3000/intelligence"
echo ""
echo "  4️⃣  Run full test suite:"
echo "     npx ts-node scripts/test-google-policy-compliance.ts"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation: GOOGLE_POLICY_DEPLOYMENT_STATUS.md"
echo ""
