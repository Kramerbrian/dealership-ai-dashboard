#!/bin/bash

# Apply RLS Performance Fix using psql
echo "🔧 Applying RLS Performance Fix using psql..."

# Database connection details
DB_HOST="db.vxrdvkhkombwlhjvtsmw.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="Autonation2077\$"

# Test connection first
echo "📡 Testing database connection..."
psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "SELECT 'Connection successful!' as status;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    
    echo "🚀 Applying RLS performance fix..."
    
    # Apply the RLS fix
    psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -f RLS_FIX_MANUAL.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ RLS Performance Fix applied successfully!"
        
        # Verify the fix
        echo "🔍 Verifying the fix..."
        psql "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" -c "SELECT COUNT(*) as inefficient_policies FROM check_rls_performance() WHERE is_inefficient = true;"
        
    else
        echo "❌ Error applying RLS fix"
    fi
else
    echo "❌ Database connection failed"
    echo "📋 Please check your network connection and try again"
    echo ""
    echo "🔄 Alternative: Use the manual method:"
    echo "1. Go to: https://supabase.com/dashboard"
    echo "2. Navigate to: SQL Editor"
    echo "3. Copy and run the contents of RLS_FIX_MANUAL.sql"
fi

echo ""
echo "🎯 RLS Performance Fix script completed!"
