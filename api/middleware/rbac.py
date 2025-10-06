"""
RBAC Middleware for Dealership Analytics API
============================================

This module implements Role-Based Access Control (RBAC) middleware for
the dealership analytics API. It defines roles, permissions, and
decorators to protect API endpoints based on user roles.

Supported Roles:
- admin: Full access to all dealership data and analytics
- manager: Access to assigned dealership data and analytics
- viewer: Read-only access to assigned dealership data
- analyst: Access to analytics data across multiple dealerships

Permissions:
- read:analytics: View analytics data
- write:analytics: Modify analytics configurations
- read:dealership: View dealership information
- write:dealership: Modify dealership information
- admin:all: Full administrative access
"""

from __future__ import annotations

import os
import logging
from typing import List, Optional, Callable, Dict, Any
from functools import wraps
from datetime import datetime, timedelta
from enum import Enum

from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()


class Role(str, Enum):
    """Enumeration of user roles in the system."""
    ADMIN = "admin"
    MANAGER = "manager"
    VIEWER = "viewer"
    ANALYST = "analyst"


class Permission(str, Enum):
    """Enumeration of permissions in the system."""
    READ_ANALYTICS = "read:analytics"
    WRITE_ANALYTICS = "write:analytics"
    READ_DEALERSHIP = "read:dealership"
    WRITE_DEALERSHIP = "write:dealership"
    ADMIN_ALL = "admin:all"


# Role to permissions mapping
ROLE_PERMISSIONS: Dict[Role, List[Permission]] = {
    Role.ADMIN: [
        Permission.ADMIN_ALL,
        Permission.READ_ANALYTICS,
        Permission.WRITE_ANALYTICS,
        Permission.READ_DEALERSHIP,
        Permission.WRITE_DEALERSHIP,
    ],
    Role.MANAGER: [
        Permission.READ_ANALYTICS,
        Permission.READ_DEALERSHIP,
        Permission.WRITE_DEALERSHIP,
    ],
    Role.ANALYST: [
        Permission.READ_ANALYTICS,
        Permission.READ_DEALERSHIP,
    ],
    Role.VIEWER: [
        Permission.READ_ANALYTICS,
        Permission.READ_DEALERSHIP,
    ],
}


class TokenData(BaseModel):
    """Schema for JWT token payload."""
    user_id: str
    email: str
    role: Role
    dealership_ids: Optional[List[str]] = None
    permissions: List[Permission] = []


class User(BaseModel):
    """Schema for authenticated user."""
    user_id: str
    email: str
    role: Role
    dealership_ids: Optional[List[str]] = None
    permissions: List[Permission] = []


def create_access_token(user_id: str, email: str, role: Role, 
                        dealership_ids: Optional[List[str]] = None) -> str:
    """
    Create a JWT access token for a user.
    
    Args:
        user_id: Unique identifier for the user
        email: User's email address
        role: User's role in the system
        dealership_ids: Optional list of dealership IDs the user has access to
        
    Returns:
        Encoded JWT token string
    """
    permissions = ROLE_PERMISSIONS.get(role, [])
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role.value,
        "dealership_ids": dealership_ids or [],
        "permissions": [p.value for p in permissions],
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> TokenData:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        TokenData object containing the decoded payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        token_data = TokenData(
            user_id=payload["user_id"],
            email=payload["email"],
            role=Role(payload["role"]),
            dealership_ids=payload.get("dealership_ids", []),
            permissions=[Permission(p) for p in payload.get("permissions", [])],
        )
        return token_data
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> User:
    """
    FastAPI dependency to extract and validate the current user from JWT token.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        User object with authentication details
        
    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    token_data = decode_token(token)
    
    user = User(
        user_id=token_data.user_id,
        email=token_data.email,
        role=token_data.role,
        dealership_ids=token_data.dealership_ids,
        permissions=token_data.permissions,
    )
    
    logger.info(f"Authenticated user: {user.email} with role: {user.role}")
    return user


def require_permission(required_permission: Permission):
    """
    Decorator factory to require a specific permission for an endpoint.
    
    Args:
        required_permission: The permission required to access the endpoint
        
    Returns:
        Decorated function that checks for the required permission
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract the current_user from kwargs (injected by FastAPI)
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            
            # Check if user has the required permission or admin access
            if (Permission.ADMIN_ALL in current_user.permissions or 
                required_permission in current_user.permissions):
                return await func(*args, **kwargs)
            else:
                logger.warning(
                    f"User {current_user.email} attempted to access endpoint "
                    f"without required permission: {required_permission}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required: {required_permission.value}",
                )
        
        return wrapper
    return decorator


def require_role(required_roles: List[Role]):
    """
    Decorator factory to require specific roles for an endpoint.
    
    Args:
        required_roles: List of roles that are allowed to access the endpoint
        
    Returns:
        Decorated function that checks for the required roles
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract the current_user from kwargs (injected by FastAPI)
            current_user = kwargs.get("current_user")
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                )
            
            # Check if user has one of the required roles
            if current_user.role in required_roles:
                return await func(*args, **kwargs)
            else:
                logger.warning(
                    f"User {current_user.email} with role {current_user.role} "
                    f"attempted to access endpoint requiring roles: {required_roles}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient privileges. Required roles: {[r.value for r in required_roles]}",
                )
        
        return wrapper
    return decorator


def check_dealership_access(user: User, dealership_id: str) -> bool:
    """
    Check if a user has access to a specific dealership.
    
    Args:
        user: Authenticated user
        dealership_id: ID of the dealership to check access for
        
    Returns:
        True if user has access, False otherwise
    """
    # Admins and analysts have access to all dealerships
    if user.role in [Role.ADMIN, Role.ANALYST]:
        return True
    
    # Other users must have the dealership in their access list
    if user.dealership_ids and dealership_id in user.dealership_ids:
        return True
    
    return False


async def verify_dealership_access(
    dealership_id: str,
    current_user: User = Depends(get_current_user)
) -> str:
    """
    FastAPI dependency to verify user has access to a specific dealership.
    
    Args:
        dealership_id: ID of the dealership being accessed
        current_user: Authenticated user
        
    Returns:
        The dealership_id if access is granted
        
    Raises:
        HTTPException: If user doesn't have access to the dealership
    """
    if not check_dealership_access(current_user, dealership_id):
        logger.warning(
            f"User {current_user.email} attempted to access dealership "
            f"{dealership_id} without proper access"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this dealership",
        )
    
    return dealership_id
