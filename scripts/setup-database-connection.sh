#!/bin/bash

# DealershipAI v2.0 - Database Connection Setup
# Helps set up the correct DATABASE_URL for running diagnostics

set -e

echo "🔗 Setting up Database Connection for DealershipAI v2.0"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "Please create a .env file with your database connection details"
    exit 1
fi

# Load environment variables
source .env

echo "📋 Current Environment Variables:"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:50}..."
echo ""

# Check if DATABASE_URL is set and valid
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set in .env file"
    echo ""
    echo "Please add your database connection string to .env:"
    echo "DATABASE_URL=\"postgresql://user:password@host:port/database\""
    echo ""
    echo "For Supabase, you can find this in:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Settings > Database"
    echo "3. Copy the 'Connection string' under 'Connection parameters'"
    echo "4. Replace [YOUR-PASSWORD] with your actual database password"
    exit 1
fi

# Check if DATABASE_URL looks like a placeholder
if [[ "$DATABASE_URL" == *"username"* ]] || [[ "$DATABASE_URL" == *"password"* ]] || [[ "$DATABASE_URL" == *"localhost"* ]]; then
    echo "⚠️  DATABASE_URL appears to contain placeholder values"
    echo ""
    echo "Current DATABASE_URL: $DATABASE_URL"
    echo ""
    echo "Please update your .env file with the actual database connection details:"
    echo "1. For Supabase: Get the connection string from your project dashboard"
    echo "2. For local PostgreSQL: Use your actual credentials"
    echo "3. For other providers: Use the provided connection string"
    echo ""
    echo "Example Supabase URL:"
    echo "DATABASE_URL=\"postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\""
    exit 1
fi

echo "✅ DATABASE_URL looks valid"
echo ""

# Test database connection
echo "🔍 Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful"
    echo ""
    
    # Run the security events diagnostic
    echo "🔒 Running Security Events Diagnostic..."
    echo ""
    psql "$DATABASE_URL" -f scripts/check-security-events.sql
    
    echo ""
    echo "✅ Diagnostic complete!"
    echo ""
    echo "Next steps:"
    echo "1. If the table doesn't exist, run: ./scripts/setup-security-events.sh"
    echo "2. If RLS is not enabled, run the migration script"
    echo "3. Verify the security events system is working"
    
else
    echo "❌ Database connection failed"
    echo ""
    echo "Please check:"
    echo "1. Database server is running"
    echo "2. Credentials are correct"
    echo "3. Network connectivity"
    echo "4. Database exists"
    echo ""
    echo "Common issues:"
    echo "- Wrong password"
    echo "- Database server not running"
    echo "- Firewall blocking connection"
    echo "- Database name doesn't exist"
    exit 1
fi
