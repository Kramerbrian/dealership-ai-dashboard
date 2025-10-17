#!/bin/bash

# DealershipAI Quick Setup Script
# Run this after copying the 15 files

echo "🚀 Setting up DealershipAI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please copy env.example to .env.local and fill in your values."
    echo "   cp env.example .env.local"
    echo "   Then edit .env.local with your database and API keys."
    exit 1
fi

echo "✅ .env.local found"

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Setting up database..."
npx prisma db push

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your database is running"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "Happy coding! 🚀"
