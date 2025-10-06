"""
Dealership Analytics API Routes
================================

This module defines API endpoints for fetching and managing dealership
analytics data. All endpoints are protected with RBAC middleware to ensure
proper access control based on user roles and permissions.

Endpoints:
- GET /analytics/dealership/{dealership_id} - Fetch analytics for a specific dealership
- GET /analytics/dealership/{dealership_id}/visibility - Fetch AI visibility metrics
- GET /analytics/dealership/{dealership_id}/threats - Fetch identified threats
- GET /analytics/dealership/{dealership_id}/competitors - Fetch competitor analysis
- GET /analytics/dealership/{dealership_id}/reviews - Fetch review analytics
- POST /analytics/dealership/{dealership_id}/refresh - Trigger analytics refresh
"""

from __future__ import annotations

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field

from api.middleware.rbac import (
    get_current_user,
    User,
    Permission,
    Role,
    check_dealership_access,
)

# Import the existing multi-agent system
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from dealership_ai_multi_agent import (
    PlatformAgent,
    AnalysisAgent,
    CompetitorAgent,
    ReviewAgent,
    IntegrationAgent,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["analytics"])


# Response Models
class DealershipInfo(BaseModel):
    """Basic dealership information."""
    dealership_id: str
    name: str
    location: str
    url: Optional[str] = None


class VisibilityScore(BaseModel):
    """AI visibility score for a specific platform."""
    platform: str
    score: float = Field(..., ge=0, le=100, description="Visibility score (0-100)")
    last_updated: datetime


class ThreatData(BaseModel):
    """Threat information."""
    category: str
    severity: str
    impact: str
    description: str


class CompetitorData(BaseModel):
    """Competitor information."""
    name: str
    mention_count: int
    rank: Optional[int] = None


class ReviewMetrics(BaseModel):
    """Review metrics from various platforms."""
    overall_rating: float
    overall_sentiment: float
    ratings: Dict[str, float]
    review_counts: Dict[str, int]
    response_rates: Dict[str, float]


class AnalyticsOverview(BaseModel):
    """Complete analytics overview for a dealership."""
    dealership: DealershipInfo
    risk_score: float = Field(..., ge=0, le=100)
    monthly_loss_risk: float
    ai_visibility_score: float = Field(..., ge=0, le=100)
    invisible_percentage: float = Field(..., ge=0, le=100)
    market_position: int
    total_competitors: int
    sov_percentage: float = Field(..., ge=0, le=100, description="Share of voice percentage")
    ai_platform_scores: Dict[str, float]
    threats: List[ThreatData]
    last_updated: datetime


class VisibilityAnalytics(BaseModel):
    """AI visibility analytics."""
    dealership_id: str
    overall_score: float = Field(..., ge=0, le=100)
    platform_scores: List[VisibilityScore]
    invisible_percentage: float
    visibility_reports: List[Dict[str, Any]]


class ThreatsResponse(BaseModel):
    """Threats response."""
    dealership_id: str
    threats: List[ThreatData]
    total_risk_score: float


class CompetitorAnalytics(BaseModel):
    """Competitor analytics."""
    dealership_id: str
    competitors: List[CompetitorData]
    market_position: int
    total_competitors: int
    sov_percentage: float


class RefreshRequest(BaseModel):
    """Request to refresh analytics data."""
    force_refresh: bool = False


class RefreshResponse(BaseModel):
    """Response after refreshing analytics."""
    dealership_id: str
    status: str
    message: str
    timestamp: datetime


# Helper function to mock dealership data (replace with database queries)
def get_dealership_info(dealership_id: str) -> Optional[DealershipInfo]:
    """
    Retrieve dealership information from database.
    This is a mock implementation - replace with actual database queries.
    """
    # Mock data for demonstration
    mock_dealerships = {
        "deal_001": DealershipInfo(
            dealership_id="deal_001",
            name="Toyota of Naples",
            location="Naples, FL",
            url="https://toyotaofnaples.com"
        ),
        "deal_002": DealershipInfo(
            dealership_id="deal_002",
            name="Honda of Miami",
            location="Miami, FL",
            url="https://hondaofmiami.com"
        ),
    }
    return mock_dealerships.get(dealership_id)


