"""
FastAPI application for dealership AI analytics API
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any
import logging
import os
from datetime import datetime, timedelta
import jwt
from pydantic import BaseModel

# Import our custom modules
from api.routes import analytics, auth
from api.middleware import rbac
from api.models import User, Role, Permission
from dealership_ai_multi_agent import IntegrationAgent, PlatformAgent, AnalysisAgent, CompetitorAgent, ReviewAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Dealership AI Analytics API",
    description="API for fetching dealership analytics data with RBAC",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Include routers
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])
app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Dealership AI Analytics API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)