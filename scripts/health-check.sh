#!/bin/bash

echo "🔍 DealershipAI Production Health Check"
echo "========================================"

# Check if site is accessible
echo "🌐 Checking site accessibility..."
if curl -s -o /dev/null -w "%{http_code}" https://dealershipai.com | grep -q "200"; then
    echo "✅ Site is accessible"
else
    echo "❌ Site is not accessible"
fi

# Check API endpoints
echo "🔌 Checking API endpoints..."
endpoints=(
    "/api/health"
    "/api/dashboard/enhanced"
    "/api/qai/calculate"
    "/api/eeat/calculate"
)

for endpoint in "${endpoints[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" "https://dealershipai.com${endpoint}" | grep -q "200|401"; then
        echo "✅ ${endpoint} responding"
    else
        echo "❌ ${endpoint} not responding"
    fi
done

# Check authentication
echo "🔐 Checking authentication..."
if curl -s https://dealershipai.com/auth/signin | grep -q "Clerk"; then
    echo "✅ Authentication working"
else
    echo "❌ Authentication not working"
fi

echo "🎉 Health check complete!"
echo "💰 Ready to start collecting $499/month deals!"
