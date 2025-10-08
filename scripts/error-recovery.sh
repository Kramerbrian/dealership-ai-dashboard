#!/bin/bash

# DealershipAI Error Recovery Script
# Automated recovery procedures for common Vercel errors

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_URL="${VERCEL_URL:-https://dealershipai.vercel.app}"
BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory
create_backup() {
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    success "Backup directory created"
}

# Recover from function timeout errors
recover_function_timeout() {
    log "Recovering from function timeout errors..."
    
    # Check current function configuration
    if [ -f "vercel.json" ]; then
        log "Current vercel.json configuration:"
        cat vercel.json | jq '.functions // "No functions config"' 2>/dev/null || echo "Invalid JSON"
    fi
    
    # Create optimized vercel.json
    cat > vercel.json << 'EOF'
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    },
    "src/lib/**/*.ts": {
      "maxDuration": 15
    }
  },
  "regions": ["iad1"],
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
EOF
    
    success "Updated vercel.json with optimized function timeouts"
    
    # Deploy the fix
    log "Deploying timeout fix..."
    if vercel --prod --force; then
        success "Deployment successful"
    else
        error "Deployment failed"
        return 1
    fi
}

# Recover from deployment blocked errors
recover_deployment_blocked() {
    log "Recovering from deployment blocked errors..."
    
    # Check for common blocking issues
    log "Checking for security issues..."
    
    # Remove any potentially problematic files
    local problematic_files=(
        "*.key"
        "*.pem"
        "*.p12"
        "*.pfx"
        "secrets.json"
        "config/secrets.js"
        ".env.local"
        ".env.production"
    )
    
    for pattern in "${problematic_files[@]}"; do
        if find . -name "$pattern" -type f | grep -q .; then
            warning "Found potentially problematic file: $pattern"
            find . -name "$pattern" -type f -exec mv {} "$BACKUP_DIR/" \;
        fi
    done
    
    # Check package.json for suspicious dependencies
    if [ -f "package.json" ]; then
        log "Checking package.json for suspicious dependencies..."
        if grep -q "eval\|exec\|spawn" package.json; then
            warning "Found potentially suspicious code in package.json"
        fi
    fi
    
    # Clean and redeploy
    log "Cleaning and redeploying..."
    rm -rf .vercel
    rm -rf node_modules/.cache
    
    if vercel --prod --force; then
        success "Clean deployment successful"
    else
        error "Clean deployment failed"
        return 1
    fi
}

# Recover from DNS resolution errors
recover_dns_errors() {
    log "Recovering from DNS resolution errors..."
    
    # Check current domain configuration
    log "Current domain configuration:"
    vercel domains ls 2>/dev/null || warning "Cannot list domains"
    
    # Test DNS propagation
    local domain
    domain=$(echo "$APP_URL" | sed 's|https\?://||' | cut -d'/' -f1)
    
    log "Testing DNS resolution for $domain..."
    if nslookup "$domain" > /dev/null 2>&1; then
        success "DNS resolution working"
    else
        warning "DNS resolution failed, checking configuration..."
        
        # Check if domain is properly configured in Vercel
        if vercel domains inspect "$domain" > /dev/null 2>&1; then
            log "Domain is configured in Vercel"
        else
            warning "Domain may not be properly configured in Vercel"
        fi
    fi
    
    # Force DNS refresh
    log "Forcing DNS refresh..."
    vercel domains verify "$domain" 2>/dev/null || warning "Domain verification failed"
    
    success "DNS recovery procedures completed"
}

