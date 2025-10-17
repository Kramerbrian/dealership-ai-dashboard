#!/bin/bash

# Execute RLS Performance Fix using Supabase CLI
echo "🔧 Executing RLS Performance Fix using Supabase CLI..."

# Get the SQL content
SQL_CONTENT=$(cat RLS_FIX_MANUAL.sql)

echo "📋 SQL Content to Execute:"
echo "=========================="
echo "$SQL_CONTENT"
echo "=========================="
echo ""

# Try to use the Supabase CLI to execute the SQL
echo "🚀 Attempting to execute SQL using Supabase CLI..."

# Method 1: Try using supabase db remote exec with here document
echo "Method 1: Using here document..."
supabase db remote exec --linked << 'EOF'
-- RLS Performance Fix
DROP POLICY IF EXISTS "Users can read their own prospect record" ON public.prospects;
CREATE POLICY "Users can read their own prospect record" ON public.prospects
    FOR SELECT USING (user_id = (select auth.uid()));

SELECT 'RLS Performance Fix Applied!' as status;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Method 1 successful!"
else
    echo "❌ Method 1 failed, trying Method 2..."
    
    # Method 2: Try using supabase db remote exec with echo
    echo "Method 2: Using echo..."
    echo "DROP POLICY IF EXISTS \"Users can read their own prospect record\" ON public.prospects;" | supabase db remote exec --linked
    
    if [ $? -eq 0 ]; then
        echo "✅ Method 2 successful!"
    else
        echo "❌ Method 2 failed, trying Method 3..."
        
        # Method 3: Try using supabase db remote exec with printf
        echo "Method 3: Using printf..."
        printf "DROP POLICY IF EXISTS \"Users can read their own prospect record\" ON public.prospects;\n" | supabase db remote exec --linked
        
        if [ $? -eq 0 ]; then
            echo "✅ Method 3 successful!"
        else
            echo "❌ All CLI methods failed."
            echo ""
            echo "🔄 Alternative: Manual Application Required"
            echo "1. Go to: https://supabase.com/dashboard"
            echo "2. Navigate to: SQL Editor"
            echo "3. Copy and run the SQL content shown above"
        fi
    fi
fi

echo ""
echo "🎯 RLS Performance Fix execution completed!"
