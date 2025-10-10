#!/bin/bash

echo "🗄️  DealershipAI Database Setup"
echo "==============================="

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    echo "📋 Running database migration..."
    
    # Check if we're in a Supabase project
    if [ -f "supabase/config.toml" ]; then
        echo "✅ Supabase project detected"
        supabase db push
        echo "✅ Database migration completed"
    else
        echo "⚠️  Not in a Supabase project directory"
        echo "📋 Please run the SQL migration manually:"
        echo "   1. Go to your Supabase dashboard"
        echo "   2. Navigate to SQL Editor"
        echo "   3. Copy and run: supabase/migrations/20241220000000_add_aiv_tables.sql"
    fi
else
    echo "❌ Supabase CLI not found"
    echo "📋 Please run the database migration manually:"
    echo ""
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy the entire content from:"
    echo "   supabase/migrations/20241220000000_add_aiv_tables.sql"
    echo "4. Paste and execute the SQL"
    echo ""
    echo "This will create the following tables:"
    echo "   - aiv_weekly (AIV metrics storage)"
    echo "   - dealers (dealer information)"
    echo "   - dealer_access (user permissions)"
    echo "   - audit_log (action tracking)"
fi

echo ""
echo "🔍 After migration, verify tables exist:"
echo "   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
echo ""
echo "📊 Sample data will be inserted for testing:"
echo "   - demo-dealer (Toyota in Naples, FL)"
echo "   - test-dealer (Honda in Miami, FL)"