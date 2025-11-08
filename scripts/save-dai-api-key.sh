#!/bin/bash

# Save dAI GPT API Key to .env.local, Supabase, and Vercel
# Usage: ./scripts/save-dai-api-key.sh

set -e

API_KEY="sk-***REDACTED***"

echo "🔐 Saving dAI GPT API Key..."

# 1. Save to .env.local
if [ ! -f .env.local ]; then
  touch .env.local
  echo "Created .env.local"
fi

# Remove existing OPENAI_API_KEY if present
sed -i.bak '/^OPENAI_API_KEY=/d' .env.local 2>/dev/null || true
sed -i.bak '/^DAI_API_KEY=/d' .env.local 2>/dev/null || true
sed -i.bak '/^NEXT_PUBLIC_DAI_API_KEY=/d' .env.local 2>/dev/null || true

# Add new API key
echo "" >> .env.local
echo "# DealershipAI GPT API Key" >> .env.local
echo "OPENAI_API_KEY=${API_KEY}" >> .env.local
echo "DAI_API_KEY=${API_KEY}" >> .env.local
echo "NEXT_PUBLIC_DAI_API_KEY=${API_KEY}" >> .env.local
echo "NEXT_PUBLIC_API_BASE_URL=https://api.gpt.dealershipai.com" >> .env.local

echo "✅ Saved to .env.local"

# 2. Save to Supabase (if Supabase CLI is available)
if command -v supabase &> /dev/null; then
  echo "📦 Saving to Supabase..."
  supabase secrets set OPENAI_API_KEY="${API_KEY}" 2>/dev/null || echo "⚠️  Supabase CLI not configured, skipping"
  supabase secrets set DAI_API_KEY="${API_KEY}" 2>/dev/null || echo "⚠️  Supabase CLI not configured, skipping"
  echo "✅ Saved to Supabase secrets"
else
  echo "⚠️  Supabase CLI not found, skipping Supabase secrets"
fi

# 3. Save to Vercel (if Vercel CLI is available)
if command -v vercel &> /dev/null; then
  echo "🚀 Saving to Vercel..."
  
  # Check if we're in a Vercel project
  if [ -f .vercel/project.json ]; then
    echo "${API_KEY}" | vercel env add OPENAI_API_KEY production 2>/dev/null || \
      (vercel env rm OPENAI_API_KEY production --yes 2>/dev/null && \
       echo "${API_KEY}" | vercel env add OPENAI_API_KEY production)
    
    echo "${API_KEY}" | vercel env add DAI_API_KEY production 2>/dev/null || \
      (vercel env rm DAI_API_KEY production --yes 2>/dev/null && \
       echo "${API_KEY}" | vercel env add DAI_API_KEY production)
    
    echo "${API_KEY}" | vercel env add NEXT_PUBLIC_DAI_API_KEY production 2>/dev/null || \
      (vercel env rm NEXT_PUBLIC_DAI_API_KEY production --yes 2>/dev/null && \
       echo "${API_KEY}" | vercel env add NEXT_PUBLIC_DAI_API_KEY production)
    
    echo "https://api.gpt.dealershipai.com" | vercel env add NEXT_PUBLIC_API_BASE_URL production 2>/dev/null || \
      (vercel env rm NEXT_PUBLIC_API_BASE_URL production --yes 2>/dev/null && \
       echo "https://api.gpt.dealershipai.com" | vercel env add NEXT_PUBLIC_API_BASE_URL production)
    
    echo "✅ Saved to Vercel production environment"
  else
    echo "⚠️  Not in a Vercel project, skipping Vercel env vars"
    echo "   Run 'vercel link' first to connect to a project"
  fi
else
  echo "⚠️  Vercel CLI not found, skipping Vercel env vars"
  echo "   Install with: npm i -g vercel"
fi

echo ""
echo "✅ API Key setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Verify in .env.local that keys are set correctly"
echo "   3. Test API connection with: curl 'https://api.gpt.dealershipai.com/api/v1/analyze?domain=example.com&api_key=${API_KEY:0:20}...'"
echo ""

