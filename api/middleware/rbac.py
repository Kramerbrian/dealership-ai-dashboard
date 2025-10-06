"""
Role-Based Access Control (RBAC) middleware for the dealership AI analytics API
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
import jwt
import os
from datetime import datetime, timedelta

from ..models import User, UserRole, Permission, ROLE_PERMISSIONS

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

# Mock user database - in production, this would be a real database
MOCK_USERS = {
    "admin@dealership.com": User(
        id="1",
        username="admin",
        email="admin@dealership.com",
        role=UserRole.ADMIN,
        permissions=ROLE_PERMISSIONS[UserRole.ADMIN],
        dealership_id=None
    ),
    "manager@dealership.com": User(
        id="2",
        username="manager",
        email="manager@dealership.com",
        role=UserRole.MANAGER,
        permissions=ROLE_PERMISSIONS[UserRole.MANAGER],
        dealership_id="dealership_1"
    ),
    "analyst@dealership.com": User(
        id="3",
        username="analyst",
        email="analyst@dealership.com",
        role=UserRole.ANALYST,
        permissions=ROLE_PERMISSIONS[UserRole.ANALYST],
        dealership_id="dealership_1"
    ),
    "viewer@dealership.com": User(
        id="4",
        username="viewer",
        email="viewer@dealership.com",
        role=UserRole.VIEWER,
        permissions=ROLE_PERMISSIONS[UserRole.VIEWER],
        dealership_id="dealership_1"
    )
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(payload: dict = Depends(verify_token)) -> User:
    """Get current user from JWT payload"""
    email = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = MOCK_USERS.get(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def require_permission(required_permission: Permission):
    """Decorator to require specific permission"""
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if required_permission not in current_user.permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{required_permission}' required"
            )
        return current_user
    return permission_checker

def require_role(required_roles: List[UserRole]):
    """Decorator to require specific role(s)"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' not authorized. Required: {required_roles}"
            )
        return current_user
    return role_checker

def require_dealership_access():
    """Decorator to require dealership access (for non-admin users)"""
    def dealership_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == UserRole.ADMIN:
            return current_user
        
        if not current_user.dealership_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Dealership access required"
            )
        return current_user
    return dealership_checker

# Common dependency combinations
def require_analytics_read():
    """Require permission to read analytics data"""
    return require_permission(Permission.READ_ANALYTICS)

def require_analytics_write():
    """Require permission to write analytics data"""
    return require_permission(Permission.WRITE_ANALYTICS)

def require_admin_or_manager():
    """Require admin or manager role"""
    return require_role([UserRole.ADMIN, UserRole.MANAGER])

def require_admin():
    """Require admin role"""
    return require_role([UserRole.ADMIN])