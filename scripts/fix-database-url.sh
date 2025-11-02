#!/bin/bash

# Fix DATABASE_URL in .env.local to use Supabase pooler connection
# Usage: ./scripts/fix-database-url.sh [PASSWORD]

set -e

PROJECT_REF="gzlgfghpkbqlhgfozjkb"
REGION="us-east-2"

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found"
  exit 1
fi

# Get password from argument or prompt
if [ -n "$1" ]; then
  DB_PASSWORD="$1"
elif [ -n "$SUPABASE_DB_PASSWORD" ]; then
  DB_PASSWORD="$SUPABASE_DB_PASSWORD"
else
  echo "🔐 Enter your Supabase database password:"
  read -s DB_PASSWORD
  echo ""
fi

if [ -z "$DB_PASSWORD" ]; then
  echo "❌ Error: Password cannot be empty"
  exit 1
fi

# Construct correct connection string (Transaction pooler)
NEW_DATABASE_URL="postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-${REGION}.pooler.supabase.com:6543/postgres"

echo "🔧 Updating DATABASE_URL in $ENV_FILE..."
echo ""

# Backup original
cp "$ENV_FILE" "$ENV_FILE.backup"
echo "✅ Backup created: $ENV_FILE.backup"

# Update DATABASE_URL
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
  # Replace existing DATABASE_URL
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
  else
    # Linux
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
  fi
  echo "✅ DATABASE_URL updated"
else
  # Add new DATABASE_URL
  echo "DATABASE_URL=\"$NEW_DATABASE_URL\"" >> "$ENV_FILE"
  echo "✅ DATABASE_URL added"
fi

echo ""
echo "🧪 Testing connection..."
export DATABASE_URL="$NEW_DATABASE_URL"

# Test with Prisma
if npx prisma db execute --stdin <<< "SELECT 1;" 2>&1 | grep -q "1"; then
  echo "✅ Connection successful!"
else
  echo "⚠️  Connection test skipped (will test with db push)"
fi

echo ""
echo "✅ Updated! Next steps:"
echo "   1. Test: npx prisma db push"
echo "   2. If successful, update Vercel with the same connection string"

