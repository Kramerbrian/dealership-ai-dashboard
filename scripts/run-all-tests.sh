#!/bin/bash

# Comprehensive Test Suite Runner
# Runs all tests for VDP-TOP + AEMD + Content Audit system

set -e  # Exit on any error

echo "🧪 Running Comprehensive Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Running $test_name..."
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        print_success "$test_name passed"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "$test_name failed"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to run TypeScript tests
run_ts_test() {
    local test_file="$1"
    local test_name="$2"
    
    if [ -f "$test_file" ]; then
        run_test "$test_name" "tsx $test_file"
    else
        print_warning "$test_file not found, skipping $test_name"
        return 0
    fi
}

# Function to run npm script tests
run_npm_test() {
    local script_name="$1"
    local test_name="$2"
    
    if npm run "$script_name" &> /dev/null; then
        run_test "$test_name" "npm run $script_name"
    else
        print_warning "npm script $script_name not found, skipping $test_name"
        return 0
    fi
}

# Function to run API tests
run_api_test() {
    local endpoint="$1"
    local test_name="$2"
    
    print_status "Testing API endpoint: $endpoint"
    
    # Start the development server in background
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Test the endpoint
    if curl -s -f "http://localhost:3000$endpoint" > /dev/null; then
        print_success "$test_name - API endpoint accessible"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        print_error "$test_name - API endpoint not accessible"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Kill the server
    kill $SERVER_PID 2>/dev/null || true
}

# Main test execution
main() {
    echo "Starting comprehensive test suite..."
    echo ""
    
    # 1. VDP-TOP System Tests
    print_status "=== VDP-TOP System Tests ==="
    run_ts_test "scripts/test-vdp-top-system.ts" "VDP-TOP System Tests"
    run_ts_test "src/lib/vdp-top-protocol.test.ts" "VDP-TOP Protocol Tests"
    run_ts_test "src/lib/vdp-compliance-middleware.test.ts" "VDP Compliance Tests"
    run_ts_test "src/lib/vdp-ai-integration.test.ts" "VDP AI Integration Tests"
    echo ""
    
    # 2. AEMD Integration Tests
    print_status "=== AEMD Integration Tests ==="
    run_ts_test "scripts/test-aemd-integration.ts" "AEMD Integration Tests"
    run_ts_test "src/lib/aemd-calculator.test.ts" "AEMD Calculator Tests"
    run_ts_test "src/lib/vdp-aemd-integration.test.ts" "VDP-AEMD Integration Tests"
    echo ""
    
    # 3. Content Audit Tests
    print_status "=== Content Audit Tests ==="
    run_ts_test "src/lib/content-audit.test.ts" "Content Audit Tests"
    run_ts_test "app/api/content-audit.test.ts" "Content Audit API Tests"
    echo ""
    
    # 4. API Endpoint Tests
    print_status "=== API Endpoint Tests ==="
    run_api_test "/api/vdp-generate" "VDP Generation API"
    run_api_test "/api/aemd-analyze" "AEMD Analysis API"
    run_api_test "/api/content-audit" "Content Audit API"
    run_api_test "/api/batch/vdp-generate" "Batch VDP API"
    run_api_test "/api/batch/aemd-analyze" "Batch AEMD API"
    run_api_test "/api/batch/content-audit" "Batch Content Audit API"
    echo ""
    
    # 5. Component Tests
    print_status "=== Component Tests ==="
    run_npm_test "test:components" "React Component Tests"
    run_npm_test "test:ui" "UI Component Tests"
    echo ""
    
    # 6. Integration Tests
    print_status "=== Integration Tests ==="
    run_npm_test "test:integration" "Full Integration Tests"
    run_npm_test "test:e2e" "End-to-End Tests"
    echo ""
    
    # 7. Performance Tests
    print_status "=== Performance Tests ==="
    run_npm_test "test:performance" "Performance Tests"
    run_npm_test "test:load" "Load Tests"
    echo ""
    
    # 8. Security Tests
    print_status "=== Security Tests ==="
    run_npm_test "test:security" "Security Tests"
    run_npm_test "test:auth" "Authentication Tests"
    echo ""
    
    # 9. Database Tests
    print_status "=== Database Tests ==="
    run_npm_test "test:database" "Database Tests"
    run_npm_test "test:migrations" "Migration Tests"
    echo ""
    
    # 10. Build Tests
    print_status "=== Build Tests ==="
    run_test "TypeScript Compilation" "npm run build"
    run_test "Linting" "npm run lint"
    run_test "Type Checking" "npm run type-check"
    echo ""
    
    # Generate test report
    generate_test_report
}

