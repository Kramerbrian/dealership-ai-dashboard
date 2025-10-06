"""
Pydantic models for the dealership AI analytics API
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    """User roles for RBAC"""
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"

class Permission(str, Enum):
    """Permissions for RBAC"""
    READ_ANALYTICS = "read:analytics"
    WRITE_ANALYTICS = "write:analytics"
    READ_DEALERSHIPS = "read:dealerships"
    WRITE_DEALERSHIPS = "write:dealerships"
    ADMIN_ACCESS = "admin:access"

class User(BaseModel):
    """User model"""
    id: str
    username: str
    email: str
    role: UserRole
    permissions: List[Permission]
    dealership_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Role(BaseModel):
    """Role model with permissions"""
    name: UserRole
    permissions: List[Permission]
    description: str

class AnalyticsRequest(BaseModel):
    """Request model for analytics data"""
    dealership_name: str = Field(..., description="Name of the dealership")
    location: str = Field(..., description="Location of the dealership")
    include_competitors: bool = Field(True, description="Include competitor analysis")
    include_reviews: bool = Field(True, description="Include review data")
    include_auto_responses: bool = Field(False, description="Include auto-generated responses")

class AnalyticsResponse(BaseModel):
    """Response model for analytics data"""
    dealership: str
    location: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    visibility_reports: List[Dict[str, Any]]
    competitor_reports: List[Dict[str, Any]]
    review_data: Dict[str, Any]
    auto_responses: Optional[Dict[str, Any]] = None
    risk_score: float
    monthly_loss_risk: float
    ai_visibility_score: float
    market_position: int
    total_competitors: int

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Role definitions
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        Permission.READ_ANALYTICS,
        Permission.WRITE_ANALYTICS,
        Permission.READ_DEALERSHIPS,
        Permission.WRITE_DEALERSHIPS,
        Permission.ADMIN_ACCESS
    ],
    UserRole.MANAGER: [
        Permission.READ_ANALYTICS,
        Permission.WRITE_ANALYTICS,
        Permission.READ_DEALERSHIPS
    ],
    UserRole.ANALYST: [
        Permission.READ_ANALYTICS,
        Permission.READ_DEALERSHIPS
    ],
    UserRole.VIEWER: [
        Permission.READ_ANALYTICS
    ]
}