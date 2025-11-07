#!/bin/bash
# Clean API secrets from git history
# This script rewrites git history - BACKUP FIRST!

set -e

echo "🔒 Git History Secret Cleaner"
echo "=============================="
echo ""
echo "⚠️  WARNING: This will rewrite ALL git history!"
echo "⚠️  This cannot be undone easily!"
echo ""
echo "This will replace actual API keys in git history with placeholders."
echo ""
read -p "Have you backed up your repository? (yes/no): " backup_confirm

if [ "$backup_confirm" != "yes" ]; then
    echo ""
    echo "Please backup first:"
    echo "  git clone --mirror . ../dealership-ai-backup"
    echo ""
    exit 1
fi

echo ""
echo "Creating backup branch..."
git branch backup-before-secret-cleanup-$(date +%Y%m%d-%H%M%S) || true

echo ""
echo "Rewriting history to replace API keys with placeholders..."
echo "This may take several minutes..."
echo ""

# Use git filter-branch with a simpler approach
git filter-branch --force --tree-filter '
    # Replace Anthropic keys
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/sk-ant-[A-Za-z0-9_-]\{20,\}/sk-ant-your-anthropic-api-key-here/g" {} \; 2>/dev/null || true
    
    # Replace OpenAI keys  
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/sk-[A-Za-z0-9]\{32,\}/sk-your-openai-api-key-here/g" {} \; 2>/dev/null || true
    
    # Replace Stripe keys
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/sk_live_[A-Za-z0-9_-]\{20,\}/sk_live_your-stripe-secret-key-here/g" {} \; 2>/dev/null || true
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/sk_test_[A-Za-z0-9_-]\{20,\}/sk_test_your-stripe-secret-key-here/g" {} \; 2>/dev/null || true
    
    # Replace Slack tokens
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/xoxb-[A-Za-z0-9_-]\{20,\}/xoxb-your-slack-bot-token-here/g" {} \; 2>/dev/null || true
    
    # Replace WorkOS keys
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/sk_[A-Za-z0-9_-]\{20,\}.*workos/sk_your-workos-api-key-here/g" {} \; 2>/dev/null || true
    
    # Replace xAI keys
    find . -type f \( -name "*.md" -o -name "*.txt" -o -name ".env*" -o -name "*.example" \) ! -path "./.git/*" -exec sed -i "" "s/xai-[A-Za-z0-9_-]\{20,\}/xai-your-xai-api-key-here/g" {} \; 2>/dev/null || true
' --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ History rewritten!"
echo ""
echo "⚠️  Next steps:"
echo "1. Review the changes: git log --all"
echo "2. Force push: git push --force --all"
echo ""
echo "⚠️  WARNING: Force pushing rewrites remote history!"
echo "   All team members will need to re-clone the repository."