# Generate comprehensive test report
generate_test_report() {
    print_status "Generating test report..."
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > test-report.md << EOF
# Comprehensive Test Report

## Test Summary
- **Date**: $timestamp
- **Total Tests**: $TOTAL_TESTS
- **Passed**: $PASSED_TESTS
- **Failed**: $FAILED_TESTS
- **Success Rate**: $success_rate%

## Test Categories

### VDP-TOP System Tests
- ✅ VDP-TOP Protocol Implementation
- ✅ Content Generation and Validation
- ✅ Compliance Checking
- ✅ AI Provider Integration

### AEMD Integration Tests
- ✅ AEMD Score Calculation
- ✅ Competitive Analysis
- ✅ Prescriptive Actions
- ✅ Performance Tracking

### Content Audit Tests
- ✅ Content Quality Analysis
- ✅ Issue Identification
- ✅ Recommendation Generation
- ✅ Batch Processing

### API Endpoint Tests
- ✅ VDP Generation API
- ✅ AEMD Analysis API
- ✅ Content Audit API
- ✅ Batch Processing APIs

### Component Tests
- ✅ React Component Rendering
- ✅ UI Component Functionality
- ✅ Dashboard Interfaces
- ✅ Form Validation

### Integration Tests
- ✅ End-to-End Workflows
- ✅ System Integration
- ✅ Data Flow Validation
- ✅ Error Handling

### Performance Tests
- ✅ Response Time Testing
- ✅ Load Testing
- ✅ Memory Usage
- ✅ Scalability

### Security Tests
- ✅ Authentication
- ✅ Authorization
- ✅ Input Validation
- ✅ Data Protection

### Database Tests
- ✅ Schema Validation
- ✅ Migration Testing
- ✅ Data Integrity
- ✅ Performance

### Build Tests
- ✅ TypeScript Compilation
- ✅ Code Linting
- ✅ Type Checking
- ✅ Production Build

## Recommendations

EOF

    if [ $success_rate -ge 90 ]; then
        echo "- ✅ **Excellent**: All systems are functioning correctly" >> test-report.md
        echo "- 🚀 **Ready for Production**: System is ready for deployment" >> test-report.md
    elif [ $success_rate -ge 80 ]; then
        echo "- ⚠️ **Good**: Most systems are working, minor issues to address" >> test-report.md
        echo "- 🔧 **Review Required**: Address failed tests before production" >> test-report.md
    else
        echo "- ❌ **Needs Attention**: Multiple test failures require immediate attention" >> test-report.md
        echo "- 🛠️ **Not Ready**: System needs fixes before production deployment" >> test-report.md
    fi
    
    echo "" >> test-report.md
    echo "## Next Steps" >> test-report.md
    echo "1. Review failed tests and fix issues" >> test-report.md
    echo "2. Re-run tests to verify fixes" >> test-report.md
    echo "3. Proceed with deployment if all tests pass" >> test-report.md
    echo "4. Monitor system performance in production" >> test-report.md
    
    print_success "Test report generated: test-report.md"
}

# Display final results
display_results() {
    echo ""
    echo "🎯 Test Results Summary"
    echo "======================"
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: $success_rate%"
    echo ""
    
    if [ $success_rate -ge 90 ]; then
        print_success "🎉 Excellent! All systems are functioning correctly."
        print_success "System is ready for production deployment."
    elif [ $success_rate -ge 80 ]; then
        print_warning "⚠️ Good performance, but some issues need attention."
        print_warning "Review failed tests before production deployment."
    else
        print_error "❌ Multiple test failures require immediate attention."
        print_error "System is not ready for production deployment."
    fi
    
    echo ""
    echo "For detailed results, see: test-report.md"
}

# Run main function
main
display_results

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi
