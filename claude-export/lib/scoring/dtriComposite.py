#!/usr/bin/env python3
"""
Digital Trust Revenue Index (DTRI) Composite Function
Computes DTRI scores using E-E-A-T, Reputation, Technical, and Local Visibility inputs
"""

import json
import sys
from typing import Dict, Any

def dtri_composite(eeat: float, rep: float, tech: float, locvis: float, betas: Dict[str, float]) -> float:
    """
    Compute Digital Trust Revenue Index (DTRI)
    
    Args:
        eeat: E-E-A-T score (0-1)
        rep: Reputation score (0-1) 
        tech: Technical score (0-1)
        locvis: Local Visibility score (0-1)
        betas: Dictionary of weights per vertical
        
    Returns:
        DTRI normalized to 0-100
    """
    # Validate inputs
    scores = [eeat, rep, tech, locvis]
    if not all(0 <= score <= 1 for score in scores):
        raise ValueError("All scores must be between 0 and 1")
    
    # Validate beta weights sum to 1.0
    total_weight = sum(betas.values())
    if abs(total_weight - 1.0) > 0.01:
        raise ValueError(f"Beta weights must sum to 1.0, got {total_weight}")
    
    # Calculate DTRI using weighted formula
    base = (
        betas["EEAT"] * eeat +
        betas["Rep"] * rep +
        betas["Tech"] * tech +
        betas["LocVis"] * locvis
    )
    
    # Normalize to 0-100 scale
    dtri = round(base * 100, 2)
    
    return dtri

def calculate_supporting_indices(eeat: float, rep: float, tech: float, locvis: float) -> Dict[str, float]:
    """
    Calculate supporting indices that feed into DTRI
    
    Returns:
        Dictionary of supporting index scores
    """
    # DELI - Digital Experience Loss Index (Technical degradation cost)
    deli = (1 - tech) * 100  # Higher tech score = lower loss
    
    # LVRI - Local Visibility Revenue Index (Geo rank × revenue multiplier)
    lvri = locvis * 100
    
    # ATS - Algorithmic Trust Score (AI model confidence)
    ats = (eeat + rep) / 2 * 100  # Average of E-E-A-T and Reputation
    
    # PIQR - Performance Impact Quality Risk (Revenue lost per % drop)
    piqr = (1 - (eeat + rep + tech) / 3) * 100  # Inverse of average quality
    
    # QAI - Quantum Authority Index (Global clarity & authority)
    qai = (eeat * 0.4 + rep * 0.3 + tech * 0.2 + locvis * 0.1) * 100
    
    return {
        "DELI": round(deli, 2),
        "LVRI": round(lvri, 2), 
        "ATS": round(ats, 2),
        "PIQR": round(piqr, 2),
        "QAI": round(qai, 2)
    }

def main():
    """Main function for command-line usage"""
    try:
        # Read input from stdin
        input_data = json.loads(sys.stdin.read())
        
        eeat = input_data.get("eeat", 0.0)
        rep = input_data.get("rep", 0.0)
        tech = input_data.get("tech", 0.0)
        locvis = input_data.get("locvis", 0.0)
        weights = input_data.get("weights", {})
        
        # Calculate DTRI
        dtri = dtri_composite(eeat, rep, tech, locvis, weights)
        
        # Calculate supporting indices
        supporting = calculate_supporting_indices(eeat, rep, tech, locvis)
        
        # Prepare output
        result = {
            "dtri": dtri,
            "supporting_indices": supporting,
            "components": {
                "eeat": eeat * 100,
                "rep": rep * 100,
                "tech": tech * 100,
                "locvis": locvis * 100
            },
            "weights": weights,
            "status": "success"
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "dtri": 0.0,
            "error": str(e),
            "status": "error"
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()