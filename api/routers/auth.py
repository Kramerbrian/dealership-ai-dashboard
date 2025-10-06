"""Authentication and authorization endpoints"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
import os
from passlib.context import CryptContext

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class UserLogin(BaseModel):
    """User login request model"""
    email: EmailStr
    password: str

class Token(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class User(BaseModel):
    """User model"""
    email: str
    full_name: Optional[str] = None
    dealership_id: Optional[str] = None
    role: str = "viewer"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin) -> Token:
    """
    User login endpoint
    Note: This is a simplified version. In production, verify against database.
    """
    # TODO: Implement actual user verification against database
    # For demo purposes, accept any email/password
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_credentials.email},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/register")
async def register(user: UserLogin) -> Dict[str, str]:
    """
    User registration endpoint
    """
    # TODO: Implement actual user registration with database
    hashed_password = pwd_context.hash(user.password)
    
    return {
        "message": "User registered successfully",
        "email": user.email
    }

@router.get("/me", response_model=User)
async def get_current_user(token_data: Dict = Depends(verify_token)) -> User:
    """
    Get current user information
    """
    return User(
        email=token_data.get("sub", ""),
        full_name="Demo User",
        dealership_id="demo-dealership",
        role="admin"
    )

@router.post("/refresh")
async def refresh_token(token_data: Dict = Depends(verify_token)) -> Token:
    """
    Refresh access token
    """
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": token_data.get("sub")},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )