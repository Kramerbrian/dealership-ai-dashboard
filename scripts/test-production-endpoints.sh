#!/bin/bash

echo "🧪 DealershipAI Production Endpoint Testing"
echo "=========================================="

# Get the latest deployment URL
DEPLOYMENT_URL=$(npx vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "https://dealership-ai-dashboard-nine.vercel.app")

echo "📍 Testing deployment: $DEPLOYMENT_URL"
echo ""

# Test endpoints
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo "🔍 Testing $description..."
    echo "   URL: $DEPLOYMENT_URL$endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo "   ✅ Status: $response (Expected: $expected_status)"
    else
        echo "   ❌ Status: $response (Expected: $expected_status)"
    fi
    echo ""
}

# Core API endpoints
test_endpoint "/api/health" "Health Check"
test_endpoint "/api/dashboard/overview" "Dashboard Overview API"
test_endpoint "/api/qai/calculate" "QAI Calculation API"
test_endpoint "/api/ai/advanced-analysis" "Advanced AI Analysis API"
test_endpoint "/api/ai/predictive-analytics" "Predictive Analytics API"
test_endpoint "/api/ai/real-time-monitoring" "Real-time Monitoring API"

# Action endpoints
test_endpoint "/api/actions/generate-schema" "Schema Generation API"
test_endpoint "/api/actions/draft-reviews" "Review Drafting API"

# AEO endpoints
test_endpoint "/api/aeo/breakdown" "AEO Breakdown API"

# Pages
test_endpoint "/" "Landing Page"
test_endpoint "/dashboard" "Dashboard Page"
test_endpoint "/landing" "Landing Page"

echo "🎯 Testing Summary"
echo "================="
echo "✅ All endpoints tested"
echo "📊 Check individual results above"
echo ""
echo "🔗 Production URL: $DEPLOYMENT_URL"
echo "📋 Next steps:"
echo "   1. Disable Vercel authentication"
echo "   2. Set up custom domain"
echo "   3. Configure monitoring"
echo "   4. Run database migrations"
