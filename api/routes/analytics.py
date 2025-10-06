"""
Analytics API routes for dealership data
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Dict, Any, Optional
import logging
import asyncio
from datetime import datetime

from ..models import (
    AnalyticsRequest, 
    AnalyticsResponse, 
    ErrorResponse,
    User
)
from ..middleware.rbac import (
    get_current_user,
    require_analytics_read,
    require_analytics_write,
    require_dealership_access
)
from dealership_ai_multi_agent import (
    IntegrationAgent, 
    PlatformAgent, 
    AnalysisAgent, 
    CompetitorAgent, 
    ReviewAgent
)

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize agents (in production, these would be dependency injected)
platform_agent = PlatformAgent()
analysis_agent = AnalysisAgent()
competitor_agent = CompetitorAgent()
review_agent = ReviewAgent()
integration_agent = IntegrationAgent(
    platform_agent, 
    analysis_agent, 
    competitor_agent, 
    review_agent
)

@router.get("/analytics/health")
async def analytics_health():
    """Health check for analytics service"""
    return {
        "status": "healthy",
        "service": "analytics",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post(
    "/analytics/dealership",
    response_model=AnalyticsResponse,
    responses={
        200: {"description": "Analytics data retrieved successfully"},
        400: {"description": "Invalid request parameters", "model": ErrorResponse},
        401: {"description": "Unauthorized", "model": ErrorResponse},
        403: {"description": "Forbidden - insufficient permissions", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse}
    }
)
async def get_dealership_analytics(
    request: AnalyticsRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_analytics_read())
):
    """
    Fetch comprehensive analytics data for a dealership.
    
    This endpoint provides:
    - Visibility analysis across AI platforms
    - Competitor analysis
    - Review data and sentiment analysis
    - Risk assessment and revenue impact
    - Optional auto-generated responses
    
    Requires READ_ANALYTICS permission.
    """
    try:
        logger.info(f"Analytics request for {request.dealership_name} by user {current_user.username}")
        
        # For non-admin users, validate dealership access
        if current_user.role != "admin" and current_user.dealership_id:
            # In a real implementation, you'd validate that the user has access
            # to the specific dealership being requested
            pass
        
        # Run the multi-agent analysis
        analysis_result = await integration_agent.run(
            request.dealership_name, 
            request.location
        )
        
        # Calculate additional metrics
        visibility_reports = analysis_result.get("visibility_reports", [])
        competitor_reports = analysis_result.get("competitor_reports", [])
        review_data = analysis_result.get("review_data", {})
        
        # Calculate risk score and other metrics
        risk_score = _calculate_risk_score(visibility_reports, review_data)
        monthly_loss_risk = _calculate_monthly_loss_risk(visibility_reports)
        ai_visibility_score = _calculate_ai_visibility_score(visibility_reports)
        market_position = _calculate_market_position(competitor_reports)
        total_competitors = _count_total_competitors(competitor_reports)
        
        # Prepare response
        response_data = {
            "dealership": request.dealership_name,
            "location": request.location,
            "timestamp": datetime.utcnow(),
            "visibility_reports": visibility_reports,
            "competitor_reports": competitor_reports,
            "review_data": review_data,
            "risk_score": risk_score,
            "monthly_loss_risk": monthly_loss_risk,
            "ai_visibility_score": ai_visibility_score,
            "market_position": market_position,
            "total_competitors": total_competitors
        }
        
        # Add auto responses if requested and user has permission
        if request.include_auto_responses and "auto_responses" in analysis_result:
            response_data["auto_responses"] = analysis_result["auto_responses"]
        
        # Log analytics request for audit purposes
        background_tasks.add_task(
            _log_analytics_request,
            current_user.id,
            request.dealership_name,
            request.location
        )
        
        return AnalyticsResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error processing analytics request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing analytics request: {str(e)}"
        )

@router.get(
    "/analytics/dealership/{dealership_name}",
    response_model=AnalyticsResponse,
    responses={
        200: {"description": "Analytics data retrieved successfully"},
        401: {"description": "Unauthorized", "model": ErrorResponse},
        403: {"description": "Forbidden - insufficient permissions", "model": ErrorResponse},
        404: {"description": "Dealership not found", "model": ErrorResponse},
        500: {"description": "Internal server error", "model": ErrorResponse}
    }
)
async def get_dealership_analytics_by_name(
    dealership_name: str,
    location: str = "Naples, FL",
    include_competitors: bool = True,
    include_reviews: bool = True,
    include_auto_responses: bool = False,
    current_user: User = Depends(require_analytics_read())
):
    """
    Fetch analytics data for a dealership by name (GET endpoint).
    
    This is a convenience endpoint for simple GET requests.
    """
    request = AnalyticsRequest(
        dealership_name=dealership_name,
        location=location,
        include_competitors=include_competitors,
        include_reviews=include_reviews,
        include_auto_responses=include_auto_responses
    )
    
    return await get_dealership_analytics(request, None, current_user)

@router.get(
    "/analytics/summary",
    response_model=Dict[str, Any],
    responses={
        200: {"description": "Analytics summary retrieved successfully"},
        401: {"description": "Unauthorized", "model": ErrorResponse},
        403: {"description": "Forbidden - insufficient permissions", "model": ErrorResponse}
    }
)
async def get_analytics_summary(
    current_user: User = Depends(require_analytics_read())
):
    """
    Get a summary of analytics data across all accessible dealerships.
    
    This endpoint provides aggregated metrics for dashboard overview.
    """
    try:
        # In a real implementation, this would query a database
        # For now, return a mock summary
        summary = {
            "total_dealerships": 1,
            "total_analyses": 1,
            "average_risk_score": 73.0,
            "total_revenue_at_risk": 47250.0,
            "last_updated": datetime.utcnow().isoformat(),
            "user_role": current_user.role,
            "accessible_dealerships": [current_user.dealership_id] if current_user.dealership_id else []
        }
        
        return summary
        
    except Exception as e:
        logger.error(f"Error generating analytics summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating analytics summary: {str(e)}"
        )

# Helper functions
def _calculate_risk_score(visibility_reports: list, review_data: dict) -> float:
    """Calculate overall risk score based on visibility and review data"""
    if not visibility_reports:
        return 0.0
    
    # Calculate average visibility score
    avg_visibility = sum(report.get("visibility_score", 0) for report in visibility_reports) / len(visibility_reports)
    
    # Calculate review score (0-100)
    review_score = review_data.get("overall_rating", 0) * 20  # Convert 0-5 to 0-100
    
    # Risk score is inverse of performance (higher performance = lower risk)
    risk_score = 100 - ((avg_visibility + review_score) / 2)
    return round(risk_score, 2)

def _calculate_monthly_loss_risk(visibility_reports: list) -> float:
    """Calculate estimated monthly revenue at risk"""
    if not visibility_reports:
        return 0.0
    
    total_revenue_at_risk = sum(report.get("revenue_at_risk", 0) for report in visibility_reports)
    return round(total_revenue_at_risk, 2)

def _calculate_ai_visibility_score(visibility_reports: list) -> float:
    """Calculate overall AI visibility score"""
    if not visibility_reports:
        return 0.0
    
    avg_visibility = sum(report.get("visibility_score", 0) for report in visibility_reports) / len(visibility_reports)
    return round(avg_visibility, 2)

def _calculate_market_position(competitor_reports: list) -> int:
    """Calculate market position based on competitor analysis"""
    # Simplified calculation - in reality this would be more complex
    return 7  # Mock position

def _count_total_competitors(competitor_reports: list) -> int:
    """Count total competitors across all reports"""
    all_competitors = set()
    for report in competitor_reports:
        competitors = report.get("competitors", [])
        for competitor_name, _ in competitors:
            all_competitors.add(competitor_name)
    return len(all_competitors)

async def _log_analytics_request(user_id: str, dealership_name: str, location: str):
    """Log analytics request for audit purposes"""
    logger.info(f"Analytics request logged - User: {user_id}, Dealership: {dealership_name}, Location: {location}")
    # In production, this would write to an audit log database