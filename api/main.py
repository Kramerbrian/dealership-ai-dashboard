"""
Dealership Analytics API - Main Application
==========================================

FastAPI application entry point with RBAC middleware integration.

This application provides secure, role-based access to dealership analytics
data through RESTful API endpoints. All endpoints are protected by JWT
authentication and RBAC middleware.

Environment Variables Required:
- JWT_SECRET: Secret key for JWT token signing
- OPENAI_API_KEY: OpenAI API key (optional)
- GOOGLE_SEARCH_API_KEY: Google Search API key (optional)
- GOOGLE_SEARCH_ENGINE_ID: Google Custom Search Engine ID (optional)
- PERPLEXITY_API_KEY: Perplexity API key (optional)
- GOOGLE_GEMINI_API_KEY: Google Gemini API key (optional)

Usage:
    uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from api.routes import analytics
from api.middleware.rbac import create_access_token, Role

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting Dealership Analytics API")
    logger.info("Initializing AI agents and services...")
    yield
    # Shutdown
    logger.info("Shutting down Dealership Analytics API")


# Create FastAPI application
app = FastAPI(
    title="Dealership Analytics API",
    description="API for fetching and managing dealership analytics data with RBAC",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        # Add your frontend URLs here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
)


# Global exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} - {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(f"Validation error: {exc} - {request.url}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation error",
            "details": exc.errors(),
            "body": exc.body,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.exception(f"Unexpected error: {exc} - {request.url}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
        },
    )


# Include routers
app.include_router(analytics.router, prefix="/api/v1")


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint to verify API is running.
    
    Returns:
        Status information
    """
    return {
        "status": "healthy",
        "service": "dealership-analytics-api",
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/", tags=["root"])
async def root() -> Dict[str, Any]:
    """
    Root endpoint with API information.
    
    Returns:
        API information and available endpoints
    """
    return {
        "message": "Dealership Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "analytics": "/api/v1/analytics",
            "auth": "/api/v1/auth",
        }
    }


# Demo authentication endpoint (for testing)
@app.post("/api/v1/auth/demo-token", tags=["auth"])
async def get_demo_token(
    email: str = "demo@dealership.ai",
    role: Role = Role.ANALYST,
    dealership_ids: list[str] = None
) -> Dict[str, str]:
    """
    Generate a demo JWT token for testing purposes.
    
    **WARNING**: This endpoint should be removed in production!
    Use a proper authentication service instead.
    
    Args:
        email: User email
        role: User role (admin, manager, analyst, viewer)
        dealership_ids: Optional list of dealership IDs user has access to
        
    Returns:
        JWT access token
    """
    logger.warning(f"Demo token generated for {email} with role {role}")
    
    if dealership_ids is None:
        dealership_ids = ["deal_001", "deal_002"]
    
    token = create_access_token(
        user_id=f"user_{email.split('@')[0]}",
        email=email,
        role=role,
        dealership_ids=dealership_ids
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": 86400,  # 24 hours
        "user": {
            "email": email,
            "role": role.value,
            "dealership_ids": dealership_ids
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
