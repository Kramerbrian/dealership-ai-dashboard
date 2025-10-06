"""
RBAC Configuration and Advanced Middleware
=========================================

This module provides advanced Role-Based Access Control configurations,
permission definitions, and security middleware for the dealership analytics API.
"""

from __future__ import annotations

import time
from datetime import datetime, timedelta
from typing import Dict, List, Set, Optional, Callable
from enum import Enum
from collections import defaultdict
import logging

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import asyncio

logger = logging.getLogger(__name__)


class Permission(str, Enum):
    """Fine-grained permissions for RBAC."""
    
    # Analytics permissions
    READ_ANALYTICS = "analytics:read"
    READ_ANALYTICS_SUMMARY = "analytics:read_summary"
    READ_ANALYTICS_DETAILED = "analytics:read_detailed"
    EXPORT_ANALYTICS = "analytics:export"
    
    # Dealership management permissions
    READ_DEALERSHIP = "dealership:read"
    WRITE_DEALERSHIP = "dealership:write"
    DELETE_DEALERSHIP = "dealership:delete"
    
    # User management permissions
    READ_USERS = "users:read"
    WRITE_USERS = "users:write"
    DELETE_USERS = "users:delete"
    
    # System permissions
    READ_SYSTEM_HEALTH = "system:read_health"
    WRITE_SYSTEM_CONFIG = "system:write_config"
    
    # AI Agent permissions
    EXECUTE_AI_ANALYSIS = "ai:execute_analysis"
    CONFIGURE_AI_AGENTS = "ai:configure_agents"
    READ_AI_LOGS = "ai:read_logs"


class RolePermissions:
    """Role-based permission mapping."""
    
    ROLE_PERMISSIONS: Dict[str, Set[Permission]] = {
        "admin": {
            Permission.READ_ANALYTICS,
            Permission.READ_ANALYTICS_SUMMARY,
            Permission.READ_ANALYTICS_DETAILED,
            Permission.EXPORT_ANALYTICS,
            Permission.READ_DEALERSHIP,
            Permission.WRITE_DEALERSHIP,
            Permission.DELETE_DEALERSHIP,
            Permission.READ_USERS,
            Permission.WRITE_USERS,
            Permission.DELETE_USERS,
            Permission.READ_SYSTEM_HEALTH,
            Permission.WRITE_SYSTEM_CONFIG,
            Permission.EXECUTE_AI_ANALYSIS,
            Permission.CONFIGURE_AI_AGENTS,
            Permission.READ_AI_LOGS,
        },
        "manager": {
            Permission.READ_ANALYTICS,
            Permission.READ_ANALYTICS_SUMMARY,
            Permission.READ_ANALYTICS_DETAILED,
            Permission.EXPORT_ANALYTICS,
            Permission.READ_DEALERSHIP,
            Permission.WRITE_DEALERSHIP,
            Permission.READ_SYSTEM_HEALTH,
            Permission.EXECUTE_AI_ANALYSIS,
        },
        "viewer": {
            Permission.READ_ANALYTICS,
            Permission.READ_ANALYTICS_SUMMARY,
            Permission.READ_DEALERSHIP,
            Permission.READ_SYSTEM_HEALTH,
        },
        "premium": {
            Permission.READ_ANALYTICS,
            Permission.READ_ANALYTICS_SUMMARY,
            Permission.READ_ANALYTICS_DETAILED,
            Permission.EXPORT_ANALYTICS,
            Permission.READ_DEALERSHIP,
            Permission.READ_SYSTEM_HEALTH,
            Permission.EXECUTE_AI_ANALYSIS,
            Permission.READ_AI_LOGS,
        }
    }
    
    @classmethod
    def has_permission(cls, role: str, permission: Permission) -> bool:
        """Check if a role has a specific permission."""
        return permission in cls.ROLE_PERMISSIONS.get(role, set())
    
    @classmethod
    def get_role_permissions(cls, role: str) -> Set[Permission]:
        """Get all permissions for a role."""
        return cls.ROLE_PERMISSIONS.get(role, set())


class RateLimiter:
    """In-memory rate limiter for API endpoints."""
    
    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.limits = {
            "default": (100, 3600),  # 100 requests per hour
            "analytics": (50, 3600),  # 50 analytics requests per hour
            "auth": (10, 600),       # 10 auth attempts per 10 minutes
        }
    
    def is_allowed(self, key: str, limit_type: str = "default") -> bool:
        """Check if a request is allowed based on rate limits."""
        now = time.time()
        limit, window = self.limits.get(limit_type, self.limits["default"])
        
        # Clean old requests
        self.requests[key] = [req_time for req_time in self.requests[key] 
                              if now - req_time < window]
        
        # Check if limit exceeded
        if len(self.requests[key]) >= limit:
            return False
        
        # Record this request
        self.requests[key].append(now)
        return True
    
    def get_reset_time(self, key: str, limit_type: str = "default") -> Optional[float]:
        """Get the time when rate limit resets for a key."""
        if key not in self.requests or not self.requests[key]:
            return None
        
        _, window = self.limits.get(limit_type, self.limits["default"])
        oldest_request = min(self.requests[key])
        return oldest_request + window


