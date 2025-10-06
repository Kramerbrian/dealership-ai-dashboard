"""
Dealership Analytics API Server with RBAC Middleware
===================================================

This module provides a FastAPI-based REST API server for the dealership analytics
system with comprehensive Role-Based Access Control (RBAC). The API exposes
endpoints for fetching dealership analytics data, managing users, and handling
authentication.

Features:
- JWT-based authentication
- Role-based access control (Admin, Manager, Viewer, Premium)
- Rate limiting and security headers
- Comprehensive analytics endpoints
- Swagger/OpenAPI documentation
- CORS support for frontend integration

Usage:
    python api_server.py

Or with uvicorn:
    uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import os
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Annotated
from enum import Enum
import json

from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
import uvicorn

# Import our existing analytics modules
try:
    from dealership_ai_multi_agent import (
        IntegrationAgent, PlatformAgent, AnalysisAgent, 
        CompetitorAgent, ReviewAgent
    )
    # Try to import AutoResponseAgent, create a stub if not available
    try:
        from dealership_ai_multi_agent import AutoResponseAgent
    except ImportError:
        # Create a simple AutoResponseAgent stub if not available
        class AutoResponseAgent:
            def __init__(self):
                pass
            def generate(self, business_name: str, review_data: Dict[str, Any]) -> Dict[str, Any]:
                return {"suggestions": {}, "note": "AutoResponseAgent not available"}
except ImportError:
    logger.error("Could not import dealership analytics modules. Please ensure dealership_ai_multi_agent.py is available.")
    raise

# Import RBAC middleware
from rbac_middleware import (
    Permission, RolePermissions, SecurityMiddleware, AuditLogger,
    PermissionChecker, security_middleware, audit_logger, permission_checker
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Initialize FastAPI app
app = FastAPI(
    title="Dealership Analytics API",
    description="Comprehensive dealership analytics with AI-powered insights and RBAC",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Add custom security middleware
app.middleware("http")(security_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserRole(str, Enum):
    """User role definitions for RBAC."""
    ADMIN = "admin"
    MANAGER = "manager" 
    VIEWER = "viewer"
    PREMIUM = "premium"


class User(BaseModel):
    """User model for authentication and authorization."""
    username: str
    email: str
    role: UserRole
    dealership_ids: List[str] = Field(default_factory=list)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Token(BaseModel):
    """JWT token response model."""
    access_token: str
    token_type: str
    expires_in: int
    user_info: User


class LoginRequest(BaseModel):
    """Login request model."""
    username: str
    password: str


class AnalyticsRequest(BaseModel):
    """Analytics request model."""
    business_name: str
    location: str
    dealership_id: Optional[str] = None


class AnalyticsResponse(BaseModel):
    """Analytics response model."""
    dealership: str
    location: str
    visibility_reports: List[Dict[str, Any]]
    competitor_reports: List[Dict[str, Any]]
    review_data: Dict[str, Any]
    auto_responses: Optional[Dict[str, Any]] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    requested_by: str


# Mock user database (replace with real database in production)
fake_users_db = {
    "admin": {
        "username": "admin",
        "email": "admin@dealershipai.com",
        "hashed_password": "plain:admin123",
        "role": UserRole.ADMIN,
        "dealership_ids": ["*"],  # Access to all dealerships
        "is_active": True
    },
    "manager": {
        "username": "manager",
        "email": "manager@toyotaofnaples.com", 
        "hashed_password": "plain:manager123",
        "role": UserRole.MANAGER,
        "dealership_ids": ["toyota_naples", "toyota_ftmyers"],
        "is_active": True
    },
    "viewer": {
        "username": "viewer",
        "email": "viewer@toyotaofnaples.com",
        "hashed_password": "plain:viewer123",
        "role": UserRole.VIEWER,
        "dealership_ids": ["toyota_naples"],
        "is_active": True
    },
    "premium": {
        "username": "premium",
        "email": "premium@dealershipai.com",
        "hashed_password": "plain:premium123",
        "role": UserRole.PREMIUM,
        "dealership_ids": ["*"],
        "is_active": True
    }
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against its hash."""
    # For demo purposes, use simple comparison if hash starts with "plain:"
    if hashed_password.startswith("plain:"):
        return plain_password == hashed_password[6:]
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        # Fallback to plain comparison for development
        return plain_password == hashed_password


