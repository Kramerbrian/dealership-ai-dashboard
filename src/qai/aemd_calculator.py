import pandas as pd
import numpy as np
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime

class AEMDCalculator:
    """
    Answer Engine Market Dominance (AEMD) Calculator
    Optimizes for Featured Snippets, AI Overviews, and People Also Ask (PAA)
    """
    
    def __init__(self):
        # Base weights for AEO features
        self.base_weights = {
            'fs_capture_share': 0.40,
            'aio_citation_share': 0.40,
            'paa_box_ownership': 0.20
        }
        
        # Dynamic financial weighting factors
        self.financial_factors = {
            'fs_ctr_lift': 1.2,  # FS typically provides 20% CTR lift over P3
            'aio_authority_multiplier': 1.5,  # AIO citations have higher authority
            'paa_conversion_assist': 0.8  # PAA assists early funnel conversions
        }
        
        # Cost catalog for ASR ROI calculation
        self.cost_catalog = {
            "add_odometer_photo": 5.00,
            "rewrite_vdp_text": 150.00,
            "update_schema_markup": 0.00,
            "add_interior_photos": 25.00,
            "improve_description": 75.00,
            "add_customer_reviews": 0.00,
            "optimize_image_quality": 15.00,
            "add_vin_verification": 10.00,
            "enhance_specifications": 30.00,
            "add_video_content": 200.00,
            "implement_faq_schema": 50.00,
            "add_comparison_table": 100.00
        }
    
    def calculate_dynamic_financial_weights(self, performance_data: Dict) -> Dict:
        """
        Calculate dynamic financial weights based on actual performance
        Formula: Ω_Fin = (CTR_P3 / CTR_FS) * 0.30 for FS, etc.
        """
        weights = {}
        
        # FS Capture Share weight based on CTR lift
        fs_ctr = performance_data.get('fs_ctr', 0.05)
        p3_ctr = performance_data.get('p3_ctr', 0.04)
        weights['fs_capture_share'] = (p3_ctr / fs_ctr) * 0.30 if fs_ctr > 0 else 0.30
        
        # AIO Citation Share weight based on VDP view influence
        total_vdp_views = performance_data.get('total_vdp_views', 1000)
        aio_vdp_views = performance_data.get('aio_vdp_views', 200)
        weights['aio_citation_share'] = (total_vdp_views / aio_vdp_views) * 0.50 if aio_vdp_views > 0 else 0.50
        
        # PAA Box Ownership weight based on assisted conversions
        total_conversions = performance_data.get('total_conversions', 50)
        paa_conversions = performance_data.get('paa_conversions', 10)
        weights['paa_box_ownership'] = (total_conversions / paa_conversions) * 0.20 if paa_conversions > 0 else 0.20
        
        return weights
    
    def calculate_aemd_score(self, aeo_metrics: Dict, competitive_data: Dict, 
                           performance_data: Dict = None) -> Dict:
        """
        Calculate AEMD Score with dynamic financial weighting
        Formula: AEMD_Final = (∑(Metric_i * Ω_Fin,i)) / ω_Def
        """
        if performance_data is None:
            performance_data = {}
        
        # Get dynamic financial weights
        financial_weights = self.calculate_dynamic_financial_weights(performance_data)
        
        # Extract AEO metrics
        fs_capture = aeo_metrics.get('fs_capture_share', 0.0)
        aio_citation = aeo_metrics.get('aio_citation_share', 0.0)
        paa_ownership = aeo_metrics.get('paa_box_ownership', 0.0)
        
        # Calculate weighted raw score
        weighted_score = (
            fs_capture * financial_weights['fs_capture_share'] +
            aio_citation * financial_weights['aio_citation_share'] +
            paa_ownership * financial_weights['paa_box_ownership']
        )
        
        # Apply defensive weight
        defensive_weight = competitive_data.get('defensive_weight', 1.0)
        aemd_score = weighted_score / defensive_weight
        
        # Calculate competitor benchmark
        competitor_avg = competitive_data.get('competitor_aemd_avg', 50.0)
        
        # Generate prescriptive action
        prescriptive_action = self._generate_prescriptive_action(
            aemd_score, competitor_avg, aeo_metrics, competitive_data
        )
        
        return {
            'aemd_score': min(aemd_score * 100, 100.0),  # Convert to 0-100 scale
            'weighted_components': {
                'fs_contribution': fs_capture * financial_weights['fs_capture_share'],
                'aio_contribution': aio_citation * financial_weights['aio_citation_share'],
                'paa_contribution': paa_ownership * financial_weights['paa_box_ownership']
            },
            'financial_weights': financial_weights,
            'defensive_weight': defensive_weight,
            'competitor_benchmark': competitor_avg,
            'performance_gap': aemd_score * 100 - competitor_avg,
            'prescriptive_action': prescriptive_action,
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_prescriptive_action(self, aemd_score: float, competitor_avg: float, 
                                    aeo_metrics: Dict, competitive_data: Dict) -> Dict:
        """Generate prescriptive action based on AEMD analysis"""
        trust_alpha = competitive_data.get('e_e_a_t_trust_alpha', 0.5)
        
        # Determine lowest performing component
        components = {
            'fs_capture_share': aeo_metrics.get('fs_capture_share', 0.0),
            'aio_citation_share': aeo_metrics.get('aio_citation_share', 0.0),
            'paa_box_ownership': aeo_metrics.get('paa_box_ownership', 0.0)
        }
        lowest_component = min(components, key=components.get)
        
        # Generate action based on conditions
        if aemd_score * 100 > competitor_avg and trust_alpha > 0.75:
            return {
                'priority': 'maintain_dominance',
                'action': 'Focus resources on GEO Authority Blocks. Increase content velocity by 10% on next-tier vehicle segments.',
                'estimated_cost': 0,
                'estimated_roi': 'High',
                'timeline': '30 days'
            }
        elif aemd_score * 100 < competitor_avg and lowest_component == 'fs_capture_share':
            return {
                'priority': 'aeo_tactical_shift',
                'action': 'Implement 40-60 word Direct Answer Protocol on top 10 informational pages. Mandate List/Table Schema implementation.',
                'estimated_cost': 1000,
                'estimated_roi': 'Medium-High',
                'timeline': '14 days',
                'specific_tasks': [
                    'Add FAQPage Schema to high-traffic pages',
                    'Implement Comparison Table Schema for vehicle comparisons',
                    'Optimize meta descriptions for featured snippet format'
                ]
            }
        elif aemd_score * 100 < competitor_avg and lowest_component == 'aio_citation_share':
            return {
                'priority': 'geo_e_e_a_t_intervention',
                'action': 'Content must feature Master Technician or Finance Director quotes. Add inline statistical citations about local market conditions.',
                'estimated_cost': 500,
                'estimated_roi': 'High',
                'timeline': '21 days',
                'specific_tasks': [
                    'Add expert quotes to vehicle descriptions',
                    'Include local market statistics and citations',
                    'Enhance E-E-A-T signals in content'
                ]
            }
        elif aemd_score * 100 < competitor_avg and lowest_component == 'paa_box_ownership':
            return {
                'priority': 'topical_depth_fix',
                'action': 'Review top 5 highest-traffic pages. Add dedicated FAQ/Q&A Schema Block with minimum 5 questions each.',
                'estimated_cost': 750,
                'estimated_roi': 'Medium',
                'timeline': '21 days',
                'specific_tasks': [
                    'Create comprehensive FAQ sections',
                    'Implement FAQPage Schema markup',
                    'Target PAA questions for each vehicle segment'
                ]
            }
        else:
            return {
                'priority': 'monitor',
                'action': 'Continue current optimization strategy. Monitor for competitive changes.',
                'estimated_cost': 0,
                'estimated_roi': 'Maintain',
                'timeline': 'Ongoing'
            }
    
    def calculate_rpas(self, action: str, vdp_gross_profit: float, 
                      vco_predicted_lift: float, success_rate: float = 0.7) -> float:
        """
        Calculate Revenue-Per-Actionable-Signal (RPAS)
        Formula: RPAS = (VDP_Gross_Profit) * (VCO_Predicted_Lift) * (Success_Rate) - Cost
        """
        cost = self.cost_catalog.get(action, 100.0)
        rpas = (vdp_gross_profit * vco_predicted_lift * success_rate) - cost
        return max(rpas, 0)  # Ensure non-negative ROI
    
    def generate_aemd_json_export(self, dealer_data: Dict) -> str:
        """
        Generate complete AEMD JSON export for dashboard integration
        """
        aemd_result = self.calculate_aemd_score(
            dealer_data.get('aeo_metrics', {}),
            dealer_data.get('competitive_data', {}),
            dealer_data.get('performance_data', {})
        )
        
        # Add RPAS calculations for each recommended action
        if 'asr_recommendations' in dealer_data:
            for rec in dealer_data['asr_recommendations']:
                rec['rpas'] = self.calculate_rpas(
                    rec.get('action', ''),
                    dealer_data.get('vdp_gross_profit', 1000),
                    rec.get('potential_gain', 0.1)
                )
        
        export_data = {
            'calculator_name': 'Answer_Engine_Market_Dominance_Optimizer',
            'version': '2.0',
            'dealer_id': dealer_data.get('dealer_id', 'unknown'),
            'calculation_timestamp': datetime.now().isoformat(),
            'aemd_analysis': aemd_result,
            'cost_catalog': self.cost_catalog,
            'financial_weights': aemd_result['financial_weights'],
            'prescriptive_actions': aemd_result['prescriptive_action']
        }
        
        return json.dumps(export_data, indent=2)
