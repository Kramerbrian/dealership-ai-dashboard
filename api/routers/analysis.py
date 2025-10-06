"""Analysis endpoints for dealership visibility analysis"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field, HttpUrl
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class AnalysisRequest(BaseModel):
    """Request model for dealership analysis"""
    business_name: str = Field(..., min_length=1, max_length=200)
    location: str = Field(..., min_length=1, max_length=200)
    include_competitors: bool = True
    include_reviews: bool = True
    platforms: Optional[List[str]] = None

class AnalysisResponse(BaseModel):
    """Response model for analysis results"""
    analysis_id: str
    status: str
    dealership: str
    location: str
    timestamp: datetime
    visibility_score: float
    revenue_at_risk: float
    data: Dict[str, Any]

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_dealership(
    request: AnalysisRequest,
    background_tasks: BackgroundTasks
) -> AnalysisResponse:
    """
    Trigger a comprehensive dealership visibility analysis
    """
    try:
        # Import the app to access agents
        from ..main import app
        
        # Generate unique analysis ID
        import uuid
        analysis_id = str(uuid.uuid4())
        
        # Run the analysis
        logger.info(f"Starting analysis {analysis_id} for {request.business_name}")
        
        # Execute the integration agent
        report = await app.state.integration_agent.run(
            request.business_name,
            request.location
        )
        
        # Calculate aggregate metrics
        visibility_scores = [r["visibility_score"] for r in report.get("visibility_reports", [])]
        avg_visibility = sum(visibility_scores) / len(visibility_scores) if visibility_scores else 0
        
        revenue_risks = [r["revenue_at_risk"] for r in report.get("visibility_reports", [])]
        total_revenue_risk = sum(revenue_risks)
        
        return AnalysisResponse(
            analysis_id=analysis_id,
            status="completed",
            dealership=request.business_name,
            location=request.location,
            timestamp=datetime.utcnow(),
            visibility_score=avg_visibility,
            revenue_at_risk=total_revenue_risk,
            data=report
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str) -> Dict[str, Any]:
    """
    Retrieve analysis results by ID
    """
    # TODO: Implement result caching/storage
    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "message": "Analysis retrieval not yet implemented"
    }

@router.get("/platforms")
async def list_supported_platforms() -> Dict[str, List[str]]:
    """
    Get list of supported AI platforms
    """
    return {
        "platforms": [
            "ChatGPT",
            "Perplexity",
            "Google",
            "Gemini",
            "Claude",
            "Grok"
        ]
    }