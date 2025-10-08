#!/bin/bash

# DealershipAI Vercel Troubleshooting Script
# Automated diagnostic and repair tools for common Vercel issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL="${VERCEL_URL:-https://dealershipai.vercel.app}"
API_BASE="${API_BASE:-$APP_URL/api}"
LOG_FILE="troubleshoot-$(date +%Y%m%d-%H%M%S).log"

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    fi
    
    if ! command -v vercel &> /dev/null; then
        missing_deps+=("vercel-cli")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        error "Missing dependencies: ${missing_deps[*]}"
        echo "Please install missing dependencies:"
        for dep in "${missing_deps[@]}"; do
            case $dep in
                "curl")
                    echo "  - curl: https://curl.se/download.html"
                    ;;
                "jq")
                    echo "  - jq: https://stedolan.github.io/jq/download/"
                    ;;
                "vercel-cli")
                    echo "  - vercel-cli: npm install -g vercel"
                    ;;
            esac
        done
        exit 1
    fi
    
    success "All dependencies are installed"
}

# Test basic connectivity
test_connectivity() {
    log "Testing basic connectivity..."
    
    # Test DNS resolution
    if ! nslookup $(echo "$APP_URL" | sed 's|https\?://||' | cut -d'/' -f1) > /dev/null 2>&1; then
        error "DNS resolution failed for $APP_URL"
        return 1
    fi
    success "DNS resolution successful"
    
    # Test HTTP connectivity
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" || echo "000")
    
    if [ "$http_code" = "000" ]; then
        error "Cannot connect to $APP_URL"
        return 1
    elif [ "$http_code" -ge 500 ]; then
        warning "Server error: HTTP $http_code"
    elif [ "$http_code" -ge 400 ]; then
        warning "Client error: HTTP $http_code"
    else
        success "HTTP connectivity successful: $http_code"
    fi
    
    return 0
}

# Test API endpoints
test_api_endpoints() {
    log "Testing API endpoints..."
    
    local endpoints=(
        "/health"
        "/diagnostics?action=full-report"
        "/monitoring?action=health"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        local url="$API_BASE$endpoint"
        local http_code
        local response
        
        log "Testing $endpoint..."
        
        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
        response=$(curl -s "$url" 2>/dev/null || echo "")
        
        if [ "$http_code" = "000" ]; then
            error "Failed to connect to $endpoint"
            failed_endpoints+=("$endpoint")
        elif [ "$http_code" -ge 500 ]; then
            error "Server error on $endpoint: HTTP $http_code"
            failed_endpoints+=("$endpoint")
        elif [ "$http_code" -ge 400 ]; then
            warning "Client error on $endpoint: HTTP $http_code"
        else
            success "API endpoint $endpoint working: HTTP $http_code"
            
            # Try to parse JSON response
            if echo "$response" | jq . > /dev/null 2>&1; then
                log "Response is valid JSON"
            else
                warning "Response is not valid JSON"
            fi
        fi
    done
    
    if [ ${#failed_endpoints[@]} -ne 0 ]; then
        error "Failed endpoints: ${failed_endpoints[*]}"
        return 1
    fi
    
    return 0
}

# Check Vercel deployment status
check_vercel_deployment() {
    log "Checking Vercel deployment status..."
    
    if ! vercel whoami > /dev/null 2>&1; then
        warning "Not logged into Vercel CLI"
        return 1
    fi
    
    local deployments
    deployments=$(vercel ls --json 2>/dev/null || echo "[]")
    
    if [ "$deployments" = "[]" ]; then
        warning "No deployments found"
        return 1
    fi
    
    local latest_deployment
    latest_deployment=$(echo "$deployments" | jq -r '.[0] | select(.state) | .state' 2>/dev/null || echo "unknown")
    
    case "$latest_deployment" in
        "READY")
            success "Latest deployment is ready"
            ;;
        "BUILDING")
            warning "Deployment is currently building"
            ;;
        "ERROR")
            error "Latest deployment has errors"
            ;;
        "CANCELED")
            warning "Latest deployment was canceled"
            ;;
        *)
            warning "Unknown deployment state: $latest_deployment"
            ;;
    esac
    
    return 0
}

