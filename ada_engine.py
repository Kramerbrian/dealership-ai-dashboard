# ADA Engine - FastAPI Application
# DealershipAI - Python ADA Engine for automotive dealership analysis

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
from datetime import datetime
import json

# Import our ADA workflow
from lib.analysis.ada_workflow import run_ada_analysis

app = FastAPI(
    title="DealershipAI ADA Engine",
    description="Automotive Dealership Analysis Engine",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ADARequest(BaseModel):
    tenantId: str
    vertical: str
    dataPoints: List[Dict[str, Any]]
    forceRefresh: bool = False

class ADAResponse(BaseModel):
    tenantId: str
    vertical: str
    summaryScore: float
    performanceDetractors: List[str]
    penalties: List[Dict[str, Any]]
    enhancers: List[Dict[str, Any]]
    processingTime: float
    dataPointsCount: int
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    uptime: float

# Global variables for health check
start_time = datetime.now()

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    uptime = (datetime.now() - start_time).total_seconds()
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0",
        uptime=uptime
    )

@app.post("/analyze", response_model=ADAResponse)
async def analyze_dealership(request: ADARequest):
    """
    Analyze dealership data and return ADA insights
    """
    try:
        start_time = datetime.now()
        
        # Run ADA analysis
        result = run_ada_analysis(
            tenant_id=request.tenantId,
            vertical=request.vertical,
            data_points=request.dataPoints,
            force_refresh=request.forceRefresh
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ADAResponse(
            tenantId=request.tenantId,
            vertical=request.vertical,
            summaryScore=result.get("summary_score", 0.0),
            performanceDetractors=result.get("performance_detractors", []),
            penalties=result.get("penalties", []),
            enhancers=result.get("enhancers", []),
            processingTime=processing_time,
            dataPointsCount=len(request.dataPoints),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"ADA analysis failed: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "DealershipAI ADA Engine",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    # In production, you would return actual Prometheus metrics
    return {
        "requests_total": 0,
        "processing_time_seconds": 0.0,
        "errors_total": 0,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "ada_engine:app",
        host="0.0.0.0",
        port=port,
        workers=2,
        reload=False
    )
