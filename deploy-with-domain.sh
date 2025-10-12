#!/bin/bash

# Vercel deployment script with custom domain aliasing
# Usage: ./deploy-with-domain.sh [custom-domain]

# Get custom domain from argument or use default
CUSTOM_DOMAIN=${1:-"dealershipai.com"}

echo "🚀 Starting Vercel deployment..."
echo "📝 Custom domain: $CUSTOM_DOMAIN"

# save stdout and stderr to files
vercel deploy --cwd . >deployment-url.txt 2>error.txt

# check the exit code
code=$?
if [ $code -eq 0 ]; then
    # Now you can use the deployment url from stdout for the next step of your workflow
    deploymentUrl=`cat deployment-url.txt`
    echo "✅ Deployment successful!"
    echo "🔗 Deployment URL: $deploymentUrl"
    
    echo "🌐 Setting up custom domain alias..."
    vercel alias $deploymentUrl $CUSTOM_DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ Domain alias set successfully!"
        echo "🌍 Your app is now available at: https://$CUSTOM_DOMAIN"
    else
        echo "❌ Failed to set domain alias"
    fi
else
    # Handle the error
    errorMessage=`cat error.txt`
    echo "❌ There was an error: $errorMessage"
    exit 1
fi

# Clean up temporary files
rm -f deployment-url.txt error.txt

echo "🎉 Deployment process completed!"
