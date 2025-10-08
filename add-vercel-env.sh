#!/bin/bash
echo "Adding environment variables to Vercel..."
echo ""

# ORY Authentication
echo "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com" | vercel env add ORY_SDK_URL production
echo "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com" | vercel env add ORY_SDK_URL preview

echo "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com" | vercel env add NEXT_PUBLIC_ORY_SDK_URL production
echo "https://optimistic-haslett-3r8udelhc2.projects.oryapis.com" | vercel env add NEXT_PUBLIC_ORY_SDK_URL preview

echo "360ebb8f-2337-48cd-9d25-fba49a262f9c" | vercel env add ORY_PROJECT_ID production
echo "360ebb8f-2337-48cd-9d25-fba49a262f9c" | vercel env add ORY_PROJECT_ID preview

echo "83af532a-eee6-4ad8-96c4-f4802a90940a" | vercel env add ORY_WORKSPACE_ID production
echo "83af532a-eee6-4ad8-96c4-f4802a90940a" | vercel env add ORY_WORKSPACE_ID preview

# Supabase
echo "https://vxrdvkhkombwlhjvtsmw.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "https://vxrdvkhkombwlhjvtsmw.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NjgwMDQsImV4cCI6MjA3MTA0NDAwNH0.5GEWgoolAs5l1zd0ftOBG7MfYZ20sKuxcR-w93VeF7s" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4cmR2a2hrb21id2xoanZ0c213Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2ODAwNCwiZXhwIjoyMDcxMDQ0MDA0fQ.lLQNZjVAWQ_DeObUYMzXL4cQ81_R6MnDzYPlqIIxoR0" | vercel env add SUPABASE_SERVICE_ROLE_KEY preview

echo "✅ Critical variables added! Continue with the rest manually."
