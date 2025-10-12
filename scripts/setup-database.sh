#!/bin/bash

# DealershipAI v2.0 - Database Setup Script
# This script sets up the database and runs necessary Prisma commands

echo "🚀 Setting up DealershipAI v2.0 Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from .env.example"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env file"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🗄️  Pushing database schema..."
npx prisma db push

echo "🌱 Seeding database with initial data..."
npx prisma db seed

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your Redis instance (Upstash)"
echo "2. Set up Stripe for payments"
echo "3. Configure API keys for AI services"
echo "4. Run 'npm run dev' to start the development server"
