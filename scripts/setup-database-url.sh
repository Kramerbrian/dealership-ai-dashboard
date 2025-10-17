#!/bin/bash

# DealershipAI v2.0 - Database URL Setup Helper

echo "🔧 Setting up DATABASE_URL for AOER tables..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    touch .env.local
fi

echo ""
echo "Choose your database option:"
echo "1. Supabase (Recommended - Free)"
echo "2. Local PostgreSQL"
echo "3. Railway/Neon"
echo "4. Skip and use direct SQL file"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📋 Supabase Setup Instructions:"
        echo "1. Go to https://supabase.com"
        echo "2. Create a new project"
        echo "3. Go to Settings > Database"
        echo "4. Copy the connection string"
        echo "5. Paste it below (it should look like: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres)"
        echo ""
        read -p "Enter your Supabase DATABASE_URL: " db_url
        if [ ! -z "$db_url" ]; then
            echo "DATABASE_URL=\"$db_url\"" >> .env.local
            echo "✅ DATABASE_URL added to .env.local"
        fi
        ;;
    2)
        echo ""
        echo "📋 Local PostgreSQL Setup:"
        echo "Make sure PostgreSQL is installed and running"
        echo "Default format: postgresql://username:password@localhost:5432/database_name"
        echo ""
        read -p "Enter your local DATABASE_URL: " db_url
        if [ ! -z "$db_url" ]; then
            echo "DATABASE_URL=\"$db_url\"" >> .env.local
            echo "✅ DATABASE_URL added to .env.local"
        fi
        ;;
    3)
        echo ""
        echo "📋 Railway/Neon Setup:"
        echo "Copy your connection string from Railway or Neon dashboard"
        echo ""
        read -p "Enter your Railway/Neon DATABASE_URL: " db_url
        if [ ! -z "$db_url" ]; then
            echo "DATABASE_URL=\"$db_url\"" >> .env.local
            echo "✅ DATABASE_URL added to .env.local"
        fi
        ;;
    4)
        echo ""
        echo "📋 Using Direct SQL File:"
        echo "You can use the aoer_tables.sql file directly:"
        echo "1. Open aoer_tables.sql in this directory"
        echo "2. Copy the contents"
        echo "3. Paste into your database client (pgAdmin, DBeaver, etc.)"
        echo "4. Execute the SQL"
        echo ""
        echo "The SQL file is ready to use!"
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🚀 Now you can run:"
echo "node scripts/create-aoer-tables.js"
echo ""
echo "Or use the direct SQL file: aoer_tables.sql"
