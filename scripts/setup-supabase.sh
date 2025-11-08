#!/bin/bash

# DealershipAI Supabase Setup Script
# This script sets up the complete database schema for DealershipAI

set -e

echo "🚀 Setting up DealershipAI Supabase Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

echo "📁 Copying schema files to migrations..."

# Copy all SQL schema files to migrations directory
cp database/migrations/*.sql supabase/migrations/ 2>/dev/null || echo "No migration files found in database/migrations/"

# Copy additional schema files
cp database/*.sql supabase/migrations/ 2>/dev/null || echo "No additional schema files found"

# Apply migrations in order
echo "🔄 Applying migrations..."

# Apply migrations in chronological order
for migration in supabase/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "   Applying $(basename "$migration")..."
        supabase db reset --linked
        break # Reset applies all migrations
    fi
done

# Alternative: Apply individual migrations (if you prefer incremental)
# supabase migration up

echo "🌱 Seeding initial data..."
# Run seed scripts if they exist
if [ -f "supabase/seed.sql" ]; then
    supabase db reset --linked
fi

echo "🔍 Verifying setup..."
# Run a quick verification query
supabase db diff --schema public

echo "✅ Supabase setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run 'supabase start' to start local development"
echo "   2. Run 'supabase db push' to deploy to production"
echo "   3. Check your Supabase dashboard for the new tables"
echo ""
echo "🔗 Useful commands:"
echo "   supabase db reset --linked    # Reset and apply all migrations"
echo "   supabase db diff              # See differences"
echo "   supabase db push              # Deploy to production"
echo "   supabase gen types typescript # Generate TypeScript types"
