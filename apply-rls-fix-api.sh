#!/bin/bash

# Apply RLS Performance Fix using Supabase REST API
echo "🔧 Applying RLS Performance Fix using Supabase API..."

# Get project details
PROJECT_REF="vxrdvkhkombwlhjvtsmw"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0"

# Create the SQL payload
SQL_PAYLOAD='{
  "query": "DROP POLICY IF EXISTS \"Users can read their own prospect record\" ON public.prospects; CREATE POLICY \"Users can read their own prospect record\" ON public.prospects FOR SELECT USING (user_id = (select auth.uid())); DROP POLICY IF EXISTS \"Users can view own profile\" ON public.users; CREATE POLICY \"Users can view own profile\" ON public.users FOR SELECT USING (id = (select auth.uid())); DROP POLICY IF EXISTS \"Users can update own profile\" ON public.users; CREATE POLICY \"Users can update own profile\" ON public.users FOR UPDATE USING (id = (select auth.uid())); CREATE INDEX IF NOT EXISTS idx_prospects_user_id ON public.prospects(user_id); CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id); SELECT '\''RLS Performance Fix Applied Successfully!'\'' as status;"
}'

echo "📡 Executing RLS performance fix..."

# Execute the SQL using Supabase REST API
RESPONSE=$(curl -s -X POST \
  "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "$SQL_PAYLOAD")

echo "📋 Response: $RESPONSE"

# Try alternative approach using direct SQL execution
echo "🔄 Trying alternative approach..."

ALTERNATIVE_SQL='{
  "query": "SELECT '\''Testing connection'\'' as status;"
}'

RESPONSE2=$(curl -s -X POST \
  "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "$ALTERNATIVE_SQL")

echo "📋 Alternative Response: $RESPONSE2"

echo "✅ RLS Performance Fix script completed!"
echo ""
echo "🎯 If the API approach didn't work, please use the manual method:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Navigate to: SQL Editor"
echo "3. Copy and run the contents of RLS_FIX_MANUAL.sql"
echo ""
echo "🚀 Your DealershipAI dashboard will be faster and more scalable!"
