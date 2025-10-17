import requests
import json
import time
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass


@dataclass
class DealershipAIConfig:
    base_url: str
    token: str
    timeout: int = 30


class DealershipAIError(Exception):
    """Base exception for DealershipAI SDK errors"""
    pass


class APIError(DealershipAIError):
    """Raised when API returns an error response"""
    def __init__(self, status_code: int, message: str, details: Optional[Dict] = None):
        self.status_code = status_code
        self.message = message
        self.details = details or {}
        super().__init__(f"API Error {status_code}: {message}")


class TimeoutError(DealershipAIError):
    """Raised when request times out"""
    pass


class DealershipAI:
    """
    DealershipAI Python SDK
    
    Provides access to AI visibility tracking, hallucination risk prevention,
    and autonomous strategy recommendations for automotive dealerships.
    """
    
    def __init__(self, base_url: str, token: str, timeout: int = 30):
        """
        Initialize the DealershipAI client
        
        Args:
            base_url: Base URL of the DealershipAI API
            token: Bearer token for authentication
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.token = token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "authorization": f"Bearer {token}",
            "content-type": "application/json"
        })
    
    def _request(
        self, 
        method: str, 
        endpoint: str, 
        params: Optional[Dict] = None,
        json_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make HTTP request to the API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                params=params,
                json=json_data,
                timeout=self.timeout
            )
            
            if not response.ok:
                try:
                    error_data = response.json()
                    message = error_data.get("error", response.text)
                    details = error_data.get("details", {})
                except (ValueError, KeyError):
                    message = response.text or f"HTTP {response.status_code}"
                    details = {}
                
                raise APIError(response.status_code, message, details)
            
            return response.json()
            
        except requests.exceptions.Timeout:
            raise TimeoutError(f"Request timed out after {self.timeout} seconds")
        except requests.exceptions.RequestException as e:
            raise DealershipAIError(f"Request failed: {str(e)}")
    
    # AVI (AI Visibility Index) methods
    def avi_latest(self, tenant_id: str) -> Dict[str, Any]:
        """
        Get the latest AI Visibility Index report
        
        Args:
            tenant_id: Unique tenant identifier
            
        Returns:
            Dict containing AVI report data
        """
        return self._request("GET", f"/api/tenants/{tenant_id}/avi/latest")
    
    def avi_history(
        self, 
        tenant_id: str, 
        limit: int = 8, 
        before: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get historical AVI data for trend analysis
        
        Args:
            tenant_id: Unique tenant identifier
            limit: Number of historical records to return (1-100)
            before: Return records before this date (YYYY-MM-DD)
            
        Returns:
            Dict containing AVI history data
        """
        params = {"limit": str(limit)}
        if before:
            params["before"] = before
            
        return self._request("GET", f"/api/tenants/{tenant_id}/avi/history", params=params)
    
    # ASR (Autonomous Strategy Recommendations) methods
    def asr_execute(
        self, 
        tenant_id: str, 
        vdp_ids: List[str], 
        idempotency_key: str,
        include_competitors: bool = False,
        analysis_depth: str = "standard"
    ) -> Dict[str, Any]:
        """
        Generate Autonomous Strategy Recommendations
        
        Args:
            tenant_id: Unique tenant identifier
            vdp_ids: List of VDP IDs to analyze
            idempotency_key: Unique key for idempotent requests
            include_competitors: Whether to include competitor analysis
            analysis_depth: Analysis depth ('quick', 'standard', 'deep')
            
        Returns:
            Dict containing ASR recommendations
        """
        json_data = {
            "vdpIds": vdp_ids,
            "idempotencyKey": idempotency_key,
            "options": {
                "includeCompetitors": include_competitors,
                "analysisDepth": analysis_depth
            }
        }
        
        return self._request("POST", f"/api/tenants/{tenant_id}/asr/execute", json_data=json_data)
    
    # HRP (Hallucination Risk Prevention) methods
    def hrp_scan(self, tenant_id: str) -> Dict[str, Any]:
        """
        Run hallucination risk prevention scan
        
        Args:
            tenant_id: Unique tenant identifier
            
        Returns:
            Dict containing scan initiation confirmation
        """
        return self._request("POST", f"/api/tenants/{tenant_id}/hrp/scan")
    
    def hrp_status(self, tenant_id: str) -> Dict[str, Any]:
        """
        Get HRP findings and quarantine status
        
        Args:
            tenant_id: Unique tenant identifier
            
        Returns:
            Dict containing HRP findings and quarantine data
        """
        return self._request("GET", f"/api/tenants/{tenant_id}/hrp/status")
    
    def hrp_resolve(self, tenant_id: str, topic: str) -> Dict[str, Any]:
        """
        Resolve quarantine for a topic
        
        Args:
            tenant_id: Unique tenant identifier
            topic: Topic to resolve (e.g., "Price", "APR", "Warranty")
            
        Returns:
            Dict containing resolution confirmation
        """
        json_data = {"topic": topic}
        return self._request("POST", f"/api/tenants/{tenant_id}/hrp/resolve", json_data=json_data)
    
    # Utility methods
    def generate_idempotency_key(self) -> str:
        """Generate a unique idempotency key"""
        return f"{int(time.time() * 1000)}-{hash(str(time.time())) % 1000000000}"
    
    def batch_hrp_resolve(self, tenant_id: str, topics: List[str]) -> List[Dict[str, Any]]:
        """
        Resolve multiple quarantined topics in batch
        
        Args:
            tenant_id: Unique tenant identifier
            topics: List of topics to resolve
            
        Returns:
            List of results for each topic resolution attempt
        """
        results = []
        for topic in topics:
            try:
                result = self.hrp_resolve(tenant_id, topic)
                results.append({
                    "topic": topic,
                    "success": True,
                    "data": result
                })
            except Exception as e:
                results.append({
                    "topic": topic,
                    "success": False,
                    "error": str(e)
                })
        
        return results
    
    def get_quarantined_topics(self, tenant_id: str) -> List[str]:
        """
        Get list of currently quarantined topics
        
        Args:
            tenant_id: Unique tenant identifier
            
        Returns:
            List of quarantined topic names
        """
        status = self.hrp_status(tenant_id)
        return [q["topic"] for q in status.get("quarantine", []) if q.get("active", False)]
    
    def is_topic_quarantined(self, tenant_id: str, topic: str) -> bool:
        """
        Check if a specific topic is quarantined
        
        Args:
            tenant_id: Unique tenant identifier
            topic: Topic to check
            
        Returns:
            True if topic is quarantined, False otherwise
        """
        quarantined_topics = self.get_quarantined_topics(tenant_id)
        return topic in quarantined_topics
    
    def close(self):
        """Close the HTTP session"""
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Convenience function for quick initialization
def create_client(base_url: str, token: str, timeout: int = 30) -> DealershipAI:
    """
    Create a DealershipAI client instance
    
    Args:
        base_url: Base URL of the DealershipAI API
        token: Bearer token for authentication
        timeout: Request timeout in seconds
        
    Returns:
        DealershipAI client instance
    """
    return DealershipAI(base_url, token, timeout)