# Check environment variables
check_environment() {
    log "Checking environment variables..."
    
    local required_vars=(
        "DATABASE_URL"
        "CLERK_SECRET_KEY"
        "CLERK_PUBLISHABLE_KEY"
        "NEXT_PUBLIC_APP_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Missing environment variables: ${missing_vars[*]}"
        echo "Please set the following environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  export $var=\"your_value_here\""
        done
        return 1
    fi
    
    success "All required environment variables are set"
    return 0
}

# Test database connectivity
test_database() {
    log "Testing database connectivity..."
    
    if [ -z "$DATABASE_URL" ]; then
        warning "DATABASE_URL not set, skipping database test"
        return 0
    fi
    
    # This would be your actual database test
    # For now, we'll just check if the URL is properly formatted
    if [[ "$DATABASE_URL" =~ ^postgresql:// ]]; then
        success "Database URL format is correct"
    else
        warning "Database URL format may be incorrect"
    fi
    
    return 0
}

# Check function logs
check_function_logs() {
    log "Checking function logs..."
    
    if ! vercel logs --json > /dev/null 2>&1; then
        warning "Cannot access Vercel logs"
        return 1
    fi
    
    local recent_logs
    recent_logs=$(vercel logs --json 2>/dev/null | jq -r '.[] | select(.level == "error") | .message' | head -10)
    
    if [ -n "$recent_logs" ]; then
        warning "Recent error logs found:"
        echo "$recent_logs" | while read -r log; do
            echo "  - $log"
        done
    else
        success "No recent error logs found"
    fi
    
    return 0
}

# Generate diagnostic report
generate_report() {
    log "Generating diagnostic report..."
    
    local report_file="diagnostic-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "app_url": "$APP_URL",
  "environment": {
    "node_version": "$(node --version 2>/dev/null || echo 'unknown')",
    "npm_version": "$(npm --version 2>/dev/null || echo 'unknown')",
    "vercel_cli_version": "$(vercel --version 2>/dev/null || echo 'unknown')"
  },
  "connectivity": {
    "dns_resolution": "$(nslookup $(echo "$APP_URL" | sed 's|https\?://||' | cut -d'/' -f1) > /dev/null 2>&1 && echo 'success' || echo 'failed')",
    "http_status": "$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" 2>/dev/null || echo '000')"
  },
  "api_endpoints": {
    "health": "$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health" 2>/dev/null || echo '000')",
    "diagnostics": "$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/diagnostics?action=full-report" 2>/dev/null || echo '000')",
    "monitoring": "$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/monitoring?action=health" 2>/dev/null || echo '000')"
  },
  "environment_variables": {
    "DATABASE_URL": "$([ -n "$DATABASE_URL" ] && echo 'set' || echo 'missing')",
    "CLERK_SECRET_KEY": "$([ -n "$CLERK_SECRET_KEY" ] && echo 'set' || echo 'missing')",
    "CLERK_PUBLISHABLE_KEY": "$([ -n "$CLERK_PUBLISHABLE_KEY" ] && echo 'set' || echo 'missing')",
    "NEXT_PUBLIC_APP_URL": "$([ -n "$NEXT_PUBLIC_APP_URL" ] && echo 'set' || echo 'missing')"
  }
}
EOF
    
    success "Diagnostic report saved to $report_file"
    return 0
}

# Main troubleshooting function
main() {
    log "Starting DealershipAI Vercel troubleshooting..."
    log "Log file: $LOG_FILE"
    
    local exit_code=0
    
    # Run all checks
    check_dependencies || exit_code=1
    test_connectivity || exit_code=1
    test_api_endpoints || exit_code=1
    check_vercel_deployment || exit_code=1
    check_environment || exit_code=1
    test_database || exit_code=1
    check_function_logs || exit_code=1
    generate_report || exit_code=1
    
    if [ $exit_code -eq 0 ]; then
        success "All checks passed! Your DealershipAI deployment appears to be healthy."
    else
        error "Some checks failed. Please review the output above and the log file: $LOG_FILE"
    fi
    
    log "Troubleshooting complete. Exit code: $exit_code"
    exit $exit_code
}

# Handle command line arguments
case "${1:-}" in
    "connectivity")
        test_connectivity
        ;;
    "api")
        test_api_endpoints
        ;;
    "deployment")
        check_vercel_deployment
        ;;
    "environment")
        check_environment
        ;;
    "database")
        test_database
        ;;
    "logs")
        check_function_logs
        ;;
    "report")
        generate_report
        ;;
    "help"|"-h"|"--help")
        echo "DealershipAI Vercel Troubleshooting Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  connectivity  - Test basic connectivity"
        echo "  api          - Test API endpoints"
        echo "  deployment   - Check Vercel deployment status"
        echo "  environment  - Check environment variables"
        echo "  database     - Test database connectivity"
        echo "  logs         - Check function logs"
        echo "  report       - Generate diagnostic report"
        echo "  help         - Show this help message"
        echo ""
        echo "If no command is specified, all checks will be run."
        ;;
    "")
        main
        ;;
    *)
        error "Unknown command: $1"
        echo "Run '$0 help' for usage information."
        exit 1
        ;;
esac
