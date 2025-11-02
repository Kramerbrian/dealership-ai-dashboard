#!/bin/bash

# Update DATABASE_URL with provided connection details
# Using: host, port, database, user from Supabase

set -e

ENV_FILE=".env"
HOST="db.gzlgfghpkbqlhgfozjkb.supabase.co"
PORT="5432"
DATABASE="postgres"
USER="postgres.gzlgfghpkbqlhgfozjkb"  # Supabase requires project-specific username
PASSWORD="Autonation2077$"

# URL encode password
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASSWORD', safe=''))" 2>/dev/null || echo "$PASSWORD")

# Construct connection string
NEW_DATABASE_URL="postgresql://${USER}:${ENCODED_PASSWORD}@${HOST}:${PORT}/${DATABASE}"

echo "🔧 Updating DATABASE_URL in $ENV_FILE..."
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   Database: $DATABASE"
echo "   User: $USER"
echo ""

# Backup
cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Update
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
else
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DATABASE_URL\"|" "$ENV_FILE"
fi

echo "✅ DATABASE_URL updated:"
echo "   postgresql://$USER:***@$HOST:$PORT/$DATABASE"
echo ""

# Test connection
echo "🧪 Testing connection..."
export DATABASE_URL="$NEW_DATABASE_URL"

echo "Running: npx prisma db push"
npx prisma db push 2>&1

