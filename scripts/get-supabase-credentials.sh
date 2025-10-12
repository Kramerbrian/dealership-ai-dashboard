#!/bin/bash

# Get Supabase Credentials
# This script helps you get your Supabase project URL and keys

echo "🔑 Getting Supabase Credentials"
echo "==============================="
echo ""

echo "To get your Supabase credentials:"
echo ""
echo "1. 🌐 Go to: https://supabase.com/dashboard"
echo "2. 🔐 Sign in to your account"
echo "3. 📁 Select your project (or create a new one)"
echo "4. ⚙️  Go to Settings → API"
echo "5. 📋 Copy the following values:"
echo ""

echo "📌 What you need to copy:"
echo "   • Project URL (looks like: https://your-project-id.supabase.co)"
echo "   • Service Role Key (starts with eyJ...)"
echo ""

echo "📝 Once you have them, run:"
echo "   export SUPABASE_URL='https://your-project-id.supabase.co'"
echo "   export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
echo ""

echo "🧪 Then test the connection:"
echo "   ./scripts/test-database-connection.sh"
echo ""

echo "🔧 Finally, fix the database schema:"
echo "   ./scripts/fix-database-schema.sh"
echo ""

echo "💡 Don't have a Supabase project yet?"
echo "   1. Go to https://supabase.com/dashboard"
echo "   2. Click 'New Project'"
echo "   3. Choose your organization"
echo "   4. Enter project name: 'dealership-ai-dashboard'"
echo "   5. Set a database password"
echo "   6. Choose a region close to you"
echo "   7. Click 'Create new project'"
echo "   8. Wait for setup to complete (2-3 minutes)"
echo "   9. Go to Settings → API to get your credentials"
echo ""

echo "🎯 Quick Start Options:"
echo "   [1] I have a Supabase project - show me where to find credentials"
echo "   [2] I need to create a new Supabase project"
echo "   [3] I want to use the existing setup script"
echo "   [4] I want to test with mock data first"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔍 Finding your Supabase credentials:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Click on your project name"
        echo "3. In the left sidebar, click 'Settings'"
        echo "4. Click 'API'"
        echo "5. You'll see:"
        echo "   • Project URL: https://your-project-id.supabase.co"
        echo "   • Service Role Key: eyJhbGc..."
        echo "6. Copy both values"
        echo ""
        echo "Then run:"
        echo "export SUPABASE_URL='https://your-project-id.supabase.co'"
        echo "export SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'"
        ;;
    2)
        echo ""
        echo "🆕 Creating a new Supabase project:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Click 'New Project'"
        echo "3. Choose your organization"
        echo "4. Project name: 'dealership-ai-dashboard'"
        echo "5. Database password: (choose a strong password)"
        echo "6. Region: (choose closest to you)"
        echo "7. Click 'Create new project'"
        echo "8. Wait 2-3 minutes for setup"
        echo "9. Go to Settings → API"
        echo "10. Copy Project URL and Service Role Key"
        ;;
    3)
        echo ""
        echo "🚀 Using the existing setup script:"
        echo "Run: ./setup-supabase.sh"
        echo ""
        echo "This will:"
        echo "• Ask for your Supabase URL and key"
        echo "• Set up the database schema"
        echo "• Create all necessary tables"
        echo "• Insert sample data"
        ;;
    4)
        echo ""
        echo "🧪 Testing with mock data:"
        echo "The system has built-in fallback capabilities!"
        echo ""
        echo "You can:"
        echo "• Start the app without Supabase: npm run dev"
        echo "• Upload documents (will use mock analysis)"
        echo "• View AI insights (will use mock data)"
        echo "• Test all features without external APIs"
        echo ""
        echo "To start with mock data:"
        echo "npm run dev"
        echo ""
        echo "Then go to http://localhost:3000"
        ;;
    *)
        echo "❌ Invalid option. Please choose 1-4."
        ;;
esac

echo ""
echo "🎉 Ready to proceed!"
