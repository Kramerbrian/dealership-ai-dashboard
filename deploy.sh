#!/bin/bash

# DealershipAI Deployment Script
echo "🚀 Deploying DealershipAI Landing Page..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Create a temporary directory structure that matches Vercel's expected path
    echo "📁 Creating deployment structure..."
    mkdir -p temp-deploy/apps/web
    
    # Copy all necessary files to the expected location
    cp -r .next temp-deploy/apps/web/
    cp -r app temp-deploy/apps/web/
    cp -r components temp-deploy/apps/web/
    cp -r lib temp-deploy/apps/web/
    cp -r types temp-deploy/apps/web/
    cp -r public temp-deploy/apps/web/
    cp -r prisma temp-deploy/apps/web/
    cp package.json temp-deploy/apps/web/
    cp next.config.js temp-deploy/apps/web/
    cp tailwind.config.js temp-deploy/apps/web/
    cp tsconfig.json temp-deploy/apps/web/
    cp postcss.config.js temp-deploy/apps/web/
    cp vercel.json temp-deploy/apps/web/
    
    # Change to the deployment directory
    cd temp-deploy
    
    # Deploy from the correct directory
    echo "🚀 Deploying to Vercel..."
    vercel --prod --yes
    
    # Clean up
    cd ..
    rm -rf temp-deploy
    
    echo "✅ Deployment complete!"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi
