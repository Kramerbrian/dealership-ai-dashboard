#!/bin/bash
# Interactive script to add streaming LLM environment variables
# Adds to both .env.local and Vercel

set -e

ENV_FILE=".env.local"

echo "🚀 Streaming LLM Environment Variables Setup"
echo "=============================================="
echo ""

# Check if .env.local exists, create if not
if [ ! -f "$ENV_FILE" ]; then
  echo "📝 Creating $ENV_FILE..."
  touch "$ENV_FILE"
fi

# Function to add variable to .env.local
add_to_env_file() {
  local key=$1
  local value=$2
  
  # Remove existing entry if present
  sed -i.bak "/^${key}=/d" "$ENV_FILE" 2>/dev/null || true
  # Add new entry
  echo "${key}=${value}" >> "$ENV_FILE"
  echo "   ✅ Added to $ENV_FILE"
}

# Function to add to Vercel
add_to_vercel() {
  local key=$1
  local value=$2
  local env=${3:-production}
  
  echo "   📤 Adding to Vercel ($env)..."
  echo "$value" | vercel env add "$key" "$env" 2>&1 | grep -v "Enter" || {
    echo "      ⚠️  May already exist or failed"
  }
}

# 1. ANTHROPIC_API_KEY
echo "1️⃣  ANTHROPIC_API_KEY (Required)"
echo "   Get it from: https://console.anthropic.com/api-keys"
read -p "   Enter ANTHROPIC_API_KEY (or press Enter to skip): " ANTHROPIC_KEY

if [ -n "$ANTHROPIC_KEY" ]; then
  add_to_env_file "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY"
  
  read -p "   Add to Vercel? (y/n, default: y): " ADD_VERCEL
  if [ "${ADD_VERCEL:-y}" = "y" ]; then
    read -p "   Environments (all/production/preview/development, default: all): " ENV_TYPE
    ENV_TYPE=${ENV_TYPE:-all}
    
    if [ "$ENV_TYPE" = "all" ]; then
      add_to_vercel "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY" "production"
      add_to_vercel "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY" "preview"
      add_to_vercel "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY" "development"
    else
      add_to_vercel "ANTHROPIC_API_KEY" "$ANTHROPIC_KEY" "$ENV_TYPE"
    fi
  fi
else
  echo "   ⏭️  Skipped"
fi

echo ""

# 2. OPENAI_API_KEY (Optional)
echo "2️⃣  OPENAI_API_KEY (Optional - fallback)"
echo "   Get it from: https://platform.openai.com/api-keys"
read -p "   Enter OPENAI_API_KEY (or press Enter to skip): " OPENAI_KEY

if [ -n "$OPENAI_KEY" ]; then
  add_to_env_file "OPENAI_API_KEY" "$OPENAI_KEY"
  
  read -p "   Add to Vercel? (y/n, default: y): " ADD_VERCEL
  if [ "${ADD_VERCEL:-y}" = "y" ]; then
    read -p "   Environments (all/production/preview/development, default: all): " ENV_TYPE
    ENV_TYPE=${ENV_TYPE:-all}
    
    if [ "$ENV_TYPE" = "all" ]; then
      add_to_vercel "OPENAI_API_KEY" "$OPENAI_KEY" "production"
      add_to_vercel "OPENAI_API_KEY" "$OPENAI_KEY" "preview"
      add_to_vercel "OPENAI_API_KEY" "$OPENAI_KEY" "development"
    else
      add_to_vercel "OPENAI_API_KEY" "$OPENAI_KEY" "$ENV_TYPE"
    fi
  fi
else
  echo "   ⏭️  Skipped (optional)"
fi

echo ""

# 3. DATABASE_URL
echo "3️⃣  DATABASE_URL (Required)"
echo "   Get it from: Supabase Dashboard → Settings → Database"
read -p "   Enter DATABASE_URL (or press Enter to skip): " DATABASE_URL

if [ -n "$DATABASE_URL" ]; then
  add_to_env_file "DATABASE_URL" "$DATABASE_URL"
  
  read -p "   Add to Vercel? (y/n, default: y): " ADD_VERCEL
  if [ "${ADD_VERCEL:-y}" = "y" ]; then
    read -p "   Environments (all/production/preview/development, default: all): " ENV_TYPE
    ENV_TYPE=${ENV_TYPE:-all}
    
    if [ "$ENV_TYPE" = "all" ]; then
      add_to_vercel "DATABASE_URL" "$DATABASE_URL" "production"
      add_to_vercel "DATABASE_URL" "$DATABASE_URL" "preview"
      add_to_vercel "DATABASE_URL" "$DATABASE_URL" "development"
    else
      add_to_vercel "DATABASE_URL" "$DATABASE_URL" "$ENV_TYPE"
    fi
  fi
else
  echo "   ⏭️  Skipped"
fi

echo ""
echo "=============================================="
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   • Variables added to: $ENV_FILE"
echo "   • Variables synced to: Vercel"
echo ""
echo "🔍 Verify:"
echo "   cat $ENV_FILE"
echo "   vercel env ls"
echo ""
echo "🚀 Next steps:"
echo "   npm run dev          # Test locally"
echo "   vercel --prod        # Deploy to production"
echo ""