def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user credentials."""
    user = fake_users_db.get(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> User:
    """Extract and validate current user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_dict = fake_users_db.get(username)
    if user_dict is None:
        raise credentials_exception
    
    if not user_dict.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user"
        )
    
    return User(
        username=user_dict["username"],
        email=user_dict["email"],
        role=user_dict["role"],
        dealership_ids=user_dict["dealership_ids"],
        is_active=user_dict["is_active"]
    )


class RBACMiddleware:
    """Legacy RBAC middleware - replaced by advanced rbac_middleware module."""
    pass  # Keeping for backward compatibility, functionality moved to rbac_middleware.py


# Initialize analytics components
platform_agent = PlatformAgent()
analysis_agent = AnalysisAgent()
competitor_agent = CompetitorAgent()
review_agent = ReviewAgent()
auto_response_agent = AutoResponseAgent()
integration_agent = IntegrationAgent(
    platform_agent, analysis_agent, competitor_agent, review_agent
)


@app.post("/auth/login", response_model=Token)
async def login(login_request: LoginRequest, request: Request):
    """
    Authenticate user and return JWT token.
    
    This endpoint validates user credentials and returns a JWT token
    for subsequent API requests.
    """
    client_ip = security_middleware.get_client_ip(request)
    
    user_data = authenticate_user(login_request.username, login_request.password)
    if not user_data:
        # Log failed authentication attempt
        audit_logger.log_auth_attempt(login_request.username, False, client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Log successful authentication
    audit_logger.log_auth_attempt(login_request.username, True, client_ip)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["username"]}, expires_delta=access_token_expires
    )
    
    user = User(
        username=user_data["username"],
        email=user_data["email"],
        role=user_data["role"],
        dealership_ids=user_data["dealership_ids"],
        is_active=user_data["is_active"]
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_info=user
    )


@app.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current user information.
    
    Returns the authenticated user's profile and permissions.
    """
    return current_user


@app.get("/api/analytics", response_model=AnalyticsResponse)
async def get_dealership_analytics(
    request: Request,
    business_name: str,
    location: str,
    dealership_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Fetch comprehensive dealership analytics data.
    
    This endpoint performs multi-agent analysis including:
    - AI platform visibility scores
    - Competitor analysis
    - Review sentiment analysis
    - Automated response suggestions
    - Revenue impact calculations
    
    Requires authentication and appropriate dealership access permissions.
    """
    client_ip = security_middleware.get_client_ip(request)
    
    # Check required permissions
    if not permission_checker.check_permission(
        current_user.role.value, Permission.READ_ANALYTICS, 
        "/api/analytics", current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to access analytics"
        )
    
    # Generate dealership ID if not provided
    if not dealership_id:
        dealership_id = business_name.lower().replace(" ", "_").replace("of", "").replace("  ", "_")
    
    # Check dealership access permissions with logging
    if not permission_checker.check_dealership_access_with_logging(
        current_user.role.value, current_user.dealership_ids, dealership_id,
        current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to dealership: {dealership_id}"
        )
    
    try:
        # Execute multi-agent analysis
        logger.info(f"Starting analytics for {business_name} in {location} by user {current_user.username}")
        
        report = await integration_agent.run(business_name, location)
        
        # Log successful API access
        audit_logger.log_api_access(
            current_user.username, "/api/analytics", "GET", client_ip, 200, dealership_id
        )
        
        logger.info(f"Analytics completed for {business_name} by {current_user.username}")
        
        return AnalyticsResponse(
            dealership=report["dealership"],
            location=report["location"],
            visibility_reports=report["visibility_reports"],
            competitor_reports=report["competitor_reports"],
            review_data=report["review_data"],
            auto_responses=report.get("auto_responses"),
            requested_by=current_user.username
        )
        
    except Exception as e:
        # Log failed API access
        audit_logger.log_api_access(
            current_user.username, "/api/analytics", "GET", client_ip, 500, dealership_id
        )
        logger.error(f"Analytics failed for {business_name}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics processing failed: {str(e)}"
        )


