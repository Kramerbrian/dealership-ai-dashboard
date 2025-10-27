#!/bin/bash

# DealershipAI v2.0 - Complete Dependency Setup
# Execute this script to install all required dependencies

echo "🚀 Setting up DealershipAI v2.0 dependencies..."

# Core dependencies
echo "📦 Installing core dependencies..."
npm install @supabase/supabase-js
npm install @clerk/nextjs
npm install @upstash/redis
npm install stripe

# UI dependencies
echo "🎨 Installing UI dependencies..."
npm install tailwindcss @tailwindcss/forms
npm install lucide-react
npm install recharts
npm install framer-motion

# State management
echo "🔄 Installing state management..."
npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query
npm install zustand

# Utilities
echo "🛠️ Installing utilities..."
npm install date-fns
npm install zod
npm install axios

# Development dependencies
echo "🧪 Installing dev dependencies..."
npm install -D @types/node
npm install -D @types/react
npm install -D @types/react-dom
npm install -D eslint
npm install -D prettier
npm install -D husky
npm install -D lint-staged

echo "✅ All dependencies installed successfully!"
echo "📋 Next steps:"
echo "1. Set up environment variables"
echo "2. Configure services (Supabase, Clerk, Redis, Stripe)"
echo "3. Run database migrations"
echo "4. Start development server: npm run dev"
