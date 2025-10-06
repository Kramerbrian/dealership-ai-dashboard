"""
Authentication routes for the dealership AI analytics API
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from datetime import timedelta

from ..models import User, UserRole
from ..middleware.rbac import create_access_token, get_current_user

router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    """Login request model"""
    email: str
    password: str  # In production, this would be hashed

class LoginResponse(BaseModel):
    """Login response model"""
    access_token: str
    token_type: str = "bearer"
    user: User

class TokenResponse(BaseModel):
    """Token validation response"""
    valid: bool
    user: Optional[User] = None

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user and return access token.
    
    For demo purposes, any email from our mock users with any password will work.
    In production, this would validate against a real user database with hashed passwords.
    """
    # Mock authentication - in production, validate against database
    from ..middleware.rbac import MOCK_USERS
    
    user = MOCK_USERS.get(request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # In production, verify password hash here
    # if not verify_password(request.password, user.hashed_password):
    #     raise HTTPException(...)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role}
    )
    
    return LoginResponse(
        access_token=access_token,
        user=user
    )

@router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/auth/validate", response_model=TokenResponse)
async def validate_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate a JWT token"""
    try:
        user = get_current_user(credentials)
        return TokenResponse(valid=True, user=user)
    except HTTPException:
        return TokenResponse(valid=False)

@router.get("/auth/roles")
async def get_available_roles():
    """Get list of available user roles"""
    return {
        "roles": [
            {"name": role.value, "description": f"{role.value.title()} role"}
            for role in UserRole
        ]
    }