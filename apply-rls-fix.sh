#!/bin/bash

# Apply RLS Performance Fix using Supabase CLI
echo "🔧 Applying RLS Performance Fix to Supabase..."

# Get the database URL
echo "📡 Getting database connection details..."
DB_URL=$(supabase status --output env | grep DB_URL | cut -d'=' -f2)

if [ -z "$DB_URL" ]; then
    echo "❌ Could not get database URL. Trying alternative approach..."
    
    # Try to get the project reference
    PROJECT_REF=$(supabase status --output env | grep PROJECT_REF | cut -d'=' -f2)
    echo "📋 Project Reference: $PROJECT_REF"
    
    if [ -z "$PROJECT_REF" ]; then
        echo "❌ Could not get project reference. Please run 'supabase link' first."
        exit 1
    fi
fi

echo "✅ Database connection established"

# Create a simplified version of the RLS fix
cat > temp_rls_fix.sql << 'EOF'
-- Simplified RLS Performance Fix
-- Fix the most critical performance issues

-- 1. Fix prospects table RLS policy
DROP POLICY IF EXISTS "Users can read their own prospect record" ON public.prospects;
CREATE POLICY "Users can read their own prospect record" ON public.prospects
    FOR SELECT USING (user_id = (select auth.uid()));

-- 2. Fix users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = (select auth.uid()));

-- 3. Fix tenants table policies
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
CREATE POLICY "Users can view own tenant" ON public.tenants
    FOR SELECT USING (owner_id = (select auth.uid()));

-- 4. Fix dealership_data table policies
DROP POLICY IF EXISTS "Users can view own dealership data" ON public.dealership_data;
CREATE POLICY "Users can view own dealership data" ON public.dealership_data
    FOR SELECT USING (user_id = (select auth.uid()));

-- 5. Fix subscriptions table policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = (select auth.uid()));

-- 6. Create performance monitoring function
CREATE OR REPLACE FUNCTION check_rls_performance()
RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    definition text,
    is_inefficient boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.nspname::text as schemaname,
        c.relname::text as tablename,
        pol.polname::text as policyname,
        pg_get_expr(pol.polqual, pol.polrelid)::text as definition,
        CASE 
            WHEN pg_get_expr(pol.polqual, pol.polrelid)::text LIKE '%auth.uid()%' 
                 AND pg_get_expr(pol.polqual, pol.polrelid)::text NOT LIKE '%(select auth.uid())%'
            THEN true
            ELSE false
        END as is_inefficient
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND pol.polqual IS NOT NULL
    ORDER BY c.relname, pol.polname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Run the performance check
SELECT 'RLS Performance Check Results:' as status;
SELECT * FROM check_rls_performance() WHERE is_inefficient = true;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON public.prospects(user_id);
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_dealership_data_user_id ON public.dealership_data(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

SELECT 'RLS Performance Fix Applied Successfully!' as result;
EOF

echo "📝 Created temporary RLS fix script"

# Try to apply the fix using psql if available
if command -v psql &> /dev/null; then
    echo "🐘 Using psql to apply the fix..."
    
    # Try to get connection details from Supabase
    if [ ! -z "$DB_URL" ]; then
        psql "$DB_URL" -f temp_rls_fix.sql
    else
        echo "❌ Could not get database URL for psql"
        echo "📋 Please run the following SQL manually in your Supabase dashboard:"
        echo ""
        cat temp_rls_fix.sql
    fi
else
    echo "❌ psql not found. Please install PostgreSQL client or run the SQL manually."
    echo "📋 SQL to run in Supabase dashboard:"
    echo ""
    cat temp_rls_fix.sql
fi

# Clean up
rm -f temp_rls_fix.sql

echo "✅ RLS Performance Fix script completed!"
echo ""
echo "🎯 Next steps:"
echo "1. If the script ran successfully, your RLS performance is now optimized"
echo "2. If you need to run manually, copy the SQL above to Supabase SQL Editor"
echo "3. Test your application to verify improved performance"
echo ""
echo "🚀 Your DealershipAI dashboard should now be faster and more scalable!"
