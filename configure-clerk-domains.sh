#!/bin/bash

# Clerk Domain Configuration Script
# Run this after setting up your production keys

echo "🔧 Configuring Clerk domains..."

# Your Clerk instance details
CLERK_INSTANCE_ID="ins_33KM1OT8bmznnJnWoQOVxKIsZoD"
CLERK_SECRET_KEY="sk_live_YOUR_SECRET_KEY_HERE"

# Domains to add
DOMAINS=(
  "dealershipai.com"
  "www.dealershipai.com"
  "dealership-ai-dashboard.vercel.app"
)

echo "Adding domains to Clerk instance: $CLERK_INSTANCE_ID"

for domain in "${DOMAINS[@]}"; do
  echo "Adding domain: $domain"
  
  curl -X POST "https://api.clerk.com/v1/instances/$CLERK_INSTANCE_ID/domains" \
    -H "Authorization: Bearer $CLERK_SECRET_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      "name": "$domain",
      "is_satellite": false,
      "proxy_url": "https://$domain"
    }"
  
  echo ""
done

echo "✅ Domain configuration complete!"
echo "Check your domains at: https://dashboard.clerk.com/apps/app_33KM1Q3TCBfKXd0PqVn6gt32SFx/instances/$CLERK_INSTANCE_ID/domains"
