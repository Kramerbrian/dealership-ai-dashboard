#!/bin/bash

# DealershipAI Quick Start Script
# This script sets up the development environment

set -e

echo "🚀 DealershipAI Quick Start Setup"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys before continuing"
    echo "   At minimum, set DATABASE_URL and NEXTAUTH_SECRET"
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start database services
echo "🐘 Starting database services..."
docker-compose up postgres redis -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client and setup database
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

# Create initial data (optional)
echo "🌱 Creating initial data..."
# Add any seed data scripts here

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development servers:"
echo "   Frontend: npm run dev (port 3000)"
echo "   Backend:  cd backend && python -m uvicorn app.api:app --reload --port 8000"
echo ""
echo "🌐 Open http://localhost:3000 to view the application"
echo ""
echo "📚 See README.md for detailed documentation"