#!/bin/bash

echo "🚀 Deploying DealershipAI Dashboard to dash.dealershipai.com"

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to Vercel Dashboard: https://vercel.com/brian-kramers-projects/dealershipai-dashboard"
    echo "2. Add custom domain: dash.dealershipai.com"
    echo "3. Configure DNS: CNAME dash -> cname.vercel-dns.com"
    echo ""
    echo "📊 Dashboard will be available at:"
    echo "- Vercel URL: https://dealershipai-dashboard-[hash].vercel.app/dash"
    echo "- Custom Domain: https://dash.dealershipai.com (after DNS setup)"
else
    echo "❌ Deployment failed"
    exit 1
fi
