#!/bin/bash

# GitHub Repository Setup Script
# Run this after creating your GitHub repository

echo "🚀 Setting up GitHub repository for DealershipAI Dashboard"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Get repository URL from user
echo "📝 Please provide your GitHub repository URL:"
echo "   Example: https://github.com/yourusername/dealership-ai-dashboard.git"
read -p "Repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Error: Repository URL is required"
    exit 1
fi

echo ""
echo "🔗 Adding remote origin..."
git remote add origin "$REPO_URL"

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to Vercel Dashboard (https://vercel.com/dashboard)"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository"
echo "4. Configure environment variables"
echo "5. Deploy!"
echo ""
echo "📋 Environment variables needed:"
echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "   - CLERK_SECRET_KEY"
echo "   - DATABASE_URL"
echo "   - NEXT_PUBLIC_APP_URL"
echo ""

