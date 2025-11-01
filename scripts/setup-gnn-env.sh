#!/bin/bash
# Setup GNN environment variables in .env.local
# Usage: ./scripts/setup-gnn-env.sh

set -e

ENV_FILE=".env.local"

echo "🔧 Setting up GNN environment variables"
echo "======================================="
echo ""

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env.local from env.example..."
    cp env.example "$ENV_FILE"
    echo "✅ Created $ENV_FILE"
fi

# Function to set or update env var
set_env_var() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Update existing
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        else
            sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        fi
        echo "  ✅ Updated $key"
    else
        # Add new
        echo "${key}=${value}" >> "$ENV_FILE"
        echo "  ✅ Added $key"
    fi
}

# Set GNN variables
echo "📝 Setting GNN configuration..."
set_env_var "NEXT_PUBLIC_GNN_ENABLED" "true"
set_env_var "GNN_ENGINE_URL" "http://localhost:8080"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "📋 Current GNN settings in $ENV_FILE:"
grep -E "^NEXT_PUBLIC_GNN_ENABLED=|^GNN_ENGINE_URL=" "$ENV_FILE" || echo "  (not found)"
echo ""
echo "💡 For production, update GNN_ENGINE_URL to your deployed service URL"

