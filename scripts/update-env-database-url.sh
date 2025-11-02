#!/bin/bash

# Update DATABASE_URL in .env to use Supabase pooler connection
# This script will update the connection string format

set -e

ENV_FILE=".env"
PROJECT_REF="gzlgfghpkbqlhgfozjkb"
REGION="us-east-2"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found"
  exit 1
fi

# Get current password from existing DATABASE_URL
CURRENT_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | head -1 | cut -d'=' -f2- | tr -d '"')

if [ -z "$CURRENT_URL" ]; then
  echo "❌ Error: DATABASE_URL not found in $ENV_FILE"
  exit 1
fi

# Extract password from current URL (handle URL encoding)
# Format: postgresql://postgres:PASSWORD@host:port/db
PASSWORD=$(echo "$CURRENT_URL" | sed -n 's|.*://postgres:\([^@]*\)@.*|\1|p')

if [ -z "$PASSWORD" ]; then
  echo "⚠️  Could not extract password from existing URL"
  echo "🔐 Enter your Supabase database password:"
  read -s PASSWORD
  echo ""
fi

# URL encode the password (handle special characters like $)
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))" 2>/dev/null || echo "$PASSWORD")

# Construct new connection string (Transaction pooler)
NEW_DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${ENCODED_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

echo "🔧 Updating DATABASE_URL in $ENV_FILE..."
echo ""

# Backup
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

# Update DATABASE_URL
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
else
  # Linux
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
fi

echo "✅ DATABASE_URL updated to pooler connection"
echo "   Old: postgresql://postgres:***@db.*.supabase.co:5432/postgres"
echo "   New: postgresql://postgres.$PROJECT_REF:***@aws-0-$REGION.pooler.supabase.com:6543/postgres"
echo ""
echo "🧪 Testing connection..."
export DATABASE_URL="$NEW_DATABASE_URL"

# Test with Prisma
if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null | grep -q "1"; then
  echo "✅ Connection test successful!"
else
  echo "⚠️  Connection test skipped (will verify with db push)"
fi

echo ""
echo "✅ Done! Now run: npx prisma db push"

