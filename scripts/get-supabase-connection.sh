#!/bin/bash

# DealershipAI v2.0 - Supabase Connection Helper
# Helps you get the correct database connection string

echo "🔗 Getting Supabase Database Connection String"
echo "=============================================="
echo ""

echo "📋 Step 1: Go to your Supabase project dashboard"
echo "   URL: https://supabase.com/dashboard/project/vxrdvkhkombwlhjvtsmw"
echo ""

echo "📋 Step 2: Navigate to Settings > Database"
echo ""

echo "📋 Step 3: Copy the 'Connection string' under 'Connection parameters'"
echo "   It should look like:"
echo "   postgresql://postgres:[YOUR-PASSWORD]@db.vxrdvkhkombwlhjvtsmw.supabase.co:5432/postgres"
echo ""

echo "📋 Step 4: Replace [YOUR-PASSWORD] with your actual database password"
echo ""

echo "📋 Step 5: Update your .env file"
echo "   Replace the current DATABASE_URL line with your connection string"
echo ""

echo "Current DATABASE_URL in .env:"
grep DATABASE_URL .env
echo ""

echo "📋 Step 6: After updating .env, run the setup again:"
echo "   ./setup-dealership-ai-v2.sh"
echo ""

echo "💡 Need help finding your password?"
echo "   - Check your Supabase project settings"
echo "   - Look for 'Database password' or 'DB password'"
echo "   - If you forgot it, you can reset it in Supabase dashboard"
echo ""

read -p "Press Enter when you've updated the .env file with the correct DATABASE_URL..."

echo ""
echo "🔍 Verifying DATABASE_URL..."
if grep -q "username:password" .env; then
    echo "❌ DATABASE_URL still contains placeholder credentials"
    echo "Please update .env with your actual Supabase connection string"
    exit 1
else
    echo "✅ DATABASE_URL appears to be updated"
    echo ""
    echo "🚀 Now you can run the setup script:"
    echo "   ./setup-dealership-ai-v2.sh"
fi