# API Endpoints
@router.get(
    "/dealership/{dealership_id}",
    response_model=AnalyticsOverview,
    summary="Get dealership analytics overview",
    description="Fetch complete analytics overview for a specific dealership including risk scores, visibility, and threats."
)
async def get_dealership_analytics(
    dealership_id: str,
    current_user: User = Depends(get_current_user)
) -> AnalyticsOverview:
    """
    Fetch complete analytics overview for a dealership.
    
    Requires: read:analytics permission
    Access: Users must have access to the specified dealership
    """
    # Check if user has read analytics permission
    if Permission.READ_ANALYTICS not in current_user.permissions and \
       Permission.ADMIN_ALL not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Required: read:analytics"
        )
    
    # Check dealership access
    if not check_dealership_access(current_user, dealership_id):
        logger.warning(
            f"User {current_user.email} attempted to access dealership "
            f"{dealership_id} without proper access"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this dealership"
        )
    
    # Get dealership info
    dealership_info = get_dealership_info(dealership_id)
    if not dealership_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dealership {dealership_id} not found"
        )
    
    logger.info(f"Fetching analytics for dealership {dealership_id} by user {current_user.email}")
    
    # Initialize agents and run analysis
    platform_agent = PlatformAgent()
    analysis_agent = AnalysisAgent()
    competitor_agent = CompetitorAgent()
    review_agent = ReviewAgent()
    integrator = IntegrationAgent(platform_agent, analysis_agent, competitor_agent, review_agent)
    
    # Run the multi-agent analysis
    report = await integrator.run(dealership_info.name, dealership_info.location)
    
    # Calculate aggregate metrics from the report
    visibility_reports = report.get("visibility_reports", [])
    avg_visibility = sum(r["visibility_score"] for r in visibility_reports) / len(visibility_reports) if visibility_reports else 0
    
    # Mock AI platform scores (should be derived from actual data)
    ai_platform_scores = {
        "chatgpt": 28.0,
        "claude": 31.0,
        "gemini": 42.0,
        "perplexity": 29.0,
        "copilot": 35.0,
        "grok": 25.0
    }
    
    # Mock threats (should be derived from analysis)
    threats = [
        ThreatData(
            category="AI Search",
            severity="Critical",
            impact="$18,750/month",
            description="Invisible in 82% of ChatGPT searches for local Toyota dealers"
        ),
        ThreatData(
            category="Zero-Click",
            severity="High",
            impact="$12,400/month",
            description="Missing from Google SGE results for 67% of relevant queries"
        ),
    ]
    
    # Compile analytics overview
    analytics = AnalyticsOverview(
        dealership=dealership_info,
        risk_score=73.0,
        monthly_loss_risk=47250.0,
        ai_visibility_score=avg_visibility,
        invisible_percentage=78.0,
        market_position=7,
        total_competitors=12,
        sov_percentage=12.3,
        ai_platform_scores=ai_platform_scores,
        threats=threats,
        last_updated=datetime.utcnow()
    )
    
    return analytics


@router.get(
    "/dealership/{dealership_id}/visibility",
    response_model=VisibilityAnalytics,
    summary="Get AI visibility analytics",
    description="Fetch detailed AI visibility metrics across different platforms."
)
async def get_visibility_analytics(
    dealership_id: str,
    current_user: User = Depends(get_current_user)
) -> VisibilityAnalytics:
    """
    Fetch AI visibility analytics for a dealership.
    
    Requires: read:analytics permission
    """
    # Check permissions and access
    if Permission.READ_ANALYTICS not in current_user.permissions and \
       Permission.ADMIN_ALL not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Required: read:analytics"
        )
    
    if not check_dealership_access(current_user, dealership_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this dealership"
        )
    
    # Get dealership info
    dealership_info = get_dealership_info(dealership_id)
    if not dealership_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dealership {dealership_id} not found"
        )
    
    logger.info(f"Fetching visibility analytics for dealership {dealership_id}")
    
    # Initialize agents
    platform_agent = PlatformAgent()
    analysis_agent = AnalysisAgent()
    competitor_agent = CompetitorAgent()
    review_agent = ReviewAgent()
    integrator = IntegrationAgent(platform_agent, analysis_agent, competitor_agent, review_agent)
    
    # Run analysis
    report = await integrator.run(dealership_info.name, dealership_info.location)
    visibility_reports = report.get("visibility_reports", [])
    
    # Create platform scores
    platform_scores = [
        VisibilityScore(platform="ChatGPT", score=28.0, last_updated=datetime.utcnow()),
        VisibilityScore(platform="Claude", score=31.0, last_updated=datetime.utcnow()),
        VisibilityScore(platform="Gemini", score=42.0, last_updated=datetime.utcnow()),
        VisibilityScore(platform="Perplexity", score=29.0, last_updated=datetime.utcnow()),
    ]
    
    avg_score = sum(ps.score for ps in platform_scores) / len(platform_scores)
    
    return VisibilityAnalytics(
        dealership_id=dealership_id,
        overall_score=avg_score,
        platform_scores=platform_scores,
        invisible_percentage=78.0,
        visibility_reports=visibility_reports
    )


