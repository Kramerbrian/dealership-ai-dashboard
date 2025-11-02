#!/bin/bash

# Add environment variables from .env.local to Vercel
# This will prompt you to confirm each variable before adding

set -e

echo "🚀 Add Environment Variables from .env.local to Vercel"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found."
  echo "📦 Install with: npm install -g vercel"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "❌ Not logged in to Vercel."
  echo "🔐 Run: vercel login"
  exit 1
fi

echo "✅ Logged in as: $(vercel whoami)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  echo "   Create .env.local with your variables first."
  exit 1
fi

echo "📄 Reading .env.local..."
echo ""

# Function to add variable
add_var() {
  local var_name=$1
  local var_value=$2
  
  if [ -z "$var_value" ]; then
    return
  fi
  
  # Check if already exists
  if vercel env ls 2>/dev/null | grep -q "^$var_name"; then
    echo "✅ $var_name already exists, skipping..."
    return
  fi
  
  echo "➕ Adding $var_name..."
  echo "$var_value" | vercel env add "$var_name" production preview development <<< "$var_value" && echo "   ✅ Added!" || echo "   ❌ Failed"
}

# Read .env.local line by line
while IFS='=' read -r key value || [ -n "$key" ]; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue
  
  # Remove quotes if present
  value=$(echo "$value" | sed "s/^['\"]//;s/['\"]$//")
  
  # Skip if value is empty
  [[ -z "$value" ]] && continue
  
  add_var "$key" "$value"
done < .env.local

echo ""
echo "✅ Done!"
echo ""
echo "📋 To verify, run:"
echo "   vercel env ls"
echo ""