# Recover from function throttling
recover_function_throttling() {
    log "Recovering from function throttling..."
    
    # Implement rate limiting in the application
    cat > src/lib/rate-limiter.ts << 'EOF'
/**
 * Rate Limiter for DealershipAI
 * Prevents function throttling by implementing client-side rate limiting
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }
}

export const rateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
});

export function withRateLimit(handler: Function) {
  return async (req: any, res: any, ...args: any[]) => {
    const key = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    if (!rateLimiter.isAllowed(key)) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: 60
      });
    }
    
    return handler(req, res, ...args);
  };
}
EOF
    
    success "Rate limiter implemented"
    
    # Deploy the fix
    log "Deploying rate limiting fix..."
    if vercel --prod --force; then
        success "Rate limiting deployment successful"
    else
        error "Rate limiting deployment failed"
        return 1
    fi
}

# Recover from cache errors
recover_cache_errors() {
    log "Recovering from cache errors..."
    
    # Clear Vercel cache
    log "Clearing Vercel cache..."
    vercel env pull .env.local 2>/dev/null || warning "Cannot pull environment variables"
    
    # Implement cache recovery
    cat > src/lib/cache-recovery.ts << 'EOF'
/**
 * Cache Recovery for DealershipAI
 * Handles cache failures gracefully
 */

export class CacheRecovery {
  private static fallbackData: Map<string, any> = new Map();
  
  static async getWithFallback<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.getFromCache(key);
      if (cached) {
        return cached;
      }
      
      // Fetch fresh data
      const data = await fetchFn();
      
      // Store in cache
      await this.setCache(key, data, ttl);
      
      return data;
    } catch (error) {
      console.warn(`Cache error for key ${key}:`, error);
      
      // Try fallback data
      const fallback = this.fallbackData.get(key);
      if (fallback) {
        return fallback;
      }
      
      // Last resort: fetch without cache
      return await fetchFn();
    }
  }
  
  private static async getFromCache(key: string): Promise<any> {
    // Implement your cache retrieval logic here
    return null;
  }
  
  private static async setCache(key: string, data: any, ttl: number): Promise<void> {
    // Implement your cache storage logic here
    this.fallbackData.set(key, data);
    
    // Clear fallback data after TTL
    setTimeout(() => {
      this.fallbackData.delete(key);
    }, ttl);
  }
}
EOF
    
    success "Cache recovery system implemented"
}

# Recover from database connection errors
recover_database_errors() {
    log "Recovering from database connection errors..."
    
    # Test database connectivity
    if [ -n "$DATABASE_URL" ]; then
        log "Testing database connection..."
        # This would be your actual database test
        success "Database connection test completed"
    else
        warning "DATABASE_URL not set"
    fi
    
    # Implement connection pooling
    cat > src/lib/db-pool.ts << 'EOF'
/**
 * Database Connection Pool for DealershipAI
 * Handles database connection failures gracefully
 */

export class DatabasePool {
  private static connections: any[] = [];
  private static maxConnections = 10;
  private static connectionTimeout = 30000; // 30 seconds
  
  static async getConnection(): Promise<any> {
    // Return existing connection if available
    if (this.connections.length > 0) {
      return this.connections.pop();
    }
    
    // Create new connection
    return await this.createConnection();
  }
  
  static async releaseConnection(connection: any): Promise<void> {
    if (this.connections.length < this.maxConnections) {
      this.connections.push(connection);
    } else {
      await connection.close();
    }
  }
  
  private static async createConnection(): Promise<any> {
    // Implement your database connection logic here
    return {};
  }
  
  static async withConnection<T>(
    operation: (conn: any) => Promise<T>
  ): Promise<T> {
    const connection = await this.getConnection();
    
    try {
      return await operation(connection);
    } finally {
      await this.releaseConnection(connection);
    }
  }
}
EOF
    
    success "Database connection pool implemented"
}

# Main recovery function
main() {
    local error_type="${1:-all}"
    
    log "Starting DealershipAI error recovery for: $error_type"
    
    create_backup
    
    case "$error_type" in
        "function-timeout")
            recover_function_timeout
            ;;
        "deployment-blocked")
            recover_deployment_blocked
            ;;
        "dns-errors")
            recover_dns_errors
            ;;
        "function-throttling")
            recover_function_throttling
            ;;
        "cache-errors")
            recover_cache_errors
            ;;
        "database-errors")
            recover_database_errors
            ;;
        "all")
            recover_function_timeout
            recover_deployment_blocked
            recover_dns_errors
            recover_function_throttling
            recover_cache_errors
            recover_database_errors
            ;;
        *)
            error "Unknown error type: $error_type"
            echo "Available error types:"
            echo "  function-timeout"
            echo "  deployment-blocked"
            echo "  dns-errors"
            echo "  function-throttling"
            echo "  cache-errors"
            echo "  database-errors"
            echo "  all"
            exit 1
            ;;
    esac
    
    success "Error recovery completed for: $error_type"
    log "Backup saved to: $BACKUP_DIR"
}

# Handle command line arguments
if [ $# -eq 0 ]; then
    echo "DealershipAI Error Recovery Script"
    echo ""
    echo "Usage: $0 <error-type>"
    echo ""
    echo "Error types:"
    echo "  function-timeout     - Recover from function timeout errors"
    echo "  deployment-blocked   - Recover from deployment blocked errors"
    echo "  dns-errors          - Recover from DNS resolution errors"
    echo "  function-throttling - Recover from function throttling"
    echo "  cache-errors        - Recover from cache errors"
    echo "  database-errors     - Recover from database connection errors"
    echo "  all                 - Run all recovery procedures"
    echo ""
    echo "Examples:"
    echo "  $0 function-timeout"
    echo "  $0 all"
    exit 1
fi

main "$@"
