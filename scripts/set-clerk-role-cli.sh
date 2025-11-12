#!/bin/bash
# Set Clerk User Role using Clerk CLI
# 
# Usage: ./scripts/set-clerk-role-cli.sh <userId> <role> <tenant>
# Example: ./scripts/set-clerk-role-cli.sh user_abc123 admin demo-dealer-001

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
  echo "Usage: $0 <userId> <role> <tenant>"
  echo "Example: $0 user_abc123 admin demo-dealer-001"
  exit 1
fi

USER_ID=$1
ROLE=$2
TENANT=$3

if [[ ! "$ROLE" =~ ^(admin|ops|viewer)$ ]]; then
  echo "❌ Role must be one of: admin, ops, viewer"
  exit 1
fi

echo "🔧 Setting Clerk user role..."
echo "   User ID: $USER_ID"
echo "   Role: $ROLE"
echo "   Tenant: $TENANT"
echo ""

# Use Clerk CLI to update user metadata
clerk users update "$USER_ID" \
  --metadata "{\"role\":\"$ROLE\",\"tenant\":\"$TENANT\"}" \
  --json

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully set user role!"
else
  echo ""
  echo "❌ Failed to set user role"
  echo "   Make sure Clerk CLI is installed: npm install -g @clerk/cli"
  echo "   Or use Clerk Dashboard: https://dashboard.clerk.com"
  exit 1
fi

