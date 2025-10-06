from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import asyncio
import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the multi-agent system
from main import (
    PlatformAgent, AnalysisAgent, CompetitorAgent, 
    ReviewAgent, IntegrationAgent, QueryAgent
)

app = FastAPI(
    title="DealershipAI Backend API",
    description="Multi-agent analysis system for dealership AI visibility",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer(auto_error=False)

# Pydantic models
class AnalysisRequest(BaseModel):
    business_name: str
    location: str
    dealership_url: Optional[str] = None
    analysis_type: str = "full"

class AnalysisResponse(BaseModel):
    dealership: str
    location: str
    visibility_reports: list
    competitor_reports: list
    review_data: dict

# Initialize agents (global instances for performance)
platform_agent = PlatformAgent()
analysis_agent = AnalysisAgent()
competitor_agent = CompetitorAgent()
review_agent = ReviewAgent()
integrator = IntegrationAgent(
    platform_agent, analysis_agent, competitor_agent, review_agent
)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Simple token verification - replace with proper JWT validation"""
    if not credentials:
        return None
    # For now, accept any token in development
    return {"user_id": "demo_user"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/v1/analysis")
async def get_analysis(
    businessName: str,
    location: str,
    dealership_url: Optional[str] = None,
    analysis_type: str = "full",
    user = Depends(verify_token)
):
    """GET endpoint for analysis (compatible with frontend)"""
    try:
        result = await integrator.run(businessName, location)
        
        # Add auto-response suggestions
        result["auto_responses"] = {
            "suggestions": {
                "Yelp": "Thanks for your feedback! We're always working to improve our customer experience. We'd love to discuss this further - please call us.",
                "Google": "We appreciate your review and take all feedback seriously. Our team is committed to excellence in every interaction.",
                "DealerRater": "Thank you for taking the time to share your experience. We value your input and use it to continuously improve our services."
            }
        }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/v1/analysis", response_model=AnalysisResponse)
async def create_analysis(
    request: AnalysisRequest,
    user = Depends(verify_token)
):
    """POST endpoint for triggering new analysis"""
    try:
        result = await integrator.run(request.business_name, request.location)
        
        # Add auto-response suggestions
        result["auto_responses"] = {
            "suggestions": {
                "Yelp": "Thanks for your feedback! We're always working to improve our customer experience. We'd love to discuss this further - please call us.",
                "Google": "We appreciate your review and take all feedback seriously. Our team is committed to excellence in every interaction.",
                "DealerRater": "Thank you for taking the time to share your experience. We value your input and use it to continuously improve our services."
            }
        }
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/v1/platforms/{platform}/test")
async def test_platform(
    platform: str,
    query: str,
    user = Depends(verify_token)
):
    """Test individual platform connectivity"""
    try:
        if platform.lower() == "chatgpt":
            result = await platform_agent._search_chatgpt(query)
        elif platform.lower() == "perplexity":
            result = await platform_agent._search_perplexity(query)
        elif platform.lower() == "google":
            result = await platform_agent._search_google(query)
        elif platform.lower() == "gemini":
            result = await platform_agent._search_gemini(query)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
        
        return {
            "platform": result.platform,
            "query": result.query,
            "mentioned": result.mentioned,
            "snippet": result.snippet
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Platform test failed: {str(e)}")

@app.get("/api/v1/dealership/{dealership_id}/metrics")
async def get_dealership_metrics(
    dealership_id: str,
    user = Depends(verify_token)
):
    """Get cached metrics for a specific dealership"""
    # This would typically fetch from database
    # For now, return mock data
    return {
        "dealership_id": dealership_id,
        "risk_score": 73,
        "monthly_loss_risk": 47250,
        "ai_visibility_score": 34,
        "invisible_percentage": 78,
        "market_position": 7,
        "total_competitors": 12,
        "sov_percentage": 12.3,
        "last_updated": "2023-10-06T00:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)