@app.get("/api/analytics/summary")
async def get_analytics_summary(
    request: Request,
    dealership_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Get analytics summary for accessible dealerships.
    
    Returns aggregated metrics and key insights for dealerships
    the authenticated user has access to.
    """
    client_ip = security_middleware.get_client_ip(request)
    
    # Check required permissions
    if not permission_checker.check_permission(
        current_user.role.value, Permission.READ_ANALYTICS_SUMMARY,
        "/api/analytics/summary", current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to access analytics summary"
        )
    
    # For demo purposes, return mock summary data
    # In production, this would query actual analytics database
    
    accessible_dealerships = []
    if current_user.role == UserRole.ADMIN or "*" in current_user.dealership_ids:
        accessible_dealerships = ["toyota_naples", "honda_ftmyers", "chevrolet_bonita"]
    else:
        accessible_dealerships = current_user.dealership_ids
    
    if dealership_id and not permission_checker.check_dealership_access_with_logging(
        current_user.role.value, current_user.dealership_ids, dealership_id,
        current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to dealership: {dealership_id}"
        )
    
    summary = {
        "total_dealerships": len(accessible_dealerships),
        "avg_visibility_score": 34.2,
        "total_revenue_at_risk": 425750,
        "critical_issues": 7,
        "high_priority_recommendations": 12,
        "dealerships": [
            {
                "id": "toyota_naples",
                "name": "Toyota of Naples",
                "location": "Naples, FL",
                "visibility_score": 34,
                "revenue_at_risk": 47250,
                "last_updated": datetime.utcnow().isoformat()
            },
            {
                "id": "honda_ftmyers", 
                "name": "Honda of Fort Myers",
                "location": "Fort Myers, FL",
                "visibility_score": 42,
                "revenue_at_risk": 38500,
                "last_updated": datetime.utcnow().isoformat()
            }
        ] if current_user.role in [UserRole.ADMIN, UserRole.PREMIUM] else accessible_dealerships[:1],
        "generated_at": datetime.utcnow().isoformat(),
        "requested_by": current_user.username
    }
    
    # Log successful API access
    audit_logger.log_api_access(
        current_user.username, "/api/analytics/summary", "GET", client_ip, 200, dealership_id
    )
    
    return summary


@app.get("/api/dealerships")
async def list_dealerships(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    List dealerships accessible to the current user.
    
    Returns a list of dealerships the authenticated user can access
    based on their role and permissions.
    """
    client_ip = security_middleware.get_client_ip(request)
    
    # Check required permissions
    if not permission_checker.check_permission(
        current_user.role.value, Permission.READ_DEALERSHIP,
        "/api/dealerships", current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to list dealerships"
        )
    
    # Mock dealership data - in production, query from database
    all_dealerships = [
        {"id": "toyota_naples", "name": "Toyota of Naples", "location": "Naples, FL", "active": True},
        {"id": "honda_ftmyers", "name": "Honda of Fort Myers", "location": "Fort Myers, FL", "active": True},
        {"id": "chevrolet_bonita", "name": "Chevrolet of Bonita Springs", "location": "Bonita Springs, FL", "active": True},
        {"id": "ford_estero", "name": "Ford of Estero", "location": "Estero, FL", "active": False},
    ]
    
    # Filter based on user permissions
    if current_user.role == UserRole.ADMIN or "*" in current_user.dealership_ids:
        accessible_dealerships = all_dealerships
    else:
        accessible_dealerships = [
            d for d in all_dealerships 
            if d["id"] in current_user.dealership_ids
        ]
    
    # Log successful API access
    audit_logger.log_api_access(
        current_user.username, "/api/dealerships", "GET", client_ip, 200
    )
    
    return {
        "dealerships": accessible_dealerships,
        "total": len(accessible_dealerships),
        "user_role": current_user.role.value
    }


@app.get("/api/analytics/export")
async def export_analytics(
    request: Request,
    business_name: str,
    location: str,
    format: str = "json",
    dealership_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Export analytics data in various formats.
    
    Supports JSON, CSV, and PDF export formats for analytics reports.
    Requires EXPORT_ANALYTICS permission.
    """
    client_ip = security_middleware.get_client_ip(request)
    
    # Check required permissions
    if not permission_checker.check_permission(
        current_user.role.value, Permission.EXPORT_ANALYTICS,
        "/api/analytics/export", current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to export analytics"
        )
    
    # Generate dealership ID if not provided
    if not dealership_id:
        dealership_id = business_name.lower().replace(" ", "_").replace("of", "").replace("  ", "_")
    
    # Check dealership access
    if not permission_checker.check_dealership_access_with_logging(
        current_user.role.value, current_user.dealership_ids, dealership_id,
        current_user.username, client_ip
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied to dealership: {dealership_id}"
        )
    
    # Validate format
    if format not in ["json", "csv", "pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid export format. Supported: json, csv, pdf"
        )
    
    try:
        # For demo, return mock export data
        export_data = {
            "export_id": f"exp_{int(datetime.utcnow().timestamp())}",
            "dealership": business_name,
            "location": location,
            "format": format,
            "generated_at": datetime.utcnow().isoformat(),
            "generated_by": current_user.username,
            "download_url": f"/api/downloads/analytics_{dealership_id}_{int(datetime.utcnow().timestamp())}.{format}",
            "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
        }
        
        # Log successful export request
        audit_logger.log_api_access(
            current_user.username, "/api/analytics/export", "GET", client_ip, 200, dealership_id
        )
        
        logger.info(f"Analytics export generated for {business_name} by {current_user.username} in {format} format")
        
        return export_data
        
    except Exception as e:
        audit_logger.log_api_access(
            current_user.username, "/api/analytics/export", "GET", client_ip, 500, dealership_id
        )
        logger.error(f"Export failed for {business_name}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export processing failed: {str(e)}"
        )


@app.get("/api/permissions")
async def get_user_permissions(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's permissions and capabilities.
    
    Returns detailed information about what the authenticated user
    is allowed to do within the system.
    """
    client_ip = security_middleware.get_client_ip(request)
    
    # Get user permissions
    user_permissions = RolePermissions.get_role_permissions(current_user.role.value)
    
    permissions_info = {
        "user": {
            "username": current_user.username,
            "role": current_user.role.value,
            "dealership_access": current_user.dealership_ids
        },
        "permissions": [perm.value for perm in user_permissions],
        "capabilities": {
            "can_read_analytics": Permission.READ_ANALYTICS in user_permissions,
            "can_export_analytics": Permission.EXPORT_ANALYTICS in user_permissions,
            "can_manage_dealerships": Permission.WRITE_DEALERSHIP in user_permissions,
            "can_manage_users": Permission.WRITE_USERS in user_permissions,
            "can_configure_ai": Permission.CONFIGURE_AI_AGENTS in user_permissions,
            "has_admin_access": current_user.role == UserRole.ADMIN,
            "has_full_dealership_access": "*" in current_user.dealership_ids
        }
    }
    
    # Log API access
    audit_logger.log_api_access(
        current_user.username, "/api/permissions", "GET", client_ip, 200
    )
    
    return permissions_info


@app.get("/api/health")
async def health_check():
    """
    API health check endpoint.
    
    Returns server status and basic system information.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }


@app.get("/")
async def root():
    """
    API root endpoint with basic information.
    """
    return {
        "message": "Dealership Analytics API with RBAC",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/api/health"
    }


if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )