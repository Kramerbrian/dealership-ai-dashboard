#!/bin/bash

echo "🗄️  Setting up Supabase Database for DealershipAI..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it first with your Supabase credentials."
    echo "Copy env.production.example to .env.local and fill in your values."
    exit 1
fi

# Load environment variables
source .env.local

# Check if Supabase URL and keys are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase credentials not found in .env.local"
    echo "Please add:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    exit 1
fi

echo "✅ Supabase credentials found"

# Extract project reference from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/.*\/\/\([^.]*\)\..*/\1/')

echo "📋 Project Reference: $PROJECT_REF"

echo ""
echo "🚀 Next steps:"
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project: $PROJECT_REF"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the following SQL:"
echo ""
echo "--- START SQL ---"
cat supabase-schema.sql
echo ""
echo "--- END SQL ---"
echo ""
echo "5. Click 'Run' to execute the SQL"
echo ""
echo "✅ After running the SQL, your database will be ready!"
echo ""
echo "🔑 Don't forget to:"
echo "- Set up Clerk authentication"
echo "- Configure Stripe billing"
echo "- Add your AI API keys"
echo "- Deploy to Vercel"