class SecurityMiddleware:
    """Advanced security middleware for the API."""
    
    def __init__(self):
        self.rate_limiter = RateLimiter()
        self.suspicious_ips: Set[str] = set()
        self.failed_attempts: Dict[str, int] = defaultdict(int)
    
    async def __call__(self, request: Request, call_next: Callable):
        """Process request through security middleware."""
        start_time = time.time()
        
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Check if IP is blocked
        if client_ip in self.suspicious_ips:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "IP blocked due to suspicious activity"}
            )
        
        # Apply rate limiting
        limit_type = self.get_rate_limit_type(request.url.path)
        rate_limit_key = f"{client_ip}:{limit_type}"
        
        if not self.rate_limiter.is_allowed(rate_limit_key, limit_type):
            reset_time = self.rate_limiter.get_reset_time(rate_limit_key, limit_type)
            headers = {
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(reset_time)) if reset_time else ""
            }
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Rate limit exceeded"},
                headers=headers
            )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Add security headers
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            
            # Add processing time header
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Request processing error for {client_ip}: {str(e)}")
            # Track failed requests
            self.failed_attempts[client_ip] += 1
            
            # Block IP if too many failures
            if self.failed_attempts[client_ip] > 10:
                self.suspicious_ips.add(client_ip)
                logger.warning(f"Blocked suspicious IP: {client_ip}")
            
            raise
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        # Check for forwarded headers first (for proxy/load balancer setups)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fall back to client host
        return request.client.host if request.client else "unknown"
    
    def get_rate_limit_type(self, path: str) -> str:
        """Determine rate limit type based on request path."""
        if path.startswith("/auth"):
            return "auth"
        elif path.startswith("/api/analytics"):
            return "analytics"
        else:
            return "default"


class AuditLogger:
    """Audit logging for security and compliance."""
    
    def __init__(self):
        self.audit_log = logging.getLogger("audit")
        self.audit_log.setLevel(logging.INFO)
        
        # Create audit log handler if not exists
        if not self.audit_log.handlers:
            handler = logging.FileHandler("audit.log")
            formatter = logging.Formatter(
                '%(asctime)s - AUDIT - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.audit_log.addHandler(handler)
    
    def log_auth_attempt(self, username: str, success: bool, ip: str):
        """Log authentication attempt."""
        status = "SUCCESS" if success else "FAILED"
        self.audit_log.info(f"AUTH_{status} - User: {username}, IP: {ip}")
    
    def log_api_access(self, username: str, endpoint: str, method: str, ip: str, 
                      status_code: int, dealership_id: Optional[str] = None):
        """Log API access."""
        dealership_info = f", Dealership: {dealership_id}" if dealership_id else ""
        self.audit_log.info(
            f"API_ACCESS - User: {username}, Endpoint: {method} {endpoint}, "
            f"Status: {status_code}, IP: {ip}{dealership_info}"
        )
    
    def log_permission_denied(self, username: str, endpoint: str, required_permission: str, ip: str):
        """Log permission denied events."""
        self.audit_log.warning(
            f"PERMISSION_DENIED - User: {username}, Endpoint: {endpoint}, "
            f"Required: {required_permission}, IP: {ip}"
        )
    
    def log_suspicious_activity(self, ip: str, activity: str, details: str):
        """Log suspicious activity."""
        self.audit_log.warning(f"SUSPICIOUS_ACTIVITY - IP: {ip}, Activity: {activity}, Details: {details}")


class PermissionChecker:
    """Advanced permission checking utilities."""
    
    def __init__(self):
        self.audit_logger = AuditLogger()
    
    def check_permission(self, user_role: str, required_permission: Permission, 
                        endpoint: str, username: str, ip: str) -> bool:
        """Check if user has required permission and log the attempt."""
        has_perm = RolePermissions.has_permission(user_role, required_permission)
        
        if not has_perm:
            self.audit_logger.log_permission_denied(
                username, endpoint, required_permission.value, ip
            )
        
        return has_perm
    
    def check_dealership_access_with_logging(self, user_role: str, user_dealerships: List[str],
                                           dealership_id: str, username: str, ip: str) -> bool:
        """Check dealership access with audit logging."""
        # Admin and users with wildcard access
        if user_role == "admin" or "*" in user_dealerships:
            return True
        
        # Check specific dealership access
        has_access = dealership_id in user_dealerships
        
        if not has_access:
            self.audit_logger.log_permission_denied(
                username, f"dealership:{dealership_id}", "dealership:access", ip
            )
        
        return has_access


# Global instances
security_middleware = SecurityMiddleware()
audit_logger = AuditLogger()
permission_checker = PermissionChecker()