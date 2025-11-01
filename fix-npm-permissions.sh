#!/bin/bash

# Fix npm Permissions Script
# Run this script to fix npm cache permission issues

echo "🔧 Fixing npm permissions..."
echo ""

# Get current user
USER=$(whoami)
USER_ID=$(id -u)
GROUP_ID=$(id -g)

echo "Current user: $USER ($USER_ID:$GROUP_ID)"
echo ""

# Check npm cache location
NPM_CACHE=$(npm config get cache)
echo "npm cache location: $NPM_CACHE"
echo ""

# Try to fix without sudo first
echo "Attempting to fix without sudo..."
chown -R $USER:$GROUP_ID "$NPM_CACHE" 2>/dev/null && echo "✅ Fixed without sudo!" && exit 0

# If that fails, provide sudo command
echo "⚠️  Need sudo to fix permissions"
echo ""
echo "Run this command (will ask for your password):"
echo ""
echo "sudo chown -R $USER:$GROUP_ID ~/.npm"
echo ""
echo "Or if using a custom npm cache:"
echo "sudo chown -R $USER:$GROUP_ID \"$NPM_CACHE\""
echo ""
echo "After fixing, run:"
echo "npm install @react-email/components @react-email/render mixpanel-browser"

