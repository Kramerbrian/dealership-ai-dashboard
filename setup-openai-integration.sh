#!/bin/bash

echo "🚀 DealershipAI OpenAI Integration Setup"
echo "========================================"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local not found. Creating from template..."
    cp env-openai-template.txt .env.local
    echo "✅ Created .env.local from template"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Required Environment Variables:"
echo "=================================="
echo "1. OPENAI_API_KEY - Your OpenAI API key"
echo "2. OPENAI_ASSISTANT_ID - Your OpenAI Assistant ID"
echo "3. NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL"
echo "4. NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anon key"
echo "5. SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key"

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Edit .env.local and add your actual API keys"
echo "2. Run the database migration in Supabase"
echo "3. Create an OpenAI Assistant"
echo "4. Test the integration"

echo ""
echo "📖 For detailed instructions, see: OPENAI_INTEGRATION_README.md"

# Check if required variables are set
echo ""
echo "🔍 Checking current configuration..."

if grep -q "OPENAI_API_KEY=sk-" .env.local; then
    echo "✅ OPENAI_API_KEY is configured"
else
    echo "❌ OPENAI_API_KEY needs to be set"
fi

if grep -q "OPENAI_ASSISTANT_ID=asst_" .env.local; then
    echo "✅ OPENAI_ASSISTANT_ID is configured"
else
    echo "❌ OPENAI_ASSISTANT_ID needs to be set"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local; then
    echo "✅ NEXT_PUBLIC_SUPABASE_URL is configured"
else
    echo "❌ NEXT_PUBLIC_SUPABASE_URL needs to be set"
fi

echo ""
echo "🎯 Ready to proceed with setup!"
