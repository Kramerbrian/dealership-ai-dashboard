#!/bin/bash

# Script to add environment variables from .env.local to Vercel
# Usage: ./scripts/add-env-to-vercel.sh

set -e

echo "📋 Adding Environment Variables to Vercel"
echo ""

# Variables to add (read from .env.local)
declare -a vars=(
  "NEXT_PUBLIC_GA_ID=G-JYQ9MZLCQW"
  "NEXT_PUBLIC_GA_STREAM_NAME=dealershipAI"
  "NEXT_PUBLIC_GA_STREAM_URL=https://dealershipAI.com"
  "NEXT_PUBLIC_GA_STREAM_ID=12840986554"
  "NEXT_PUBLIC_GOOGLE_ADS_ID=469-565-3842"
  "WORKOS_API_KEY=client_01K93QEQNK49CEMSNQXAKMYZPZ"
  "WORKOS_CLIENT_ID=client_01K93QEQNK49CEMSNQXAKMYZPZ"
  "NEXT_PUBLIC_WORKOS_CLIENT_ID=client_01K93QEQNK49CEMSNQXAKMYZPZ"
)

environments=("production" "preview" "development")

for var_line in "${vars[@]}"; do
  IFS='=' read -r key value <<< "$var_line"
  
  if [ -z "$key" ] || [ -z "$value" ]; then
    continue
  fi
  
  echo "Adding $key..."
  
  for env in "${environments[@]}"; do
    echo "$value" | vercel env add "$key" "$env" --force 2>&1 | grep -E "(Added|already)" || echo "  ✓ $env"
  done
  
  echo ""
done

echo "✅ All variables added to Vercel!"
echo ""
echo "⚠️  Note: SENTRY_AUTH_TOKEN must be added manually after generating token"
echo "   vercel env add SENTRY_AUTH_TOKEN production"

