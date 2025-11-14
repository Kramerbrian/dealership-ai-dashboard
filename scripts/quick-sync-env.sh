#!/bin/bash
# Quick sync: .env.local → Vercel (all environments)

ENV_FILE=".env.local"
ENVS=("production" "preview" "development")

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Create it first."
  exit 1
fi

echo "🔄 Syncing .env.local → Vercel"
echo ""

for env in "${ENVS[@]}"; do
  echo "📤 Syncing to $env..."
  
  # ANTHROPIC_API_KEY
  if grep -q "^ANTHROPIC_API_KEY=" "$ENV_FILE"; then
    VALUE=$(grep "^ANTHROPIC_API_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
    echo "$VALUE" | vercel env add ANTHROPIC_API_KEY "$env" 2>&1 | grep -v "Enter" || echo "   ⚠️  ANTHROPIC_API_KEY may already exist"
  fi
  
  # OPENAI_API_KEY (optional)
  if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
    VALUE=$(grep "^OPENAI_API_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
    echo "$VALUE" | vercel env add OPENAI_API_KEY "$env" 2>&1 | grep -v "Enter" || echo "   ⚠️  OPENAI_API_KEY may already exist"
  fi
  
  # DATABASE_URL
  if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    VALUE=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
    echo "$VALUE" | vercel env add DATABASE_URL "$env" 2>&1 | grep -v "Enter" || echo "   ⚠️  DATABASE_URL may already exist"
  fi
done

echo ""
echo "✅ Sync complete! Verify with: vercel env ls"
