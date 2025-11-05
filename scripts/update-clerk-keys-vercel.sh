#!/bin/bash
# Update Clerk keys in Vercel (remove old, add new)
# Usage: ./scripts/update-clerk-keys-vercel.sh

set -e

PUBLISHABLE_KEY="pk_live_Y2xlcmsuZGVhbGVyc2hpcGFpLmNvbSQ"
SECRET_KEY="sk_live_46lFcR07X8wbGi0k6nXBVTYUXaE5djeCsoqyuyiubl"

echo "🔄 Updating Clerk keys in Vercel..."
echo ""

# Function to update a key
update_key() {
    local KEY_NAME=$1
    local VALUE=$2
    local ENV=$3
    
    echo "Updating $KEY_NAME for $ENV..."
    
    # Remove old key (ignore errors if it doesn't exist)
    vercel env rm "$KEY_NAME" "$ENV" --yes 2>/dev/null || true
    
    # Add new key
    echo "$VALUE" | vercel env add "$KEY_NAME" "$ENV"
    echo ""
}

# Update publishable key for all environments
update_key "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$PUBLISHABLE_KEY" "production"
update_key "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$PUBLISHABLE_KEY" "preview"
update_key "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$PUBLISHABLE_KEY" "development"

# Update secret key for all environments
update_key "CLERK_SECRET_KEY" "$SECRET_KEY" "production"
update_key "CLERK_SECRET_KEY" "$SECRET_KEY" "preview"
update_key "CLERK_SECRET_KEY" "$SECRET_KEY" "development"

echo "✅ Done! Verify with: vercel env ls"

