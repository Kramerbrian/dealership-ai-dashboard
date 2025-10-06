"""
FastAPI Backend for DealershipAI
Main application entry point with routes and configuration
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import logging
from typing import Dict, Any
from dotenv import load_dotenv

# Import our multi-agent system
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dealership_ai_multi_agent import (
    IntegrationAgent,
    PlatformAgent,
    AnalysisAgent,
    CompetitorAgent,
    ReviewAgent
)

# Import routers
from .routers import analysis, dashboard, auth, health

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Application metadata
API_VERSION = "1.0.0"
API_TITLE = "DealershipAI API"
API_DESCRIPTION = """
Enterprise Multi-Agent Platform for Automotive Dealership AI Visibility

## Features
- Multi-platform AI search analysis
- Competitor tracking
- Review aggregation
- Revenue impact calculations
- Real-time visibility scoring

## Authentication
Use Bearer token authentication for protected endpoints.
"""

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application lifecycle
    """
    # Startup
    logger.info(f"Starting {API_TITLE} v{API_VERSION}")
    
    # Initialize agents
    app.state.platform_agent = PlatformAgent()
    app.state.analysis_agent = AnalysisAgent()
    app.state.competitor_agent = CompetitorAgent()
    app.state.review_agent = ReviewAgent()
    app.state.integration_agent = IntegrationAgent(
        app.state.platform_agent,
        app.state.analysis_agent,
        app.state.competitor_agent,
        app.state.review_agent
    )
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {API_TITLE}")

# Create FastAPI application
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint providing API information"""
    return {
        "name": API_TITLE,
        "version": API_VERSION,
        "status": "operational",
        "documentation": "/api/docs"
    }

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "error_id": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=int(os.getenv("BACKEND_PORT", 8000)),
        reload=os.getenv("NODE_ENV") == "development"
    )