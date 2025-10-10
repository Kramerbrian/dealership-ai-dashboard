#!/bin/bash

echo "🧪 Complete OpenAI GPT Integration Test"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
    echo "🔍 Test $TOTAL_TESTS: $test_name"
    echo "Command: $test_command"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check environment variables
check_env() {
    echo ""
    echo "🔧 Environment Configuration Check"
    echo "=================================="
    
    local env_ok=true
    
    if grep -q "OPENAI_API_KEY=sk-" .env.local; then
        echo -e "${GREEN}✅ OPENAI_API_KEY configured${NC}"
    else
        echo -e "${RED}❌ OPENAI_API_KEY missing or invalid${NC}"
        env_ok=false
    fi
    
    if grep -q "OPENAI_ASSISTANT_ID=asst_" .env.local; then
        echo -e "${GREEN}✅ OPENAI_ASSISTANT_ID configured${NC}"
    else
        echo -e "${RED}❌ OPENAI_ASSISTANT_ID missing or invalid${NC}"
        env_ok=false
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL configured${NC}"
    else
        echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL missing or invalid${NC}"
        env_ok=false
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local; then
        echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configured${NC}"
    else
        echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_ANON_KEY missing or invalid${NC}"
        env_ok=false
    fi
    
    if [ "$env_ok" = true ]; then
        echo -e "${GREEN}🎉 All environment variables configured correctly!${NC}"
        return 0
    else
        echo -e "${RED}⚠️  Please fix environment configuration before running tests${NC}"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    echo ""
    echo "🌐 API Endpoints Test"
    echo "===================="
    
    # Test 1: Health endpoint
    run_test "Health Check" "curl -s http://localhost:3001/api/health | grep -q 'healthy'"
    
    # Test 2: GPT Proxy endpoint
    run_test "GPT Proxy Endpoint" "curl -s -X POST http://localhost:3001/api/gpt-proxy -H 'Content-Type: application/json' -d '{\"prompt\":\"test\"}' | grep -q 'success'"
    
    # Test 3: AIV Metrics endpoint
    run_test "AIV Metrics Endpoint" "curl -s 'http://localhost:3001/api/aiv-metrics?dealerId=demo-dealer' | grep -q 'dealerId'"
    
    # Test 4: Elasticity endpoint
    run_test "Elasticity Endpoint" "curl -s -X POST http://localhost:3001/api/elasticity/recompute -H 'Content-Type: application/json' -d '{\"dealerId\":\"demo-dealer\"}' | grep -q 'dealerId'"
}

# Function to test dashboard
test_dashboard() {
    echo ""
    echo "📊 Dashboard Test"
    echo "================"
    
    # Test 1: Dashboard loads
    run_test "Dashboard Loads" "curl -s http://localhost:3001/dashboard | grep -q 'AI Visibility Dashboard'"
    
    # Test 2: AIV Panel present
    run_test "AIV Metrics Panel Present" "curl -s http://localhost:3001/dashboard | grep -q 'AIVMetricsPanel'"
    
    # Test 3: React components loaded
    run_test "React Components Loaded" "curl -s http://localhost:3001/dashboard | grep -q 'useAIVMetrics'"
}

# Function to test database connection
test_database() {
    echo ""
    echo "🗄️  Database Test"
    echo "================"
    
    # Test if we can reach Supabase (this is a basic connectivity test)
    run_test "Supabase Connectivity" "curl -s -I https://supabase.com | grep -q '200 OK'"
}

# Main test execution
echo "Starting comprehensive integration test..."
echo "Server should be running on: http://localhost:3001"

# Check if server is running
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${RED}❌ Development server is not running${NC}"
    echo "Please start it with: npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Development server is running${NC}"

# Run all tests
check_env
if [ $? -eq 0 ]; then
    test_api_endpoints
    test_dashboard
    test_database
fi

# Final results
echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "Tests passed: $TESTS_PASSED/$TOTAL_TESTS"

if [ $TESTS_PASSED -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Integration is working perfectly!${NC}"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Visit: http://localhost:3001/dashboard"
    echo "2. Look for the 'AI Visibility Index' panel"
    echo "3. Click 'Compute Initial AIV' to generate sample data"
    echo "4. Verify real-time scores and recommendations appear"
elif [ $TESTS_PASSED -ge $((TOTAL_TESTS * 3 / 4)) ]; then
    echo -e "${YELLOW}⚠️  Most tests passed. Check failed tests above.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "1. Ensure all environment variables are set correctly"
    echo "2. Run the database migration in Supabase"
    echo "3. Create the OpenAI Assistant"
    echo "4. Restart the development server"
else
    echo -e "${RED}❌ Multiple tests failed. Please check configuration.${NC}"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Check .env.local configuration"
    echo "2. Verify Supabase database migration"
    echo "3. Ensure OpenAI Assistant is created"
    echo "4. Check browser console for errors"
fi

echo ""
echo "📖 For detailed setup instructions, see:"
echo "   - OPENAI_ASSISTANT_SETUP.md"
echo "   - ACTIVATION_CHECKLIST.md"
echo "   - OPENAI_INTEGRATION_README.md"
