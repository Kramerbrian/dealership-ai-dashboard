#!/usr/bin/env python3
"""
Penalty Enhancer Module
Identifies penalties and generates enhancement recommendations
"""

from typing import Dict, List, Any

def identify_penalties(eeat_penalty: Dict[str, bool], sentiment_keywords: List[str]) -> List[Dict[str, Any]]:
    """
    Identify penalties based on E-E-A-T and sentiment analysis
    
    Args:
        eeat_penalty: Dictionary of E-E-A-T penalty flags
        sentiment_keywords: List of negative sentiment keywords found
        
    Returns:
        List of penalty objects with enhancers
    """
    penalties = []
    
    # Trustworthiness penalties
    if eeat_penalty.get("trustworthiness", False):
        penalties.append({
            "type": "trustworthiness",
            "severity": "high",
            "description": "Trustworthiness issues detected",
            "enhancers": [
                "Implement transparent pricing display",
                "Add detailed fee breakdowns",
                "Create customer testimonials section",
                "Display certifications and awards"
            ]
        })
    
    # Expertise penalties
    if eeat_penalty.get("expertise", False):
        penalties.append({
            "type": "expertise",
            "severity": "medium",
            "description": "Expertise gaps identified",
            "enhancers": [
                "Highlight technician certifications",
                "Add service history and experience",
                "Create educational content about services",
                "Display team qualifications"
            ]
        })
    
    # Authoritativeness penalties
    if eeat_penalty.get("authoritativeness", False):
        penalties.append({
            "type": "authoritativeness",
            "severity": "medium",
            "description": "Authority signals weak",
            "enhancers": [
                "Add industry partnerships",
                "Display manufacturer certifications",
                "Showcase awards and recognition",
                "Create thought leadership content"
            ]
        })
    
    # Experience penalties
    if eeat_penalty.get("experience", False):
        penalties.append({
            "type": "experience",
            "severity": "low",
            "description": "Experience indicators missing",
            "enhancers": [
                "Add company history timeline",
                "Display years in business",
                "Showcase long-term customer relationships",
                "Create "about us" story"
            ]
        })
    
    # Sentiment-based penalties
    if sentiment_keywords:
        sentiment_penalty = {
            "type": "sentiment",
            "severity": "high" if len(sentiment_keywords) > 3 else "medium",
            "description": f"Negative sentiment detected: {', '.join(sentiment_keywords[:3])}",
            "enhancers": [
                "Implement proactive review management",
                "Create customer service improvement plan",
                "Add complaint resolution process",
                "Display customer satisfaction metrics"
            ]
        }
        penalties.append(sentiment_penalty)
    
    return penalties

def generate_enhancement_roadmap(penalties: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a comprehensive enhancement roadmap
    
    Args:
        penalties: List of identified penalties
        
    Returns:
        Enhancement roadmap with priorities and timelines
    """
    roadmap = {
        "immediate": [],  # 0-30 days
        "short_term": [],  # 30-90 days
        "long_term": []   # 90+ days
    }
    
    for penalty in penalties:
        severity = penalty.get("severity", "medium")
        enhancers = penalty.get("enhancers", [])
        
        if severity == "high":
            roadmap["immediate"].extend(enhancers[:2])  # Top 2 for immediate
            roadmap["short_term"].extend(enhancers[2:])  # Rest for short term
        elif severity == "medium":
            roadmap["short_term"].extend(enhancers)
        else:
            roadmap["long_term"].extend(enhancers)
    
    return roadmap
