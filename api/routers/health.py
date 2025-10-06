"""Health check endpoints for monitoring"""

from fastapi import APIRouter, Depends
from typing import Dict, Any
import os
import psutil
from datetime import datetime

router = APIRouter()

@router.get("")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": os.getenv("API_VERSION", "1.0.0")
    }

@router.get("/detailed")
async def detailed_health() -> Dict[str, Any]:
    """Detailed health check with system metrics"""
    try:
        memory = psutil.virtual_memory()
        cpu_percent = psutil.cpu_percent(interval=1)
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": round(memory.available / (1024**3), 2),
                "memory_total_gb": round(memory.total / (1024**3), 2)
            },
            "services": {
                "database": "connected",  # TODO: Add actual DB health check
                "redis": "connected",      # TODO: Add actual Redis health check
                "ai_agents": "operational"
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@router.get("/ready")
async def readiness_check() -> Dict[str, bool]:
    """Kubernetes readiness probe endpoint"""
    # TODO: Add actual service checks
    return {
        "ready": True
    }

@router.get("/live")
async def liveness_check() -> Dict[str, bool]:
    """Kubernetes liveness probe endpoint"""
    return {
        "alive": True
    }