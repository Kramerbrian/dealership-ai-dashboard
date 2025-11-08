#!/bin/bash

# Setup script to create .env.local with required variables
# This script helps set up environment variables for DealershipAI

ENV_FILE=".env.local"

echo "🔧 DealershipAI Environment Setup"
echo "=================================="
echo ""

if [ -f "$ENV_FILE" ]; then
  echo "⚠️  .env.local already exists"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. Edit .env.local manually if needed."
    exit 0
  fi
fi

echo "Enter your environment variables (press Enter to skip):"
echo ""

read -p "SUPABASE_URL: " SUPABASE_URL
read -p "SUPABASE_SERVICE_KEY: " SUPABASE_SERVICE_KEY
read -p "UPSTASH_REDIS_REST_URL: " UPSTASH_REDIS_REST_URL
read -p "UPSTASH_REDIS_REST_TOKEN: " UPSTASH_REDIS_REST_TOKEN
read -p "SCHEMA_ENGINE_URL (optional): " SCHEMA_ENGINE_URL
read -p "NEXT_PUBLIC_BASE_URL [http://localhost:3000]: " BASE_URL

BASE_URL=${BASE_URL:-http://localhost:3000}

cat > "$ENV_FILE" << EOF
# DealershipAI Environment Variables
# Generated on $(date)

# Supabase Configuration
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

# Schema Engine (optional)
SCHEMA_ENGINE_URL=${SCHEMA_ENGINE_URL}

# Base URL
NEXT_PUBLIC_BASE_URL=${BASE_URL}
EOF

echo ""
echo "✅ Created $ENV_FILE"
echo ""
echo "⚠️  IMPORTANT: Make sure to add .env.local to .gitignore!"
echo ""
echo "Next steps:"
echo "1. Review and edit .env.local if needed"
echo "2. Create the telemetry_events table in Supabase (see README_TELEMETRY_SETUP.md)"
echo "3. Run: npm run dev"
echo "4. Test endpoints: ./scripts/test-endpoints.sh"

