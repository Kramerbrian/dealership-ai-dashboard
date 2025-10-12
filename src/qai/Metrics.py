import pandas as pd
import numpy as np
from typing import Dict, List, Tuple

class RiskVisibilityScoring:
    """
    Risk and Visibility Scoring Module for QAI* calculation
    Implements PIQR, HRP, and VAI penalized scoring
    """
    
    def __init__(self):
        self.warning_multipliers = {
            'missing_photos': 0.85,
            'incomplete_specs': 0.90,
            'no_reviews': 0.80,
            'poor_quality_images': 0.88,
            'missing_vin': 0.95
        }
        
        self.compliance_weights = {
            'photo_count': 0.3,
            'spec_completeness': 0.25,
            'review_presence': 0.2,
            'image_quality': 0.15,
            'vin_presence': 0.1
        }
        
        self.platform_weights = {
            'google': 0.35,
            'facebook': 0.25,
            'autotrader': 0.20,
            'cars_com': 0.15,
            'cargurus': 0.05
        }
    
    def calculate_piqr(self, vdp_data: Dict) -> float:
        """
        Calculate PIQR (Platform Integrity Quality Rating)
        Formula: PIQR = (1 + ΣW_C) ⋅ ΠM_Warning
        """
        compliance_fails = 0
        warning_multipliers = 1.0
        
        # Calculate compliance fails (W_C)
        for metric, weight in self.compliance_weights.items():
            if metric in vdp_data:
                if vdp_data[metric] < 0.7:  # Threshold for compliance
                    compliance_fails += weight * (0.7 - vdp_data[metric])
        
        # Apply warning multipliers (M_Warning)
        for warning, multiplier in self.warning_multipliers.items():
            if warning in vdp_data and vdp_data[warning]:
                warning_multipliers *= multiplier
        
        piqr = (1 + compliance_fails) * warning_multipliers
        return min(piqr, 2.0)  # Cap at 2.0
    
    def calculate_hrp(self, mention_data: Dict) -> float:
        """
        Calculate HRP (High-Risk Penalty)
        Formula: HRP = (Total - Verifiable) / Total ⋅ (1 + Severity Multiplier)
        """
        total_mentions = mention_data.get('total_mentions', 0)
        verifiable_mentions = mention_data.get('verifiable_mentions', 0)
        severity_multiplier = mention_data.get('severity_multiplier', 0.0)
        
        if total_mentions == 0:
            return 0.0
        
        unverifiable_ratio = (total_mentions - verifiable_mentions) / total_mentions
        hrp = unverifiable_ratio * (1 + severity_multiplier)
        
        return min(hrp, 1.0)  # Cap at 1.0
    
    def calculate_vai_penalized(self, visibility_scores: Dict, piqr_value: float) -> float:
        """
        Calculate VAI (Visibility Authority Index) with PIQR penalty
        Formula: VAI_Penalized = Σ(Visibility_Platform_j ⋅ W_j) / PIQR
        """
        weighted_visibility = 0.0
        
        for platform, weight in self.platform_weights.items():
            if platform in visibility_scores:
                weighted_visibility += visibility_scores[platform] * weight
        
        if piqr_value <= 0:
            return 0.0
        
        vai_penalized = weighted_visibility / piqr_value
        return min(vai_penalized, 100.0)  # Cap at 100
