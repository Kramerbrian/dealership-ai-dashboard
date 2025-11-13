#!/usr/bin/env python3
"""
MAXIMUS Sentinel Agent - Heartbeat monitor of the DTRI ecosystem
Continuously monitors live API feeds and triggers corrective actions
"""

import asyncio
import aiohttp
import os
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from supabase import create_client
from typing import Dict, List, Optional, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# -------- Utilities --------
def supabase_client():
    """Initialize Supabase client with service role key"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    return create_client(url, key)

def load_engine_spec() -> Dict[str, Any]:
    """Load DTRI-MAXIMUS engine specification"""
    spec_path = Path(__file__).resolve().parents[2] / "config" / "DTRI_MAXIMUS_spec.json"
    if not spec_path.exists():
        logger.warning(f"DTRI spec not found at {spec_path}, using defaults")
        return get_default_spec()
    
    with open(spec_path) as f:
        return json.load(f)

def get_default_spec() -> Dict[str, Any]:
    """Default specification if config file is missing"""
    return {
        "V_AGENTIC_AND_AUTONOMOUS_LOGIC": {
            "AUTONOMOUS_TRIGGERS": {
                "REVIEW_CRISIS_THRESHOLD": 4.0,  # hours
                "REVIEW_VELOCITY_THRESHOLD": 0.85,
                "VDP_SPEED_THRESHOLD": 3.0,  # seconds
                "TSM_DEFENSIVE_THRESHOLD": 1.4,
                "COMPETITIVE_DELTA_THRESHOLD": 10.0
            }
        },
        "I_FINANCIAL_BASELINE_AND_CONTEXT": {
            "EXTERNAL_CONTEXT_MODELS": {
                "TSM_FORMULA": "economic_confidence * trust_multiplier"
            }
        }
    }

async def post_alert(title: str, message: str, severity: str = "info", dealer_id: str = None):
    """Post alert to webhook/Slack"""
    webhook = os.getenv("SENTINEL_WEBHOOK_URL")
    if not webhook:
        logger.info(f"Alert: {severity.upper()} - {title}: {message}")
        return
    
    payload = {
        "text": f"*{severity.upper()} ALERT:* {title}\n{message}",
        "username": "MAXIMUS Sentinel",
        "icon_emoji": ":warning:" if severity == "critical" else ":information_source:"
    }
    
    if dealer_id:
        payload["text"] += f"\nDealer: {dealer_id}"
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(webhook, json=payload) as response:
                if response.status == 200:
                    logger.info(f"Alert posted successfully: {title}")
                else:
                    logger.error(f"Failed to post alert: {response.status}")
    except Exception as e:
        logger.error(f"Error posting alert: {e}")

async def log_event(event: Dict[str, Any]):
    """Log event to Supabase sentinel_events table"""
    try:
        sb = supabase_client()
        result = sb.table("sentinel_events").insert(event).execute()
        logger.info(f"Event logged: {event['event_type']} for {event['dealer_id']}")
        return result
    except Exception as e:
        logger.error(f"Error logging event: {e}")

async def trigger_beta_recalibration():
    """Trigger β-recalibration if pattern persists"""
    try:
        recalibrate_url = os.getenv("APP_BASE_URL", "http://localhost:3000") + "/api/beta/recalibrate"
        async with aiohttp.ClientSession() as session:
            async with session.post(recalibrate_url) as response:
                if response.status == 200:
                    logger.info("Beta recalibration triggered")
                else:
                    logger.warning(f"Beta recalibration failed: {response.status}")
    except Exception as e:
        logger.error(f"Error triggering beta recalibration: {e}")

# -------- Feed Pullers --------
async def fetch_gbp_review_metrics(session: aiohttp.ClientSession, dealer_id: str) -> Dict[str, Any]:
    """Fetch Google Business Profile review metrics"""
    try:
        # Mock implementation - replace with actual GBP API
        url = f"https://api.example-gbp.com/reviews?dealer={dealer_id}"
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as r:
            if r.status == 200:
                return await r.json()
            else:
                logger.warning(f"GBP API returned {r.status} for {dealer_id}")
                return get_mock_review_data()
    except Exception as e:
        logger.error(f"Error fetching GBP data for {dealer_id}: {e}")
        return get_mock_review_data()

def get_mock_review_data() -> Dict[str, Any]:
    """Mock review data for testing"""
    return {
        "velocity": 0.75,  # Below threshold
        "negativity_rate": 0.15,
        "avg_response_time": 5.2,  # Above threshold
        "total_reviews": 127,
        "rating": 4.2
    }

async def fetch_pagespeed(session: aiohttp.ClientSession, domain: str) -> Dict[str, Any]:
    """Fetch PageSpeed Insights data"""
    try:
        # Mock implementation - replace with actual PageSpeed API
        url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={domain}"
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as r:
            if r.status == 200:
                return await r.json()
            else:
                logger.warning(f"PageSpeed API returned {r.status} for {domain}")
                return get_mock_pagespeed_data()
    except Exception as e:
        logger.error(f"Error fetching PageSpeed data for {domain}: {e}")
        return get_mock_pagespeed_data()

def get_mock_pagespeed_data() -> Dict[str, Any]:
    """Mock PageSpeed data for testing"""
    return {
        "lighthouseResult": {
            "audits": {
                "largest-contentful-paint": {
                    "numericValue": 3500  # 3.5 seconds - above threshold
                },
                "first-contentful-paint": {
                    "numericValue": 1800
                },
                "cumulative-layout-shift": {
                    "numericValue": 0.08
                }
            }
        }
    }

async def fetch_tsm_external(session: aiohttp.ClientSession) -> Dict[str, Any]:
    """Fetch external TSM (Trust Sensitivity Multiplier) data"""
    try:
        # Mock economic API - replace with actual economic data source
        async with session.get("https://api.economyfeeds.com/tsm_index", 
                              timeout=aiohttp.ClientTimeout(total=10)) as r:
            if r.status == 200:
                return await r.json()
            else:
                logger.warning("TSM API unavailable, using default")
                return get_mock_tsm_data()
    except Exception as e:
        logger.error(f"Error fetching TSM data: {e}")
        return get_mock_tsm_data()

def get_mock_tsm_data() -> Dict[str, Any]:
    """Mock TSM data for testing"""
    return {
        "current_tsm": 1.45,  # Above defensive threshold
        "economic_confidence": 0.72,
        "trust_multiplier": 1.2,
        "last_updated": datetime.utcnow().isoformat()
    }

async def fetch_competitive_dtri(session: aiohttp.ClientSession, dealer_id: str) -> Dict[str, Any]:
    """Fetch competitive DTRI delta data"""
    try:
        # Mock competitive intelligence API
        url = f"https://api.dealershipai.yourdomain.com/competitors/dtri?dealer={dealer_id}"
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as r:
            if r.status == 200:
                return await r.json()
            else:
                logger.warning(f"Competitive API returned {r.status} for {dealer_id}")
                return get_mock_competitive_data()
    except Exception as e:
        logger.error(f"Error fetching competitive data for {dealer_id}: {e}")
        return get_mock_competitive_data()

def get_mock_competitive_data() -> Dict[str, Any]:
    """Mock competitive data for testing"""
    return {
        "delta": 12.5,  # Above threshold
        "competitor_name": "Rival Dealer",
        "dtri_score": 85.2,
        "our_dtri_score": 72.7,
        "last_updated": datetime.utcnow().isoformat()
    }

# -------- Sentinel Logic --------
async def sentinel_monitor():
    """Main sentinel monitoring loop"""
    logger.info("Starting MAXIMUS Sentinel monitoring cycle")
    
    spec = load_engine_spec()
    triggers = spec["V_AGENTIC_AND_AUTONOMOUS_LOGIC"]["AUTONOMOUS_TRIGGERS"]
    
    # Get dealer list from environment or use defaults
    dealers_env = os.getenv("MONITORED_DEALERS", "toyota-naples,fort-myers-honda")
    dealers = [d.strip() for d in dealers_env.split(",")]
    
    logger.info(f"Monitoring {len(dealers)} dealers: {dealers}")
    
    async with aiohttp.ClientSession() as session:
        for dealer in dealers:
            logger.info(f"Checking dealer: {dealer}")
            
            try:
                # 1️⃣ Review velocity & sentiment
                await check_review_metrics(session, dealer, triggers)
                
                # 2️⃣ PageSpeed (VDP Experience)
                await check_pagespeed_metrics(session, dealer, triggers)
                
                # 3️⃣ Economic TSM monitor
                await check_tsm_metrics(session, dealer, triggers)
                
                # 4️⃣ Competitive DTRI delta
                await check_competitive_metrics(session, dealer, triggers)
                
            except Exception as e:
                logger.error(f"Error monitoring dealer {dealer}: {e}")
                continue
    
    logger.info("Sentinel monitoring cycle complete")

async def check_review_metrics(session: aiohttp.ClientSession, dealer: str, triggers: Dict[str, Any]):
    """Check review response metrics"""
    review_data = await fetch_gbp_review_metrics(session, dealer)
    review_velocity = review_data.get("velocity", 1.0)
    avg_resp_time = review_data.get("avg_response_time", 0)
    
    threshold_time = triggers.get("REVIEW_CRISIS_THRESHOLD", 4.0)
    threshold_velocity = triggers.get("REVIEW_VELOCITY_THRESHOLD", 0.85)
    
    if avg_resp_time > threshold_time and review_velocity < threshold_velocity:
        message = f"Average response time is {avg_resp_time}h, velocity={review_velocity}. Triggering CRISIS SOW."
        
        await post_alert(
            f"Review Response Lag – {dealer}",
            message,
            severity="critical",
            dealer_id=dealer
        )
        
        await log_event({
            "dealer_id": dealer,
            "event_type": "REVIEW_CRISIS_SOW",
            "metric_value": avg_resp_time,
            "timestamp": datetime.utcnow().isoformat(),
            "description": f"Response time {avg_resp_time}h exceeds {threshold_time}h threshold"
        })

async def check_pagespeed_metrics(session: aiohttp.ClientSession, dealer: str, triggers: Dict[str, Any]):
    """Check PageSpeed metrics"""
    ps_data = await fetch_pagespeed(session, f"https://{dealer}.com")
    lcp_audit = ps_data.get("lighthouseResult", {}).get("audits", {}).get("largest-contentful-paint", {})
    lcp = lcp_audit.get("numericValue", 0) / 1000  # Convert to seconds
    
    threshold = triggers.get("VDP_SPEED_THRESHOLD", 3.0)
    
    if lcp > threshold:
        message = f"LCP={lcp:.1f}s exceeds {threshold}s threshold. Triggering optimization SOW."
        
        await post_alert(
            f"VDP Speed Violation – {dealer}",
            message,
            severity="warning",
            dealer_id=dealer
        )
        
        await log_event({
            "dealer_id": dealer,
            "event_type": "VDP_OPTIMIZATION_SOW",
            "metric_value": lcp,
            "timestamp": datetime.utcnow().isoformat(),
            "description": f"LCP {lcp:.1f}s exceeds {threshold}s threshold"
        })

async def check_tsm_metrics(session: aiohttp.ClientSession, dealer: str, triggers: Dict[str, Any]):
    """Check TSM (Trust Sensitivity Multiplier) metrics"""
    econ = await fetch_tsm_external(session)
    tsm = econ.get("current_tsm", 1.0)
    
    threshold = triggers.get("TSM_DEFENSIVE_THRESHOLD", 1.4)
    
    if tsm > threshold:
        message = f"TSM={tsm:.2f}. Entering DEFENSIVE MODE. Prioritize Trust fixes over growth."
        
        await post_alert(
            "Economic Risk Spike",
            message,
            severity="critical",
            dealer_id=dealer
        )
        
        await log_event({
            "dealer_id": dealer,
            "event_type": "TSM_DEFENSIVE_MODE",
            "metric_value": tsm,
            "timestamp": datetime.utcnow().isoformat(),
            "description": f"TSM {tsm:.2f} exceeds {threshold} defensive threshold"
        })

async def check_competitive_metrics(session: aiohttp.ClientSession, dealer: str, triggers: Dict[str, Any]):
    """Check competitive DTRI delta metrics"""
    comp = await fetch_competitive_dtri(session, dealer)
    delta = comp.get("delta", 0)
    
    threshold = triggers.get("COMPETITIVE_DELTA_THRESHOLD", 10.0)
    
    if delta > threshold:
        competitor = comp.get("competitor_name", "Unknown")
        message = f"Rival lead detected ({delta:.1f}pt delta vs {competitor}). Launching Competitive Attack SOW."
        
        await post_alert(
            f"Competitive DTRI Threat – {dealer}",
            message,
            severity="warning",
            dealer_id=dealer
        )
        
        await log_event({
            "dealer_id": dealer,
            "event_type": "COMPETITIVE_ATTACK_SOW",
            "metric_value": delta,
            "timestamp": datetime.utcnow().isoformat(),
            "description": f"Competitive delta {delta:.1f} exceeds {threshold}pt threshold"
        })

async def run_continuous_monitoring():
    """Run continuous monitoring with configurable intervals"""
    interval_minutes = int(os.getenv("SENTINEL_INTERVAL_MINUTES", "15"))
    interval_seconds = interval_minutes * 60
    
    logger.info(f"Starting continuous monitoring with {interval_minutes} minute intervals")
    
    while True:
        try:
            await sentinel_monitor()
            
            # Optional: Trigger beta recalibration for persistent issues
            if os.getenv("AUTO_BETA_RECALIBRATION", "false").lower() == "true":
                await trigger_beta_recalibration()
                
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
        
        logger.info(f"Waiting {interval_minutes} minutes until next cycle...")
        await asyncio.sleep(interval_seconds)

# -------- Main Entry Point --------
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--continuous":
        # Run continuous monitoring
        asyncio.run(run_continuous_monitoring())
    else:
        # Run single monitoring cycle
        asyncio.run(sentinel_monitor())
