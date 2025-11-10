#!/bin/bash

echo "🚀 DealershipAI Complete Production Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from the dealership-ai root directory"
    exit 1
fi

echo "📋 Step-by-step deployment process:"
echo ""

echo "1. ✅ Repository cloned and dependencies installed"
echo "2. ✅ Global CLIs installed (Vercel & Upstash)"
echo ""

echo "3. 🔐 MANUAL STEP - Authentication required:"
echo "   Run these commands manually:"
echo "   → vercel login"
echo "   → upstash auth login --email your@email.com"
echo ""

echo "4. 🔧 Create Redis instance:"
echo "   → upstash redis create dealershipai-cache --region=global"
echo ""

echo "5. 🚀 Deploy to Vercel:"
echo "   → vercel --prod --yes"
echo ""

echo "6. ⚙️  Set environment variables in Vercel:"
echo "   → vercel env add DATABASE_URL"
echo "   → vercel env add REDIS_URL"
echo "   → vercel env add NEXTAUTH_SECRET"
echo "   → vercel env add OPENAI_API_KEY"
echo "   → vercel env add ANTHROPIC_API_KEY"
echo ""

echo "📝 Environment variables you'll need:"
echo ""

cat << 'EOF'
DATABASE_URL=postgresql://postgres:password@host:5432/postgres
REDIS_URL=redis://default:password@host:6379
NEXTAUTH_SECRET=your-32-character-secret-here
NEXTAUTH_URL=https://your-app.vercel.app
OPENAI_API_KEY=sk-your-key
ANTHROPIC_API_KEY=sk-ant-your-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

echo ""
echo "🎯 After authentication, run:"
echo "   ./scripts/complete-deployment.sh --execute"

if [ "$1" = "--execute" ]; then
    echo ""
    echo "🚀 Executing automated deployment steps..."

    # Create Redis (requires authentication first)
    echo "Creating Redis instance..."
    upstash redis create dealershipai-cache --region=global

    # Deploy to Vercel (requires authentication first)
    echo "Deploying to Vercel..."
    vercel --prod --yes

    echo "✅ Deployment complete!"
    echo "🔧 Don't forget to set your environment variables in Vercel dashboard"
fi

