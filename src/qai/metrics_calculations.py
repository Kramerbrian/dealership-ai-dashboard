import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional

class RiskVisibilityScoring:
    """
    Risk and Visibility Scoring Module for QAI* calculation
    Implements PIQR, HRP, and VAI penalized scoring with governance parameters
    """
    
    def __init__(self):
        # Warning Multipliers for PIQR calculation
        self.warning_multipliers = {
            'deceptive_pricing': 0.75,
            'inventory_dilution': 0.80,
            'content_duplication': 0.85,
            'missing_photos': 0.90,
            'incomplete_specs': 0.95,
            'no_reviews': 0.88,
            'poor_quality_images': 0.92,
            'missing_vin': 0.98
        }
        
        # Compliance weights for PIQR calculation
        self.compliance_weights = {
            'photo_count': 0.30,
            'spec_completeness': 0.25,
            'review_presence': 0.20,
            'image_quality': 0.15,
            'vin_presence': 0.10
        }
        
        # Platform weights for VAI calculation
        self.platform_weights = {
            'google_ai': 0.50,
            'chatgpt': 0.30,
            'bing': 0.15,
            'perplexity': 0.05
        }
        
        # HRP severity multipliers
        self.severity_multipliers = {
            'low': 0.5,
            'medium': 1.0,
            'high': 2.0,
            'critical': 3.0
        }
    
    def calculate_piqr(self, vdp_data: Dict) -> float:
        """
        Calculate PIQR (Platform Integrity Quality Rating)
        Formula: PIQR = (1 + SUM(Compliance_Fails * 0.25)) * PRODUCT(Warning_Multipliers)
        """
        compliance_fails = 0
        warning_multipliers = 1.0
        
        # Calculate compliance fails (W_C) with 0.25 multiplier
        for metric, weight in self.compliance_weights.items():
            if metric in vdp_data:
                if vdp_data[metric] < 0.7:  # Threshold for compliance
                    compliance_fails += weight * (0.7 - vdp_data[metric]) * 0.25
        
        # Apply warning multipliers (M_Warning)
        for warning, multiplier in self.warning_multipliers.items():
            if warning in vdp_data and vdp_data[warning]:
                warning_multipliers *= multiplier
        
        piqr = (1 + compliance_fails) * warning_multipliers
        return min(piqr, 2.0)  # Cap at 2.0
    
    def calculate_hrp(self, mention_data: Dict) -> float:
        """
        Calculate HRP (High-Risk Penalty)
        Formula: HRP = ((Total_Mentions - Verifiable_Mentions) / Total_Mentions) * (1 + Severity_Multiplier)
        """
        total_mentions = mention_data.get('total_mentions', 0)
        verifiable_mentions = mention_data.get('verifiable_mentions', 0)
        severity_level = mention_data.get('severity_level', 'medium')
        
        if total_mentions == 0:
            return 0.0
        
        severity_multiplier = self.severity_multipliers.get(severity_level, 1.0)
        unverifiable_ratio = (total_mentions - verifiable_mentions) / total_mentions
        hrp = unverifiable_ratio * (1 + severity_multiplier)
        
        return min(hrp, 1.0)  # Cap at 1.0
    
    def calculate_vai_penalized(self, visibility_scores: Dict, piqr_value: float) -> float:
        """
        Calculate VAI (Visibility Authority Index) with PIQR penalty
        Formula: VAI_Penalized = SUM(Visibility_Platform_j * W_j) / PIQR
        """
        weighted_visibility = 0.0
        
        for platform, weight in self.platform_weights.items():
            if platform in visibility_scores:
                weighted_visibility += visibility_scores[platform] * weight
        
        if piqr_value <= 0:
            return 0.0
        
        vai_penalized = weighted_visibility / piqr_value
        return min(vai_penalized, 100.0)  # Cap at 100
    
    def check_hrp_breach(self, hrp_value: float) -> bool:
        """
        Check for critical HRP breach (> 0.50)
        """
        return hrp_value > 0.50
    
    def calculate_omega_def(self, competitor_data: Dict) -> float:
        """
        Calculate ω_Def (Defensive Weight) based on competitor inventory risk
        """
        competitor_risk = competitor_data.get('predicted_geo_spend', 0)
        market_share = competitor_data.get('market_share', 0.1)
        
        # Higher competitor spend = higher defensive weight
        omega_def = min(1.0 + (competitor_risk * market_share), 2.0)
        return omega_def