@router.get(
    "/dealership/{dealership_id}/threats",
    response_model=ThreatsResponse,
    summary="Get identified threats",
    description="Fetch identified threats and risks for the dealership."
)
async def get_threats(
    dealership_id: str,
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, High, Medium, Low"),
    current_user: User = Depends(get_current_user)
) -> ThreatsResponse:
    """
    Fetch identified threats for a dealership.
    
    Requires: read:analytics permission
    """
    if Permission.READ_ANALYTICS not in current_user.permissions and \
       Permission.ADMIN_ALL not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    if not check_dealership_access(current_user, dealership_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Mock threats data
    threats = [
        ThreatData(
            category="AI Search",
            severity="Critical",
            impact="$18,750/month",
            description="Invisible in 82% of ChatGPT searches"
        ),
        ThreatData(
            category="Zero-Click",
            severity="High",
            impact="$12,400/month",
            description="Missing from Google SGE results"
        ),
        ThreatData(
            category="Local SEO",
            severity="Medium",
            impact="$7,000/month",
            description="Not in top 3 map pack"
        ),
    ]
    
    # Filter by severity if specified
    if severity:
        threats = [t for t in threats if t.severity.lower() == severity.lower()]
    
    return ThreatsResponse(
        dealership_id=dealership_id,
        threats=threats,
        total_risk_score=73.0
    )


@router.get(
    "/dealership/{dealership_id}/competitors",
    response_model=CompetitorAnalytics,
    summary="Get competitor analysis",
    description="Fetch competitor analysis and market position data."
)
async def get_competitor_analytics(
    dealership_id: str,
    current_user: User = Depends(get_current_user)
) -> CompetitorAnalytics:
    """
    Fetch competitor analytics for a dealership.
    
    Requires: read:analytics permission
    """
    if Permission.READ_ANALYTICS not in current_user.permissions and \
       Permission.ADMIN_ALL not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    if not check_dealership_access(current_user, dealership_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    dealership_info = get_dealership_info(dealership_id)
    if not dealership_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealership not found"
        )
    
    # Run competitor analysis
    platform_agent = PlatformAgent()
    analysis_agent = AnalysisAgent()
    competitor_agent = CompetitorAgent()
    review_agent = ReviewAgent()
    integrator = IntegrationAgent(platform_agent, analysis_agent, competitor_agent, review_agent)
    
    report = await integrator.run(dealership_info.name, dealership_info.location)
    competitor_reports = report.get("competitor_reports", [])
    
    # Aggregate competitors
    competitor_mentions: Dict[str, int] = {}
    for report in competitor_reports:
        for comp_name, count in report.get("competitors", []):
            competitor_mentions[comp_name] = competitor_mentions.get(comp_name, 0) + count
    
    competitors = [
        CompetitorData(name=name, mention_count=count, rank=idx+1)
        for idx, (name, count) in enumerate(sorted(competitor_mentions.items(), key=lambda x: x[1], reverse=True))
    ]
    
    return CompetitorAnalytics(
        dealership_id=dealership_id,
        competitors=competitors[:10],  # Top 10
        market_position=7,
        total_competitors=len(competitors),
        sov_percentage=12.3
    )


@router.get(
    "/dealership/{dealership_id}/reviews",
    response_model=ReviewMetrics,
    summary="Get review analytics",
    description="Fetch review metrics and sentiment analysis from multiple platforms."
)
async def get_review_analytics(
    dealership_id: str,
    current_user: User = Depends(get_current_user)
) -> ReviewMetrics:
    """
    Fetch review analytics for a dealership.
    
    Requires: read:analytics permission
    """
    if Permission.READ_ANALYTICS not in current_user.permissions and \
       Permission.ADMIN_ALL not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    if not check_dealership_access(current_user, dealership_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    dealership_info = get_dealership_info(dealership_id)
    if not dealership_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealership not found"
        )
    
    # Run review analysis
    review_agent = ReviewAgent()
    review_data = await review_agent.run(dealership_info.name, dealership_info.location)
    
    return ReviewMetrics(**review_data)


@router.post(
    "/dealership/{dealership_id}/refresh",
    response_model=RefreshResponse,
    summary="Refresh analytics data",
    description="Trigger a refresh of analytics data for the dealership."
)
async def refresh_analytics(
    dealership_id: str,
    request: RefreshRequest,
    current_user: User = Depends(get_current_user)
) -> RefreshResponse:
    """
    Trigger a refresh of analytics data.
    
    Requires: write:analytics permission or manager/admin role
    """
    if Permission.WRITE_ANALYTICS not in current_user.permissions and \
       Permission.ADMIN_ALL not in current_user.permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Required: write:analytics"
        )
    
    if not check_dealership_access(current_user, dealership_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    dealership_info = get_dealership_info(dealership_id)
    if not dealership_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dealership not found"
        )
    
    logger.info(
        f"Analytics refresh triggered for dealership {dealership_id} "
        f"by user {current_user.email} (force={request.force_refresh})"
    )
    
    # In a production system, this would trigger a background job
    # For now, we'll just return a success response
    
    return RefreshResponse(
        dealership_id=dealership_id,
        status="success",
        message="Analytics refresh initiated successfully",
        timestamp=datetime.utcnow()
    )
