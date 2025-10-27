#!/bin/bash

# DealershipAI Development Setup Script
echo "🚀 Setting up DealershipAI for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << EOF
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database (Optional for development)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# AI APIs (Optional for development)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Google APIs (Optional for development)
GOOGLE_MY_BUSINESS_API_KEY=...
GOOGLE_PLACES_API_KEY=...
GOOGLE_REVIEWS_API_KEY=...

# Analytics (Optional)
NEXT_PUBLIC_GA=G-...
EOF
    echo "✅ .env.local template created"
    echo "⚠️  Please update .env.local with your actual API keys"
fi

# Type check
echo "🔍 Running type check..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type check failed, but continuing..."
fi

echo "🎉 Development setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see the dashboard"
echo ""
echo "Available commands:"
echo "- npm run dev          # Start development server"
echo "- npm run build        # Build for production"
echo "- npm run type-check   # Run TypeScript checks"
echo "- npm run lint         # Run ESLint"