#!/bin/bash

# Test Database Connection
# This script tests if the database connection is working

set -e

echo "🔍 Testing database connection..."

# Check if environment variables are set
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL environment variable is not set"
    echo "Please set it with: export SUPABASE_URL='your-supabase-url'"
    echo ""
    echo "To get your Supabase URL:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → API"
    echo "4. Copy the Project URL"
    echo ""
    echo "Then run: export SUPABASE_URL='https://your-project-id.supabase.co'"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set"
    echo "Please set it with: export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
    echo ""
    echo "To get your Service Role Key:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings → API"
    echo "4. Copy the Service Role Key"
    exit 1
fi

echo "✅ Environment variables are set"

# Test connection
echo "🔌 Testing database connection..."

# Test basic connection
if psql "$SUPABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Database connection failed"
    echo ""
    echo "Common issues:"
    echo "1. Check if your Supabase URL is correct"
    echo "2. Check if your Service Role Key is correct"
    echo "3. Check if your Supabase project is active"
    echo "4. Check if you have internet connectivity"
    exit 1
fi

# Test if we can create tables
echo "🔧 Testing table creation..."

if psql "$SUPABASE_URL" -c "CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMPTZ);" > /dev/null 2>&1; then
    echo "✅ Table creation successful!"
    
    # Clean up test table
    psql "$SUPABASE_URL" -c "DROP TABLE IF EXISTS test_connection;" > /dev/null 2>&1
    echo "✅ Test table cleaned up"
else
    echo "❌ Table creation failed"
    echo "This might indicate permission issues"
    exit 1
fi

# Test if we can query system tables
echo "🔍 Testing system table access..."

if psql "$SUPABASE_URL" -c "SELECT schemaname FROM information_schema.schemata WHERE schema_name = 'public';" > /dev/null 2>&1; then
    echo "✅ System table access successful!"
else
    echo "❌ System table access failed"
    echo "This might indicate permission issues"
    exit 1
fi

echo ""
echo "🎉 Database connection test completed successfully!"
echo ""
echo "Your database is ready for the DealershipAI system!"
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/fix-database-schema.sh"
echo "2. Start your application: npm run dev"
echo "3. Test the AI features"
