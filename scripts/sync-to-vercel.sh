#!/bin/bash

# Sync environment variables to Vercel
# Reads from .env.local and syncs to Vercel production

set -e

echo "📤 Syncing API Keys to Vercel"
echo "=============================="
echo ""

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

# Check if linked
if [ ! -f ".vercel/project.json" ]; then
    echo "⚠️  Not linked to Vercel. Run: vercel link"
    exit 1
fi

# Keys to sync
KEYS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "CRON_SECRET"
    "MODEL_REGISTRY_VERSION"
    "NEXT_PUBLIC_API_URL"
    "TELEMETRY_WEBHOOK"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SENTRY_DSN"
    "SUPABASE_SERVICE_ROLE_KEY"
)

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.local not found"
    exit 1
fi

# Function to get value from .env.local
get_env_value() {
    grep "^$1=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo ""
}

# Sync each key
for key in "${KEYS[@]}"; do
    value=$(get_env_value "$key")
    
    if [ -z "$value" ] || [[ "$value" == *"your-"* ]] || [[ "$value" == *"localhost"* ]]; then
        echo "⏭️  Skipping $key (not set or placeholder)"
        continue
    fi
    
    echo "📤 Syncing $key..."
    
    # Remove existing if present
    vercel env rm "$key" production --yes 2>/dev/null || true
    
    # Add new value
    echo "$value" | vercel env add "$key" production
    
    echo "✅ Synced $key"
    echo ""
done

echo "✅ Sync complete!"
echo ""
echo "Verify with: vercel env ls"

