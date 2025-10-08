#!/bin/bash

# DealershipAI Production Setup Script
echo "🚀 Setting up DealershipAI for production..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional required packages
echo "📦 Installing additional packages..."
npm install @supabase/supabase-js @clerk/nextjs stripe @trpc/server @trpc/client @trpc/react-query @trpc/next zod lucide-react

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp env.production.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys"
fi

# Create Supabase schema
echo "🗄️  Setting up database schema..."
echo "Please run the following SQL in your Supabase SQL editor:"
echo "---"
cat supabase-schema.sql
echo "---"

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Run the Supabase schema SQL in your database"
echo "3. Configure Clerk authentication"
echo "4. Set up Stripe webhooks"
echo "5. Deploy to Vercel: vercel --prod"
echo ""
echo "🎉 DealershipAI is ready for production!"