#!/bin/bash
# Monitor Next.js releases for bug fix
# Checks npm registry for Next.js 15.5.7+ releases

echo "🔍 Checking Next.js releases..."

CURRENT_VERSION=$(grep '"next":' package.json | sed 's/.*"next": "\([^"]*\)".*/\1/')
echo "Current version: $CURRENT_VERSION"

# Check latest version
LATEST_VERSION=$(npm view next version)
echo "Latest version: $LATEST_VERSION"

# Check if there's a newer patch version (15.5.7+)
CURRENT_MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
CURRENT_MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
CURRENT_PATCH=$(echo $CURRENT_VERSION | cut -d. -f3)

LATEST_MAJOR=$(echo $LATEST_VERSION | cut -d. -f1)
LATEST_MINOR=$(echo $LATEST_VERSION | cut -d. -f2)
LATEST_PATCH=$(echo $LATEST_VERSION | cut -d. -f3)

if [ "$LATEST_MAJOR" -gt "$CURRENT_MAJOR" ] || \
   [ "$LATEST_MAJOR" -eq "$CURRENT_MAJOR" ] && [ "$LATEST_MINOR" -gt "$CURRENT_MINOR" ] || \
   [ "$LATEST_MAJOR" -eq "$CURRENT_MAJOR" ] && [ "$LATEST_MINOR" -eq "$CURRENT_MINOR" ] && [ "$LATEST_PATCH" -ge 7 ]; then
  echo "✅ New version available: $LATEST_VERSION"
  echo "📝 This version may fix the not-found page bug"
  echo ""
  echo "To update:"
  echo "  npm install next@$LATEST_VERSION --legacy-peer-deps"
else
  echo "⚠️  No new version available yet"
  echo "Current: $CURRENT_VERSION"
  echo "Latest: $LATEST_VERSION"
fi

# Check for specific bug fix mentions
echo ""
echo "🔍 Checking for bug fix mentions..."
npm view next@latest --json | jq -r '.version, .description' 2>/dev/null || echo "Could not fetch details"

