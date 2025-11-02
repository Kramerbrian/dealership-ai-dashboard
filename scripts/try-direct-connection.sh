#!/bin/bash

# Try direct connection instead of pooler
# Sometimes pooler has authentication issues

set -e

ENV_FILE=".env"
PROJECT_REF="gzlgfghpkbqlhgfozjkb"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found"
  exit 1
fi

# Get current password
CURRENT_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"')
PASSWORD=$(echo "$CURRENT_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p' | python3 -c "import sys, urllib.parse; print(urllib.parse.unquote(sys.stdin.read().strip()))" 2>/dev/null || echo "$(echo "$CURRENT_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')")

if [ -z "$PASSWORD" ]; then
  echo "🔐 Enter your Supabase database password:"
  read -s PASSWORD
  echo ""
fi

# Try direct connection format (port 5432)
# Format: postgresql://postgres.gzlgfghpkbqlhgfozjkb:[PASSWORD]@db.gzlgfghpkbqlhgfozjkb.supabase.co:5432/postgres
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))" 2>/dev/null || echo "$PASSWORD")
NEW_DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo "🔧 Trying direct connection format..."
echo ""

# Backup
cp "$ENV_FILE" "$ENV_FILE.backup.direct.$(date +%Y%m%d_%H%M%S)"

# Update
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
else
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
fi

echo "✅ Updated to direct connection format"
echo "   postgresql://postgres.$PROJECT_REF:***@db.$PROJECT_REF.supabase.co:5432/postgres"
echo ""
echo "🧪 Testing..."
export DATABASE_URL="$NEW_DATABASE_URL"

if npx prisma db push 2>&1 | head -20; then
  echo "✅ Success!"
else
  echo "⚠️  Still having issues. You may need to:"
  echo "   1. Verify password in Supabase dashboard"
  echo "   2. Check IP allowlist in Supabase"
  echo "   3. Reset database password if needed"
fi

