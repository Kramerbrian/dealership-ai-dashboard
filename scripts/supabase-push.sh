#!/bin/bash

# Helper script to push Supabase migrations using password from .env.local

set -e

# Load .env.local if it exists
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep -E 'SUPABASE_DB_PASSWORD|DATABASE_PASSWORD' | xargs)
fi

# Use password from env or fallback
export PGPASSWORD="${SUPABASE_DB_PASSWORD:-${DATABASE_PASSWORD:-Autonation2077$}}"

echo "🚀 Pushing Supabase migrations..."
echo ""

# Push migrations
supabase db push --include-all

echo ""
echo "✅ Migrations pushed successfully!"

